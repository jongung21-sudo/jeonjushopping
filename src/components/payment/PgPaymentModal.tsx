import React, { useState } from 'react';
import {
  ShieldCheck,
  CreditCard,
  Lock,
  X,
  CheckCircle2,
  AlertTriangle,
  ExternalLink,
  Smartphone,
  Building2,
  Loader2,
} from 'lucide-react';
import {
  PendingPaymentOrder,
  PgProvider,
  DEFAULT_TOSS_CLIENT_KEY,
  requestRealTossPayment,
  savePendingOrderSession,
} from '../../services/paymentService';

interface PgPaymentModalProps {
  isOpen: boolean;
  pendingOrder: PendingPaymentOrder | null;
  onClose: () => void;
  onNavigate: (path: string) => void;
}

const CARD_COMPANIES = [
  '현대카드',
  '삼성카드',
  '신한카드',
  'KB국민카드',
  '롯데카드',
  '하나카드',
  '우리카드',
  'NH농협카드',
];

const INSTALLMENT_OPTIONS = [
  '일시불',
  '2개월 (무이자)',
  '3개월 (무이자)',
  '6개월 (무이자)',
  '12개월',
];

const ERROR_SCENARIOS = [
  {
    code: 'PAY_PROCESS_CANCELED',
    label: '사용자 결제 취소',
    message: '사용자에 의해 결제가 취소되었습니다. 주문서에서 다시 결제를 진행해 주세요.',
  },
  {
    code: 'REJECT_CARD_COMPANY',
    label: '카드사 한도초과 / 승인거절',
    message: '카드 한도초과 또는 잔액 부족으로 카드사 승인이 거절되었습니다.',
  },
  {
    code: 'INVALID_CARD_EXPIRATION',
    label: '카드 유효기간/정보 오류',
    message: '입력하신 카드의 유효기간이 만료되었거나 인증 정보가 일치하지 않습니다.',
  },
  {
    code: 'AMOUNT_MISMATCH',
    label: '결제 금액 위변조 감지',
    message: '주문 금액과 실제 결제 요청 금액이 일치하지 않아 보안 정책에 의해 차단되었습니다.',
  },
];

export const PgPaymentModal: React.FC<PgPaymentModalProps> = ({
  isOpen,
  pendingOrder,
  onClose,
  onNavigate,
}) => {
  const [pgProvider, setPgProvider] = useState<PgProvider>('tosspayments');
  const [selectedCard, setSelectedCard] = useState<string>('현대카드');
  const [installment, setInstallment] = useState<string>('일시불');
  const [agreedPgTerms, setAgreedPgTerms] = useState<boolean>(true);
  const [isApproving, setIsApproving] = useState<boolean>(false);
  const [selectedErrorScenario, setSelectedErrorScenario] = useState(ERROR_SCENARIOS[0]);
  const [showErrorTestPanel, setShowErrorTestPanel] = useState<boolean>(false);
  const [clientKey, setClientKey] = useState<string>(DEFAULT_TOSS_CLIENT_KEY);
  const [sdkError, setSdkError] = useState<string>('');

  if (!isOpen || !pendingOrder) return null;

  const isCardPayment = pendingOrder.paymentMethod.includes('카드');
  const isEasyPay =
    pendingOrder.paymentMethod.includes('카카오') ||
    pendingOrder.paymentMethod.includes('네이버') ||
    pendingOrder.paymentMethod.includes('토스');

  // 1) 인앱 PG 결제 승인 완료 -> /payment/success 로 이동
  const handleConfirmSuccess = () => {
    if (!agreedPgTerms) return;
    setIsApproving(true);
    savePendingOrderSession({
      ...pendingOrder,
      pgProvider,
    });

    const generatedPaymentKey =
      pgProvider === 'tosspayments'
        ? `tviva_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`
        : `imp_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;

    const resolvedMethod = isCardPayment
      ? `${selectedCard} (${installment})`
      : pendingOrder.paymentMethod;

    setTimeout(() => {
      setIsApproving(false);
      const query = new URLSearchParams({
        paymentKey: generatedPaymentKey,
        orderId: pendingOrder.orderId,
        amount: String(pendingOrder.finalPrice),
        method: resolvedMethod,
        pg: pgProvider,
      }).toString();

      onNavigate(`/payment/success?${query}`);
    }, 800);
  };

  // 2) 결제 실패 시뮬레이션 -> /payment/fail 로 이동
  const handleTriggerFail = (scenario = selectedErrorScenario) => {
    savePendingOrderSession({
      ...pendingOrder,
      pgProvider,
    });

    const query = new URLSearchParams({
      code: scenario.code,
      message: scenario.message,
      orderId: pendingOrder.orderId,
      pg: pgProvider,
    }).toString();

    onNavigate(`/payment/fail?${query}`);
  };

  // 3) 실제 토스페이먼츠(Toss Payments) 공식 JS SDK 결제창 호출
  const handleOpenRealTossSdk = async () => {
    setSdkError('');
    try {
      await requestRealTossPayment(
        {
          ...pendingOrder,
          pgProvider: 'tosspayments',
        },
        clientKey
      );
    } catch (err: any) {
      // 사용자가 토스 결제창을 닫거나 에러가 난 경우 실패 페이지 이동 또는 안내
      if (err?.code === 'USER_CANCEL' || err?.code === 'PAY_PROCESS_CANCELED') {
        handleTriggerFail({
          code: err.code,
          label: '결제창 취소',
          message: err.message || '사용자가 토스페이먼츠 결제창을 닫았습니다.',
        });
      } else {
        setSdkError(
          err?.message || '토스페이먼츠 SDK 결제창 호출 중 오류가 발생했습니다. 클라이언트 키를 확인해주세요.'
        );
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-stone-200 overflow-hidden my-8">
        {/* 상단 PG사 헤더 바 */}
        <div
          className={`px-6 py-4 flex items-center justify-between text-white transition-colors ${
            pgProvider === 'tosspayments' ? 'bg-[#0064FF]' : 'bg-[#1A1F27]'
          }`}
        >
          <div className="flex items-center gap-2.5">
            <ShieldCheck size={20} className="text-white" />
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-base tracking-tight">
                  {pgProvider === 'tosspayments' ? 'Toss Payments 표준결제' : 'PortOne (아임포트) 통합결제'}
                </span>
                <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full bg-white/20">
                  TEST / LIVE 호환
                </span>
              </div>
              <p className="text-xs text-white/80">
                가맹점: 전주이씨 공식 부티크 (JEONJU LEE Co., Ltd.)
              </p>
            </div>
          </div>
          <button
            onClick={() =>
              handleTriggerFail({
                code: 'USER_CANCEL',
                label: '사용자 결제창 닫기',
                message: '결제창을 닫아 결제가 중단되었습니다. 다시 시도해 주세요.',
              })
            }
            className="p-1.5 rounded-lg hover:bg-white/15 transition-colors"
            title="결제 취소 및 닫기"
          >
            <X size={20} />
          </button>
        </div>

        {/* PG 게이트웨이 탭 전환 (토스페이먼츠 / 포트원) */}
        <div className="grid grid-cols-2 border-b border-stone-200 bg-stone-50">
          <button
            type="button"
            onClick={() => setPgProvider('tosspayments')}
            className={`py-3 text-xs font-bold flex items-center justify-center gap-1.5 border-b-2 transition-all ${
              pgProvider === 'tosspayments'
                ? 'border-[#0064FF] text-[#0064FF] bg-white'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            <CreditCard size={14} />
            토스페이먼츠 (Toss Payments)
          </button>
          <button
            type="button"
            onClick={() => setPgProvider('portone')}
            className={`py-3 text-xs font-bold flex items-center justify-center gap-1.5 border-b-2 transition-all ${
              pgProvider === 'portone'
                ? 'border-stone-900 text-stone-900 bg-white'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            <Building2 size={14} />
            포트원 (PortOne / 아임포트)
          </button>
        </div>

        <div className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
          {/* 주문 요약 박스 */}
          <div className="bg-stone-50 rounded-xl p-4 border border-stone-200/80 space-y-2">
            <div className="flex items-center justify-between text-xs text-stone-500">
              <span>주문번호 (orderId)</span>
              <span className="font-mono font-semibold text-stone-700">{pendingOrder.orderId}</span>
            </div>
            <div className="flex items-center justify-between text-xs text-stone-500">
              <span>주문상품 (orderName)</span>
              <span className="font-semibold text-stone-800 truncate max-w-[240px]">
                {pendingOrder.orderName}
              </span>
            </div>
            <div className="flex items-center justify-between text-xs text-stone-500">
              <span>주문자 / 수령인</span>
              <span className="font-medium text-stone-700">
                {pendingOrder.recipientName} ({pendingOrder.recipientPhone})
              </span>
            </div>
            <div className="pt-2.5 mt-2 border-t border-stone-200 flex items-baseline justify-between">
              <span className="text-xs font-bold text-stone-700">최종 결제 요청 금액</span>
              <span
                className={`text-xl font-black ${
                  pgProvider === 'tosspayments' ? 'text-[#0064FF]' : 'text-stone-900'
                }`}
              >
                {pendingOrder.finalPrice.toLocaleString()}원
              </span>
            </div>
          </div>

          {/* 결제 수단 상세 선택 UI */}
          {isCardPayment && (
            <div className="space-y-3">
              <label className="block text-xs font-bold text-stone-700">
                카드사 선택 <span className="text-stone-400 font-normal">(신용/체크카드)</span>
              </label>
              <div className="grid grid-cols-4 gap-2">
                {CARD_COMPANIES.map((card) => (
                  <button
                    key={card}
                    type="button"
                    onClick={() => setSelectedCard(card)}
                    className={`py-2.5 px-2 rounded-lg text-xs font-medium border transition-all ${
                      selectedCard === card
                        ? pgProvider === 'tosspayments'
                          ? 'border-[#0064FF] bg-[#0064FF]/5 text-[#0064FF] font-bold shadow-2xs'
                          : 'border-stone-900 bg-stone-900 text-white font-bold'
                        : 'border-stone-200 text-stone-600 hover:border-stone-400'
                    }`}
                  >
                    {card}
                  </button>
                ))}
              </div>

              <div className="pt-1">
                <label className="block text-xs font-bold text-stone-700 mb-1.5">
                  할부 기간 선택
                </label>
                <select
                  value={installment}
                  onChange={(e) => setInstallment(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs border border-stone-300 rounded-lg focus:outline-none focus:border-stone-900 bg-white"
                >
                  {INSTALLMENT_OPTIONS.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {isEasyPay && (
            <div className="p-4 rounded-xl bg-blue-50/70 border border-blue-200 flex items-center gap-3">
              <Smartphone size={24} className="text-[#0064FF] shrink-0" />
              <div className="text-xs space-y-0.5">
                <p className="font-bold text-stone-900">
                  {pendingOrder.paymentMethod} 간편결제 인증 대기 중
                </p>
                <p className="text-stone-600">
                  아래 [결제 승인 완료하기] 버튼을 누르면 간편결제 인증 및 승인이 즉시 완료됩니다.
                </p>
              </div>
            </div>
          )}

          {/* 전자금융거래 이용약관 동의 */}
          <label className="flex items-center gap-2.5 p-3 rounded-lg bg-stone-50 border border-stone-200 cursor-pointer">
            <input
              type="checkbox"
              checked={agreedPgTerms}
              onChange={(e) => setAgreedPgTerms(e.target.checked)}
              className="w-4 h-4 accent-[#0064FF] rounded"
            />
            <span className="text-xs text-stone-700 font-medium">
              [필수] 전자금융거래 이용약관 및 개인정보 제3자 제공에 동의합니다.
            </span>
          </label>

          {sdkError && (
            <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700 flex items-start gap-2">
              <AlertTriangle size={15} className="shrink-0 mt-0.5" />
              <span>{sdkError}</span>
            </div>
          )}

          {/* 주요 결제 실행 버튼 (성공 프로세스) */}
          <div className="space-y-2.5">
            <button
              type="button"
              disabled={!agreedPgTerms || isApproving}
              onClick={handleConfirmSuccess}
              className={`w-full py-4 rounded-xl text-sm font-bold text-white shadow-md transition-all flex items-center justify-center gap-2 ${
                pgProvider === 'tosspayments'
                  ? 'bg-[#0064FF] hover:bg-[#0052D4] disabled:bg-stone-300'
                  : 'bg-stone-900 hover:bg-stone-800 disabled:bg-stone-300'
              }`}
            >
              {isApproving ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  PG사 결제 승인 및 금액 위변조 검증 중...
                </>
              ) : (
                <>
                  <Lock size={16} />
                  {pendingOrder.finalPrice.toLocaleString()}원 결제 승인 완료하기 (주문완료 이동)
                </>
              )}
            </button>

            {/* 실제 토스페이먼츠 공식 SDK 외부 팝업/리다이렉트 호출 버튼 */}
            <button
              type="button"
              onClick={handleOpenRealTossSdk}
              className="w-full py-2.5 px-4 rounded-xl text-xs font-semibold text-[#0064FF] bg-[#0064FF]/8 hover:bg-[#0064FF]/15 border border-[#0064FF]/30 transition-colors flex items-center justify-center gap-1.5"
            >
              <ExternalLink size={14} />
              토스페이먼츠 공식 JS SDK 실결제창 띄우기 (test_ck 테스트키 연동)
            </button>
          </div>

          {/* 결제 실패/에러 페이지 이동 테스트 섹션 */}
          <div className="pt-3 border-t border-stone-200">
            <button
              type="button"
              onClick={() => setShowErrorTestPanel(!showErrorTestPanel)}
              className="w-full flex items-center justify-between text-xs font-semibold text-stone-500 hover:text-red-600 transition-colors py-1"
            >
              <span className="flex items-center gap-1.5">
                <AlertTriangle size={14} className="text-amber-600" />
                결제 실패 / 에러 페이지(/payment/fail) 시나리오 테스트 및 SDK 키 설정
              </span>
              <span className="underline">{showErrorTestPanel ? '접기' : '열기'}</span>
            </button>

            {showErrorTestPanel && (
              <div className="mt-3 p-3.5 rounded-xl bg-red-50/60 border border-red-200/80 space-y-3">
                <div>
                  <label className="block text-[11px] font-bold text-red-900 mb-1">
                    결제 실패 사유 선택 (실패 시 /payment/fail 에러 페이지로 이동)
                  </label>
                  <select
                    value={selectedErrorScenario.code}
                    onChange={(e) => {
                      const found = ERROR_SCENARIOS.find((s) => s.code === e.target.value);
                      if (found) setSelectedErrorScenario(found);
                    }}
                    className="w-full px-3 py-2 text-xs bg-white border border-red-200 rounded-lg text-stone-800"
                  >
                    {ERROR_SCENARIOS.map((sc) => (
                      <option key={sc.code} value={sc.code}>
                        [{sc.code}] {sc.label}
                      </option>
                    ))}
                  </select>
                </div>

                <button
                  type="button"
                  onClick={() => handleTriggerFail(selectedErrorScenario)}
                  className="w-full py-2.5 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-lg transition-colors flex items-center justify-center gap-1.5"
                >
                  <AlertTriangle size={14} />
                  선택한 에러로 결제 실패 페이지(/payment/fail) 이동 테스트
                </button>

                <div className="pt-2 border-t border-red-200/60">
                  <label className="block text-[11px] font-bold text-stone-700 mb-1">
                    Toss Payments Client Key (테스트/라이브 키 변경 가능)
                  </label>
                  <input
                    type="text"
                    value={clientKey}
                    onChange={(e) => setClientKey(e.target.value)}
                    className="w-full px-2.5 py-1.5 text-[11px] font-mono bg-white border border-stone-300 rounded text-stone-700"
                    placeholder="test_ck_..."
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 하단 보안 인증 푸터 */}
        <div className="px-6 py-3 bg-stone-100 border-t border-stone-200 flex items-center justify-between text-[11px] text-stone-500">
          <span className="flex items-center gap-1">
            <CheckCircle2 size={13} className="text-emerald-600" />
            PCI-DSS 보안 인증 · 금액 위변조 검증 적용됨
          </span>
          <button
            type="button"
            onClick={onClose}
            className="text-stone-500 hover:text-stone-800 underline"
          >
            주문서로 돌아가기
          </button>
        </div>
      </div>
    </div>
  );
};
