// supabase/functions/asaas-webhooks/index.ts
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// Pega o token de autenticação do webhook dos secrets para segurança
const ASAAS_WEBHOOK_TOKEN = Deno.env.get('ASAAS_WEBHOOK_TOKEN');

// Cria um cliente admin do Supabase para poder atualizar a tabela de perfis
const supabaseAdmin = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
);

Deno.serve(async (req) => {
  // 1. Verificação de Segurança
  // Compara o token enviado pelo Asaas no cabeçalho com o nosso secret
  const receivedToken = req.headers.get('asaas-access-token');
  if (!ASAAS_WEBHOOK_TOKEN || receivedToken !== ASAAS_WEBHOOK_TOKEN) {
    console.error("Webhook: Tentativa de acesso com token inválido.");
    return new Response("Acesso não autorizado.", { status: 401 });
  }

  try {
    const eventData = await req.json();
    console.log("Webhook recebido:", eventData.event);

    // 2. Processamento do Evento
    // Verifica se o evento é de pagamento confirmado ou recebido
    if (eventData.event === 'PAYMENT_CONFIRMED' || eventData.event === 'PAYMENT_RECEIVED') {
      const payment = eventData.payment;
      const asaasCustomerId = payment.customer;

      if (!asaasCustomerId) {
        throw new Error("ID de cliente do Asaas não encontrado no evento.");
      }

      // 3. Atualização do Banco de Dados
      // Encontra o usuário no nosso banco de dados com base no ID de cliente do Asaas
      // e atualiza o status da assinatura para 'active'
      const { data, error } = await supabaseAdmin
        .from('profiles')
        .update({ subscription_status: 'active' })
        .eq('asaas_customer_id', asaasCustomerId)
        .select('id') // Seleciona o ID para confirmar que a atualização ocorreu
        .single(); // .single() garante que apenas um perfil seja atualizado

      if (error) {
        console.error("Erro ao atualizar perfil via webhook:", error);
        throw new Error(`Não foi possível atualizar o perfil para o cliente Asaas ${asaasCustomerId}.`);
      }
      
      console.log(`Perfil do usuário ${data.id} atualizado para 'active'.`);
    }

    // Retorna uma resposta de sucesso para o Asaas
    return new Response(JSON.stringify({ received: true }), { status: 200 });

  } catch (error) {
    console.error("Erro no processamento do webhook:", error.message);
    return new Response(JSON.stringify({ error: error.message }), { status: 400 });
  }
});
