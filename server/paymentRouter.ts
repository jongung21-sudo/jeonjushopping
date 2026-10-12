/**
 * Node.js / Express 백엔드 결제 승인 및 취소 라우터 예시 (server/paymentRouter.ts)
 * - 토스페이먼츠 (Toss Payments) 결제 승인 API: POST /api/payments/confirm
 * - 포트원 (PortOne V2) 결제 단건 조회 검증 API: POST /api/payments/portone-verify
 * - 결제 취소/환불 API: POST /api/payments/cancel
 */

// 실제 Express 서버에서 사용할 때의 표준 구현 코드입니다.
export async function confirmTossPaymentOnNodeServer(params: {
  paymentKey: string;
  orderId: string;
  amount: number;
  expectedAmountFromDb: number;
}) {
  const { paymentKey, orderId, amount, expectedAmountFromDb } = params;

  // [1단계] DB에 사전 저장된 주문 금액과 클라이언트 요청 금액 일치 여부 검증 (위변조 방지 필수)
  if (Number(amount) !== Number(expectedAmountFromDb)) {
    throw new Error('결제 요청 금액과 주문 금액이 일치하지 않습니다 (위변조 의심).');
  }

  // [2단계] 시크릿 키 Base64 인코딩 (`${SECRET_KEY}:` 형태)
  const secretKey = process.env.TOSS_SECRET_KEY || 'test_sk_zXLkKEypNArWmo50nX3lmeaxYG5R';
  const basicToken = Buffer.from(`${secretKey}:`).toString('base64');

  // [3단계] 토스페이먼츠 결제 승인 API 호출
  const response = await fetch('https://api.tosspayments.com/v1/payments/confirm', {
    method: 'POST',
    headers: {
      Authorization: `Basic ${basicToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      paymentKey,
      orderId,
      amount,
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    // 승인 실패 시 에러 코드와 메시지를 프론트엔드(/payment/fail)로 전달
    const error = new Error(data.message || '결제 승인 실패') as any;
    error.code = data.code || 'CONFIRM_FAILED';
    error.status = response.status;
    throw error;
  }

  // [4단계] 결제 승인 완료 후 가맹점 DB(Supabase orders, payment_transactions) 상태를 '결제완료'로 업데이트
  return data;
}
