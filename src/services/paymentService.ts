import { OrderItem } from '../types';
import { getSupabaseClient, isSupabaseConfigured } from '../lib/supabaseClient';

export type PgProvider = 'tosspayments' | 'portone';

export interface PendingPaymentOrder {
  orderId: string;
  orderName: string;
  items: OrderItem[];
  totalProductPrice: number;
  discountPrice: number;
  usedPoints: number;
  couponDiscount?: number;
  couponCode?: string;
  shippingFee: number;
  finalPrice: number;
  recipientName: string;
  recipientPhone: string;
  customerEmail: string;
  postalCode: string;
  address: string;
  detailAddress: string;
  deliveryMemo: string;
  paymentMethod: string;
  pgProvider: PgProvider;
  createdAt: string;
}

export interface PaymentConfirmRequest {
  paymentKey: string;
  orderId: string;
  amount: number;
  pgProvider?: PgProvider;
  method?: string;
}

export interface PaymentConfirmResponse {
  success: boolean;
  paymentKey: string;
  orderId: string;
  amount: number;
  method: string;
  pgProvider: PgProvider;
  approvedAt: string;
  receiptUrl?: string;
  cardCompany?: string;
  errorCode?: string;
  errorMessage?: string;
}

const PENDING_ORDER_STORAGE_KEY = 'jeonjulee_pending_pg_order_v1';
const CONFIRMED_ORDERS_STORAGE_KEY = 'jeonjulee_confirmed_pg_orders_v1';

// 1) 토스페이먼츠 일반결제창(TossPayments V1) 공식 테스트 키 쌍
export const TOSS_STANDARD_CLIENT_KEY =
  (import.meta as any).env?.VITE_TOSS_CLIENT_KEY || 'test_ck_D5GePWvyJnrK0W0k6q8gLzN97Eoq';
export const TOSS_STANDARD_SECRET_KEY =
  (import.meta as any).env?.VITE_TOSS_SECRET_KEY || 'test_sk_zXLkKEypNArWmo50nX3lmeaxYG5R';

// 2) 토스페이먼츠 결제위젯(PaymentWidget) 공식 테스트 키 쌍
export const TOSS_WIDGET_CLIENT_KEY =
  (import.meta as any).env?.VITE_TOSS_WIDGET_CLIENT_KEY || 'test_gck_docs_Ovk5rk1EwkEbP0W43n07xlzm';
export const TOSS_WIDGET_SECRET_KEY =
  (import.meta as any).env?.VITE_TOSS_WIDGET_SECRET_KEY || 'test_gsk_docs_OaPz8L5KdmQXkzRz3y47BMw6';

export const DEFAULT_TOSS_CLIENT_KEY = TOSS_STANDARD_CLIENT_KEY;

declare global {
  interface Window {
    TossPayments?: (clientKey: string) => {
      requestPayment: (
        method: string,
        params: {
          amount: number;
          orderId: string;
          orderName: string;
          customerName?: string;
          customerEmail?: string;
          customerMobilePhone?: string;
          successUrl: string;
          failUrl: string;
          flowMode?: 'DEFAULT' | 'DIRECT';
          easyPay?: string;
        }
      ) => Promise<void>;
    };
    PaymentWidget?: (
      clientKey: string,
      customerKey: string
    ) => {
      renderPaymentMethods: (
        selector: string,
        amount: { value: number; currency?: string; country?: string },
        options?: { variantKey?: string }
      ) => {
        updateAmount: (amount: number) => void;
        getSelectedPaymentMethod: () => { method?: string; easyPay?: { provider?: string } };
      };
      renderAgreement: (selector: string, options?: { variantKey?: string }) => void;
      requestPayment: (params: {
        orderId: string;
        orderName: string;
        customerName?: string;
        customerEmail?: string;
        customerMobilePhone?: string;
        successUrl: string;
        failUrl: string;
      }) => Promise<void>;
    };
  }
}

export function generateMerchantOrderId(): string {
  const datePart = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const randomPart = Math.floor(100000 + Math.random() * 900000);
  return `ORD-${datePart}-${randomPart}`;
}

export function savePendingOrderSession(order: PendingPaymentOrder): void {
  try {
    sessionStorage.setItem(PENDING_ORDER_STORAGE_KEY, JSON.stringify(order));
    localStorage.setItem(PENDING_ORDER_STORAGE_KEY, JSON.stringify(order));
  } catch (e) {
    console.warn('Failed to save pending order session:', e);
  }
}

export function getPendingOrderSession(): PendingPaymentOrder | null {
  try {
    const raw =
      sessionStorage.getItem(PENDING_ORDER_STORAGE_KEY) ||
      localStorage.getItem(PENDING_ORDER_STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as PendingPaymentOrder;
  } catch {
    return null;
  }
}

export function clearPendingOrderSession(): void {
  try {
    sessionStorage.removeItem(PENDING_ORDER_STORAGE_KEY);
    localStorage.removeItem(PENDING_ORDER_STORAGE_KEY);
  } catch {
    // ignore
  }
}

export function isOrderAlreadyConfirmed(orderId: string): boolean {
  try {
    const raw = sessionStorage.getItem(CONFIRMED_ORDERS_STORAGE_KEY);
    const list: string[] = raw ? JSON.parse(raw) : [];
    return list.includes(orderId);
  } catch {
    return false;
  }
}

export function markOrderConfirmed(orderId: string): void {
  try {
    const raw = sessionStorage.getItem(CONFIRMED_ORDERS_STORAGE_KEY);
    const list: string[] = raw ? JSON.parse(raw) : [];
    if (!list.includes(orderId)) {
      list.push(orderId);
      sessionStorage.setItem(CONFIRMED_ORDERS_STORAGE_KEY, JSON.stringify(list));
    }
  } catch {
    // ignore
  }
}

export function loadTossPaymentsScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (typeof window !== 'undefined' && window.TossPayments) {
      resolve();
      return;
    }
    const existing = document.querySelector('script[src="https://js.tosspayments.com/v1/payment"]');
    if (existing) {
      existing.addEventListener('load', () => resolve());
      existing.addEventListener('error', () =>
        reject(new Error('토스페이먼츠 SDK 스크립트 로드에 실패했습니다.'))
      );
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://js.tosspayments.com/v1/payment';
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('토스페이먼츠 SDK 스크립트 로드에 실패했습니다.'));
    document.head.appendChild(script);
  });
}

export function loadTossPaymentWidgetScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (typeof window !== 'undefined' && window.PaymentWidget) {
      resolve();
      return;
    }
    const existing = document.querySelector(
      'script[src="https://js.tosspayments.com/v1/payment-widget"]'
    );
    if (existing) {
      existing.addEventListener('load', () => resolve());
      existing.addEventListener('error', () =>
        reject(new Error('토스페이먼츠 결제위젯 스크립트 로드에 실패했습니다.'))
      );
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://js.tosspayments.com/v1/payment-widget';
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('토스페이먼츠 결제위젯 스크립트 로드에 실패했습니다.'));
    document.head.appendChild(script);
  });
}

/**
 * 실제 토스페이먼츠(Toss Payments) 공식 결제창 호출
 * 클릭 즉시 토스페이먼츠 실결제창이 뜨며, 카드/간편결제 인증 완료 시 /payment/success로 이동합니다.
 */
export async function requestRealTossPayment(
  pendingOrder: PendingPaymentOrder,
  clientKey: string = TOSS_STANDARD_CLIENT_KEY
): Promise<void> {
  savePendingOrderSession(pendingOrder);
  await loadTossPaymentsScript();

  if (!window.TossPayments) {
    throw new Error('토스페이먼츠 SDK를 불러오지 못했습니다.');
  }

  const tossPayments = window.TossPayments(clientKey.trim());
  const origin = window.location.origin;

  // 사용자가 선택한 결제 수단 매핑
  let tossMethod = '카드';
  if (pendingOrder.paymentMethod.includes('계좌이체')) {
    tossMethod = '계좌이체';
  } else if (
    pendingOrder.paymentMethod.includes('무통장') ||
    pendingOrder.paymentMethod.includes('가상계좌')
  ) {
    tossMethod = '가상계좌';
  } else if (pendingOrder.paymentMethod.includes('휴대폰')) {
    tossMethod = '휴대폰';
  }

  await tossPayments.requestPayment(tossMethod, {
    amount: pendingOrder.finalPrice,
    orderId: pendingOrder.orderId,
    orderName: pendingOrder.orderName,
    customerName: pendingOrder.recipientName,
    customerEmail: pendingOrder.customerEmail,
    successUrl: `${origin}/payment/success`,
    failUrl: `${origin}/payment/fail`,
  });
}

/**
 * 실제 토스페이먼츠 결제 승인 API (POST https://api.tosspayments.com/v1/payments/confirm) 호출
 */
export async function confirmPaymentWithBackend(
  req: PaymentConfirmRequest
): Promise<PaymentConfirmResponse> {
  const pendingOrder = getPendingOrderSession();

  // 1. 주문 금액 위변조 대조
  if (pendingOrder && pendingOrder.orderId === req.orderId) {
    if (Number(pendingOrder.finalPrice) !== Number(req.amount)) {
      return {
        success: false,
        paymentKey: req.paymentKey,
        orderId: req.orderId,
        amount: req.amount,
        method: req.method || pendingOrder.paymentMethod,
        pgProvider: 'tosspayments',
        approvedAt: new Date().toISOString(),
        errorCode: 'AMOUNT_MISMATCH',
        errorMessage: `결제 요청 금액(${pendingOrder.finalPrice.toLocaleString()}원)과 승인 요청 금액(${Number(req.amount).toLocaleString()}원)이 일치하지 않습니다.`,
      };
    }
  }

  // 2. 토스페이먼츠 공식 결제 승인 서버(https://api.tosspayments.com/v1/payments/confirm) 호출
  // 결제위젯 시크릿키(test_gsk_...) 및 일반결제창 시크릿키(test_sk_...) 모두 호환되도록 순차 요청
  const secretKeysToTry = [TOSS_WIDGET_SECRET_KEY, TOSS_STANDARD_SECRET_KEY];
  let tossApprovedData: any = null;
  let lastError: { code?: string; message?: string } | null = null;

  for (const secretKey of secretKeysToTry) {
    try {
      const basicAuth = btoa(`${secretKey}:`);
      const response = await fetch('https://api.tosspayments.com/v1/payments/confirm', {
        method: 'POST',
        headers: {
          Authorization: `Basic ${basicAuth}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          paymentKey: req.paymentKey,
          orderId: req.orderId,
          amount: Number(req.amount),
        }),
      });

      const data = await response.json();

      if (response.ok) {
        tossApprovedData = data;
        break;
      } else {
        lastError = data;
        // 이미 승인 완료된 건인 경우 성공으로 간주
        if (data?.code === 'ALREADY_PROCESSED_PAYMENT') {
          tossApprovedData = {
            paymentKey: req.paymentKey,
            orderId: req.orderId,
            totalAmount: req.amount,
            method: pendingOrder?.paymentMethod || '카드',
            approvedAt: new Date().toISOString(),
          };
          break;
        }
      }
    } catch (err: any) {
      lastError = { code: 'NETWORK_ERROR', message: err?.message };
    }
  }

  if (!tossApprovedData) {
    return {
      success: false,
      paymentKey: req.paymentKey,
      orderId: req.orderId,
      amount: req.amount,
      method: req.method || pendingOrder?.paymentMethod || '카드',
      pgProvider: 'tosspayments',
      approvedAt: new Date().toISOString(),
      errorCode: lastError?.code || 'PAYMENT_CONFIRM_FAILED',
      errorMessage:
        lastError?.message || '토스페이먼츠 결제 승인 서버 검증에 실패했습니다.',
    };
  }

  const approvedAt = tossApprovedData.approvedAt || new Date().toISOString();
  const resolvedMethod =
    tossApprovedData.easyPay?.provider ||
    tossApprovedData.method ||
    pendingOrder?.paymentMethod ||
    '신용/체크카드';
  const receiptUrl = tossApprovedData.receipt?.url || undefined;

  // 3. Supabase payment_transactions 테이블에 실제 승인 데이터 저장
  if (isSupabaseConfigured()) {
    try {
      const client = getSupabaseClient();
      await client.from('payment_transactions').upsert(
        [
          {
            payment_key: req.paymentKey,
            order_id: req.orderId,
            amount: Number(tossApprovedData.totalAmount || req.amount),
            method: resolvedMethod,
            pg_provider: 'tosspayments',
            status: tossApprovedData.status || 'DONE',
            customer_name: pendingOrder?.recipientName || '고객',
            receipt_url: receiptUrl || null,
            approved_at: approvedAt,
            raw_response: tossApprovedData,
          },
        ],
        { onConflict: 'payment_key' }
      );
    } catch {
      // 테이블 미생성 시 무시
    }
  }

  return {
    success: true,
    paymentKey: req.paymentKey,
    orderId: req.orderId,
    amount: Number(tossApprovedData.totalAmount || req.amount),
    method: resolvedMethod,
    pgProvider: 'tosspayments',
    approvedAt,
    receiptUrl,
  };
}
