import React, { useState } from 'react';
import {
  CreditCard,
  X,
  CheckCircle2,
  XCircle,
  Loader2,
} from 'lucide-react';
import {
  PendingPaymentOrder,
  savePendingOrderSession,
} from '../../services/paymentService';

interface PgPaymentModalProps {
  isOpen: boolean;
  pendingOrder: PendingPaymentOrder | null;
  onClose: () => void;
  onNavigate: (path: string) => void;
}

const SIMPLE_CARD_LIST = ['현대카드', '삼성카드', '신한카드', 'KB국민카드', '카카오페이', '토스페이'];

export const PgPaymentModal: React.FC<PgPaymentModalProps> = ({
  isOpen,
  pendingOrder,
  onClose,
  onNavigate,
}) => {
  const [selectedPay, setSelectedPay] = useState<string>(
    pendingOrder?.paymentMethod || '현대카드'
  );
  const [isLoading, setIsLoading] = useState<boolean>(false);

  if (!isOpen || !pendingOrder) return null;

  // 1. [성공] 버튼 클릭 -> 바로 주문 완료 페이지(/payment/success)로 이동
  const handleSuccessPay = () => {
    setIsLoading(true);
    savePendingOrderSession({
      ...pendingOrder,
      paymentMethod: selectedPay,
    });

    setTimeout(() => {
      setIsLoading(false);
      const query = new URLSearchParams({
        paymentKey: `toss_${Date.now()}`,
        orderId: pendingOrder.orderId,
        amount: String(pendingOrder.finalPrice),
        method: selectedPay,
      }).toString();

      onNavigate(`/payment/success?${query}`);
    }, 500);
  };

  // 2. [실패] 버튼 클릭 -> 바로 에러 페이지(/payment/fail)로 이동
  const handleFailPay = () => {
    savePendingOrderSession(pendingOrder);
    const query = new URLSearchParams({
      code: 'PAY_FAILED',
      message: '결제가 취소되었거나 카드 한도 초과로 승인에 실패했습니다.',
      orderId: pendingOrder.orderId,
    }).toString();

    onNavigate(`/payment/fail?${query}`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden border border-stone-200 animate-fade-in">
        {/* 상단 헤더 */}
        <div className="bg-[#0064FF] px-6 py-4 flex items-center justify-between text-white">
          <div className="flex items-center gap-2">
            <CreditCard size={20} />
            <span className="font-bold text-base">토스페이먼츠 간편결제</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-white/20 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* 본문 */}
        <div className="p-6 space-y-5">
          {/* 결제 금액 & 상품명 */}
          <div className="bg-stone-50 p-4 rounded-xl border border-stone-200 text-center">
            <p className="text-xs text-stone-500 mb-1">{pendingOrder.orderName}</p>
            <p className="text-2xl font-black text-[#0064FF]">
              {pendingOrder.finalPrice.toLocaleString()}원
            </p>
          </div>

          {/* 카드 / 간편결제 선택 */}
          <div>
            <p className="text-xs font-bold text-stone-700 mb-2">결제 수단 선택</p>
            <div className="grid grid-cols-3 gap-2">
              {SIMPLE_CARD_LIST.map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => setSelectedPay(item)}
                  className={`py-2.5 px-2 rounded-lg text-xs font-bold border transition-all ${
                    selectedPay === item
                      ? 'border-[#0064FF] bg-blue-50 text-[#0064FF]'
                      : 'border-stone-200 text-stone-600 hover:border-stone-400'
                  }`}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>

          {/* 원클릭 결제 성공 / 실패 버튼 */}
          <div className="space-y-2.5 pt-2">
            <button
              type="button"
              disabled={isLoading}
              onClick={handleSuccessPay}
              className="w-full py-4 bg-[#0064FF] hover:bg-[#0052D4] text-white font-bold text-sm rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  결제 처리 중...
                </>
              ) : (
                <>
                  <CheckCircle2 size={18} />
                  {pendingOrder.finalPrice.toLocaleString()}원 결제 완료하기 (성공)
                </>
              )}
            </button>

            <button
              type="button"
              onClick={handleFailPay}
              className="w-full py-3 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-1.5"
            >
              <XCircle size={15} />
              결제 실패 테스트 (에러 페이지로 이동)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
