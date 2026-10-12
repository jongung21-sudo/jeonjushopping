// Supabase Edge Function: supabase/functions/confirm-payment/index.ts
// 배포 명령어: npx supabase functions deploy confirm-payment
// 환경변수 설정: npx supabase secrets set TOSS_SECRET_KEY=test_sk_zXLkKEypNArWmo50nX3lmeaxYG5R

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { paymentKey, orderId, amount } = await req.json();

    if (!paymentKey || !orderId || amount === undefined) {
      return new Response(
        JSON.stringify({ code: 'INVALID_PARAMETERS', message: ' 필수 결제 파라미터가 누락되었습니다.' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 1. 토스페이먼츠 시크릿 키 Basic Auth 인코딩 (시크릿키 뒤에 콜론 ':' 필수)
    const secretKey = Deno.env.get('TOSS_SECRET_KEY') || 'test_sk_zXLkKEypNArWmo50nX3lmeaxYG5R';
    const encryptedSecretKey = 'Basic ' + btoa(`${secretKey}:`);

    // 2. 토스페이먼츠 결제 승인 API 호출 (POST https://api.tosspayments.com/v1/payments/confirm)
    const tossResponse = await fetch('https://api.tosspayments.com/v1/payments/confirm', {
      method: 'POST',
      headers: {
        Authorization: encryptedSecretKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        paymentKey,
        orderId,
        amount: Number(amount),
      }),
    });

    const tossResult = await tossResponse.json();

    if (!tossResponse.ok) {
      return new Response(
        JSON.stringify({
          code: tossResult.code || 'TOSS_CONFIRM_ERROR',
          message: tossResult.message || '토스페이먼츠 결제 승인에 실패했습니다.',
        }),
        { status: tossResponse.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 3. Supabase DB에 결제 승인 내역(payment_transactions) 저장
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';

    if (supabaseUrl && supabaseServiceKey) {
      const supabase = createClient(supabaseUrl, supabaseServiceKey);
      await supabase.from('payment_transactions').upsert(
        [
          {
            payment_key: tossResult.paymentKey,
            order_id: tossResult.orderId,
            amount: tossResult.totalAmount,
            method: tossResult.method,
            pg_provider: 'tosspayments',
            status: tossResult.status,
            receipt_url: tossResult.receipt?.url || null,
            approved_at: tossResult.approvedAt,
            raw_response: tossResult,
          },
        ],
        { onConflict: 'payment_key' }
      );
    }

    return new Response(JSON.stringify(tossResult), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (err: any) {
    return new Response(
      JSON.stringify({ code: 'INTERNAL_SERVER_ERROR', message: err?.message || '서버 오류' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
