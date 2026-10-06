import React, { useState } from 'react';
import { PRODUCTS } from '../data/products';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { NOTICES, INITIAL_COUPONS } from '../data/mockData';
import { Product, OrderStatus } from '../types';
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  Ticket,
  Bell,
  Check,
  TrendingUp,
  Users,
  DollarSign,
  ArrowLeft,
  Edit,
  Trash2,
} from 'lucide-react';

interface AdminPageProps {
  navigate: (path: string) => void;
}

export const AdminPage: React.FC<AdminPageProps> = ({ navigate }) => {
  const { orders, updateOrderStatus } = useAuth();
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState<'DASHBOARD' | 'PRODUCTS' | 'ORDERS' | 'COUPONS' | 'NOTICES'>('DASHBOARD');
  const [productsList, setProductsList] = useState<Product[]>(PRODUCTS);
  const [couponsList, setCouponsList] = useState(INITIAL_COUPONS);

  // New coupon form
  const [newCouponCode, setNewCouponCode] = useState('');
  const [newCouponTitle, setNewCouponTitle] = useState('');
  const [newCouponValue, setNewCouponValue] = useState(15);

  const totalRevenue = orders.reduce((sum, o) => sum + o.finalPrice, 0);

  const toggleProductSoldOut = (id: string) => {
    setProductsList((prev) =>
      prev.map((p) => (p.id === id ? { ...p, isSoldOut: !p.isSoldOut } : p))
    );
    showToast('상품 품절 상태가 변경되었습니다.', 'info');
  };

  const handleAddCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCouponCode.trim() || !newCouponTitle.trim()) return;

    const newCoupon = {
      id: `coup-${Date.now()}`,
      code: newCouponCode.trim().toUpperCase(),
      title: newCouponTitle.trim(),
      discountType: 'PERCENT' as const,
      discountValue: newCouponValue,
      minOrderPrice: 50000,
      expiresAt: '2026-12-31',
    };

    setCouponsList((prev) => [newCoupon, ...prev]);
    setNewCouponCode('');
    setNewCouponTitle('');
    showToast(`신규 쿠폰 '${newCoupon.code}' 발행이 완료되었습니다.`, 'success');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 animate-fade-in">
      {/* Admin Top Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-6 border-b border-paper-300 gap-4">
        <div>
          <button
            onClick={() => navigate('/')}
            className="inline-flex items-center gap-1.5 text-xs text-ink-500 hover:text-ink-900 mb-2 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>온라인 스토어로 돌아가기</span>
          </button>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-serif-kr font-medium text-ink-900">
              전주이씨 관리자 시스템 (ADMIN CONSOLE)
            </h1>
            <span className="text-[10px] px-2 py-0.5 bg-ink-900 text-paper-100 font-sans tracking-widest uppercase">
              MASTER
            </span>
          </div>
        </div>

        {/* Tab Buttons */}
        <div className="flex flex-wrap gap-2 text-xs">
          {[
            { id: 'DASHBOARD', label: '대시보드', icon: LayoutDashboard },
            { id: 'PRODUCTS', label: '상품 관리', icon: Package },
            { id: 'ORDERS', label: '주문/배송 관리', icon: ShoppingBag },
            { id: 'COUPONS', label: '쿠폰/프로모션', icon: Ticket },
            { id: 'NOTICES', label: '공지사항 관리', icon: Bell },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-1.5 px-3 py-2 border transition-all ${
                  activeTab === tab.id
                    ? 'border-ink-900 bg-ink-900 text-paper-100 font-semibold'
                    : 'border-paper-300 bg-paper-100 text-ink-700 hover:border-ink-900'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ==================================================
          1. DASHBOARD TAB
          ================================================== */}
      {activeTab === 'DASHBOARD' && (
        <div className="space-y-8 mt-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-paper-100 border border-paper-300 p-5">
              <div className="flex items-center justify-between text-ink-500 mb-2">
                <span className="text-xs font-semibold uppercase">총 누적 매출</span>
                <DollarSign className="w-4 h-4 text-bronze" />
              </div>
              <p className="text-2xl font-bold font-sans text-ink-900">
                {totalRevenue.toLocaleString()}원
              </p>
              <p className="text-[11px] text-lacquer mt-1 flex items-center gap-1">
                <TrendingUp className="w-3 h-3" /> 지난달 대비 +24.8%
              </p>
            </div>

            <div className="bg-paper-100 border border-paper-300 p-5">
              <div className="flex items-center justify-between text-ink-500 mb-2">
                <span className="text-xs font-semibold uppercase">총 주문 건수</span>
                <ShoppingBag className="w-4 h-4 text-bronze" />
              </div>
              <p className="text-2xl font-bold font-sans text-ink-900">{orders.length}건</p>
              <p className="text-[11px] text-ink-500 mt-1">실시간 배송 진행 1건</p>
            </div>

            <div className="bg-paper-100 border border-paper-300 p-5">
              <div className="flex items-center justify-between text-ink-500 mb-2">
                <span className="text-xs font-semibold uppercase">가문 활성 회원</span>
                <Users className="w-4 h-4 text-bronze" />
              </div>
              <p className="text-2xl font-bold font-sans text-ink-900">1,842명</p>
              <p className="text-[11px] text-ink-500 mt-1">신규 가입 +18명 (오늘)</p>
            </div>

            <div className="bg-paper-100 border border-paper-300 p-5">
              <div className="flex items-center justify-between text-ink-500 mb-2">
                <span className="text-xs font-semibold uppercase">등록 상품 수</span>
                <Package className="w-4 h-4 text-bronze" />
              </div>
              <p className="text-2xl font-bold font-sans text-ink-900">{productsList.length}개</p>
              <p className="text-[11px] text-ink-500 mt-1">품절 0개 정상 공급</p>
            </div>
          </div>

          {/* Recent Orders Overview */}
          <div className="bg-paper-100 border border-paper-300 p-6">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-ink-900 pb-3 border-b border-paper-300">
              최근 발생 주문 (LIVE ORDERS)
            </h3>
            <div className="divide-y divide-paper-200 mt-2">
              {orders.map((o) => (
                <div key={o.id} className="py-3 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-semibold text-ink-900 font-sans">{o.orderNumber}</span>
                    <span className="text-ink-400 ml-2">({o.orderDate})</span>
                    <p className="text-ink-700 font-serif-kr mt-0.5">
                      {o.recipientName}님 · {o.items[0]?.name}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-sans font-bold">{o.finalPrice.toLocaleString()}원</span>
                    <span className="px-2 py-0.5 text-[11px] bg-paper-200 border border-paper-300">
                      {o.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ==================================================
          2. PRODUCTS TAB
          ================================================== */}
      {activeTab === 'PRODUCTS' && (
        <div className="mt-8 bg-paper-100 border border-paper-300 p-6 space-y-4">
          <div className="flex justify-between items-center pb-4 border-b border-paper-300">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-ink-900">
              상품 마스터 관리 ({productsList.length}개)
            </h3>
            <button
              onClick={() => alert('신규 상품 등록 모달 준비 중입니다.')}
              className="px-3.5 py-1.5 bg-ink-900 text-paper-100 text-xs font-medium hover:bg-lacquer"
            >
              + 신규 상품 등록
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-paper-300 text-ink-900 font-semibold bg-paper-200/50">
                  <th className="py-2.5 px-3">이미지</th>
                  <th className="py-2.5 px-3">상품명 / 영문</th>
                  <th className="py-2.5 px-3">카테고리</th>
                  <th className="py-2.5 px-3">판매가</th>
                  <th className="py-2.5 px-3">누적판매</th>
                  <th className="py-2.5 px-3">상태</th>
                  <th className="py-2.5 px-3 text-right">관리</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-paper-200">
                {productsList.map((p) => (
                  <tr key={p.id} className="hover:bg-paper-200/30">
                    <td className="py-2.5 px-3">
                      <img src={p.images[0]} alt={p.name} className="w-10 h-13 object-cover" />
                    </td>
                    <td className="py-2.5 px-3">
                      <p className="font-serif-kr font-medium text-ink-900">{p.name}</p>
                      <p className="text-[10px] text-ink-400 font-sans">{p.engName}</p>
                    </td>
                    <td className="py-2.5 px-3 font-sans text-ink-600">{p.category}</td>
                    <td className="py-2.5 px-3 font-sans font-semibold">
                      {p.price.toLocaleString()}원
                    </td>
                    <td className="py-2.5 px-3 font-sans">{p.salesCount}벌</td>
                    <td className="py-2.5 px-3">
                      <button
                        onClick={() => toggleProductSoldOut(p.id)}
                        className={`px-2 py-0.5 text-[10px] font-medium border ${
                          p.isSoldOut
                            ? 'bg-ink-900 text-paper-100 border-ink-900'
                            : 'bg-paper-200 text-ink-800 border-paper-300'
                        }`}
                      >
                        {p.isSoldOut ? '품절 (클릭시 해제)' : '정상 판매'}
                      </button>
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      <button
                        onClick={() => alert(`[${p.name}] 정보 수정 모달`)}
                        className="text-ink-600 hover:text-ink-900 underline text-xs"
                      >
                        수정
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ==================================================
          3. ORDERS TAB
          ================================================== */}
      {activeTab === 'ORDERS' && (
        <div className="mt-8 bg-paper-100 border border-paper-300 p-6 space-y-4">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-ink-900 pb-4 border-b border-paper-300">
            실시간 주문 및 배송 상태 변경
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-paper-300 text-ink-900 font-semibold bg-paper-200/50">
                  <th className="py-2.5 px-3">주문번호 / 일시</th>
                  <th className="py-2.5 px-3">주문자 / 수령인</th>
                  <th className="py-2.5 px-3">주문 상품</th>
                  <th className="py-2.5 px-3">결제 금액</th>
                  <th className="py-2.5 px-3">배송지</th>
                  <th className="py-2.5 px-3">상태 변경</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-paper-200">
                {orders.map((o) => (
                  <tr key={o.id} className="hover:bg-paper-200/30">
                    <td className="py-3 px-3">
                      <p className="font-semibold font-sans">{o.orderNumber}</p>
                      <p className="text-[10px] text-ink-400">{o.orderDate}</p>
                    </td>
                    <td className="py-3 px-3">
                      <p className="font-medium text-ink-900">{o.recipientName}</p>
                      <p className="text-[10px] text-ink-500">{o.recipientPhone}</p>
                    </td>
                    <td className="py-3 px-3">
                      <p className="font-serif-kr line-clamp-1">{o.items[0]?.name}</p>
                      <p className="text-[10px] text-ink-500">{o.items[0]?.color} / {o.items[0]?.size}</p>
                    </td>
                    <td className="py-3 px-3 font-semibold font-sans">
                      {o.finalPrice.toLocaleString()}원
                    </td>
                    <td className="py-3 px-3 text-[11px] text-ink-600 max-w-xs truncate">
                      {o.address} {o.detailAddress}
                    </td>
                    <td className="py-3 px-3">
                      <select
                        value={o.status}
                        onChange={(e) => updateOrderStatus(o.id, e.target.value as OrderStatus)}
                        className="bg-paper-200 border border-paper-300 px-2 py-1 text-xs font-medium cursor-pointer"
                      >
                        <option value="결제완료">결제완료</option>
                        <option value="상품준비중">상품준비중</option>
                        <option value="배송중">배송중</option>
                        <option value="배송완료">배송완료</option>
                        <option value="구매확정">구매확정</option>
                        <option value="주문취소">주문취소</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ==================================================
          4. COUPONS TAB
          ================================================== */}
      {activeTab === 'COUPONS' && (
        <div className="mt-8 grid grid-cols-1 md:grid-cols-12 gap-8">
          <div className="md:col-span-7 bg-paper-100 border border-paper-300 p-6 space-y-4">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-ink-900 pb-3 border-b border-paper-300">
              발행 쿠폰 목록
            </h3>
            <div className="divide-y divide-paper-200">
              {couponsList.map((c) => (
                <div key={c.id} className="py-3 flex justify-between items-center text-xs">
                  <div>
                    <span className="font-semibold text-ink-900 font-sans">{c.code}</span>
                    <p className="text-ink-600 font-serif-kr mt-0.5">{c.title}</p>
                    <p className="text-[10px] text-ink-400">최소주문: {c.minOrderPrice.toLocaleString()}원 / 기한: {c.expiresAt}</p>
                  </div>
                  <span className="text-lacquer font-bold">
                    {c.discountType === 'PERCENT' ? `${c.discountValue}%` : `${c.discountValue.toLocaleString()}원`}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="md:col-span-5 bg-paper-100 border border-paper-300 p-6 space-y-4">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-ink-900 pb-3 border-b border-paper-300">
              신규 가문 쿠폰 발행
            </h3>
            <form onSubmit={handleAddCoupon} className="space-y-3 text-xs">
              <div>
                <label className="block text-ink-700 font-medium mb-1">쿠폰 코드</label>
                <input
                  type="text"
                  required
                  value={newCouponCode}
                  onChange={(e) => setNewCouponCode(e.target.value)}
                  placeholder="예: SUMMER2026"
                  className="w-full bg-paper-200 border border-paper-300 px-3 py-2 uppercase"
                />
              </div>
              <div>
                <label className="block text-ink-700 font-medium mb-1">쿠폰명</label>
                <input
                  type="text"
                  required
                  value={newCouponTitle}
                  onChange={(e) => setNewCouponTitle(e.target.value)}
                  placeholder="예: 여름 시즌 15% 특별 할인권"
                  className="w-full bg-paper-200 border border-paper-300 px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-ink-700 font-medium mb-1">할인율 (%)</label>
                <input
                  type="number"
                  min="5"
                  max="50"
                  value={newCouponValue}
                  onChange={(e) => setNewCouponValue(Number(e.target.value))}
                  className="w-full bg-paper-200 border border-paper-300 px-3 py-2"
                />
              </div>
              <button
                type="submit"
                className="w-full py-2.5 bg-ink-900 text-paper-100 text-xs font-semibold uppercase hover:bg-lacquer mt-2"
              >
                쿠폰 생성 및 활성화
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ==================================================
          5. NOTICES TAB
          ================================================== */}
      {activeTab === 'NOTICES' && (
        <div className="mt-8 bg-paper-100 border border-paper-300 p-6 space-y-4">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-ink-900 pb-3 border-b border-paper-300">
            공지사항 및 릴리즈 뉴스 관리 ({NOTICES.length}건)
          </h3>
          <div className="divide-y divide-paper-200">
            {NOTICES.map((n) => (
              <div key={n.id} className="py-3 flex justify-between items-center text-xs">
                <div>
                  <span className="font-semibold text-ink-900 font-serif-kr">{n.title}</span>
                  <p className="text-[11px] text-ink-500 font-sans mt-0.5">{n.date} · [{n.category}]</p>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => alert('공지 수정')} className="px-2.5 py-1 border border-paper-300 hover:border-ink-900">
                    수정
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
