import React from 'react';
import {
  AlertTriangle,
  RotateCcw,
  ShoppingBag,
  Headphones,
  ShieldAlert,
} from 'lucide-react';
import { getPendingOrderSession } from '../services/paymentService';

interface PaymentFailPageProps {
  onNavigate: (path: string) => void;
}

export const PaymentFailPage: React.FC<PaymentFailPageProps> = ({ onNavigate }) => {
  const params = new URLSearchParams(window.location.search);
  const errorCode = params.get('code') || 'PAY_PROCESS_CANCELED';
  const errorMessage =
    params.get('message') || '결제 처리 중 오류가 발생했거나 사용자에 의해 결제가 취소되었습니다.';
  const orderId = params.get('orderId') || '-';
  const pgProvider = params.get('pg') || 'tosspayments';

  const pendingOrder = getPendingOrderSession();

  return (
    <div className="max-w-2xl mx-auto px-4 py-16">
      <div className="bg-white border border-red-200 rounded-2xl p-8 md:p-10 shadow-xs text-center">
        <div className="w-16 h-16 rounded-full bg-red-600 text-white flex items-center justify-center mx-auto mb-5 shadow-md">
          <AlertTriangle size={32} />
        </div>

        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-red-50 text-red-700 border border-red-200 mb-3">
          <ShieldAlert size={14} />
          결제 미완료 · {pgProvider === 'portone' ? 'PortOne (포트원)' : 'Toss Payments (토스페이먼츠)'}
        </span>

        <h1 className="font-serif text-2xl md:text-3xl font-bold text-stone-900 mb-3">
          결제에 실패하였습니다
        </h1>
        <p className="text-sm text-stone-600 max-w-md mx-auto mb-8">
          아래 실패 사유를 확인하신 후 다시 결제를 시도해 주세요. 장바구니와 주문서 정보는 안전하게 보관되어 있습니다.
        </p>

        {/* 에러 상세 정보 박스 */}
        <div className="bg-stone-50 border border-stone-200 rounded-xl p-5 text-left space-y-3 mb-8">
          <div className="flex items-center justify-between text-xs border-b border-stone-200 pb-2.5">
            <span className="text-stone-500 font-medium">에러 코드 (Error Code)</span>
            <span className="font-mono font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded border border-red-200">
              {errorCode}
            </span>
          </div>
          <div className="flex items-center justify-between text-xs border-b border-stone-200 pb-2.5">
            <span className="text-stone-500 font-medium">주문 번호 (orderId)</span>
            <span className="font-mono font-semibold text-stone-800">{orderId}</span>
          </div>
          {pendingOrder && (
            <div className="flex items-center justify-between text-xs border-b border-stone-200 pb-2.5">
              <span className="text-stone-500 font-medium">결제 시도 상품 / 금액</span>
              <span className="font-bold text-stone-900">
                {pendingOrder.orderName} ({pendingOrder.finalPrice.toLocaleString()}원)
              </span>
            </div>
          )}
          <div className="pt-1">
            <span className="text-xs text-stone-500 font-medium block mb-1">
              실패 상세 사유 (Failure Message)
            </span>
            <p className="text-sm font-semibold text-red-700 bg-red-50/70 p-3 rounded-lg border border-red-100">
              {errorMessage}
            </p>
          </div>
        </div>

        {/* 해결 가이드 */}
        <div className="bg-amber-50/60 border border-amber-200/80 rounded-xl p-4 text-left text-xs text-stone-700 space-y-1.5 mb-8">
          <p className="font-bold text-amber-950 mb-1">결제 오류 해결 안내</p>
          <p>• 카드 한도 초과 또는 잔액 부족인 경우 다른 결제수단(간편결제/타사 카드)을 선택해 주세요.</p>
          <p>• 브라우저 팝업 차단으로 결제창이 닫힌 경우 팝업 차단을 해제 후 다시 시도해 주세요.</p>
          <p>• 동일한 오류가 반복될 경우 고객센터(1588-1392) 또는 1:1 문의를 이용해 주세요.</p>
        </div>

        {/* 액션 버튼 */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={() => onNavigate('/checkout')}
            className="px-7 py-4 bg-stone-900 text-white text-sm font-bold rounded-xl hover:bg-stone-800 transition-colors flex items-center justify-center gap-2"
          >
            <RotateCcw size={16} />
            주문서로 돌아가 다시 결제하기
          </button>
          <button
            onClick={() => onNavigate('/cart')}
            className="px-6 py-4 border border-stone-300 bg-white text-stone-800 text-sm font-bold rounded-xl hover:bg-stone-50 transition-colors flex items-center justify-center gap-2"
          >
            <ShoppingBag size={16} />
            장바구니 확인
          </button>
          <button
            onClick={() => onNavigate('/support')}
            className="px-5 py-4 border border-stone-200 bg-stone-50 text-stone-600 text-sm font-semibold rounded-xl hover:bg-stone-100 transition-colors flex items-center justify-center gap-1.5"
          >
            <Headphones size={16} />
            고객센터
          </button>
        </div>
      </div>
    </div>
  );
};
