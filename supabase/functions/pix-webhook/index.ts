// =====================================================================
// FUNCIONÁRIO ARTIFICIAL — Webhook de confirmação de PIX
// ---------------------------------------------------------------------
// Esta é a peça que AUTOMATIZA a liberação do acesso. Um provedor de
// pagamento (PSP) — Mercado Pago, Asaas, Efí, PagBank, Stripe — chama
// esta função quando um PIX é pago. Ela confirma o pagamento no banco
// usando a SERVICE ROLE (que ignora o RLS).
//
// Deploy:
//   supabase functions deploy pix-webhook --no-verify-jwt
//   supabase secrets set SUPABASE_URL=... SERVICE_ROLE_KEY=... PSP_SECRET=...
//
// Importante: AJUSTE o parsing do corpo conforme o PSP que você usar e
// VALIDE a assinatura/segredo do webhook (cada PSP tem o seu).
// =====================================================================
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

Deno.serve(async (req) => {
  try {
    // 1) valide o segredo do webhook do seu PSP (exemplo simples por header)
    const secret = req.headers.get("x-webhook-secret");
    if (secret !== Deno.env.get("PSP_SECRET")) {
      return new Response("unauthorized", { status: 401 });
    }

    // 2) leia o corpo do webhook (ADAPTE ao formato do seu PSP)
    const body = await req.json();
    // Exemplo: esperamos receber o id do pagamento criado no nosso banco.
    // Ajuste para extrair do payload real do PSP (txid, external_reference, etc.)
    const paymentId: string | undefined = body.payment_id ?? body.external_reference;
    const paid: boolean = body.status === "paid" || body.status === "approved" || body.status === "CONFIRMED";

    if (!paymentId || !paid) {
      return new Response("ignored", { status: 200 });
    }

    // 3) confirme no banco com a SERVICE ROLE (ignora RLS)
    const admin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SERVICE_ROLE_KEY")!,
    );
    const { error } = await admin.rpc("confirm_payment", { p_payment_id: paymentId });
    if (error) throw error;

    return new Response("ok", { status: 200 });
  } catch (e) {
    return new Response("error: " + (e?.message ?? e), { status: 500 });
  }
});
