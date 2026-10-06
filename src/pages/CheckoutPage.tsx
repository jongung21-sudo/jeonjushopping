import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Order } from '../types';
import { ShieldCheck, CheckCircle2, Search, ArrowRight, CreditCard } from 'lucide-react';

interface CheckoutPageProps {
  navigate: (path: string) => void;
  onOrderCompleted: (order: Order) => void;
}

export const CheckoutPage: React.FC<CheckoutPageProps> = ({
  navigate,
  onOrderCompleted,
}) => {
  const { items, totalProductPrice, couponDiscount, shippingFee, finalPrice, clearCart } =
    useCart();
  const { user, addOrder, usePoints } = useAuth();
  const { showToast } = useToast();

  const [ordererName, setOrdererName] = useState(user?.name || '이도현');
  const [ordererEmail, setOrdererEmail] = useState(user?.email || 'heritage@jeonjulee.kr');
  const [ordererPhone, setOrdererPhone] = useState(user?.phone || '010-8521-1392');

  // Shipping
  const [sameAsOrderer, setSameAsOrderer] = useState(true);
  const [recipientName, setRecipientName] = useState(user?.name || '이도현');
  const [recipientPhone, setRecipientPhone] = useState(user?.phone || '010-8521-1392');
  const [postalCode, setPostalCode] = useState('04383');
  const [address, setAddress] = useState('서울특별시 용산구 이태원로 240');
  const [detailAddress, setDetailAddress] = useState('전주이씨 한남 아틀리에 3층');
  const [deliveryMemo, setDeliveryMemo] = useState('부재 시 문 앞에 놓아주세요.');

  // Points
  const [usedPoints, setUsedPoints] = useState(0);

  // Payment Method
  const [paymentMethod, setPaymentMethod] = useState<string>('KAKAOPAY');
  const [isProcessing, setIsProcessing] = useState(false);
  const [termsAgreed, setTermsAgreed] = useState(true);

  const selectedItems = items.filter((i) => i.selected !== false);

  const handleApplyAllPoints = () => {
    if (!user) return;
    const maxUsable = Math.min(user.points, totalProductPrice - couponDiscount);
    setUsedPoints(maxUsable);
  };

  const handlePostalCodeSearch = () => {
    // Mock Daum/Kakao postal address finder
    setPostalCode('06028');
    setAddress('서울특별시 강남구 압구정로 168');
    setDetailAddress('로열 펜트하우스 1201호');
    showToast('우편번호 검색이 완료되었습니다.', 'info');
  };

  const handleProcessPayment = (e: React.FormEvent) => {
    e.preventDefault();

    if (selectedItems.length === 0) {
      showToast('주문할 상품이 없습니다.', 'error');
      navigate('/cart');
      return;
    }

    if (!termsAgreed) {
      showToast('주문 및 결제 진행을 위한 필수 약관에 동의해 주세요.', 'error');
      return;
    }

    setIsProcessing(true);

    // Simulate PG payment gateway call
    setTimeout(() => {
      const orderItems = selectedItems.map((item) => ({
        productId: item.productId,
        name: item.product.name,
        image: item.product.images[0],
        color: item.selectedColor.name,
        size: item.selectedSize,
        price: item.product.price,
        quantity: item.quantity,
      }));

      const newOrder = addOrder({
        items: orderItems,
        totalProductPrice,
        discountPrice: couponDiscount,
        usedPoints,
        shippingFee,
        finalPrice: Math.max(0, finalPrice - usedPoints),
        status: '결제완료',
        recipientName,
        recipientPhone,
        postalCode,
        address,
        detailAddress,
        deliveryMemo,
        paymentMethod:
          paymentMethod === 'KAKAOPAY'
            ? '카카오페이 (간편결제)'
            : paymentMethod === 'NAVERPAY'
            ? '네이버페이 (간편결제)'
            : paymentMethod === 'TOSSPAY'
            ? '토스페이 (간편결제)'
            : paymentMethod === 'CREDIT_CARD'
            ? '신용/체크카드'
            : '무통장 입금 (가상계좌)',
      });

      if (usedPoints > 0) {
        usePoints(usedPoints);
      }

      clearCart();
      setIsProcessing(false);
      onOrderCompleted(newOrder);
      navigate('/orders');
      showToast('주문이 정상적으로 완료되었습니다. (어명이 접수되었습니다)', 'success');
    }, 1200);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 animate-fade-in">
      <div className="pb-6 border-b border-paper-300">
        <h1 className="text-2xl sm:text-3xl font-serif-kr font-medium text-ink-900">
          주문서 작성 및 결제 (CHECKOUT)
        </h1>
        <p className="text-xs text-ink-500 font-sans mt-1">
          안전하고 정갈한 결제 시스템을 통해 주문이 처리됩니다.
        </p>
      </div>

      <form onSubmit={handleProcessPayment} className="grid grid-cols-1 lg:grid-cols-12 gap-10 mt-8">
        {/* Left Column: Form Details (col 7) */}
        <div className="lg:col-span-7 space-y-8">
          {/* 1. 주문자 정보 */}
          <div className="bg-paper-100 border border-paper-300 p-6 space-y-4">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-ink-900 border-b border-paper-300 pb-2">
              01. 주문자 정보
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block text-ink-700 font-medium mb-1">성명</label>
                <input
                  type="text"
                  required
                  value={ordererName}
                  onChange={(e) => setOrdererName(e.target.value)}
                  className="w-full bg-paper-200 border border-paper-300 px-3 py-2 text-ink-900 focus:outline-none focus:border-ink-900"
                />
              </div>
              <div>
                <label className="block text-ink-700 font-medium mb-1">휴대폰 번호</label>
                <input
                  type="tel"
                  required
                  value={ordererPhone}
                  onChange={(e) => setOrdererPhone(e.target.value)}
                  className="w-full bg-paper-200 border border-paper-300 px-3 py-2 text-ink-900 focus:outline-none focus:border-ink-900"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-ink-700 font-medium mb-1">이메일 (주문 확인서 수신)</label>
                <input
                  type="email"
                  required
                  value={ordererEmail}
                  onChange={(e) => setOrdererEmail(e.target.value)}
                  className="w-full bg-paper-200 border border-paper-300 px-3 py-2 text-ink-900 focus:outline-none focus:border-ink-900"
                />
              </div>
            </div>
          </div>

          {/* 2. 배송지 정보 */}
          <div className="bg-paper-100 border border-paper-300 p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-paper-300 pb-2">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-ink-900">
                02. 배송지 정보
              </h2>
              <label className="flex items-center gap-1.5 text-xs text-ink-600 cursor-pointer">
                <input
                  type="checkbox"
                  checked={sameAsOrderer}
                  onChange={(e) => {
                    setSameAsOrderer(e.target.checked);
                    if (e.target.checked) {
                      setRecipientName(ordererName);
                      setRecipientPhone(ordererPhone);
                    }
                  }}
                  className="accent-ink-900"
                />
                <span>주문자 정보와 동일</span>
              </label>
            </div>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-ink-700 font-medium mb-1">받는 분</label>
                  <input
                    type="text"
                    required
                    value={recipientName}
                    onChange={(e) => setRecipientName(e.target.value)}
                    className="w-full bg-paper-200 border border-paper-300 px-3 py-2 text-ink-900 focus:outline-none focus:border-ink-900"
                  />
                </div>
                <div>
                  <label className="block text-ink-700 font-medium mb-1">연락처</label>
                  <input
                    type="tel"
                    required
                    value={recipientPhone}
                    onChange={(e) => setRecipientPhone(e.target.value)}
                    className="w-full bg-paper-200 border border-paper-300 px-3 py-2 text-ink-900 focus:outline-none focus:border-ink-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-ink-700 font-medium mb-1">우편번호</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    readOnly
                    value={postalCode}
                    className="w-28 bg-paper-200 border border-paper-300 px-3 py-2 text-ink-900"
                  />
                  <button
                    type="button"
                    onClick={handlePostalCodeSearch}
                    className="px-4 py-2 border border-ink-900 text-xs text-ink-900 hover:bg-ink-900 hover:text-paper-100 transition-colors flex items-center gap-1"
                  >
                    <Search className="w-3.5 h-3.5" />
                    <span>우편번호 찾기</span>
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-ink-700 font-medium mb-1">기본 주소</label>
                <input
                  type="text"
                  required
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full bg-paper-200 border border-paper-300 px-3 py-2 text-ink-900 focus:outline-none focus:border-ink-900"
                />
              </div>

              <div>
                <label className="block text-ink-700 font-medium mb-1">상세 주소</label>
                <input
                  type="text"
                  required
                  value={detailAddress}
                  onChange={(e) => setDetailAddress(e.target.value)}
                  className="w-full bg-paper-200 border border-paper-300 px-3 py-2 text-ink-900 focus:outline-none focus:border-ink-900"
                />
              </div>

              <div>
                <label className="block text-ink-700 font-medium mb-1">배송 요청사항</label>
                <select
                  value={deliveryMemo}
                  onChange={(e) => setDeliveryMemo(e.target.value)}
                  className="w-full bg-paper-200 border border-paper-300 px-3 py-2 text-ink-900 focus:outline-none focus:border-ink-900"
                >
                  <option value="부재 시 문 앞에 놓아주세요.">부재 시 문 앞에 놓아주세요.</option>
                  <option value="배송 전 미리 연락 부탁드립니다.">배송 전 미리 연락 부탁드립니다.</option>
                  <option value="경비실에 맡겨주세요.">경비실에 맡겨주세요.</option>
                  <option value="택배함에 보관해 주세요.">택배함에 보관해 주세요.</option>
                  <option value="파손 위험이 있으니 조심히 다뤄주세요.">파손 위험이 있으니 조심히 다뤄주세요.</option>
                </select>
              </div>
            </div>
          </div>

          {/* 3. 포인트 사용 */}
          {user && (
            <div className="bg-paper-100 border border-paper-300 p-6 space-y-3">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-ink-900 border-b border-paper-300 pb-2">
                03. 적립금 / 마일리지 사용
              </h2>
              <div className="flex items-center justify-between text-xs">
                <span className="text-ink-600">
                  보유 적립금: <strong className="text-ink-900 font-sans">{user.points.toLocaleString()}P</strong>
                </span>
                <button
                  type="button"
                  onClick={handleApplyAllPoints}
                  className="text-xs text-bronze underline font-medium hover:text-ink-900"
                >
                  전액 사용
                </button>
              </div>
              <div className="flex gap-2">
                <input
                  type="number"
                  min="0"
                  max={user.points}
                  value={usedPoints}
                  onChange={(e) => setUsedPoints(Math.min(user.points, Number(e.target.value) || 0))}
                  className="w-36 bg-paper-200 border border-paper-300 px-3 py-1.5 text-xs text-ink-900"
                />
                <span className="text-xs flex items-center text-ink-500">P 적용</span>
              </div>
            </div>
          )}

          {/* 4. 결제 수단 선택 */}
          <div className="bg-paper-100 border border-paper-300 p-6 space-y-4">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-ink-900 border-b border-paper-300 pb-2">
              04. 결제 수단 선택
            </h2>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
              {[
                { id: 'KAKAOPAY', name: '카카오페이', badge: '간편결제' },
                { id: 'NAVERPAY', name: '네이버페이', badge: '간편결제' },
                { id: 'TOSSPAY', name: '토스페이', badge: '간편결제' },
                { id: 'CREDIT_CARD', name: '신용/체크카드', badge: 'PG 연동' },
                { id: 'BANK_TRANSFER', name: '무통장 입금', badge: '가상계좌' },
              ].map((method) => (
                <button
                  key={method.id}
                  type="button"
                  onClick={() => setPaymentMethod(method.id)}
                  className={`p-3 text-left border transition-all ${
                    paymentMethod === method.id
                      ? 'border-ink-900 bg-ink-900 text-paper-100'
                      : 'border-paper-300 bg-paper-200 text-ink-800 hover:border-ink-600'
                  }`}
                >
                  <p className="font-semibold">{method.name}</p>
                  <p className="text-[10px] opacity-70 mt-0.5">{method.badge}</p>
                </button>
              ))}
            </div>

            <p className="text-[11px] text-ink-500 pt-2 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-bronze flex-shrink-0" />
              <span>
                PG API 보안 규격 준수: 카드 정보 및 인증 토큰은 암호화 전송됩니다.
              </span>
            </p>
          </div>
        </div>

        {/* Right Column: Order Items & Total Summary (col 5) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-paper-200 border border-paper-300 p-6 space-y-4 sticky top-24">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-ink-900 border-b border-paper-300 pb-2">
              주문 상품 정보 ({selectedItems.length}개)
            </h2>

            <div className="max-h-60 overflow-y-auto divide-y divide-paper-300/60 pr-1">
              {selectedItems.map((item) => (
                <div key={item.id} className="py-2.5 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-3">
                    <img
                      src={item.product.images[0]}
                      alt={item.product.name}
                      className="w-12 h-16 object-cover bg-paper-300"
                    />
                    <div>
                      <p className="font-serif-kr font-medium text-ink-900 line-clamp-1">{item.product.name}</p>
                      <p className="text-[10px] text-ink-500 font-sans mt-0.5">
                        {item.selectedColor.name} / {item.selectedSize} · {item.quantity}개
                      </p>
                    </div>
                  </div>
                  <span className="font-semibold text-ink-900 font-sans">
                    {(item.product.price * item.quantity).toLocaleString()}원
                  </span>
                </div>
              ))}
            </div>

            {/* Calculations */}
            <div className="space-y-2 pt-3 border-t border-paper-300 text-xs text-ink-700">
              <div className="flex justify-between">
                <span>총 상품금액</span>
                <span className="font-sans font-medium">{totalProductPrice.toLocaleString()}원</span>
              </div>
              {couponDiscount > 0 && (
                <div className="flex justify-between text-lacquer">
                  <span>쿠폰 할인</span>
                  <span className="font-sans font-semibold">-{couponDiscount.toLocaleString()}원</span>
                </div>
              )}
              {usedPoints > 0 && (
                <div className="flex justify-between text-lacquer">
                  <span>적립금 사용</span>
                  <span className="font-sans font-semibold">-{usedPoints.toLocaleString()}원</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>배송비</span>
                <span className="font-sans font-medium">
                  {shippingFee === 0 ? '무료' : `${shippingFee.toLocaleString()}원`}
                </span>
              </div>
            </div>

            {/* Final Amount */}
            <div className="pt-3 border-t border-paper-300 flex justify-between items-baseline">
              <span className="text-sm font-serif-kr font-semibold text-ink-900">최종 결제 금액</span>
              <span className="text-2xl font-bold font-sans text-ink-900">
                {Math.max(0, finalPrice - usedPoints).toLocaleString()}원
              </span>
            </div>

            {/* Terms Consent */}
            <div className="pt-4 border-t border-paper-300 space-y-2">
              <label className="flex items-start gap-2 text-[11px] text-ink-600 cursor-pointer">
                <input
                  type="checkbox"
                  checked={termsAgreed}
                  onChange={(e) => setTermsAgreed(e.target.checked)}
                  className="accent-ink-900 mt-0.5"
                />
                <span>
                  주문 상품의 정보 및 결제 대행 서비스 이용약관을 확인하였으며, 구매 진행에 동의합니다. (필수)
                </span>
              </label>
            </div>

            {/* Pay Submit Button */}
            <button
              type="submit"
              disabled={isProcessing}
              className="w-full py-4 bg-ink-900 text-paper-100 text-xs font-semibold tracking-[0.2em] uppercase flex items-center justify-center gap-2 hover:bg-lacquer transition-colors disabled:opacity-50 mt-4"
            >
              {isProcessing ? (
                <span>결제 인증 승인 중...</span>
              ) : (
                <>
                  <CreditCard className="w-4 h-4" />
                  <span>
                    {Math.max(0, finalPrice - usedPoints).toLocaleString()}원 결제하기
                  </span>
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};
