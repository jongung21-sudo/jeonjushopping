import React, { useEffect, useState, useRef } from 'react';
import {
  CheckCircle2,
  Package,
  MapPin,
  CreditCard,
  ArrowRight,
  ExternalLink,
  Loader2,
  ShieldCheck,
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

    const verifyAndApprove = async () => {
      const params = new URLSearchParams(window.location.search);
      const paymentKey = params.get('paymentKey') || '';
      const orderId = params.get('orderId') || '';
      const amountParam = Number(params.get('amount') || 0);

      if (!paymentKey || !orderId || !amountParam) {
        const failQuery = new URLSearchParams({
          code: 'INVALID_REQUEST',
          message: '결제 인증 정보(paymentKey, orderId, amount)가 올바르지 않습니다.',
          orderId: orderId || '-',
        }).toString();
        onNavigate(`/payment/fail?${failQuery}`);
        return;
      }

      const pendingOrder = getPendingOrderSession();

      // 실제 토스페이먼츠 승인 서버(https://api.tosspayments.com/v1/payments/confirm) 호출하여 최종 결제 승인!
      const verification = await confirmPaymentWithBackend({
        paymentKey,
        orderId,
        amount: amountParam,
        method: pendingOrder?.paymentMethod,
      });

      if (!verification.success) {
        const failQuery = new URLSearchParams({
          code: verification.errorCode || 'CONFIRM_FAILED',
          message: verification.errorMessage || '토스페이먼츠 최종 결제 승인에 실패했습니다.',
          orderId,
        }).toString();
        onNavigate(`/payment/fail?${failQuery}`);
        return;
      }

      setConfirmResult(verification);

      // 승인 성공 시 주문 생성 및 Supabase DB 반영
      if (!isOrderAlreadyConfirmed(orderId) && pendingOrder) {
        if (pendingOrder.usedPoints > 0) {
          usePoints(pendingOrder.usedPoints, '주문 결제 시 포인트 사용');
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
            verification.method.includes('가상계좌') || verification.method.includes('무통장')
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
          pgProvider: 'tosspayments',
          receiptUrl: verification.receiptUrl,
          approvedAt: verification.approvedAt,
        });

        markOrderConfirmed(orderId);
        clearCart();
        clearPendingOrderSession();
        setFinalizedOrder(created);
        showToast('토스페이먼츠 실제 결제 승인 및 주문 등록이 완료되었습니다!');
      } else {
        const existing = orders.find((o) => o.orderNumber === orderId);
        if (existing) setFinalizedOrder(existing);
      }

      setIsVerifying(false);
    };

    verifyAndApprove();
  }, []);

  if (isVerifying) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center px-4 text-center">
        <Loader2 size={38} className="animate-spin text-[#0064FF] mb-4" />
        <h2 className="text-xl font-bold text-stone-900 mb-1">
          토스페이먼츠 결제 승인 서버 확인 중...
        </h2>
        <p className="text-xs text-stone-500">
          실제 결제 승인(api.tosspayments.com/v1/payments/confirm)을 진행하고 있습니다. 잠시만 기다려 주세요.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-14">
      <div className="bg-white border border-stone-200 rounded-2xl p-8 shadow-xs text-center mb-6">
        <div className="w-16 h-16 rounded-full bg-emerald-600 text-white flex items-center justify-center mx-auto mb-4">
          <CheckCircle2 size={34} />
        </div>
        <span className="inline-flex items-center gap-1 text-xs font-bold text-[#0064FF] bg-blue-50 px-3 py-1 rounded-full border border-blue-200 mb-3">
          <ShieldCheck size={14} />
          토스페이먼츠 실결제 승인 완료
        </span>
        <h1 className="font-serif text-2xl md:text-3xl font-bold text-stone-900 mb-2">
          결제 및 주문이 완료되었습니다!
        </h1>
        <p className="text-sm text-stone-500">
          주문번호: <strong className="text-stone-800">{confirmResult?.orderId}</strong>
        </p>

        {/* 결제 요약 */}
        <div className="mt-6 bg-stone-50 rounded-xl p-5 border border-stone-200 text-left space-y-3 text-sm">
          <div className="flex justify-between">
            <span className="text-stone-500">결제 수단</span>
            <span className="font-bold text-stone-900 flex items-center gap-1.5">
              <CreditCard size={15} />
              {confirmResult?.method || finalizedOrder?.paymentMethod}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-stone-500">최종 승인 금액</span>
            <span className="text-lg font-black text-[#0064FF]">
              {(confirmResult?.amount || finalizedOrder?.finalPrice || 0).toLocaleString()}원
            </span>
          </div>
          {confirmResult?.receiptUrl && (
            <div className="flex justify-between items-center pt-2 border-t border-stone-200">
              <span className="text-stone-500 text-xs">토스페이먼츠 매출전표</span>
              <a
                href={confirmResult.receiptUrl}
                target="_blank"
                rel="noreferrer"
                className="text-xs font-bold text-[#0064FF] hover:underline flex items-center gap-1"
              >
                실제 영수증 확인하기 <ExternalLink size={12} />
              </a>
            </div>
          )}
          {finalizedOrder && (
            <div className="pt-3 border-t border-stone-200 flex items-start justify-between gap-4">
              <span className="text-stone-500 shrink-0 flex items-center gap-1">
                <MapPin size={14} /> 배송지
              </span>
              <span className="text-xs font-medium text-stone-800 text-right">
                {finalizedOrder.recipientName} · {finalizedOrder.address} {finalizedOrder.detailAddress}
              </span>
            </div>
          )}
        </div>

        {/* 주문 상품 */}
        {finalizedOrder && finalizedOrder.items.length > 0 && (
          <div className="mt-4 bg-stone-50 rounded-xl p-4 border border-stone-200 text-left">
            <p className="text-xs font-bold text-stone-700 mb-3 flex items-center gap-1.5">
              <Package size={14} /> 주문 상품 ({finalizedOrder.items.length}건)
            </p>
            <div className="space-y-2.5">
              {finalizedOrder.items.map((item, idx) => (
                <div key={idx} className="flex items-center gap-3 text-xs">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-11 h-12 object-cover rounded border border-stone-200"
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
        )}

        {/* 버튼 */}
        <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={() => onNavigate('/orders')}
            className="px-7 py-3.5 bg-stone-900 text-white text-sm font-bold rounded-xl hover:bg-stone-800 transition-colors flex items-center justify-center gap-2"
          >
            주문 내역 보러가기 <ArrowRight size={16} />
          </button>
          <button
            onClick={() => onNavigate('/shop')}
            className="px-7 py-3.5 border border-stone-300 bg-white text-stone-800 text-sm font-bold rounded-xl hover:bg-stone-50 transition-colors"
          >
            쇼핑 계속하기
          </button>
        </div>
      </div>
    </div>
  );
};
