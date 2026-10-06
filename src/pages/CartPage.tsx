import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { Trash2, Heart, ArrowRight, Truck, Tag, ShoppingBag, ArrowLeft } from 'lucide-react';
import { Product } from '../types';

interface CartPageProps {
  navigate: (path: string) => void;
  onSelectProduct: (product: Product) => void;
}

export const CartPage: React.FC<CartPageProps> = ({ navigate, onSelectProduct }) => {
  const {
    items,
    updateQuantity,
    removeFromCart,
    removeSelected,
    toggleSelect,
    selectAll,
    appliedCoupon,
    applyCoupon,
    removeCoupon,
    availableCoupons,
    totalProductPrice,
    couponDiscount,
    shippingFee,
    finalPrice,
    freeShippingProgress,
    amountUntilFreeShipping,
  } = useCart();

  const { toggleWishlist } = useWishlist();
  const [couponCodeInput, setCouponCodeInput] = useState('');

  const allSelected = items.length > 0 && items.every((i) => i.selected !== false);
  const selectedCount = items.filter((i) => i.selected !== false).length;

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (couponCodeInput.trim()) {
      applyCoupon(couponCodeInput.trim());
      setCouponCodeInput('');
    }
  };

  const handleMoveToWishlist = (productId: string, cartId: string) => {
    toggleWishlist(productId);
    removeFromCart(cartId);
  };

  if (items.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center animate-fade-in">
        <div className="w-16 h-16 mx-auto mb-4 border border-paper-400 flex items-center justify-center text-ink-400">
          <ShoppingBag className="w-7 h-7" strokeWidth={1.5} />
        </div>
        <h2 className="text-xl font-serif-kr font-medium text-ink-900">
          장바구니가 비어 있습니다.
        </h2>
        <p className="text-xs text-ink-500 mt-2 font-serif-kr">
          전주이씨의 기품 있는 2026 S/S 컬렉션을 만나보세요.
        </p>
        <button
          onClick={() => navigate('/shop')}
          className="mt-6 px-8 py-3 bg-ink-900 text-paper-100 text-xs font-semibold tracking-widest uppercase hover:bg-lacquer transition-colors"
        >
          컬렉션 둘러보기 (SHOP)
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 animate-fade-in">
      {/* Title & Free Shipping Progress Bar */}
      <div className="pb-6 border-b border-paper-300">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl sm:text-3xl font-serif-kr font-medium text-ink-900">
            장바구니 (SHOPPING BAG)
          </h1>
          <button
            onClick={() => navigate('/shop')}
            className="text-xs text-ink-500 hover:text-ink-900 flex items-center gap-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>쇼핑 계속하기</span>
          </button>
        </div>

        {/* Free shipping banner */}
        <div className="mt-4 p-3.5 bg-paper-200 border border-paper-300/80">
          <div className="flex justify-between items-center text-xs text-ink-800 mb-1.5">
            <span className="flex items-center gap-1.5 font-medium">
              <Truck className="w-4 h-4 text-bronze" />
              {amountUntilFreeShipping > 0
                ? `${amountUntilFreeShipping.toLocaleString()}원 더 담으시면 무료배송 혜택!`
                : '축하합니다! 무료배송 기준을 달성하셨습니다.'}
            </span>
            <span className="text-[11px] font-semibold text-ink-600">{freeShippingProgress}%</span>
          </div>
          <div className="w-full h-1.5 bg-paper-300 overflow-hidden">
            <div
              className="h-full bg-ink-900 transition-all duration-500 ease-out"
              style={{ width: `${freeShippingProgress}%` }}
            />
          </div>
        </div>
      </div>

      {/* Main Grid: Items Left (col 8) + Summary Right (col 4) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 mt-8">
        {/* Left: Items List */}
        <div className="lg:col-span-8 space-y-4">
          {/* Table Header / Action Row */}
          <div className="flex items-center justify-between pb-3 border-b border-paper-300 text-xs text-ink-600">
            <label className="flex items-center gap-2 cursor-pointer font-medium text-ink-900">
              <input
                type="checkbox"
                checked={allSelected}
                onChange={(e) => selectAll(e.target.checked)}
                className="accent-ink-900"
              />
              <span>전체 선택 ({selectedCount}/{items.length})</span>
            </label>
            <button
              onClick={removeSelected}
              className="text-ink-500 hover:text-lacquer underline text-[11px]"
            >
              선택 삭제
            </button>
          </div>

          {/* Cart Item Cards */}
          <div className="divide-y divide-paper-300">
            {items.map((item) => (
              <div key={item.id} className="py-5 flex gap-4 sm:gap-6 items-start">
                {/* Checkbox */}
                <input
                  type="checkbox"
                  checked={item.selected !== false}
                  onChange={() => toggleSelect(item.id)}
                  className="accent-ink-900 mt-2"
                />

                {/* Thumbnail */}
                <div
                  onClick={() => onSelectProduct(item.product)}
                  className="w-20 sm:w-24 aspect-[3/4] bg-paper-200 overflow-hidden flex-shrink-0 cursor-pointer shadow-subtle"
                >
                  <img
                    src={item.product.images[0]}
                    alt={item.product.name}
                    className="w-full h-full object-cover hover:scale-105 transition-transform"
                  />
                </div>

                {/* Details & Controls */}
                <div className="flex-1 flex flex-col justify-between min-h-[110px]">
                  <div>
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-[10px] text-ink-400 uppercase tracking-widest font-sans">
                          {item.product.category}
                        </p>
                        <h3
                          onClick={() => onSelectProduct(item.product)}
                          className="text-sm font-medium font-serif-kr text-ink-900 hover:text-lacquer cursor-pointer"
                        >
                          {item.product.name}
                        </h3>
                        <p className="text-xs text-ink-600 mt-1 font-sans">
                          옵션: {item.selectedColor.name} / {item.selectedSize}
                        </p>
                      </div>

                      {/* Delete item button */}
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="text-ink-400 hover:text-lacquer p-1"
                        aria-label="삭제"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Quantity and Price */}
                  <div className="flex items-center justify-between mt-4 pt-3 border-t border-paper-200">
                    <div className="flex items-center gap-2">
                      <div className="flex items-center border border-paper-300">
                        <button
                          onClick={() => updateQuantity(item.id, -1)}
                          className="w-7 h-7 flex items-center justify-center text-xs hover:bg-paper-200 text-ink-700"
                        >
                          -
                        </button>
                        <span className="w-8 text-center text-xs font-semibold text-ink-900">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.id, 1)}
                          className="w-7 h-7 flex items-center justify-center text-xs hover:bg-paper-200 text-ink-700"
                        >
                          +
                        </button>
                      </div>

                      <button
                        onClick={() => handleMoveToWishlist(item.productId, item.id)}
                        className="p-1.5 text-ink-500 hover:text-lacquer border border-paper-300 text-[11px] flex items-center gap-1"
                        title="찜으로 이동"
                      >
                        <Heart className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">찜</span>
                      </button>
                    </div>

                    <div className="text-right">
                      <span className="text-sm font-bold text-ink-900 font-sans">
                        {(item.product.price * item.quantity).toLocaleString()}원
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Order Summary & Coupon */}
        <div className="lg:col-span-4 space-y-6">
          {/* Coupon Box */}
          <div className="bg-paper-200 border border-paper-300 p-5">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-ink-900 mb-3 flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5 text-bronze" />
              <span>가문 혜택 쿠폰 적용</span>
            </h3>

            {appliedCoupon ? (
              <div className="flex items-center justify-between bg-paper-100 p-3 border border-lacquer/40 text-xs">
                <div>
                  <p className="font-semibold text-ink-900">{appliedCoupon.title}</p>
                  <p className="text-[11px] text-lacquer mt-0.5">
                    {appliedCoupon.discountType === 'PERCENT'
                      ? `${appliedCoupon.discountValue}% 할인`
                      : `${appliedCoupon.discountValue.toLocaleString()}원 할인`}
                  </p>
                </div>
                <button
                  onClick={removeCoupon}
                  className="text-[11px] text-ink-500 hover:text-ink-900 underline"
                >
                  취소
                </button>
              </div>
            ) : (
              <form onSubmit={handleApplyCoupon} className="space-y-2">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={couponCodeInput}
                    onChange={(e) => setCouponCodeInput(e.target.value)}
                    placeholder="쿠폰 코드 입력 (예: WELCOME10)"
                    className="flex-1 bg-paper-100 border border-paper-300 px-3 py-2 text-xs uppercase focus:outline-none focus:border-ink-900"
                  />
                  <button
                    type="submit"
                    className="px-3.5 py-2 bg-ink-900 text-paper-100 text-xs font-medium hover:bg-lacquer transition-colors"
                  >
                    적용
                  </button>
                </div>

                {/* Available Quick Coupon Selectors */}
                <div className="pt-2">
                  <p className="text-[10px] text-ink-500 mb-1">보유 쿠폰 빠른 적용:</p>
                  <div className="flex flex-col gap-1">
                    {availableCoupons.map((c) => (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => applyCoupon(c.code)}
                        className="text-left text-[11px] text-ink-700 bg-paper-100 p-2 border border-paper-300 hover:border-ink-900 transition-colors flex justify-between"
                      >
                        <span>{c.title}</span>
                        <span className="font-semibold text-lacquer">[{c.code}]</span>
                      </button>
                    ))}
                  </div>
                </div>
              </form>
            )}
          </div>

          {/* Pricing Calculation Summary */}
          <div className="bg-paper-200 border border-paper-300 p-6 space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-ink-900 pb-3 border-b border-paper-300">
              결제 금액 요약
            </h3>

            <div className="flex justify-between text-xs text-ink-700">
              <span>선택 상품 금액</span>
              <span className="font-sans font-medium">{totalProductPrice.toLocaleString()}원</span>
            </div>

            {couponDiscount > 0 && (
              <div className="flex justify-between text-xs text-lacquer">
                <span>쿠폰 할인 금액</span>
                <span className="font-sans font-semibold">
                  -{couponDiscount.toLocaleString()}원
                </span>
              </div>
            )}

            <div className="flex justify-between text-xs text-ink-700">
              <span>기본 배송비</span>
              <span className="font-sans font-medium">
                {shippingFee === 0 ? '무료배송' : `${shippingFee.toLocaleString()}원`}
              </span>
            </div>

            <div className="pt-3 border-t border-paper-300 flex justify-between items-baseline">
              <span className="text-sm font-semibold text-ink-900 font-serif-kr">
                최종 결제 예정 금액
              </span>
              <span className="text-xl sm:text-2xl font-bold text-ink-900 font-sans">
                {finalPrice.toLocaleString()}원
              </span>
            </div>

            <button
              onClick={() => navigate('/checkout')}
              disabled={selectedCount === 0}
              className="w-full mt-4 py-4 bg-ink-900 text-paper-100 text-xs font-semibold tracking-[0.2em] uppercase flex items-center justify-center gap-2 hover:bg-lacquer transition-colors disabled:opacity-50"
            >
              <span>주문하기 ({selectedCount}개)</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
