import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useWishlist } from '../context/WishlistContext';
import { PRODUCTS } from '../data/products';
import { Product } from '../types';
import {
  Package,
  Clock,
  Truck,
  CheckCircle,
  ShieldCheck,
  Heart,
  Ticket,
  Coins,
  ChevronRight,
  LogOut,
  ExternalLink,
} from 'lucide-react';

interface MyPageProps {
  navigate: (path: string) => void;
  onSelectProduct: (product: Product) => void;
}

export const MyPage: React.FC<MyPageProps> = ({ navigate, onSelectProduct }) => {
  const { user, isLoggedIn, logout, orders } = useAuth();
  const { wishlistIds } = useWishlist();

  if (!isLoggedIn || !user) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center animate-fade-in">
        <h2 className="text-xl font-serif-kr font-medium text-ink-900">
          로그인이 필요한 서비스입니다.
        </h2>
        <p className="text-xs text-ink-500 mt-2 font-serif-kr">
          가문 회원이 되시면 주문 조회 및 다양한 혜택을 이용하실 수 있습니다.
        </p>
        <button
          onClick={() => navigate('/login')}
          className="mt-6 px-8 py-3 bg-ink-900 text-paper-100 text-xs font-semibold tracking-widest uppercase hover:bg-lacquer transition-colors"
        >
          로그인 페이지로 이동
        </button>
      </div>
    );
  }

  // Count order statuses
  const statusCounts = {
    결제완료: orders.filter((o) => o.status === '결제완료').length,
    상품준비중: orders.filter((o) => o.status === '상품준비중').length,
    배송중: orders.filter((o) => o.status === '배송중').length,
    배송완료: orders.filter((o) => o.status === '배송완료').length,
    구매확정: orders.filter((o) => o.status === '구매확정').length,
  };

  const recentProducts = PRODUCTS.slice(0, 3);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 animate-fade-in space-y-10">
      {/* User Header Profile Card */}
      <div className="bg-paper-100 border border-paper-300 p-6 sm:p-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 shadow-subtle">
        <div>
          <div className="inline-block px-2.5 py-0.5 bg-paper-200 border border-paper-300 text-[10px] tracking-widest text-bronze uppercase font-sans mb-2">
            {user.membershipGrade}
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif-kr font-medium text-ink-900">
            {user.name} <span className="text-base text-ink-500 font-normal">님, 평안하신지요.</span>
          </h1>
          <p className="text-xs text-ink-500 font-sans mt-1">
            {user.email} · {user.phone}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/orders')}
            className="px-4 py-2 border border-ink-900 text-xs font-medium text-ink-900 hover:bg-paper-200 transition-colors"
          >
            주문내역 전체보기
          </button>
          <button
            onClick={logout}
            className="p-2 text-ink-500 hover:text-ink-900 border border-paper-300 transition-colors"
            title="로그아웃"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Benefits Summary Widget: Points, Coupons, Wishlist */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-paper-100 border border-paper-300 p-5 text-center shadow-xs">
          <Coins className="w-5 h-5 mx-auto text-bronze mb-1.5" />
          <p className="text-[11px] text-ink-500 font-medium">보유 적립금</p>
          <p className="text-lg sm:text-xl font-bold text-ink-900 font-sans mt-1">
            {user.points.toLocaleString()}P
          </p>
        </div>

        <div className="bg-paper-100 border border-paper-300 p-5 text-center shadow-xs">
          <Ticket className="w-5 h-5 mx-auto text-bronze mb-1.5" />
          <p className="text-[11px] text-ink-500 font-medium">사용 가능 쿠폰</p>
          <p className="text-lg sm:text-xl font-bold text-ink-900 font-sans mt-1">
            {user.couponCount}장
          </p>
        </div>

        <div
          onClick={() => navigate('/wishlist')}
          className="bg-paper-100 border border-paper-300 p-5 text-center shadow-xs cursor-pointer hover:border-ink-900 transition-colors"
        >
          <Heart className="w-5 h-5 mx-auto text-lacquer mb-1.5" />
          <p className="text-[11px] text-ink-500 font-medium">찜 목록</p>
          <p className="text-lg sm:text-xl font-bold text-ink-900 font-sans mt-1">
            {wishlistIds.length}개
          </p>
        </div>
      </div>

      {/* 5-Stage Order Progress Section */}
      <div className="bg-paper-100 border border-paper-300 p-6 sm:p-8 space-y-4">
        <div className="flex justify-between items-center pb-3 border-b border-paper-300">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-ink-900">
            진행 중인 주문 / 배송 현황
          </h2>
          <button
            onClick={() => navigate('/orders')}
            className="text-xs text-ink-500 hover:text-ink-900 flex items-center gap-1"
          >
            <span>상세 내역</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-5 gap-2 pt-4 text-center">
          <div className="space-y-2">
            <div className="w-10 h-10 mx-auto rounded-none border border-paper-400 bg-paper-200 flex items-center justify-center text-ink-700">
              <Clock className="w-4 h-4" />
            </div>
            <p className="text-[11px] text-ink-600">결제완료</p>
            <p className="text-sm font-bold text-ink-900 font-sans">{statusCounts.결제완료}</p>
          </div>

          <div className="space-y-2">
            <div className="w-10 h-10 mx-auto rounded-none border border-paper-400 bg-paper-200 flex items-center justify-center text-ink-700">
              <Package className="w-4 h-4" />
            </div>
            <p className="text-[11px] text-ink-600">상품준비중</p>
            <p className="text-sm font-bold text-ink-900 font-sans">{statusCounts.상품준비중}</p>
          </div>

          <div className="space-y-2">
            <div className="w-10 h-10 mx-auto rounded-none border border-ink-900 bg-ink-900 text-paper-100 flex items-center justify-center">
              <Truck className="w-4 h-4" />
            </div>
            <p className="text-[11px] font-semibold text-ink-900">배송중</p>
            <p className="text-sm font-bold text-ink-900 font-sans">{statusCounts.배송중}</p>
          </div>

          <div className="space-y-2">
            <div className="w-10 h-10 mx-auto rounded-none border border-paper-400 bg-paper-200 flex items-center justify-center text-ink-700">
              <CheckCircle className="w-4 h-4" />
            </div>
            <p className="text-[11px] text-ink-600">배송완료</p>
            <p className="text-sm font-bold text-ink-900 font-sans">{statusCounts.배송완료}</p>
          </div>

          <div className="space-y-2">
            <div className="w-10 h-10 mx-auto rounded-none border border-paper-400 bg-paper-200 flex items-center justify-center text-ink-700">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <p className="text-[11px] text-ink-600">구매확정</p>
            <p className="text-sm font-bold text-ink-900 font-sans">{statusCounts.구매확정}</p>
          </div>
        </div>
      </div>

      {/* Recent Orders Snippet */}
      {orders.length > 0 && (
        <div className="bg-paper-100 border border-paper-300 p-6 space-y-4">
          <div className="flex justify-between items-center border-b border-paper-300 pb-3">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-ink-900">
              최근 주문 내역
            </h2>
            <button
              onClick={() => navigate('/orders')}
              className="text-xs text-bronze hover:underline"
            >
              전체보기 ({orders.length})
            </button>
          </div>

          <div className="divide-y divide-paper-300">
            {orders.slice(0, 2).map((order) => (
              <div key={order.id} className="py-4 flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                <div className="flex gap-4 items-center">
                  <img
                    src={order.items[0]?.image}
                    alt={order.items[0]?.name}
                    className="w-14 h-18 object-cover bg-paper-200 shadow-xs"
                  />
                  <div>
                    <span className="text-[10px] text-ink-400 font-sans">
                      {order.orderNumber} · {order.orderDate}
                    </span>
                    <h3 className="text-xs sm:text-sm font-medium font-serif-kr text-ink-900 mt-0.5">
                      {order.items[0]?.name}
                      {order.items.length > 1 && ` 외 ${order.items.length - 1}건`}
                    </h3>
                    <p className="text-xs font-semibold text-ink-900 mt-1 font-sans">
                      {order.finalPrice.toLocaleString()}원
                    </p>
                  </div>
                </div>

                <div className="flex sm:flex-col items-center sm:items-end justify-between gap-2">
                  <span className="px-2.5 py-1 text-xs font-semibold bg-paper-200 border border-paper-300 text-ink-900">
                    {order.status}
                  </span>
                  {order.trackingNumber && (
                    <span className="text-[11px] text-ink-500 font-sans">
                      {order.trackingNumber}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quick Service Links */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div
          onClick={() => navigate('/contact')}
          className="bg-paper-100 border border-paper-300 p-5 flex items-center justify-between cursor-pointer hover:border-ink-900 transition-colors"
        >
          <div>
            <h4 className="text-xs font-semibold text-ink-900">1:1 고객 문의 내역</h4>
            <p className="text-[11px] text-ink-500 mt-0.5">배송 및 상품 관련 문의 접수 및 답변 확인</p>
          </div>
          <ChevronRight className="w-4 h-4 text-ink-400" />
        </div>

        <div
          onClick={() => navigate('/shipping-returns')}
          className="bg-paper-100 border border-paper-300 p-5 flex items-center justify-between cursor-pointer hover:border-ink-900 transition-colors"
        >
          <div>
            <h4 className="text-xs font-semibold text-ink-900">교환 및 반품 신청 가이드</h4>
            <p className="text-[11px] text-ink-500 mt-0.5">1회 무료 사이즈 교환 정책 안내</p>
          </div>
          <ChevronRight className="w-4 h-4 text-ink-400" />
        </div>
      </div>
    </div>
  );
};
