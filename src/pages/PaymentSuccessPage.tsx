import React, { useEffect, useState, useRef } from 'react';
import {
  CheckCircle2,
  ShieldCheck,
  Receipt,
  Package,
  MapPin,
  CreditCard,
  ArrowRight,
  ExternalLink,
  Loader2,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import {
  confirmPaymentWithBackend,
  getPendingOrderSession,
  clearPendingOrderSession,
  isOrderAlreadyConfirmed,
  markOrderConfirmed,
  PaymentConfirmResponse,
  PgProvider,
} from '../services/paymentService';
import { Order } from '../types';

interface PaymentSuccessPageProps {
  onNavigate: (path: string) => void;
}

export const PaymentSuccessPage: React.FC<PaymentSuccessPageProps> = ({ onNavigate }) => {
  const { addOrder, usePoints, orders } = useAuth();
  const { clearCart } = useCart();
  const { showToast } = useToast();

  const [isVerifying, setIsVerifying] = useState<boolean>(true);
  const [confirmResult, setConfirmResult] = useState<PaymentConfirmResponse | null>(null);
  const [finalizedOrder, setFinalizedOrder] = useState<Order | null>(null);
  const processedRef = useRef<boolean>(false);

  useEffect(() => {
    if (processedRef.current) return;
    processedRef.current = true;

    const runPaymentVerification = async () => {
      const params = new URLSearchParams(window.location.search);
      const paymentKey = params.get('paymentKey') || `tviva_${Date.now()}`;
      const orderId = params.get('orderId') || `ORD-${Date.now()}`;
      const amountParam = Number(params.get('amount') || 0);
      const methodParam = params.get('method') || undefined;
      const pgParam = (params.get('pg') as PgProvider) || 'tosspayments';

      const pendingOrder = getPendingOrderSession();
      const targetAmount = amountParam || pendingOrder?.finalPrice || 0;

      // 1. 백엔드 및 금액 위변조 검증 실행
      const verification = await confirmPaymentWithBackend({
        paymentKey,
        orderId,
        amount: targetAmount,
        method: methodParam || pendingOrder?.paymentMethod,
        pgProvider: pgParam,
      });

      if (!verification.success) {
        const failQuery = new URLSearchParams({
          code: verification.errorCode || 'PAYMENT_VERIFY_ERROR',
          message: verification.errorMessage || '결제 승인 검증에 실패했습니다.',
          orderId,
        }).toString();
        onNavigate(`/payment/fail?${failQuery}`);
        return;
      }

      setConfirmResult(verification);

      // 2. 중복 주문 생성 방지 확인 후 주문 확정 & Supabase DB 저장
      if (!isOrderAlreadyConfirmed(orderId) && pendingOrder) {
        if (pendingOrder.usedPoints > 0) {
          usePoints(
            pendingOrder.usedPoints,
            `${pendingOrder.orderName} 주문 결제 차감 (${orderId})`
          );
        }

        const created = addOrder({
          id: `ord-${Date.now()}`,
          orderNumber: orderId,
          items: pendingOrder.items,
          totalProductPrice: pendingOrder.totalProductPrice,
          discountPrice: pendingOrder.discountPrice,
          usedPoints: pendingOrder.usedPoints,
          couponDiscount: pendingOrder.couponDiscount,
          couponCode: pendingOrder.couponCode,
          shippingFee: pendingOrder.shippingFee,
          finalPrice: verification.amount,
          status:
            verification.method.includes('무통장') || verification.method.includes('가상계좌')
              ? '입금대기'
              : '결제완료',
          recipientName: pendingOrder.recipientName,
          recipientPhone: pendingOrder.recipientPhone,
          postalCode: pendingOrder.postalCode,
          address: pendingOrder.address,
          detailAddress: pendingOrder.detailAddress,
          deliveryMemo: pendingOrder.deliveryMemo,
          paymentMethod: verification.method,
          paymentKey: verification.paymentKey,
          pgProvider: verification.pgProvider,
          receiptUrl: verification.receiptUrl,
          approvedAt: verification.approvedAt,
        });

        markOrderConfirmed(orderId);
        clearCart();
        clearPendingOrderSession();
        setFinalizedOrder(created);
        showToast('PG 결제 승인 및 Supabase 주문 등록이 완료되었습니다.');
      } else {
        const existing = orders.find((o) => o.orderNumber === orderId);
        if (existing) {
          setFinalizedOrder(existing);
        }
      }

      setTimeout(() => {
        setIsVerifying(false);
      }, 450);
    };

    runPaymentVerification();
  }, []);

  if (isVerifying) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 text-center">
        <div className="w-16 h-16 rounded-full bg-blue-50 border border-blue-200 flex items-center justify-center mb-5 text-[#0064FF]">
          <Loader2 size={30} className="animate-spin" />
        </div>
        <h2 className="font-serif text-2xl font-bold text-stone-900 mb-2">
          결제 승인 내역을 검증하고 있습니다
        </h2>
        <p className="text-sm text-stone-500 max-w-md">
          PG사(토스페이먼츠/포트원) 결제 승인 서버와 주문 금액 일치 여부를 확인하고 Supabase 데이터베이스에 주문을 기록하고 있습니다...
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-14">
      {/* 상단 완료 배너 */}
      <div className="bg-white border border-stone-200 rounded-2xl p-8 md:p-10 shadow-xs text-center mb-8">
        <div className="w-16 h-16 rounded-full bg-emerald-900 text-white flex items-center justify-center mx-auto mb-5 shadow-md">
          <CheckCircle2 size={32} />
        </div>
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 mb-3">
          <ShieldCheck size={14} />
          PG 결제 승인 및 금액 위변조 검증 완료
        </span>
        <h1 className="font-serif text-2xl md:text-3xl font-bold text-stone-900 mb-2">
          주문이 정상적으로 완료되었습니다
        </h1>
        <p className="text-sm text-stone-600">
          전주이씨(JEONJU LEE) 헤리티지 컬렉션을 선택해 주셔서 감사합니다.
        </p>
      </div>

      {/* PG 결제 승인 영수증 정보 */}
      <div className="bg-white border border-stone-200 rounded-2xl p-6 md:p-8 shadow-xs mb-6">
        <div className="flex items-center justify-between pb-4 mb-5 border-b border-stone-200">
          <h2 className="text-base font-bold text-stone-900 flex items-center gap-2">
            <Receipt size={18} className="text-amber-800" />
            PG 결제 승인 내역 (전자영수증)
          </h2>
          <span className="text-xs font-semibold px-2.5 py-1 rounded bg-blue-50 text-[#0064FF] border border-blue-200">
            {confirmResult?.pgProvider === 'portone' ? 'PortOne (포트원)' : 'Toss Payments (토스페이먼츠)'}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div className="p-3.5 bg-stone-50 rounded-xl border border-stone-200/70">
            <span className="text-xs text-stone-500 block mb-1">주문번호 (orderId)</span>
            <span className="font-mono font-bold text-stone-900">
              {confirmResult?.orderId || finalizedOrder?.orderNumber}
            </span>
          </div>
          <div className="p-3.5 bg-stone-50 rounded-xl border border-stone-200/70">
            <span className="text-xs text-stone-500 block mb-1">PG 결제키 (paymentKey)</span>
            <span className="font-mono text-xs font-semibold text-stone-700 break-all">
              {confirmResult?.paymentKey}
            </span>
          </div>
          <div className="p-3.5 bg-stone-50 rounded-xl border border-stone-200/70">
            <span className="text-xs text-stone-500 block mb-1">결제 수단</span>
            <span className="font-bold text-stone-900 flex items-center gap-1.5">
              <CreditCard size={15} className="text-stone-600" />
              {confirmResult?.method || finalizedOrder?.paymentMethod}
            </span>
          </div>
          <div className="p-3.5 bg-stone-50 rounded-xl border border-stone-200/70">
            <span className="text-xs text-stone-500 block mb-1">최종 승인 금액</span>
            <span className="text-lg font-black text-amber-900">
              {(confirmResult?.amount || finalizedOrder?.finalPrice || 0).toLocaleString()}원
            </span>
          </div>
        </div>

        {confirmResult?.receiptUrl && (
          <div className="mt-4 pt-4 border-t border-stone-100 flex items-center justify-between text-xs text-stone-500">
            <span>승인일시: {new Date(confirmResult.approvedAt).toLocaleString('ko-KR')}</span>
            <a
              href={confirmResult.receiptUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 font-semibold text-[#0064FF] hover:underline"
            >
              매출전표 확인 <ExternalLink size={12} />
            </a>
          </div>
        )}
      </div>

      {/* 주문 상품 및 배송지 요약 */}
      {finalizedOrder && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white border border-stone-200 rounded-2xl p-6 shadow-xs">
            <h3 className="text-sm font-bold text-stone-900 flex items-center gap-2 pb-3 mb-4 border-b border-stone-200">
              <MapPin size={16} className="text-amber-800" />
              배송지 정보
            </h3>
            <div className="space-y-2 text-xs text-stone-600">
              <p>
                <span className="font-bold text-stone-900 mr-2">수령인:</span>
                {finalizedOrder.recipientName} ({finalizedOrder.recipientPhone})
              </p>
              <p>
                <span className="font-bold text-stone-900 mr-2">배송주소:</span>
                [{finalizedOrder.postalCode}] {finalizedOrder.address} {finalizedOrder.detailAddress}
              </p>
              {finalizedOrder.deliveryMemo && (
                <p>
                  <span className="font-bold text-stone-900 mr-2">배송메모:</span>
                  {finalizedOrder.deliveryMemo}
                </p>
              )}
            </div>
          </div>

          <div className="bg-white border border-stone-200 rounded-2xl p-6 shadow-xs">
            <h3 className="text-sm font-bold text-stone-900 flex items-center gap-2 pb-3 mb-4 border-b border-stone-200">
              <Package size={16} className="text-amber-800" />
              주문 상품 ({finalizedOrder.items.length}건)
            </h3>
            <div className="space-y-3 max-h-44 overflow-y-auto pr-1">
              {finalizedOrder.items.map((item, idx) => (
                <div key={idx} className="flex items-center gap-3 text-xs">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-12 h-14 object-cover rounded bg-stone-100 shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-stone-900 truncate">{item.name}</p>
                    <p className="text-stone-500">
                      {item.color} / {item.size} · {item.quantity}개
                    </p>
                  </div>
                  <span className="font-bold text-stone-900">
                    {(item.price * item.quantity).toLocaleString()}원
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 하단 이동 버튼 */}
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <button
          onClick={() => onNavigate('/mypage')}
          className="px-8 py-4 bg-stone-900 text-white text-sm font-bold rounded-xl hover:bg-stone-800 transition-colors flex items-center justify-center gap-2"
        >
          마이페이지 주문내역 확인 <ArrowRight size={16} />
        </button>
        <button
          onClick={() => onNavigate('/shop')}
          className="px-8 py-4 border border-stone-300 bg-white text-stone-800 text-sm font-bold rounded-xl hover:bg-stone-50 transition-colors"
        >
          쇼핑 계속하기
        </button>
      </div>
    </div>
  );
};
