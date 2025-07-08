// supabase/functions/create-checkout-session/index.ts
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders } from "../_shared/cors.ts";

// Pega a chave da API do Asaas dos secrets do projeto Supabase
const ASAAS_API_KEY = Deno.env.get('ASAAS_API_KEY');

Deno.serve(async (req) => {
  // Lida com a requisição pre-flight de CORS
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Garante que a chave do Asaas foi carregada
    if (!ASAAS_API_KEY) {
      throw new Error("Secret ASAAS_API_KEY não encontrado.");
    }

    // Pega os dados enviados pelo frontend
    const { userId, userEmail, cpfCnpj } = await req.json();

    // Valida se os dados necessários foram recebidos
    if (!userId || !userEmail) throw new Error("ID ou e-mail do usuário não fornecido.");
    if (!cpfCnpj) throw new Error("CPF/CNPJ não fornecido.");

    // Cria um cliente admin do Supabase
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Busca o perfil do usuário para verificar se ele já tem um ID de cliente no Asaas
    const { data: profileData, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('asaas_customer_id')
      .eq('id', userId)
      .single();

    if (profileError && profileError.code !== 'PGRST116') {
      throw new Error(`Erro ao buscar perfil no Supabase: ${profileError.message}`);
    }

    let asaasCustomerId = profileData?.asaas_customer_id;

    // Se o usuário não tem um ID do Asaas, cria um novo cliente
    if (!asaasCustomerId) {
      const newCustomerResponse = await fetch('https://api.asaas.com/v3/customers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'access_token': ASAAS_API_KEY },
        body: JSON.stringify({
          name: `Usuário ${userId}`,
          email: userEmail,
          cpfCnpj: cpfCnpj
        }),
      });
      
      const newCustomerData = await newCustomerResponse.json();
      if (!newCustomerResponse.ok) {
        console.error("Erro ao criar cliente no Asaas:", newCustomerData);
        throw new Error(newCustomerData.errors[0]?.description || "Falha ao criar cliente no Asaas.");
      }
      
      asaasCustomerId = newCustomerData.id;

      await supabaseAdmin
        .from('profiles')
        .update({ asaas_customer_id: asaasCustomerId })
        .eq('id', userId);
    }

    // PASSO 1: Criar a assinatura (recorrência)
    const subscriptionResponse = await fetch('https://api.asaas.com/v3/subscriptions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'access_token': ASAAS_API_KEY },
      body: JSON.stringify({
        customer: asaasCustomerId,
        billingType: 'UNDEFINED',
        value: 40.00,
        cycle: 'MONTHLY',
        description: 'Plano Mensal - Conta AI Simplifica',
      }),
    });

    const subscriptionData = await subscriptionResponse.json();
    if (!subscriptionResponse.ok) {
      console.error("Erro ao criar assinatura no Asaas:", subscriptionData);
      throw new Error(subscriptionData.errors[0]?.description || 'Erro desconhecido ao criar assinatura.');
    }
    
    const subscriptionId = subscriptionData.id;
    if (!subscriptionId) {
        throw new Error("ID da assinatura não foi retornado pelo Asaas.");
    }

    // PASSO 2: Buscar a primeira cobrança associada a essa assinatura.
    // A API pode levar um instante para gerar a cobrança, então uma pequena espera pode ajudar.
    await new Promise(resolve => setTimeout(resolve, 1500)); // Espera 1.5 segundos

    const paymentsResponse = await fetch(`https://api.asaas.com/v3/payments?subscription=${subscriptionId}`, {
        method: 'GET',
        headers: { 'access_token': ASAAS_API_KEY },
    });

    const paymentsData = await paymentsResponse.json();
    if (!paymentsResponse.ok || !paymentsData.data || paymentsData.data.length === 0) {
        console.error("Erro ao buscar cobranças da assinatura:", paymentsData);
        throw new Error("Não foi possível encontrar a cobrança inicial da assinatura.");
    }

    // Pega a URL de pagamento da primeira cobrança da lista
    const paymentLink = paymentsData.data[0].invoiceUrl; 
    if (!paymentLink) {
        throw new Error("A cobrança inicial não continha um link de pagamento.");
    }

    // Retorna a URL de pagamento para o frontend
    return new Response(JSON.stringify({ url: paymentLink }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200
    });

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  }
});
