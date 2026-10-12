import React, { useEffect, useState, useRef } from 'react';
import {
  CheckCircle2,
  Package,
  MapPin,
  CreditCard,
  ArrowRight,
  Loader2,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import {
  getPendingOrderSession,
  clearPendingOrderSession,
  isOrderAlreadyConfirmed,
  markOrderConfirmed,
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
  const [finalizedOrder, setFinalizedOrder] = useState<Order | null>(null);
  const processedRef = useRef<boolean>(false);

  const params = new URLSearchParams(window.location.search);
  const orderId = params.get('orderId') || `ORD-${Date.now()}`;
  const amountParam = Number(params.get('amount') || 0);
  const methodParam = params.get('method') || '신용/체크카드';

  useEffect(() => {
    if (processedRef.current) return;
    processedRef.current = true;

    const pendingOrder = getPendingOrderSession();

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
        finalPrice: amountParam || pendingOrder.finalPrice,
        status: '결제완료',
        recipientName: pendingOrder.recipientName,
        recipientPhone: pendingOrder.recipientPhone,
        postalCode: pendingOrder.postalCode,
        address: pendingOrder.address,
        detailAddress: pendingOrder.detailAddress,
        deliveryMemo: pendingOrder.deliveryMemo,
        paymentMethod: methodParam || pendingOrder.paymentMethod,
      });

      markOrderConfirmed(orderId);
      clearCart();
      clearPendingOrderSession();
      setFinalizedOrder(created);
      showToast('결제가 완료되어 주문이 접수되었습니다!');
    } else {
      const existing = orders.find((o) => o.orderNumber === orderId);
      if (existing) setFinalizedOrder(existing);
    }

    setTimeout(() => setIsVerifying(false), 300);
  }, []);

  if (isVerifying) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center px-4 text-center">
        <Loader2 size={36} className="animate-spin text-[#0064FF] mb-4" />
        <h2 className="text-xl font-bold text-stone-900">결제 완료 처리 중입니다...</h2>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-14">
      <div className="bg-white border border-stone-200 rounded-2xl p-8 shadow-xs text-center mb-6">
        <div className="w-16 h-16 rounded-full bg-emerald-600 text-white flex items-center justify-center mx-auto mb-4">
          <CheckCircle2 size={34} />
        </div>
        <h1 className="font-serif text-2xl md:text-3xl font-bold text-stone-900 mb-2">
          결제 및 주문이 완료되었습니다!
        </h1>
        <p className="text-sm text-stone-500">
          주문번호: <strong className="text-stone-800">{orderId}</strong>
        </p>

        {/* 결제 요약 */}
        <div className="mt-6 bg-stone-50 rounded-xl p-5 border border-stone-200 text-left space-y-3 text-sm">
          <div className="flex justify-between">
            <span className="text-stone-500">결제 수단</span>
            <span className="font-bold text-stone-900 flex items-center gap-1.5">
              <CreditCard size={15} />
              {finalizedOrder?.paymentMethod || methodParam}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-stone-500">최종 결제 금액</span>
            <span className="text-lg font-black text-[#0064FF]">
              {(finalizedOrder?.finalPrice || amountParam).toLocaleString()}원
            </span>
          </div>
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
