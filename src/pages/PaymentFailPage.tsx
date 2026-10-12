import React from 'react';
import { AlertTriangle, RotateCcw, ShoppingBag } from 'lucide-react';

interface PaymentFailPageProps {
  onNavigate: (path: string) => void;
}

export const PaymentFailPage: React.FC<PaymentFailPageProps> = ({ onNavigate }) => {
  const params = new URLSearchParams(window.location.search);
  const errorMessage =
    params.get('message') || '결제가 취소되었거나 승인 처리 중 문제가 발생했습니다.';

  return (
    <div className="max-w-xl mx-auto px-4 py-16">
      <div className="bg-white border border-red-200 rounded-2xl p-8 shadow-xs text-center">
        <div className="w-16 h-16 rounded-full bg-red-600 text-white flex items-center justify-center mx-auto mb-4">
          <AlertTriangle size={32} />
        </div>

        <h1 className="font-serif text-2xl font-bold text-stone-900 mb-2">
          결제에 실패했습니다
        </h1>
        <p className="text-sm text-stone-500 mb-6">
          장바구니 상품은 그대로 보관되어 있으니 다시 결제를 진행해 주세요.
        </p>

        {/* 실패 사유 */}
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-sm font-semibold text-red-700 mb-8">
          사유: {errorMessage}
        </div>

        {/* 다시 결제하기 / 장바구니 버튼 */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={() => onNavigate('/checkout')}
            className="px-7 py-3.5 bg-stone-900 text-white text-sm font-bold rounded-xl hover:bg-stone-800 transition-colors flex items-center justify-center gap-2"
          >
            <RotateCcw size={16} />
            주문서로 돌아가 다시 결제하기
          </button>
          <button
            onClick={() => onNavigate('/cart')}
            className="px-6 py-3.5 border border-stone-300 bg-white text-stone-800 text-sm font-bold rounded-xl hover:bg-stone-50 transition-colors flex items-center justify-center gap-2"
          >
            <ShoppingBag size={16} />
            장바구니로 이동
          </button>
        </div>
      </div>
    </div>
  );
};
