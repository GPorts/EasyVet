// supabase/functions/cakto-webhook/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

serve(async (req) => {
  try {
    // 1. Recebe os dados da Cakto (eles mandam um JSON)
    const body = await req.json()
    console.log("Webhook Recebido da Cakto:", body)

    // A Cakto envia o status da transação. Você deve conferir a documentação deles,
    // mas geralmente pagamentos aprovados vêm com status "approved" ou "paid".
    const status = body?.data?.status || body?.status;
    const customerEmail = body?.data?.customer?.email || body?.customer?.email; // Pegando o e-mail do cliente

    // Se não for pagamento aprovado, apenas ignoramos com sucesso
    if (status !== 'approved' && status !== 'paid') {
      return new Response(JSON.stringify({ message: "Ignorado (não é compra aprovada)" }), { status: 200 })
    }

    if (!customerEmail) {
      throw new Error("E-mail não encontrado no payload da Cakto");
    }

    // 2. Conectar ao Supabase com privilégios de Admin (Bypass RLS)
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // 3. Atualizar a clínica no banco de dados
    const { error } = await supabaseAdmin
      .from('clinics')
      .update({ plan: 'premium' }) 
      .eq('email', customerEmail)

    if (error) throw error

    return new Response(JSON.stringify({ success: true, email: customerEmail }), {
      headers: { "Content-Type": "application/json" },
      status: 200,
    })

  } catch (error) {
    console.error("Erro no Webhook:", error.message)
    return new Response(JSON.stringify({ error: error.message }), { status: 400 })
  }
})
