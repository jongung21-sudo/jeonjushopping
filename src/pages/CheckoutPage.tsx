import React, { useState, useEffect, useRef } from 'react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Order, OrderItem } from '../types';
import {
  ShieldCheck,
  ArrowRight,
  Sparkles,
  Tag,
  Coins,
  Loader2,
  Settings,
  CheckCircle2,
  Building2,
} from 'lucide-react';
import {
  PendingPaymentOrder,
  PgConfig,
  getPgConfig,
  savePgConfig,
  isWidgetClientKey,
  generateMerchantOrderId,
  loadTossPaymentWidgetScript,
  requestRealTossPayment,
  savePendingOrderSession,
} from '../services/paymentService';

interface CheckoutPageProps {
  navigate: (path: string) => void;
  onOrderCompleted?: (order: Order) => void;
}

export const CheckoutPage: React.FC<CheckoutPageProps> = ({ navigate }) => {
  const { items, totalProductPrice } = useCart();
  const { user, isAdmin } = useAuth();
  const { showToast } = useToast();

  const [pgConfig, setPgConfig] = useState<PgConfig>(() => getPgConfig());
  const [showPgSetup, setShowPgSetup] = useState(false);
  const [inputClientKey, setInputClientKey] = useState(pgConfig.clientKey);
  const [inputSecretKey, setInputSecretKey] = useState(pgConfig.secretKey);
  const [inputBankName, setInputBankName] = useState(pgConfig.bankName);
  const [inputBankAccount, setInputBankAccount] = useState(pgConfig.bankAccount);
  const [inputBankHolder, setInputBankHolder] = useState(pgConfig.bankHolder);

  const [ordererName, setOrdererName] = useState(user?.name || '김서연');
  const [ordererEmail, setOrdererEmail] = useState(user?.email || 'customer@jeonjulee.kr');
  const [ordererPhone, setOrdererPhone] = useState(user?.phone || '010-9876-5432');

  // 배송지 정보
  const [recipientName, setRecipientName] = useState(user?.name || '김서연');
  const [recipientPhone, setRecipientPhone] = useState(user?.phone || '010-9876-5432');
  const [postalCode, setPostalCode] = useState(user?.postalCode || '06000');
  const [address, setAddress] = useState(user?.address || '서울특별시 강남구 압구정로 10');
  const [detailAddress, setDetailAddress] = useState(user?.detailAddress || '101동 502호');
  const [deliveryRequest, setDeliveryRequest] = useState('부재 시 경비실에 보관해 주세요.');

  // 1. 쿠폰 선택 상태
  const [selectedCouponCode, setSelectedCouponCode] = useState<string>('WELCOME10');

  // 2. 포인트 결제 상태
  const [pointInput, setPointInput] = useState<string>('5000');

  // 3. 세금계산서/명세서 신청 상태
  const [wantsTaxInvoice, setWantsTaxInvoice] = useState(false);
  const [companyName, setCompanyName] = useState('');
  const [businessNumber, setBusinessNumber] = useState('');

  // 4. 결제 방식 탭 ('PG' = 토스페이먼츠 카드/간편결제, 'DIRECT_BANK' = 실제 계좌 직접 입금)
  const [payChannel, setPayChannel] = useState<'PG' | 'DIRECT_BANK'>('PG');
  const [paymentMethod, setPaymentMethod] = useState<string>('신용/체크카드');
  const [isProcessing, setIsProcessing] = useState(false);
  const [termsAgreed, setTermsAgreed] = useState(true);
  const [widgetReady, setWidgetReady] = useState(false);
  const [widgetLoadError, setWidgetLoadError] = useState(false);

  const paymentWidgetRef = useRef<any>(null);
  const paymentMethodsWidgetRef = useRef<any>(null);

  const selectedItems = items.filter((i) => i.selected !== false);

  // 쿠폰 할인 계산
  let couponDiscountAmount = 0;
  if (selectedCouponCode === 'WELCOME10') {
    couponDiscountAmount = Math.floor(totalProductPrice * 0.1);
  } else if (selectedCouponCode === 'ROYAL15') {
    couponDiscountAmount = Math.floor(totalProductPrice * 0.15);
  } else if (selectedCouponCode === 'JEONJU30') {
    couponDiscountAmount = Math.min(30000, totalProductPrice);
  }

  // 포인트 사용 한도 계산
  const userBalance = user?.points || 0;
  const maxUsablePoints = Math.max(0, Math.min(userBalance, totalProductPrice - couponDiscountAmount));

  const parsedPoints = parseInt(pointInput, 10) || 0;
  const actualPointsUsed = Math.min(parsedPoints, maxUsablePoints);

  // 무료배송 정책 (전 상품 무료)
  const shippingFee = 0;
  const finalPrice = Math.max(
    100,
    totalProductPrice - couponDiscountAmount - actualPointsUsed + shippingFee
  );

  const useWidgetMode = payChannel === 'PG' && isWidgetClientKey(pgConfig.clientKey);

  // 실제 토스페이먼츠 공식 결제위젯(PaymentWidget) 렌더링 (_gck_ 키일 때 작동)
  useEffect(() => {
    if (!useWidgetMode) {
      setWidgetReady(false);
      return;
    }

    let isMounted = true;
    setWidgetLoadError(false);

    const initTossWidget = async () => {
      try {
        await loadTossPaymentWidgetScript();
        if (!isMounted || !window.PaymentWidget) return;

        const container = document.getElementById('toss-payment-methods');
        const agreementContainer = document.getElementById('toss-payment-agreement');
        if (container) container.innerHTML = '';
        if (agreementContainer) agreementContainer.innerHTML = '';

        const customerKey = user?.id
          ? `cust_${user.id.replace(/[^a-zA-Z0-9-_]/g, '_')}`
          : `anon_${Date.now()}`;

        const paymentWidget = window.PaymentWidget(pgConfig.clientKey, customerKey);
        const paymentMethodsWidget = paymentWidget.renderPaymentMethods(
          '#toss-payment-methods',
          { value: finalPrice, currency: 'KRW', country: 'KR' },
          { variantKey: 'DEFAULT' }
        );
        paymentWidget.renderAgreement('#toss-payment-agreement', { variantKey: 'AGREEMENT' });

        paymentWidgetRef.current = paymentWidget;
        paymentMethodsWidgetRef.current = paymentMethodsWidget;
        setWidgetReady(true);
      } catch (err) {
        console.warn('Toss PaymentWidget fallback to standard window:', err);
        if (isMounted) setWidgetLoadError(true);
      }
    };

    initTossWidget();
    return () => {
      isMounted = false;
    };
  }, [pgConfig.clientKey, useWidgetMode]);

  // 할인/포인트 변경 시 토스페이먼츠 결제위젯 금액 실시간 반영
  useEffect(() => {
    if (paymentMethodsWidgetRef.current && widgetReady && useWidgetMode) {
      try {
        paymentMethodsWidgetRef.current.updateAmount(finalPrice);
      } catch {
        // ignore
      }
    }
  }, [finalPrice, widgetReady, useWidgetMode]);

  const handleSavePgLiveKeys = () => {
    const updated = savePgConfig({
      clientKey: inputClientKey,
      secretKey: inputSecretKey,
      bankName: inputBankName,
      bankAccount: inputBankAccount,
      bankHolder: inputBankHolder,
    });
    setPgConfig(updated);
    setShowPgSetup(false);
    showToast(
      updated.mode === 'LIVE'
        ? '실결제(LIVE) 키가 적용되었습니다! 이제 실제 카드 출금 결제가 동작합니다.'
        : 'PG 키 및 입금 계좌 설정이 저장되었습니다.'
    );
  };

  const handleApplyAllPoints = () => {
    setPointInput(String(maxUsablePoints));
  };

  const handlePostalCodeSearch = () => {
    setPostalCode('06000');
    setAddress('서울특별시 강남구 압구정로 10');
    setDetailAddress('101동 502호');
    showToast('기본 우편번호 및 주소가 입력되었습니다.');
  };

  // [결제하기] 버튼 클릭 시 실행
  const handleProcessPayment = async (e: React.FormEvent) => {
    e.preventDefault();

    if (selectedItems.length === 0) {
      showToast('주문할 상품이 없습니다.', 'error');
      navigate('/cart');
      return;
    }

    if (!recipientName.trim() || !recipientPhone.trim() || !address.trim()) {
      showToast('수령인 성함, 연락처, 배송지 주소를 모두 입력해 주세요.', 'error');
      return;
    }

    if (!termsAgreed) {
      showToast('주문 진행을 위한 필수 구매 조건에 동의해 주세요.', 'error');
      return;
    }

    setIsProcessing(true);

    const orderItems: OrderItem[] = selectedItems.map((item) => ({
      productId: item.productId,
      name: item.product.name,
      image: item.product.images[0] || '',
      color: item.selectedColor.name,
      size: item.selectedSize,
      price: item.product.price,
      quantity: item.quantity,
    }));

    const orderName =
      orderItems.length > 1
        ? `${orderItems[0].name} 외 ${orderItems.length - 1}건`
        : orderItems[0].name;

    let selectedMethodName =
      payChannel === 'DIRECT_BANK'
        ? `무통장입금 (${pgConfig.bankName} ${pgConfig.bankAccount})`
        : paymentMethod;

    if (useWidgetMode && paymentMethodsWidgetRef.current?.getSelectedPaymentMethod) {
      try {
        const selected = paymentMethodsWidgetRef.current.getSelectedPaymentMethod();
        if (selected?.easyPay?.provider) {
          selectedMethodName = selected.easyPay.provider;
        } else if (selected?.method) {
          selectedMethodName = selected.method;
        }
      } catch {
        // ignore
      }
    }

    const orderDraft: PendingPaymentOrder = {
      orderId: generateMerchantOrderId(),
      orderName,
      items: orderItems,
      totalProductPrice,
      discountPrice: couponDiscountAmount + actualPointsUsed,
      usedPoints: actualPointsUsed,
      couponDiscount: couponDiscountAmount,
      couponCode: selectedCouponCode !== 'NONE' ? selectedCouponCode : undefined,
      shippingFee,
      finalPrice,
      recipientName,
      recipientPhone,
      customerEmail: ordererEmail,
      postalCode,
      address,
      detailAddress,
      deliveryMemo: deliveryRequest,
      paymentMethod: selectedMethodName,
      pgProvider: 'tosspayments',
      createdAt: new Date().toISOString(),
    };

    savePendingOrderSession(orderDraft);

    // 1) 실제 계좌 직접 입금(무통장 실결제) 선택 시 즉시 주문 접수 완료 페이지로 이동
    if (payChannel === 'DIRECT_BANK') {
      const query = new URLSearchParams({
        paymentKey: `BANK_DIRECT_${Date.now()}`,
        orderId: orderDraft.orderId,
        amount: String(orderDraft.finalPrice),
        method: selectedMethodName,
      }).toString();
      navigate(`/payment/success?${query}`);
      return;
    }

    // 2) 토스페이먼츠 PG 실결제창 호출
    try {
      const origin = window.location.origin;

      if (useWidgetMode && paymentWidgetRef.current && widgetReady && !widgetLoadError) {
        await paymentWidgetRef.current.requestPayment({
          orderId: orderDraft.orderId,
          orderName: orderDraft.orderName,
          customerName: orderDraft.recipientName,
          customerEmail: orderDraft.customerEmail,
          customerMobilePhone: orderDraft.recipientPhone.replace(/[^0-9]/g, ''),
          successUrl: `${origin}/payment/success`,
          failUrl: `${origin}/payment/fail`,
        });
      } else {
        // live_ck_... 또는 test_ck_... 표준 결제창 호출
        await requestRealTossPayment(orderDraft, pgConfig.clientKey);
      }
    } catch (err: any) {
      setIsProcessing(false);
      const failCode = err?.code || 'PAY_PROCESS_CANCELED';
      const failMessage =
        err?.message || '사용자가 결제를 취소하였거나 결제창 호출 중 오류가 발생했습니다.';
      const query = new URLSearchParams({
        code: failCode,
        message: failMessage,
        orderId: orderDraft.orderId,
      }).toString();
      navigate(`/payment/fail?${query}`);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8 border-b border-paper-300 pb-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-serif-kr font-medium text-ink-900 tracking-wide">
            주문서 작성 및 결제
          </h1>
          <p className="text-xs text-ink-500 mt-1 font-serif-kr">
            전주이씨의 품격 있는 제품을 정성껏 포장하여 무료로 배송해 드립니다.
          </p>
        </div>

        {/* 실결제(LIVE) 키 설정 버튼 */}
        {isAdmin && (
          <button
            type="button"
            onClick={() => setShowPgSetup(!showPgSetup)}
            className={`px-3.5 py-2 rounded-lg text-xs font-bold border flex items-center gap-1.5 transition-colors ${
              pgConfig.mode === 'LIVE'
                ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                : 'bg-white border-stone-300 text-stone-700 hover:bg-stone-50'
            }`}
          >
            <Settings className="w-3.5 h-3.5" />
            {pgConfig.mode === 'LIVE'
              ? '🟢 실결제(LIVE) 출금 모드 작동 중 (설정)'
              : '⚙️ 실제 출금용(LIVE) 가맹점 키 연결하기'}
          </button>
        )}
      </div>

      {/* 관리자용 실결제(LIVE) 키 & 실제 입금 계좌 설정 패널 */}
      {showPgSetup && (
        <div className="mb-8 p-6 bg-stone-900 text-white rounded-2xl shadow-xl border border-amber-500/40 space-y-4">
          <div className="flex items-center justify-between border-b border-stone-700 pb-3">
            <div>
              <h3 className="text-sm font-bold text-amber-400">
                실제 카드 출금(LIVE)을 위한 토스페이먼츠 가맹점 키 & 무통장 실계좌 설정
              </h3>
              <p className="text-xs text-stone-300 mt-0.5">
                토스페이먼츠 개발자센터(developers.tosspayments.com)에서 발급받은{' '}
                <code className="text-amber-300">live_ck_...</code> (또는{' '}
                <code className="text-amber-300">live_gck_...</code>) 키를 넣으면 테스트가 아닌{' '}
                <strong>실제 카드 승인 및 계좌 출금</strong>이 일어납니다.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block text-stone-300 font-semibold mb-1">
                토스페이먼츠 클라이언트 키 (live_ck_... 또는 live_gck_...)
              </label>
              <input
                type="text"
                value={inputClientKey}
                onChange={(e) => setInputClientKey(e.target.value)}
                placeholder="live_ck_... 또는 live_gck_..."
                className="w-full px-3 py-2 rounded bg-stone-800 border border-stone-600 text-white font-mono"
              />
            </div>
            <div>
              <label className="block text-stone-300 font-semibold mb-1">
                토스페이먼츠 시크릿 키 (live_sk_... 또는 live_gsk_...)
              </label>
              <input
                type="password"
                value={inputSecretKey}
                onChange={(e) => setInputSecretKey(e.target.value)}
                placeholder="live_sk_... 또는 live_gsk_..."
                className="w-full px-3 py-2 rounded bg-stone-800 border border-stone-600 text-white font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs pt-2 border-t border-stone-800">
            <div>
              <label className="block text-stone-300 font-semibold mb-1">실제 입금 은행명</label>
              <input
                type="text"
                value={inputBankName}
                onChange={(e) => setInputBankName(e.target.value)}
                className="w-full px-3 py-2 rounded bg-stone-800 border border-stone-600 text-white"
              />
            </div>
            <div>
              <label className="block text-stone-300 font-semibold mb-1">실제 입금 계좌번호</label>
              <input
                type="text"
                value={inputBankAccount}
                onChange={(e) => setInputBankAccount(e.target.value)}
                className="w-full px-3 py-2 rounded bg-stone-800 border border-stone-600 text-white"
              />
            </div>
            <div>
              <label className="block text-stone-300 font-semibold mb-1">예금주명</label>
              <input
                type="text"
                value={inputBankHolder}
                onChange={(e) => setInputBankHolder(e.target.value)}
                className="w-full px-3 py-2 rounded bg-stone-800 border border-stone-600 text-white"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setShowPgSetup(false)}
              className="px-4 py-2 text-xs text-stone-300 hover:text-white"
            >
              닫기
            </button>
            <button
              type="button"
              onClick={handleSavePgLiveKeys}
              className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs rounded-lg"
            >
              설정 저장 및 즉시 적용하기
            </button>
          </div>
        </div>
      )}

      <form onSubmit={handleProcessPayment} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* 좌측 입력 폼 (8열) */}
        <div className="lg:col-span-8 space-y-6">
          {/* 1. 주문 상품 요약 */}
          <div className="bg-paper-100 border border-paper-300 p-6 shadow-subtle">
            <h2 className="text-sm font-serif-kr font-semibold text-ink-900 mb-4 pb-2 border-b border-paper-300 flex items-center justify-between">
              <span>1. 주문 상품 확인 ({selectedItems.length}건)</span>
              <button
                type="button"
                onClick={() => navigate('/cart')}
                className="text-xs text-lacquer hover:underline font-sans font-normal"
              >
                장바구니 수정
              </button>
            </h2>

            <div className="divide-y divide-paper-200">
              {selectedItems.map((item) => (
                <div key={item.id} className="py-3 flex items-center gap-4">
                  <img
                    src={item.product.images[0]}
                    alt={item.product.name}
                    className="w-16 h-20 object-cover border border-paper-300 flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-serif-kr font-medium text-ink-900 truncate">
                      {item.product.name}
                    </p>
                    <p className="text-[11px] text-ink-500 mt-0.5">
                      {item.selectedColor.name} / {item.selectedSize} · {item.quantity}개
                    </p>
                    <p className="text-xs font-semibold text-ink-900 mt-1">
                      {(item.product.price * item.quantity).toLocaleString()}원
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 2. 주문자 및 배송지 정보 */}
          <div className="bg-paper-100 border border-paper-300 p-6 shadow-subtle space-y-5">
            <h2 className="text-sm font-serif-kr font-semibold text-ink-900 pb-2 border-b border-paper-300">
              2. 배송지 및 수령인 정보
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div>
                <label className="block text-ink-600 mb-1 font-serif-kr">주문자 성함</label>
                <input
                  type="text"
                  required
                  value={ordererName}
                  onChange={(e) => setOrdererName(e.target.value)}
                  className="w-full bg-paper-50 border border-paper-300 px-3 py-2 text-ink-900 focus:outline-none focus:border-ink-900"
                />
              </div>
              <div>
                <label className="block text-ink-600 mb-1 font-serif-kr">이메일</label>
                <input
                  type="email"
                  required
                  value={ordererEmail}
                  onChange={(e) => setOrdererEmail(e.target.value)}
                  className="w-full bg-paper-50 border border-paper-300 px-3 py-2 text-ink-900 focus:outline-none focus:border-ink-900"
                />
              </div>
              <div>
                <label className="block text-ink-600 mb-1 font-serif-kr">연락처</label>
                <input
                  type="tel"
                  required
                  value={ordererPhone}
                  onChange={(e) => setOrdererPhone(e.target.value)}
                  className="w-full bg-paper-50 border border-paper-300 px-3 py-2 text-ink-900 focus:outline-none focus:border-ink-900"
                />
              </div>
            </div>

            <div className="pt-4 border-t border-paper-200 space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-ink-600 mb-1 font-serif-kr">수령인 성함 *</label>
                  <input
                    type="text"
                    required
                    value={recipientName}
                    onChange={(e) => setRecipientName(e.target.value)}
                    className="w-full bg-paper-50 border border-paper-300 px-3 py-2 text-ink-900 focus:outline-none focus:border-ink-900"
                  />
                </div>
                <div>
                  <label className="block text-ink-600 mb-1 font-serif-kr">수령인 연락처 *</label>
                  <input
                    type="tel"
                    required
                    value={recipientPhone}
                    onChange={(e) => setRecipientPhone(e.target.value)}
                    className="w-full bg-paper-50 border border-paper-300 px-3 py-2 text-ink-900 focus:outline-none focus:border-ink-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-ink-600 mb-1 font-serif-kr">배송지 주소 *</label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    required
                    value={postalCode}
                    onChange={(e) => setPostalCode(e.target.value)}
                    placeholder="우편번호"
                    className="w-32 bg-paper-50 border border-paper-300 px-3 py-2 text-ink-900 focus:outline-none focus:border-ink-900"
                  />
                  <button
                    type="button"
                    onClick={handlePostalCodeSearch}
                    className="px-4 py-2 bg-paper-200 border border-paper-300 text-ink-800 hover:border-ink-800 transition-colors font-serif-kr"
                  >
                    우편번호 검색
                  </button>
                </div>
                <input
                  type="text"
                  required
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="기본 주소"
                  className="w-full bg-paper-50 border border-paper-300 px-3 py-2 text-ink-900 mb-2 focus:outline-none focus:border-ink-900"
                />
                <input
                  type="text"
                  required
                  value={detailAddress}
                  onChange={(e) => setDetailAddress(e.target.value)}
                  placeholder="상세 주소 입력"
                  className="w-full bg-paper-50 border border-paper-300 px-3 py-2 text-ink-900 focus:outline-none focus:border-ink-900"
                />
              </div>

              <div>
                <label className="block text-ink-600 mb-1 font-serif-kr">배송 요청사항</label>
                <input
                  type="text"
                  value={deliveryRequest}
                  onChange={(e) => setDeliveryRequest(e.target.value)}
                  placeholder="배송 시 요청사항을 입력해 주세요."
                  className="w-full bg-paper-50 border border-paper-300 px-3 py-2 text-ink-900 focus:outline-none focus:border-ink-900"
                />
              </div>
            </div>
          </div>

          {/* 3. 쿠폰 및 포인트 할인 적용 */}
          <div className="bg-paper-100 border border-paper-300 p-6 shadow-subtle space-y-5">
            <h2 className="text-sm font-serif-kr font-semibold text-ink-900 pb-2 border-b border-paper-300 flex items-center gap-2">
              <Tag className="w-4 h-4 text-lacquer" />
              <span>3. 쿠폰 및 가문 포인트 혜택 적용</span>
            </h2>

            <div className="space-y-2 text-xs">
              <label className="block text-ink-700 font-serif-kr font-medium">보유 쿠폰 선택</label>
              <select
                value={selectedCouponCode}
                onChange={(e) => setSelectedCouponCode(e.target.value)}
                className="w-full bg-paper-50 border border-paper-300 px-3 py-2.5 text-ink-900 focus:outline-none focus:border-ink-900 font-serif-kr"
              >
                <option value="NONE">쿠폰 적용 안 함</option>
                <option value="WELCOME10">[신규 가문원 웰컴] 전 품목 10% 할인 쿠폰</option>
                <option value="ROYAL15">[VIP 스페셜] 아우터 & 컬렉션 15% 할인 쿠폰</option>
                <option value="JEONJU30">[시즌 기프트] 30,000원 정액 할인권</option>
              </select>
            </div>

            <div className="pt-3 border-t border-paper-200 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <label className="text-ink-700 font-serif-kr font-medium flex items-center gap-1.5">
                  <Coins className="w-3.5 h-3.5 text-bronze" />
                  <span>보유 포인트 사용</span>
                </label>
                <span className="text-ink-600">
                  보유: <strong className="text-ink-900 font-sans">{userBalance.toLocaleString()}P</strong>
                </span>
              </div>

              <div className="flex gap-2">
                <div className="relative flex-1">
                  <input
                    type="number"
                    min={0}
                    max={maxUsablePoints}
                    step={100}
                    value={pointInput}
                    onChange={(e) => setPointInput(e.target.value)}
                    className="w-full bg-paper-50 border border-paper-300 pl-3 pr-8 py-2 text-ink-900 focus:outline-none focus:border-ink-900 font-sans"
                  />
                  <span className="absolute right-3 top-2 text-ink-400 text-xs">P</span>
                </div>
                <button
                  type="button"
                  onClick={handleApplyAllPoints}
                  className="px-3 py-2 bg-paper-200 border border-paper-300 text-ink-800 hover:border-ink-800 text-xs font-serif-kr transition-colors whitespace-nowrap"
                >
                  전액 사용
                </button>
              </div>
            </div>
          </div>

          {/* 4. 결제 수단 선택 */}
          <div className="bg-white border border-paper-300 p-6 shadow-subtle space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-paper-300">
              <h2 className="text-sm font-serif-kr font-semibold text-ink-900">
                4. 결제 수단 선택
              </h2>
              <span
                className={`inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded border ${
                  pgConfig.mode === 'LIVE'
                    ? 'text-emerald-800 bg-emerald-50 border-emerald-200'
                    : 'text-[#0064FF] bg-blue-50 border-blue-200'
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                {pgConfig.mode === 'LIVE' ? '실결제(LIVE) 승인 모드' : 'Toss Payments PG 연동됨'}
              </span>
            </div>

            {/* 결제 방식 선택 탭: 토스페이먼츠 카드/간편결제 vs 실제 무통장 계좌이체 */}
            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => setPayChannel('PG')}
                className={`py-3 px-4 rounded-xl text-xs font-bold border flex items-center justify-center gap-2 transition-all ${
                  payChannel === 'PG'
                    ? 'border-[#0064FF] bg-blue-50/70 text-[#0064FF]'
                    : 'border-stone-200 bg-stone-50 text-stone-600 hover:border-stone-400'
                }`}
              >
                <ShieldCheck className="w-4 h-4" />
                신용카드 · 카카오/토스/네이버페이 (PG)
              </button>
              <button
                type="button"
                onClick={() => setPayChannel('DIRECT_BANK')}
                className={`py-3 px-4 rounded-xl text-xs font-bold border flex items-center justify-center gap-2 transition-all ${
                  payChannel === 'DIRECT_BANK'
                    ? 'border-stone-900 bg-stone-900 text-white'
                    : 'border-stone-200 bg-stone-50 text-stone-600 hover:border-stone-400'
                }`}
              >
                <Building2 className="w-4 h-4" />
                무통장 계좌입금 (실제 계좌이체)
              </button>
            </div>

            {payChannel === 'DIRECT_BANK' ? (
              <div className="p-5 rounded-xl bg-stone-50 border border-stone-200 space-y-2 text-xs">
                <p className="font-bold text-stone-900 flex items-center gap-1.5 text-sm">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  전주이씨 공식 입금 계좌 안내 (실제 계좌이체 즉시 주문 가능)
                </p>
                <div className="p-3.5 bg-white rounded-lg border border-stone-200 space-y-1">
                  <p className="text-stone-600">
                    입금 은행: <strong className="text-stone-900">{pgConfig.bankName}</strong>
                  </p>
                  <p className="text-stone-600">
                    계좌 번호:{' '}
                    <strong className="text-base font-mono text-[#0064FF]">
                      {pgConfig.bankAccount}
                    </strong>
                  </p>
                  <p className="text-stone-600">
                    예금주: <strong className="text-stone-900">{pgConfig.bankHolder}</strong>
                  </p>
                </div>
                <p className="text-stone-500">
                  * 우측 [결제하기] 버튼을 누르시면 주문이 즉시 접수되며, 위 계좌로 결제 금액을 입금해주시면 확인 후 바로 출고됩니다.
                </p>
              </div>
            ) : useWidgetMode && !widgetLoadError ? (
              <div className="rounded-xl overflow-hidden border border-stone-200 bg-white">
                {!widgetReady && (
                  <div className="py-12 flex flex-col items-center justify-center text-stone-500 text-xs gap-2">
                    <Loader2 className="w-6 h-6 animate-spin text-[#0064FF]" />
                    <span>토스페이먼츠 공식 결제위젯을 불러오는 중입니다...</span>
                  </div>
                )}
                <div id="toss-payment-methods" className="w-full" />
                <div id="toss-payment-agreement" className="w-full border-t border-stone-100" />
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs">
                {['신용/체크카드', '카카오페이', '네이버페이', '토스페이', '실시간 계좌이체', '가상계좌'].map(
                  (method) => (
                    <button
                      key={method}
                      type="button"
                      onClick={() => setPaymentMethod(method)}
                      className={`py-3 px-3 border font-serif-kr text-center transition-all ${
                        paymentMethod === method
                          ? 'border-ink-900 bg-ink-900 text-paper-100 font-semibold'
                          : 'border-paper-300 bg-paper-50 text-ink-700 hover:border-ink-700'
                      }`}
                    >
                      {method}
                    </button>
                  )
                )}
              </div>
            )}

            {/* 전자세금계산서 신청 체크박스 */}
            <div className="pt-4 border-t border-paper-200 text-xs">
              <label className="flex items-center gap-2 cursor-pointer font-medium text-ink-800 font-serif-kr">
                <input
                  type="checkbox"
                  checked={wantsTaxInvoice}
                  onChange={(e) => setWantsTaxInvoice(e.target.checked)}
                  className="accent-ink-900"
                />
                <span>전자세금계산서 / 세금명세서 발행 신청</span>
              </label>

              {wantsTaxInvoice && (
                <div className="mt-3 p-3 bg-paper-200 border border-paper-300 grid grid-cols-1 sm:grid-cols-2 gap-3 animate-fade-in">
                  <div>
                    <label className="block text-[11px] text-ink-600 mb-1 font-serif-kr">상호(법인명)</label>
                    <input
                      type="text"
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      placeholder="예: 주식회사 한국문화"
                      className="w-full bg-paper-50 border border-paper-300 px-2.5 py-1.5 text-xs text-ink-900"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-ink-600 mb-1 font-serif-kr">사업자등록번호</label>
                    <input
                      type="text"
                      value={businessNumber}
                      onChange={(e) => setBusinessNumber(e.target.value)}
                      placeholder="000-00-00000"
                      className="w-full bg-paper-50 border border-paper-300 px-2.5 py-1.5 text-xs text-ink-900"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 우측 결제 요약 (4열 Sticky) */}
        <div className="lg:col-span-4">
          <div className="bg-paper-100 border border-paper-300 p-6 shadow-subtle sticky top-24 space-y-5">
            <h2 className="text-sm font-serif-kr font-semibold text-ink-900 pb-3 border-b border-paper-300">
              최종 결제 금액
            </h2>

            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between text-ink-700">
                <span className="font-serif-kr">총 상품 금액</span>
                <span className="font-medium font-sans">{totalProductPrice.toLocaleString()}원</span>
              </div>

              <div className="flex justify-between text-lacquer">
                <span className="font-serif-kr">쿠폰 할인</span>
                <span className="font-medium font-sans">
                  {couponDiscountAmount > 0 ? `-${couponDiscountAmount.toLocaleString()}원` : '0원'}
                </span>
              </div>

              <div className="flex justify-between text-bronze">
                <span className="font-serif-kr">포인트 사용</span>
                <span className="font-medium font-sans">
                  {actualPointsUsed > 0 ? `-${actualPointsUsed.toLocaleString()}P` : '0P'}
                </span>
              </div>

              <div className="flex justify-between text-ink-700">
                <span className="font-serif-kr">배송비 (전 품목 무료)</span>
                <span className="font-medium font-serif-kr text-lacquer">무료</span>
              </div>
            </div>

            <div className="pt-4 border-t border-paper-300 flex justify-between items-baseline">
              <span className="text-xs font-serif-kr font-semibold text-ink-900">최종 결제 예정 금액</span>
              <span className="text-2xl font-bold font-sans text-lacquer">
                {finalPrice.toLocaleString()}
                <span className="text-sm font-normal text-ink-900 ml-1">원</span>
              </span>
            </div>

            {/* 구매 적립 안내 */}
            <div className="p-3 bg-paper-200 border border-paper-300 text-[11px] text-ink-600 font-serif-kr">
              <p className="flex items-center gap-1 font-medium text-ink-900 mb-0.5">
                <Sparkles className="w-3.5 h-3.5 text-bronze" />
                구매 적립 혜택
              </p>
              결제 완료 시 실 결제금액의 1%인{' '}
              <strong className="text-lacquer font-sans">
                {Math.floor(finalPrice * 0.01).toLocaleString()}P
              </strong>가 자동으로 적립됩니다.
            </div>

            {/* 약관 동의 */}
            <label className="flex items-start gap-2 text-[11px] text-ink-600 cursor-pointer pt-2">
              <input
                type="checkbox"
                required
                checked={termsAgreed}
                onChange={(e) => setTermsAgreed(e.target.checked)}
                className="mt-0.5 accent-ink-900"
              />
              <span className="font-serif-kr leading-relaxed">
                주문 상품의 명세, 결제 금액, 배송지 정보를 확인하였으며 구매 진행에 동의합니다. (필수)
              </span>
            </label>

            <button
              type="submit"
              disabled={isProcessing || selectedItems.length === 0}
              className="w-full py-4 bg-[#0064FF] hover:bg-[#0052D4] text-white text-sm font-bold tracking-wide transition-colors shadow-md disabled:opacity-50 flex items-center justify-center gap-2 rounded-lg"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>결제 진행 중...</span>
                </>
              ) : (
                <>
                  <span>
                    {finalPrice.toLocaleString()}원{' '}
                    {payChannel === 'DIRECT_BANK' ? '무통장 실계좌 주문하기' : '결제하기'}
                  </span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};
