import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useWishlist } from '../context/WishlistContext';
import { PRODUCTS } from '../data/products';
import { Product, Order } from '../types';
import {
  Package,
  Clock,
  Truck,
  CheckCircle2,
  Heart,
  Coins,
  Ticket,
  RotateCcw,
  HelpCircle,
  ChevronRight,
  LogOut,
  Sparkles,
  ShoppingBag,
  ExternalLink,
  ShieldCheck,
} from 'lucide-react';
import { useToast } from '../context/ToastContext';

interface MyPageProps {
  navigate: (path: string) => void;
  onSelectProduct: (product: Product) => void;
}

export const MyPage: React.FC<MyPageProps> = ({ navigate, onSelectProduct }) => {
  const { user, isLoggedIn, logout, orders, pointHistory } = useAuth();
  const { wishlistIds, removeFromWishlist, wishlistProducts } = useWishlist();
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState<'orders' | 'points' | 'wishlist' | 'inquiries'>('orders');

  if (!isLoggedIn || !user) {
    return (
      <div className="max-w-md mx-auto px-4 py-24 text-center">
        <h2 className="text-xl font-serif-kr font-medium text-ink-900">
          로그인이 필요한 서비스입니다.
        </h2>
        <p className="text-xs text-ink-500 mt-2 font-serif-kr">
          전주이씨 가문 회원이 되시면 주문 조회, 포인트 이용 원장 및 VIP 맞춤 혜택을 이용하실 수 있습니다.
        </p>
        <button
          onClick={() => navigate('/login')}
          className="mt-6 px-6 py-3 bg-ink-900 text-paper-100 text-xs font-semibold hover:bg-lacquer transition-colors shadow-sm font-serif-kr"
        >
          로그인 페이지로 이동
        </button>
      </div>
    );
  }

  // 주문 상태별 카운트
  const statusCounts = {
    결제완료: orders.filter((o) => o.status === '결제완료').length,
    상품준비중: orders.filter((o) => o.status === '상품준비중').length,
    배송중: orders.filter((o) => o.status === '배송중').length,
    배송완료: orders.filter((o) => o.status === '배송완료' || o.status === '구매확정').length,
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 animate-fade-in font-serif-kr">
      {/* 1. 상단 프로필 & 혜택 배너 */}
      <div className="bg-paper-100 border border-paper-300 p-6 sm:p-8 shadow-subtle mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pb-6 border-b border-paper-300">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full border border-paper-400 bg-lacquer/10 text-lacquer flex items-center justify-center font-serif text-2xl font-bold flex-shrink-0">
              李
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-semibold text-ink-900">
                  {user.name} 님
                </h1>
                <span className="px-2 py-0.5 bg-paper-200 border border-paper-300 text-[10px] text-bronze font-sans font-medium">
                  {user.membershipGrade || '전주이씨 가문회원'}
                </span>
                {user.role === 'admin' && (
                  <span className="px-2 py-0.5 bg-ink-900 text-paper-100 text-[10px] font-sans">
                    관리자 (Admin)
                  </span>
                )}
              </div>
              <p className="text-xs text-ink-500 font-sans mt-0.5">
                {user.email} · {user.phone}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            {user.role === 'admin' && (
              <button
                onClick={() => navigate('/admin')}
                className="px-3.5 py-2 bg-ink-900 text-paper-100 hover:bg-lacquer text-xs transition-colors shadow-sm"
              >
                ERP 관리자 콘솔 &rarr;
              </button>
            )}
            <button
              onClick={() => {
                logout();
                navigate('/login');
              }}
              className="px-3.5 py-2 border border-paper-300 hover:bg-paper-200 text-ink-700 text-xs transition-colors flex items-center gap-1.5"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>로그아웃</span>
            </button>
          </div>
        </div>

        {/* 3대 핵심 지표 (포인트 / 쿠폰 / 주문) */}
        <div className="grid grid-cols-3 gap-4 pt-6 text-center">
          <div
            onClick={() => setActiveTab('points')}
            className="cursor-pointer p-3 hover:bg-paper-50 transition-colors"
          >
            <p className="text-xs text-ink-500 flex items-center justify-center gap-1">
              <Coins className="w-3.5 h-3.5 text-bronze" /> 보유 포인트
            </p>
            <p className="text-2xl font-bold font-sans text-lacquer mt-1">
              {user.points.toLocaleString()}
              <span className="text-xs font-normal text-ink-700 ml-0.5">P</span>
            </p>
            <p className="text-[10px] text-ink-400 mt-1 font-serif-kr">이용 원장 보기 &rarr;</p>
          </div>

          <div className="p-3 border-x border-paper-300">
            <p className="text-xs text-ink-500 flex items-center justify-center gap-1">
              <Ticket className="w-3.5 h-3.5 text-ink-600" /> 보유 쿠폰
            </p>
            <p className="text-2xl font-bold font-sans text-ink-900 mt-1">
              {user.couponCount || 2}
              <span className="text-xs font-normal text-ink-700 ml-0.5">장</span>
            </p>
            <p className="text-[10px] text-ink-400 mt-1 font-serif-kr">웰컴 10% · 로열 15%</p>
          </div>

          <div
            onClick={() => setActiveTab('orders')}
            className="cursor-pointer p-3 hover:bg-paper-50 transition-colors"
          >
            <p className="text-xs text-ink-500 flex items-center justify-center gap-1">
              <ShoppingBag className="w-3.5 h-3.5 text-ink-600" /> 총 주문 건수
            </p>
            <p className="text-2xl font-bold font-sans text-ink-900 mt-1">
              {orders.length}
              <span className="text-xs font-normal text-ink-700 ml-0.5">건</span>
            </p>
            <p className="text-[10px] text-ink-400 mt-1 font-serif-kr">배송/환불 조회 &rarr;</p>
          </div>
        </div>
      </div>

      {/* 2. 주문/배송 4단계 상태 현황 바 */}
      <div className="bg-paper-100 border border-paper-300 p-6 shadow-subtle mb-8">
        <div className="flex justify-between items-center mb-4 pb-2 border-b border-paper-300">
          <h2 className="text-xs font-semibold text-ink-800 uppercase tracking-wider">
            진행 중인 주문 및 배송 현황
          </h2>
          <button
            onClick={() => navigate('/orders')}
            className="text-xs text-lacquer hover:underline"
          >
            전체 주문내역 &rarr;
          </button>
        </div>

        <div className="grid grid-cols-4 gap-2 text-center">
          {[
            { label: '결제완료', count: statusCounts.결제완료, icon: Clock },
            { label: '상품준비중', count: statusCounts.상품준비중, icon: Package },
            { label: '배송중', count: statusCounts.배송중, icon: Truck },
            { label: '배송완료', count: statusCounts.배송완료, icon: CheckCircle2 },
          ].map((s, idx) => {
            const Icon = s.icon;
            return (
              <div key={idx} className="p-3 bg-paper-50 border border-paper-200">
                <Icon className="w-4 h-4 mx-auto text-ink-600 mb-1" />
                <p className="text-xs text-ink-600">{s.label}</p>
                <p className="text-lg font-bold font-sans text-ink-900 mt-1">{s.count}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. 탭 네비게이션 */}
      <div className="flex border-b border-paper-300 mb-6 text-xs">
        {[
          { id: 'orders', label: `주문/배송/환불 (${orders.length})` },
          { id: 'points', label: `포인트 이용 원장 (${pointHistory.length})` },
          { id: 'wishlist', label: `찜 목록 (${wishlistProducts.length})` },
          { id: 'inquiries', label: '1:1 고객센터 문의' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`py-3 px-5 border-b-2 font-medium transition-all ${
              activeTab === tab.id
                ? 'border-ink-900 text-ink-900 font-bold bg-paper-100'
                : 'border-transparent text-ink-500 hover:text-ink-900'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* 4. 탭 콘텐츠 */}
      {/* 4-1. 주문 목록 */}
      {activeTab === 'orders' && (
        <div className="space-y-4 animate-fade-in">
          {orders.length === 0 ? (
            <div className="py-16 text-center bg-paper-100 border border-paper-300">
              <p className="text-xs text-ink-500">주문 내역이 없습니다.</p>
              <button
                onClick={() => navigate('/shop')}
                className="mt-3 px-4 py-2 bg-ink-900 text-paper-100 text-xs hover:bg-lacquer"
              >
                쇼핑하러 가기
              </button>
            </div>
          ) : (
            orders.map((order) => (
              <div key={order.id} className="bg-paper-100 border border-paper-300 p-5 shadow-subtle space-y-3">
                <div className="flex justify-between items-center text-xs pb-2 border-b border-paper-300">
                  <span className="font-semibold font-sans text-ink-900">{order.orderNumber}</span>
                  <span className={`px-2 py-0.5 text-[11px] border font-medium ${
                    order.status === '배송중'
                      ? 'bg-blue-50 text-blue-800 border-blue-200'
                      : order.status === '배송완료'
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                      : order.status === '반품신청'
                      ? 'bg-rose-50 text-rose-800 border-rose-200'
                      : 'bg-paper-200 text-ink-800 border-paper-300'
                  }`}>
                    {order.status}
                  </span>
                </div>

                <div className="divide-y divide-paper-200">
                  {order.items.map((item, idx) => (
                    <div key={idx} className="py-2.5 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-3">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-12 h-16 object-cover border border-paper-300"
                        />
                        <div>
                          <p className="font-medium text-ink-900">{item.name}</p>
                          <p className="text-[11px] text-ink-500 font-sans mt-0.5">
                            {item.color} / {item.size} · {item.quantity}개
                          </p>
                        </div>
                      </div>
                      <span className="font-bold font-sans text-ink-900">
                        {(item.price * item.quantity).toLocaleString()}원
                      </span>
                    </div>
                  ))}
                </div>

                <div className="pt-2 border-t border-paper-200 flex justify-between items-center text-xs">
                  <span className="text-ink-500 font-sans">{order.orderDate} 결제</span>
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-lacquer font-sans text-sm">
                      총 {order.finalPrice.toLocaleString()}원
                    </span>
                    <button
                      onClick={() => navigate('/orders')}
                      className="px-3 py-1 border border-paper-400 hover:border-ink-900 text-[11px]"
                    >
                      상세 관리 &rarr;
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* 4-2. 포인트 이용 원장 (Ledger) */}
      {activeTab === 'points' && (
        <div className="bg-paper-100 border border-paper-300 p-6 shadow-subtle space-y-5 animate-fade-in">
          <div className="flex justify-between items-center pb-3 border-b border-paper-300">
            <div>
              <h3 className="text-sm font-semibold text-ink-900">
                포인트 적립 / 사용 상세 원장 (LEDGER)
              </h3>
              <p className="text-xs text-ink-500 mt-0.5">
                신규가입 웰컴 5,000P, 결제 1% 적립, 리뷰 작성 1,000P 및 주문 차감 상세 내역
              </p>
            </div>
            <div className="text-right">
              <span className="text-xs text-ink-500">현재 잔여 포인트:</span>
              <span className="text-lg font-bold font-sans text-lacquer ml-2">
                {user.points.toLocaleString()}P
              </span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-paper-200 text-ink-700">
                <tr>
                  <th className="py-2.5 px-3">일시</th>
                  <th className="py-2.5 px-3">내용 / 적립 사유</th>
                  <th className="py-2.5 px-3 text-right">변동 포인트</th>
                  <th className="py-2.5 px-3 text-right">잔여 포인트</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-paper-200 font-sans">
                {pointHistory.map((tx) => (
                  <tr key={tx.id} className="hover:bg-paper-50">
                    <td className="py-3 px-3 text-ink-500 text-[11px]">{tx.date}</td>
                    <td className="py-3 px-3 font-serif-kr font-medium text-ink-900">{tx.reason}</td>
                    <td className={`py-3 px-3 text-right font-bold ${tx.amount > 0 ? 'text-emerald-700' : 'text-rose-600'}`}>
                      {tx.amount > 0 ? `+${tx.amount.toLocaleString()}` : tx.amount.toLocaleString()}P
                    </td>
                    <td className="py-3 px-3 text-right text-ink-700 font-medium">
                      {tx.balanceAfter.toLocaleString()}P
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 4-3. 찜 목록 */}
      {activeTab === 'wishlist' && (
        <div className="space-y-4 animate-fade-in">
          {wishlistProducts.length === 0 ? (
            <div className="py-16 text-center bg-paper-100 border border-paper-300">
              <Heart className="w-8 h-8 text-ink-300 mx-auto mb-2" />
              <p className="text-xs text-ink-500">찜한 상품이 없습니다.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {wishlistProducts.map((p) => (
                <div
                  key={p.id}
                  onClick={() => onSelectProduct(p)}
                  className="bg-paper-100 border border-paper-300 p-3 cursor-pointer hover:border-ink-900 transition-colors"
                >
                  <img src={p.images[0]} alt={p.name} className="w-full aspect-[3/4] object-cover mb-2" />
                  <p className="text-xs font-medium text-ink-900 truncate">{p.name}</p>
                  <p className="text-xs font-bold text-lacquer font-sans mt-0.5">{p.price.toLocaleString()}원</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 4-4. 1:1 고객센터 문의 바로가기 */}
      {activeTab === 'inquiries' && (
        <div className="bg-paper-100 border border-paper-300 p-8 text-center space-y-4 animate-fade-in">
          <HelpCircle className="w-10 h-10 text-bronze mx-auto" />
          <h3 className="text-base font-semibold text-ink-900">
            전주이씨 1:1 고객센터 상담 창구
          </h3>
          <p className="text-xs text-ink-500 max-w-md mx-auto leading-relaxed">
            주문, 배송, 반품, 맞춤 제작 및 VIP 기프트에 관한 모든 문의를 고객센터에서 1:1로 신속하고 정성스럽게 답변해 드립니다.
          </p>
          <button
            onClick={() => navigate('/community')}
            className="px-6 py-2.5 bg-ink-900 hover:bg-lacquer text-paper-100 text-xs font-medium transition-colors shadow-sm"
          >
            고객센터(Community) 바로가기 &rarr;
          </button>
        </div>
      )}
    </div>
  );
};
