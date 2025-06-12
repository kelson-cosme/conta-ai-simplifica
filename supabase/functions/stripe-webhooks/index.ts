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
    event = stripe.webhooks.constructEvent(
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
      case 'checkout.session.completed': {
        console.log("Processando 'checkout.session.completed'");
        const checkoutSession = eventObject as Stripe.Checkout.Session;
        
        // MODIFICADO: Adicionada verificação para garantir que o ID do usuário existe
        const supabaseUserId = checkoutSession.client_reference_id;
        if (!supabaseUserId) {
            console.error("ERRO: client_reference_id não encontrado na sessão de checkout.");
            // Retornamos 200 para o Stripe não reenviar, pois é um erro de configuração.
            return new Response(JSON.stringify({ received: true, error: "Missing client_reference_id" }), { status: 200 });
        }

        console.log("ID de Usuário Supabase (client_reference_id):", supabaseUserId);

        if (checkoutSession.mode === 'subscription') {
          const subscription = await stripe.subscriptions.retrieve(checkoutSession.subscription as string);

          console.log("Status da assinatura recebido do Stripe:", subscription.status);
          console.log("Stripe Customer ID:", subscription.customer);

          const { error } = await supabaseAdmin
            .from('profiles')
            .update({
              subscription_status: subscription.status,
              stripe_customer_id: subscription.customer as string
            })
            .eq('id', supabaseUserId); // Usando a variável verificada

          if (error) {
            console.error("ERRO ao atualizar o perfil no Supabase:", error);
          } else {
            console.log("Sucesso! Perfil atualizado no Supabase para o usuário:", supabaseUserId);
          }
        }
        break;
      }
      // ... (o restante do código permanece o mesmo)
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
      case 'customer.subscription.deleted': {
        console.log(`Processando evento de assinatura: ${event.type}`);
        const subscription = eventObject as Stripe.Subscription;
        await supabaseAdmin
          .from('profiles')
          .update({
            subscription_status: subscription.status,
          })
          .eq('stripe_customer_id', subscription.customer);
        break;
      }
      default:
        console.warn(`--> Evento não tratado: ${event.type}`);
    }
  } catch (err: any) {
     console.error(`ERRO GERAL ao processar o evento: ${err.message}`);
     return new Response(err.message, { status: 500 });
  }

  return new Response(JSON.stringify({ received: true }), { status: 200 });
});