// supabase/functions/stripe-webhooks/index.ts
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import Stripe from "https://esm.sh/stripe@13.11.0?target=deno&deno-std=0.132.0";

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY')!, {
  apiVersion: '2024-06-20',
  httpClient: Stripe.createFetchHttpClient(),
});

const supabaseAdmin = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
);

Deno.serve(async (req) => {
  const signature = req.headers.get('Stripe-Signature');
  const body = await req.text();

  console.log("--- Webhook recebido ---");

  let event: Stripe.Event;

  try {
    event = await stripe.webhooks.constructEventAsync(
      body,
      signature!,
      Deno.env.get('STRIPE_WEBHOOK_SIGNING_SECRET')!
    );
    console.log("Evento verificado com sucesso. Tipo:", event.type);

  } catch (err: any) {
    console.error(`ERRO na verificação do webhook: ${err.message}`);
    return new Response(err.message, { status: 400 });
  }

  const eventObject = event.data.object as any;

  try {
    switch (event.type) {
      // ESTE É O EVENTO MAIS IMPORTANTE PARA A ATIVAÇÃO
      case 'checkout.session.completed': {
        console.log("Processando 'checkout.session.completed'");
        const checkoutSession = eventObject as Stripe.Checkout.Session;

        // O client_reference_id é a forma mais segura de encontrar seu usuário
        if (!checkoutSession.client_reference_id) {
          throw new Error("Client Reference ID não encontrado na sessão de checkout.");
        }
        
        console.log("Client Reference ID (Supabase User ID):", checkoutSession.client_reference_id);

        if (checkoutSession.mode === 'subscription') {
          const subscription = await stripe.subscriptions.retrieve(checkoutSession.subscription as string);

          const { error } = await supabaseAdmin
            .from('profiles')
            .update({
              subscription_status: subscription.status,
              stripe_customer_id: subscription.customer as string
            })
            .eq('id', checkoutSession.client_reference_id);

          if (error) {
            console.error("ERRO ao atualizar o perfil no Supabase:", error);
            throw error;
          } else {
            console.log("Sucesso! Perfil atualizado no Supabase para o usuário:", checkoutSession.client_reference_id);
          }
        }
        break;
      }

      // ESTES EVENTOS AGORA SÓ ATUALIZAM O STATUS DE UMA ASSINATURA EXISTENTE
      case 'customer.subscription.updated':
      case 'customer.subscription.deleted': {
        console.log(`Processando evento de assinatura: ${event.type}`);
        const subscription = eventObject as Stripe.Subscription;
        
        // Esta parte depende que o stripe_customer_id já tenha sido salvo antes
        const { error } = await supabaseAdmin
          .from('profiles')
          .update({
            subscription_status: subscription.status,
          })
          .eq('stripe_customer_id', subscription.customer);
        
        if (error) {
            console.error(`ERRO ao processar ${event.type}:`, error);
        }
        break;
      }
      
      // O 'customer.subscription.created' não precisa de lógica extra se 'checkout.session.completed' funcionar
      case 'customer.subscription.created':
        console.log("Evento 'customer.subscription.created' recebido. Nenhuma ação necessária, 'checkout.session.completed' cuida da ativação.");
        break;

      default:
        console.warn(`--> Evento não tratado: ${event.type}`);
    }
  } catch (err: any) {
     console.error(`ERRO GERAL ao processar o evento: ${err.message}`);
     return new Response(err.message, { status: 500 });
  }

  return new Response(JSON.stringify({ received: true }), { status: 200 });
});