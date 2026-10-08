import React, { useState } from 'react';
import { PRODUCTS } from '../data/products';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { INITIAL_MATERIALS, INITIAL_PURCHASE_ORDERS, INITIAL_TAX_INVOICES } from '../data/communityData';
import { Product, Order, MaterialItem, PurchaseOrder, TaxInvoice, User, OrderStatus } from '../types';
import { isSupabaseConfigured, getSupabaseAnonKey, resetSupabaseClient, testSupabaseConnection, getSupabaseUrl } from '../lib/supabaseClient';
import { dbService } from '../services/dbService';
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  Users,
  Coins,
  Truck,
  Plus,
  Trash2,
  Edit,
  CheckCircle2,
  FileText,
  Boxes,
  ClipboardList,
  Printer,
  Sparkles,
  ArrowLeft,
  Search,
  Database,
  RefreshCw,
  RotateCcw,
  X,
} from 'lucide-react';

interface AdminPageProps {
  navigate: (path: string) => void;
}

export const AdminPage: React.FC<AdminPageProps> = ({ navigate }) => {
  const { orders, updateOrderStatus, allUsers, adminUpdateUserPoints, adminUpdateUserRole } = useAuth();
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState<
    'DASHBOARD' | 'ORDERS' | 'INVENTORY' | 'MATERIALS' | 'PURCHASE' | 'TAX' | 'MEMBERS' | 'DB_SETTINGS'
  >('DASHBOARD');

  // 상품/재고 관리 상태
  const [productsList, setProductsList] = useState<Product[]>(PRODUCTS);
  const [stockAdjustment, setStockAdjustment] = useState<{ [id: string]: number }>({});

  // 배송 관리 입력 상태
  const [carrierInput, setCarrierInput] = useState<{ [orderId: string]: string }>({});
  const [trackingInput, setTrackingInput] = useState<{ [orderId: string]: string }>({});

  // ERP 원자재 & 발주 상태
  const [materials, setMaterials] = useState<MaterialItem[]>(INITIAL_MATERIALS);
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>(INITIAL_PURCHASE_ORDERS);
  const [taxes, setTaxes] = useState<TaxInvoice[]>(() => {
    try {
      const saved = localStorage.getItem('jeonjulee_taxes_v2');
      return saved ? JSON.parse(saved) : INITIAL_TAX_INVOICES;
    } catch {
      return INITIAL_TAX_INVOICES;
    }
  });

  // 신규 발주서 등록 모달
  const [showPOModal, setShowPOModal] = useState(false);
  const [newPoType, setNewPoType] = useState<'완제품의류' | '원부자재' | '라이프스타일소재'>('완제품의류');
  const [newPoItem, setNewPoItem] = useState('');
  const [newPoSupplier, setNewPoSupplier] = useState('');
  const [newPoQty, setNewPoQty] = useState(50);
  const [newPoUnitCost, setNewPoUnitCost] = useState(150000);
  const [newPoDate, setNewPoDate] = useState('2026-03-30');

  // 신규 자재 등록 모달
  const [showMatModal, setShowMatModal] = useState(false);
  const [newMatName, setNewMatName] = useState('');
  const [newMatCategory, setNewMatCategory] = useState<'원단' | '자수실' | '스트랩/버클' | '라벨/부자재' | '도자기소재'>('원단');
  const [newMatStock, setNewMatStock] = useState(100);
  const [newMatCost, setNewMatCost] = useState(35000);
  const [newMatSupplier, setNewMatSupplier] = useState('');

  // 세금명세서 인쇄 팝업
  const [printInvoice, setPrintInvoice] = useState<TaxInvoice | null>(null);

  // 회원 포인트 지급 모달
  const [pointModalUser, setPointModalUser] = useState<User | null>(null);
  const [pointDeltaInput, setPointDeltaInput] = useState(5000);
  const [pointReasonInput, setPointReasonInput] = useState('VIP 특별 마일리지 지급');

  // Supabase 설정 관리 상태
  const [anonKeyInput, setAnonKeyInput] = useState(getSupabaseAnonKey());
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [isTestingDb, setIsTestingDb] = useState(false);

  const totalRevenue = orders.reduce((sum, o) => sum + o.finalPrice, 0);

  // 송장번호 저장
  const handleSaveTracking = (orderId: string) => {
    const carrier = carrierInput[orderId] || 'CJ대한통운';
    const tracking = trackingInput[orderId];
    if (!tracking || !tracking.trim()) {
      showToast('송장번호를 입력해주세요.', 'error');
      return;
    }
    updateOrderStatus(orderId, '배송중', carrier, tracking.trim());
    showToast(`송장번호(${carrier} ${tracking})가 등록되었습니다.`);
  };

  // 환불 승인 처리
  const handleApproveRefund = (orderId: string) => {
    if (window.confirm('이 주문의 환불을 승인하고 환불완료 상태로 변경하시겠습니까?')) {
      updateOrderStatus(orderId, '환불완료');
      showToast('환불 승인 처리가 완료되었습니다.');
    }
  };

  // 세금계산서 즉시 발행
  const handleIssueTaxInvoice = (order: Order) => {
    const supplyAmount = Math.floor(order.finalPrice / 1.1);
    const taxAmount = order.finalPrice - supplyAmount;

    const newInvoice: TaxInvoice = {
      id: `tax-${Date.now()}`,
      invoiceNumber: `TAX-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.floor(1000 + Math.random() * 9000)}`,
      orderId: order.orderNumber,
      issueDate: new Date().toISOString().slice(0, 10),
      supplierInfo: {
        bizNumber: '214-88-99012',
        companyName: '(주)전주이씨 헤리티지',
        ceoName: '이도윤',
        address: '전북특별자치도 전주시 완산구 한지길 88',
        bizType: '제조 및 도소매업',
        bizItem: '한복, 프리미엄 의류, 전통 공예품',
      },
      recipientInfo: {
        bizNumber: '101-81-00000',
        companyName: order.recipientName,
        ceoName: order.recipientName,
        email: `${order.recipientPhone}@customer.kr`,
      },
      supplyAmount,
      taxAmount,
      totalAmount: order.finalPrice,
      status: '발행완료',
    };

    const updated = [newInvoice, ...taxes];
    setTaxes(updated);
    try {
      localStorage.setItem('jeonjulee_taxes_v2', JSON.stringify(updated));
    } catch (e) {
      console.error(e);
    }
    dbService.saveTaxInvoice(newInvoice);
    setPrintInvoice(newInvoice);
    showToast(`주문 ${order.orderNumber}에 대한 전자세금계산서가 발행되었습니다.`);
  };

  // 신규 발주서 등록
  const handleCreatePO = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPoItem.trim() || !newPoSupplier.trim()) return;

    const newPo: PurchaseOrder = {
      id: `po-${Date.now()}`,
      poNumber: `PO-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.floor(100 + Math.random() * 900)}`,
      itemType: newPoType,
      itemName: newPoItem.trim(),
      supplier: newPoSupplier.trim(),
      quantity: newPoQty,
      unitCost: newPoUnitCost,
      totalCost: newPoQty * newPoUnitCost,
      status: '발주승인',
      expectedDate: newPoDate,
      createdAt: new Date().toISOString().slice(0, 10),
    };

    setPurchaseOrders((prev) => [newPo, ...prev]);
    setShowPOModal(false);
    setNewPoItem('');
    setNewPoSupplier('');
    showToast(`신규 발주서(${newPo.poNumber})가 성공적으로 등록되었습니다.`);
  };

  // 신규 자재 등록
  const handleCreateMaterial = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMatName.trim()) return;

    const newMat: MaterialItem = {
      id: `mat-${Date.now()}`,
      code: `MAT-${Math.floor(1000 + Math.random() * 9000)}`,
      name: newMatName.trim(),
      category: newMatCategory,
      unit: newMatCategory === '원단' ? '야드(YD)' : newMatCategory === '도자기소재' ? '포(20KG)' : '개(EA)',
      currentStock: newMatStock,
      safeStock: 20,
      unitCost: newMatCost,
      supplier: newMatSupplier.trim() || '국내 공방',
      updatedAt: new Date().toISOString().slice(0, 10),
    };

    setMaterials((prev) => [newMat, ...prev]);
    setShowMatModal(false);
    setNewMatName('');
    showToast(`원부자재(${newMat.name})가 등록되었습니다.`);
  };

  // DB 연결 테스트
  const handleTestConnection = async () => {
    setIsTestingDb(true);
    setTestResult(null);
    const res = await testSupabaseConnection();
    setIsTestingDb(false);
    setTestResult(res);
    if (res.success) {
      showToast('Supabase DB 연결 확인 완료!');
    } else {
      showToast('Supabase DB 연결 실패', 'error');
    }
  };

  // DB 키 저장
  const handleSaveAnonKey = () => {
    resetSupabaseClient(anonKeyInput);
    showToast('Supabase 키 설정이 저장되었습니다.');
    handleTestConnection();
  };

  return (
    <div className="min-h-screen bg-paper-50 text-ink-900 pb-20">
      {/* 관리자 헤더 */}
      <div className="bg-paper-100 border-b border-paper-300 sticky top-0 z-30 shadow-subtle">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/')}
              className="p-1.5 border border-paper-300 hover:bg-paper-200 transition-colors text-ink-700"
              title="부티크 메인으로 돌아가기"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div>
              <h1 className="text-base sm:text-lg font-serif-kr font-semibold text-ink-900 flex items-center gap-2">
                <span>전주이씨 (JEONJU LEE) 통합 ERP 어드민</span>
                <span className="text-[10px] px-2 py-0.5 bg-paper-300 font-sans uppercase font-medium">
                  v2.6 Enterprise
                </span>
              </h1>
              <p className="text-[11px] text-ink-500 font-serif-kr">
                주문 배송, 원부자재 수급, 공방 발주, 세금명세서 및 Supabase 클라우드 실시간 제어
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* DB 연결 뱃지 */}
            <button
              onClick={() => setActiveTab('DB_SETTINGS')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-serif-kr border transition-all ${
                isSupabaseConfigured()
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                  : 'bg-amber-50 text-amber-800 border-amber-300'
              }`}
            >
              <Database className="w-3.5 h-3.5" />
              <span>{isSupabaseConfigured() ? 'Supabase 실시간 연동' : '로컬 세이프 모드'}</span>
            </button>

            <button
              onClick={() => navigate('/')}
              className="px-3 py-1.5 bg-ink-900 text-paper-100 hover:bg-lacquer text-xs font-serif-kr transition-colors"
            >
              쇼핑몰 보기 &rarr;
            </button>
          </div>
        </div>

        {/* 탭 네비게이션 */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex overflow-x-auto gap-1 border-t border-paper-200 text-xs font-serif-kr">
          {[
            { id: 'DASHBOARD', label: '대시보드', icon: LayoutDashboard },
            { id: 'ORDERS', label: `주문/배송/환불 (${orders.length})`, icon: ShoppingBag },
            { id: 'INVENTORY', label: '완제품 재고', icon: Boxes },
            { id: 'MATERIALS', label: `원부자재 ERP (${materials.length})`, icon: Package },
            { id: 'PURCHASE', label: `공방 발주서 (${purchaseOrders.length})`, icon: ClipboardList },
            { id: 'TAX', label: `세금명세서 (${taxes.length})`, icon: FileText },
            { id: 'MEMBERS', label: `회원/포인트 (${allUsers.length})`, icon: Users },
            { id: 'DB_SETTINGS', label: 'Supabase DB 설정', icon: Database },
          ].map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-3 px-3.5 flex items-center gap-1.5 whitespace-nowrap border-b-2 transition-all ${
                  active
                    ? 'border-lacquer text-lacquer font-bold bg-lacquer/5'
                    : 'border-transparent text-ink-600 hover:text-ink-900'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 1. DASHBOARD TAB */}
        {activeTab === 'DASHBOARD' && (
          <div className="space-y-8 animate-fade-in">
            {/* 상단 통계 카드 */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-paper-100 border border-paper-300 p-5 shadow-subtle">
                <p className="text-xs text-ink-500 font-serif-kr">누적 결제 매출</p>
                <p className="text-2xl font-bold font-sans text-lacquer mt-1">
                  {totalRevenue.toLocaleString()}<span className="text-sm font-normal text-ink-700 ml-1">원</span>
                </p>
                <p className="text-[11px] text-ink-400 mt-2 font-serif-kr">전체 {orders.length}건 결제 합산</p>
              </div>

              <div className="bg-paper-100 border border-paper-300 p-5 shadow-subtle">
                <p className="text-xs text-ink-500 font-serif-kr">배송 및 환불 대기</p>
                <p className="text-2xl font-bold font-sans text-ink-900 mt-1">
                  {orders.filter((o) => o.status === '결제완료' || o.status === '반품신청').length}
                  <span className="text-sm font-normal text-ink-700 ml-1">건</span>
                </p>
                <p className="text-[11px] text-rose-600 mt-2 font-serif-kr">
                  반품/환불 신청 {orders.filter((o) => o.status === '반품신청').length}건
                </p>
              </div>

              <div className="bg-paper-100 border border-paper-300 p-5 shadow-subtle">
                <p className="text-xs text-ink-500 font-serif-kr">등록 회원 수</p>
                <p className="text-2xl font-bold font-sans text-ink-900 mt-1">
                  {allUsers.length}<span className="text-sm font-normal text-ink-700 ml-1">명</span>
                </p>
                <p className="text-[11px] text-ink-400 mt-2 font-serif-kr">웰컴 5,000P 지급 회원</p>
              </div>

              <div className="bg-paper-100 border border-paper-300 p-5 shadow-subtle">
                <p className="text-xs text-ink-500 font-serif-kr">안전재고 부족 자재</p>
                <p className="text-2xl font-bold font-sans text-amber-700 mt-1">
                  {materials.filter((m) => m.currentStock <= m.safeStock).length}
                  <span className="text-sm font-normal text-ink-700 ml-1">종</span>
                </p>
                <p className="text-[11px] text-amber-700 mt-2 font-serif-kr">공방 추가 발주 필요</p>
              </div>
            </div>

            {/* 최근 주문 현황 */}
            <div className="bg-paper-100 border border-paper-300 p-6 shadow-subtle space-y-4">
              <div className="flex justify-between items-center pb-3 border-b border-paper-300">
                <h2 className="text-sm font-serif-kr font-semibold text-ink-900">
                  실시간 주문 접수 내역
                </h2>
                <button
                  onClick={() => setActiveTab('ORDERS')}
                  className="text-xs text-lacquer hover:underline font-serif-kr"
                >
                  주문 관리 전체보기 &rarr;
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-paper-200 text-ink-700 font-serif-kr">
                    <tr>
                      <th className="py-2.5 px-3">주문번호</th>
                      <th className="py-2.5 px-3">주문일시</th>
                      <th className="py-2.5 px-3">주문자</th>
                      <th className="py-2.5 px-3">품목명</th>
                      <th className="py-2.5 px-3">실결제액</th>
                      <th className="py-2.5 px-3">상태</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-paper-200 font-sans">
                    {orders.slice(0, 5).map((o) => (
                      <tr key={o.id} className="hover:bg-paper-50 transition-colors">
                        <td className="py-3 px-3 font-semibold">{o.orderNumber}</td>
                        <td className="py-3 px-3 text-ink-500">{o.orderDate}</td>
                        <td className="py-3 px-3 font-serif-kr">{o.recipientName}</td>
                        <td className="py-3 px-3 font-serif-kr">
                          {o.items[0]?.name} {o.items.length > 1 ? `외 ${o.items.length - 1}건` : ''}
                        </td>
                        <td className="py-3 px-3 font-bold text-lacquer">
                          {o.finalPrice.toLocaleString()}원
                        </td>
                        <td className="py-3 px-3 font-serif-kr">
                          <span className={`px-2 py-0.5 text-[11px] border ${
                            o.status === '결제완료'
                              ? 'bg-amber-50 text-amber-800 border-amber-300'
                              : o.status === '배송중'
                              ? 'bg-blue-50 text-blue-800 border-blue-300'
                              : o.status === '반품신청'
                              ? 'bg-rose-50 text-rose-800 border-rose-300 font-bold'
                              : 'bg-paper-200 text-ink-800 border-paper-300'
                          }`}>
                            {o.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* 2. ORDERS TAB (주문/배송/환불 관리) */}
        {activeTab === 'ORDERS' && (
          <div className="bg-paper-100 border border-paper-300 p-6 shadow-subtle space-y-6 animate-fade-in">
            <div className="flex justify-between items-center pb-3 border-b border-paper-300">
              <div>
                <h2 className="text-base font-serif-kr font-semibold text-ink-900">
                  주문 / 배송 / 환불 통합 처리
                </h2>
                <p className="text-xs text-ink-500 font-serif-kr mt-0.5">
                  상태 변경, 송장 번호 발급, 반품 승인 및 세금계산서 원클릭 발행
                </p>
              </div>
              <span className="text-xs text-ink-500 font-serif-kr">총 {orders.length}건</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-paper-200 text-ink-700 font-serif-kr">
                  <tr>
                    <th className="py-3 px-3">주문번호 / 일시</th>
                    <th className="py-3 px-3">수령인 / 연락처</th>
                    <th className="py-3 px-3">주문 상품</th>
                    <th className="py-3 px-3">결제 정보</th>
                    <th className="py-3 px-3">배송 처리 / 송장등록</th>
                    <th className="py-3 px-3">상태 변경 & 액션</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-paper-200 font-sans">
                  {orders.map((order) => (
                    <tr key={order.id} className="hover:bg-paper-50 transition-colors">
                      <td className="py-3.5 px-3">
                        <span className="font-semibold text-ink-900 block">{order.orderNumber}</span>
                        <span className="text-[11px] text-ink-500">{order.orderDate}</span>
                      </td>

                      <td className="py-3.5 px-3 font-serif-kr">
                        <span className="font-medium text-ink-900 block">{order.recipientName}</span>
                        <span className="text-[11px] text-ink-500 font-sans">{order.recipientPhone}</span>
                        <span className="text-[10px] text-ink-400 block truncate max-w-[150px]">{order.address}</span>
                      </td>

                      <td className="py-3.5 px-3 font-serif-kr">
                        {order.items.map((i, idx) => (
                          <div key={idx} className="text-[11px]">
                            {i.name} ({i.color}/{i.size}) × {i.quantity}
                          </div>
                        ))}
                      </td>

                      <td className="py-3.5 px-3">
                        <span className="font-bold text-lacquer block">{order.finalPrice.toLocaleString()}원</span>
                        <span className="text-[10px] text-ink-500 font-serif-kr">
                          {order.paymentMethod}
                          {order.usedPoints ? ` (P:${order.usedPoints.toLocaleString()})` : ''}
                        </span>
                      </td>

                      <td className="py-3.5 px-3">
                        {order.trackingNumber ? (
                          <div className="text-[11px] text-blue-700 font-medium">
                            {order.trackingCarrier} <br />
                            {order.trackingNumber}
                          </div>
                        ) : (
                          <div className="flex items-center gap-1.5">
                            <input
                              type="text"
                              placeholder="송장번호 입력"
                              value={trackingInput[order.id] || ''}
                              onChange={(e) => setTrackingInput({ ...trackingInput, [order.id]: e.target.value })}
                              className="w-28 bg-paper-50 border border-paper-300 px-2 py-1 text-xs"
                            />
                            <button
                              onClick={() => handleSaveTracking(order.id)}
                              className="px-2 py-1 bg-ink-900 text-paper-100 hover:bg-lacquer text-[11px] font-serif-kr whitespace-nowrap"
                            >
                              등록
                            </button>
                          </div>
                        )}
                      </td>

                      <td className="py-3.5 px-3">
                        <div className="flex flex-col gap-1.5">
                          <select
                            value={order.status}
                            onChange={(e) => updateOrderStatus(order.id, e.target.value as OrderStatus)}
                            className="bg-paper-50 border border-paper-300 px-2 py-1 text-[11px] font-serif-kr"
                          >
                            <option value="결제완료">결제완료</option>
                            <option value="상품준비중">상품준비중</option>
                            <option value="배송중">배송중</option>
                            <option value="배송완료">배송완료</option>
                            <option value="반품신청">반품신청</option>
                            <option value="환불완료">환불완료</option>
                            <option value="주문취소">주문취소</option>
                          </select>

                          {order.status === '반품신청' && (
                            <button
                              onClick={() => handleApproveRefund(order.id)}
                              className="px-2 py-1 bg-rose-700 hover:bg-rose-800 text-white text-[11px] font-serif-kr"
                            >
                              환불 승인하기
                            </button>
                          )}

                          <button
                            onClick={() => handleIssueTaxInvoice(order)}
                            className="px-2 py-0.5 border border-paper-400 hover:bg-paper-200 text-ink-700 text-[10px] font-serif-kr"
                          >
                            세금명세서 발행
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 3. INVENTORY TAB (완제품 재고 관리) */}
        {activeTab === 'INVENTORY' && (
          <div className="bg-paper-100 border border-paper-300 p-6 shadow-subtle space-y-6 animate-fade-in">
            <div className="flex justify-between items-center pb-3 border-b border-paper-300">
              <div>
                <h2 className="text-base font-serif-kr font-semibold text-ink-900">
                  완제품 실시간 재고 관리
                </h2>
                <p className="text-xs text-ink-500 font-serif-kr mt-0.5">
                  전주이씨 컬렉션 품목별 판매 수량 및 아틀리에 입고 수량 조정
                </p>
              </div>
              <span className="text-xs text-ink-500 font-serif-kr">총 {productsList.length}품목</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {productsList.map((prod) => (
                <div key={prod.id} className="p-4 border border-paper-300 bg-paper-50 space-y-3">
                  <div className="flex gap-3">
                    <img
                      src={prod.images[0]}
                      alt={prod.name}
                      className="w-16 h-20 object-cover border border-paper-300 flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <span className="text-[10px] px-1.5 py-0.5 bg-paper-300 text-ink-700 font-sans uppercase">
                        {prod.category}
                      </span>
                      <h3 className="text-xs font-serif-kr font-semibold text-ink-900 truncate mt-1">
                        {prod.name}
                      </h3>
                      <p className="text-xs font-bold text-lacquer font-sans mt-0.5">
                        {prod.price.toLocaleString()}원
                      </p>
                      <p className="text-[11px] text-ink-500 mt-1">
                        누적 판매: {prod.salesCount}건 · 평점: {prod.rating}★
                      </p>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-paper-200 flex items-center justify-between text-xs font-serif-kr">
                    <span className="text-ink-600">현재 보유 재고:</span>
                    <span className="font-bold text-ink-900 font-sans text-sm">
                      {30 + (stockAdjustment[prod.id] || 0)} EA
                    </span>
                    <div className="flex gap-1">
                      <button
                        onClick={() => {
                          setStockAdjustment({
                            ...stockAdjustment,
                            [prod.id]: (stockAdjustment[prod.id] || 0) + 10,
                          });
                          showToast(`${prod.name} +10개 입고 완료`);
                        }}
                        className="px-2 py-1 bg-paper-200 border border-paper-300 hover:bg-paper-300 text-[11px]"
                      >
                        +10 입고
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 4. MATERIALS TAB (원부자재 ERP) */}
        {activeTab === 'MATERIALS' && (
          <div className="bg-paper-100 border border-paper-300 p-6 shadow-subtle space-y-6 animate-fade-in">
            <div className="flex justify-between items-center pb-3 border-b border-paper-300">
              <div>
                <h2 className="text-base font-serif-kr font-semibold text-ink-900">
                  원부자재 수급 및 재고 관리 (ERP)
                </h2>
                <p className="text-xs text-ink-500 font-serif-kr mt-0.5">
                  진주 생사 명주실, 몽골 캐시미어, 솔리드 브라스 버클 등 원자재 안전재고 모니터링
                </p>
              </div>
              <button
                onClick={() => setShowMatModal(true)}
                className="px-3 py-1.5 bg-ink-900 hover:bg-lacquer text-paper-100 text-xs font-serif-kr flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" /> 원부자재 신규등록
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-paper-200 text-ink-700 font-serif-kr">
                  <tr>
                    <th className="py-2.5 px-3">자재코드</th>
                    <th className="py-2.5 px-3">자재 품목명</th>
                    <th className="py-2.5 px-3">분류</th>
                    <th className="py-2.5 px-3">단위</th>
                    <th className="py-2.5 px-3">현재고 / 안전재고</th>
                    <th className="py-2.5 px-3">단가</th>
                    <th className="py-2.5 px-3">사입/공급처</th>
                    <th className="py-2.5 px-3">상태</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-paper-200 font-sans">
                  {materials.map((m) => {
                    const isLow = m.currentStock <= m.safeStock;
                    return (
                      <tr key={m.id} className="hover:bg-paper-50">
                        <td className="py-3 px-3 font-semibold text-ink-600">{m.code}</td>
                        <td className="py-3 px-3 font-serif-kr font-medium text-ink-900">{m.name}</td>
                        <td className="py-3 px-3 font-serif-kr">{m.category}</td>
                        <td className="py-3 px-3">{m.unit}</td>
                        <td className="py-3 px-3">
                          <span className={`font-bold ${isLow ? 'text-rose-600' : 'text-ink-900'}`}>
                            {m.currentStock}
                          </span>
                          <span className="text-ink-400"> / {m.safeStock}</span>
                        </td>
                        <td className="py-3 px-3">{m.unitCost.toLocaleString()}원</td>
                        <td className="py-3 px-3 font-serif-kr">{m.supplier}</td>
                        <td className="py-3 px-3 font-serif-kr">
                          {isLow ? (
                            <span className="px-2 py-0.5 bg-rose-50 text-rose-700 border border-rose-200 text-[10px] font-bold">
                              재고부족 (발주요망)
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px]">
                              정상
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 5. PURCHASE TAB (공방 발주 관리) */}
        {activeTab === 'PURCHASE' && (
          <div className="bg-paper-100 border border-paper-300 p-6 shadow-subtle space-y-6 animate-fade-in">
            <div className="flex justify-between items-center pb-3 border-b border-paper-300">
              <div>
                <h2 className="text-base font-serif-kr font-semibold text-ink-900">
                  전주이씨 아틀리에 & 공방 발주 관리
                </h2>
                <p className="text-xs text-ink-500 font-serif-kr mt-0.5">
                  완제품 생산 및 원부자재 발주서 발행, 납기 일정 추적
                </p>
              </div>
              <button
                onClick={() => setShowPOModal(true)}
                className="px-3 py-1.5 bg-ink-900 hover:bg-lacquer text-paper-100 text-xs font-serif-kr flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" /> 신규 발주서 등록
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-paper-200 text-ink-700 font-serif-kr">
                  <tr>
                    <th className="py-2.5 px-3">발주번호</th>
                    <th className="py-2.5 px-3">구분</th>
                    <th className="py-2.5 px-3">발주 품목</th>
                    <th className="py-2.5 px-3">제작/공급처</th>
                    <th className="py-2.5 px-3">수량</th>
                    <th className="py-2.5 px-3">총 발주금액</th>
                    <th className="py-2.5 px-3">입고예정일</th>
                    <th className="py-2.5 px-3">진행 상태</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-paper-200 font-sans">
                  {purchaseOrders.map((po) => (
                    <tr key={po.id} className="hover:bg-paper-50">
                      <td className="py-3 px-3 font-semibold">{po.poNumber}</td>
                      <td className="py-3 px-3 font-serif-kr">{po.itemType}</td>
                      <td className="py-3 px-3 font-serif-kr font-medium text-ink-900">{po.itemName}</td>
                      <td className="py-3 px-3 font-serif-kr">{po.supplier}</td>
                      <td className="py-3 px-3 font-bold">{po.quantity}</td>
                      <td className="py-3 px-3 text-lacquer font-bold">{po.totalCost.toLocaleString()}원</td>
                      <td className="py-3 px-3 text-ink-500">{po.expectedDate}</td>
                      <td className="py-3 px-3 font-serif-kr">
                        <select
                          value={po.status}
                          onChange={(e) => {
                            setPurchaseOrders((prev) =>
                              prev.map((item) =>
                                item.id === po.id ? { ...item, status: e.target.value as any } : item
                              )
                            );
                            showToast(`발주 상태가 '${e.target.value}'(으)로 변경되었습니다.`);
                          }}
                          className="bg-paper-50 border border-paper-300 px-2 py-0.5 text-[11px]"
                        >
                          <option value="발주대기">발주대기</option>
                          <option value="발주승인">발주승인</option>
                          <option value="생산중">생산중</option>
                          <option value="입고완료">입고완료</option>
                          <option value="발주취소">발주취소</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 6. TAX TAB (세금명세서 관리) */}
        {activeTab === 'TAX' && (
          <div className="bg-paper-100 border border-paper-300 p-6 shadow-subtle space-y-6 animate-fade-in">
            <div className="flex justify-between items-center pb-3 border-b border-paper-300">
              <div>
                <h2 className="text-base font-serif-kr font-semibold text-ink-900">
                  전자세금계산서 / 세금명세서 관리
                </h2>
                <p className="text-xs text-ink-500 font-serif-kr mt-0.5">
                  법인 및 개인 고객 전자세금계산서 발행 내역 및 원클릭 인쇄/출력
                </p>
              </div>
              <span className="text-xs text-ink-500 font-serif-kr">총 {taxes.length}건 발행</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-paper-200 text-ink-700 font-serif-kr">
                  <tr>
                    <th className="py-2.5 px-3">승인번호</th>
                    <th className="py-2.5 px-3">발행일자</th>
                    <th className="py-2.5 px-3">공급받는 자</th>
                    <th className="py-2.5 px-3">공급가액</th>
                    <th className="py-2.5 px-3">세액 (10%)</th>
                    <th className="py-2.5 px-3">합계금액</th>
                    <th className="py-2.5 px-3">출력 및 상태</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-paper-200 font-sans">
                  {taxes.map((t) => (
                    <tr key={t.id} className="hover:bg-paper-50">
                      <td className="py-3 px-3 font-semibold text-ink-900">{t.invoiceNumber}</td>
                      <td className="py-3 px-3 text-ink-500">{t.issueDate}</td>
                      <td className="py-3 px-3 font-serif-kr">
                        <span className="font-medium text-ink-900 block">{t.recipientInfo.companyName}</span>
                        <span className="text-[10px] text-ink-400 font-sans">{t.recipientInfo.bizNumber}</span>
                      </td>
                      <td className="py-3 px-3">{t.supplyAmount.toLocaleString()}원</td>
                      <td className="py-3 px-3 text-ink-500">{t.taxAmount.toLocaleString()}원</td>
                      <td className="py-3 px-3 font-bold text-lacquer">{t.totalAmount.toLocaleString()}원</td>
                      <td className="py-3 px-3">
                        <button
                          onClick={() => setPrintInvoice(t)}
                          className="px-2.5 py-1 bg-paper-200 border border-paper-300 hover:bg-paper-300 text-ink-800 text-[11px] font-serif-kr flex items-center gap-1"
                        >
                          <Printer className="w-3.5 h-3.5" /> 명세서 인쇄
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 7. MEMBERS TAB (회원 & 포인트 관리) */}
        {activeTab === 'MEMBERS' && (
          <div className="bg-paper-100 border border-paper-300 p-6 shadow-subtle space-y-6 animate-fade-in">
            <div className="flex justify-between items-center pb-3 border-b border-paper-300">
              <div>
                <h2 className="text-base font-serif-kr font-semibold text-ink-900">
                  회원 등급 및 포인트 관리
                </h2>
                <p className="text-xs text-ink-500 font-serif-kr mt-0.5">
                  회원별 보유 포인트 직접 증감 및 관리자 권한 부여
                </p>
              </div>
              <span className="text-xs text-ink-500 font-serif-kr">총 {allUsers.length}명</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-paper-200 text-ink-700 font-serif-kr">
                  <tr>
                    <th className="py-2.5 px-3">성명</th>
                    <th className="py-2.5 px-3">이메일 계정</th>
                    <th className="py-2.5 px-3">연락처</th>
                    <th className="py-2.5 px-3">등급</th>
                    <th className="py-2.5 px-3">보유 포인트</th>
                    <th className="py-2.5 px-3">권한</th>
                    <th className="py-2.5 px-3">포인트 조정</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-paper-200 font-sans">
                  {allUsers.map((u) => (
                    <tr key={u.id} className="hover:bg-paper-50">
                      <td className="py-3 px-3 font-serif-kr font-medium text-ink-900">{u.name}</td>
                      <td className="py-3 px-3">{u.email}</td>
                      <td className="py-3 px-3 text-ink-500">{u.phone}</td>
                      <td className="py-3 px-3 font-serif-kr text-bronze">{u.membershipGrade || '전주이씨 가문회원'}</td>
                      <td className="py-3 px-3 font-bold text-lacquer">{u.points.toLocaleString()}P</td>
                      <td className="py-3 px-3 font-serif-kr">
                        <select
                          value={u.role}
                          onChange={(e) => adminUpdateUserRole(u.id, e.target.value as any)}
                          className="bg-paper-50 border border-paper-300 px-1.5 py-0.5 text-[11px]"
                        >
                          <option value="customer">일반고객</option>
                          <option value="admin">관리자(Admin)</option>
                        </select>
                      </td>
                      <td className="py-3 px-3">
                        <button
                          onClick={() => setPointModalUser(u)}
                          className="px-2 py-1 bg-paper-200 border border-paper-300 hover:bg-paper-300 text-ink-800 text-[11px] font-serif-kr"
                        >
                          포인트 지급/차감
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 8. DB SETTINGS TAB (Supabase 실시간 클라우드 DB 연결) */}
        {activeTab === 'DB_SETTINGS' && (
          <div className="bg-paper-100 border border-paper-300 p-6 sm:p-8 shadow-subtle space-y-6 animate-fade-in max-w-3xl">
            <div>
              <h2 className="text-base font-serif-kr font-semibold text-ink-900 flex items-center gap-2">
                <Database className="w-5 h-5 text-emerald-700" />
                <span>Supabase 실시간 클라우드 데이터베이스 연동 관리</span>
              </h2>
              <p className="text-xs text-ink-500 font-serif-kr mt-1">
                사용자 지정 DB 엔드포인트와 Anon Public Key를 연결하여 실시간 클라우드 저장을 활성화합니다.
              </p>
            </div>

            <div className="p-4 bg-paper-200 border border-paper-300 space-y-2 text-xs font-serif-kr">
              <div className="flex justify-between items-center">
                <span className="text-ink-600">설정된 Supabase URL:</span>
                <span className="font-mono text-ink-900 font-bold">{getSupabaseUrl()}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-ink-600">현재 연결 모드:</span>
                <span className={`px-2 py-0.5 font-bold ${isSupabaseConfigured() ? 'text-emerald-700 bg-emerald-100' : 'text-amber-800 bg-amber-100'}`}>
                  {isSupabaseConfigured() ? '🟢 Supabase 클라우드 실시간 모드' : '🟡 브라우저 로컬스토리지 모드'}
                </span>
              </div>
            </div>

            <div className="space-y-4 text-xs font-serif-kr">
              <div>
                <label className="block text-ink-800 font-medium mb-1.5">
                  Supabase Anon Public API Key (anon-key)
                </label>
                <input
                  type="password"
                  value={anonKeyInput}
                  onChange={(e) => setAnonKeyInput(e.target.value)}
                  placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                  className="w-full bg-paper-50 border border-paper-300 px-3.5 py-2.5 font-mono text-xs text-ink-900 focus:outline-none focus:border-ink-900"
                />
                <p className="text-[11px] text-ink-500 mt-1">
                  * Supabase 프로젝트 대시보드 $\rightarrow$ Project Settings $\rightarrow$ API $\rightarrow$ Project API keys (anon public)에서 복사하여 입력하세요.
                </p>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={handleSaveAnonKey}
                  className="px-4 py-2.5 bg-ink-900 hover:bg-lacquer text-paper-100 text-xs font-medium transition-colors"
                >
                  키 저장 및 클라이언트 재연결
                </button>
                <button
                  type="button"
                  disabled={isTestingDb}
                  onClick={handleTestConnection}
                  className="px-4 py-2.5 border border-paper-400 hover:bg-paper-200 text-ink-800 text-xs font-medium transition-colors flex items-center gap-1.5"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isTestingDb ? 'animate-spin' : ''}`} />
                  실시간 연결 상태 테스트
                </button>
              </div>

              {testResult && (
                <div className={`p-4 border text-xs mt-3 ${
                  testResult.success
                    ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                    : 'bg-rose-50 border-rose-300 text-rose-800'
                }`}>
                  <p className="font-semibold">{testResult.success ? '✓ 연결 성공' : '✕ 연결 실패'}</p>
                  <p className="mt-1">{testResult.message}</p>
                </div>
              )}
            </div>

            <div className="pt-4 border-t border-paper-300 text-xs text-ink-500 space-y-1 font-serif-kr">
              <p className="font-medium text-ink-900">💡 DB 스키마 생성 안내</p>
              <p>프로젝트 내 <code>supabase/schema.sql</code> 파일을 Supabase 웹 대시보드의 SQL Editor에 붙여넣고 Run을 실행하시면 전체 11개 테이블 및 RLS 보안 정책이 자동 생성됩니다.</p>
            </div>
          </div>
        )}
      </div>

      {/* 세금명세서 인쇄 모달 */}
      {printInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white text-slate-900 w-full max-w-2xl p-8 border border-slate-300 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center pb-4 border-b-2 border-slate-900">
              <div>
                <h3 className="text-xl font-bold font-serif-kr">전 자 세 금 계 산 서 (공급받는자 보관용)</h3>
                <p className="text-xs text-slate-500 font-mono mt-0.5">승인번호: {printInvoice.invoiceNumber}</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="px-3 py-1.5 bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 flex items-center gap-1"
                >
                  <Printer className="w-3.5 h-3.5" /> 인쇄하기
                </button>
                <button onClick={() => setPrintInvoice(null)} className="p-1.5 text-slate-500 hover:text-slate-900">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs border border-slate-300 p-4">
              <div className="space-y-1">
                <p className="font-bold text-slate-800 mb-1.5">[ 공급자 ]</p>
                <p>등록번호: {printInvoice.supplierInfo.bizNumber}</p>
                <p>상호: {printInvoice.supplierInfo.companyName}</p>
                <p>대표자: {printInvoice.supplierInfo.ceoName}</p>
                <p>사업장: {printInvoice.supplierInfo.address}</p>
                <p>업태/종목: {printInvoice.supplierInfo.bizType} / {printInvoice.supplierInfo.bizItem}</p>
              </div>

              <div className="space-y-1 border-l border-slate-300 pl-4">
                <p className="font-bold text-slate-800 mb-1.5">[ 공급받는 자 ]</p>
                <p>등록번호: {printInvoice.recipientInfo.bizNumber}</p>
                <p>상호: {printInvoice.recipientInfo.companyName}</p>
                <p>성명: {printInvoice.recipientInfo.ceoName}</p>
                <p>이메일: {printInvoice.recipientInfo.email}</p>
              </div>
            </div>

            <table className="w-full text-xs border-collapse border border-slate-300 text-center">
              <thead className="bg-slate-100 font-bold">
                <tr>
                  <th className="border border-slate-300 py-2">작성일자</th>
                  <th className="border border-slate-300 py-2">공급가액</th>
                  <th className="border border-slate-300 py-2">세액 (VAT 10%)</th>
                  <th className="border border-slate-300 py-2">합계금액</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border border-slate-300 py-3">{printInvoice.issueDate}</td>
                  <td className="border border-slate-300 py-3 font-semibold">{printInvoice.supplyAmount.toLocaleString()}원</td>
                  <td className="border border-slate-300 py-3 text-slate-600">{printInvoice.taxAmount.toLocaleString()}원</td>
                  <td className="border border-slate-300 py-3 font-bold text-rose-600">{printInvoice.totalAmount.toLocaleString()}원</td>
                </tr>
              </tbody>
            </table>

            <div className="text-[11px] text-slate-500 text-right">
              위 금액을 영수(청구)함 · 주식회사 전주이씨 대표이사 이도윤 (직인생략)
            </div>
          </div>
        </div>
      )}

      {/* 포인트 지급 모달 */}
      {pointModalUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink-900/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-paper-100 border border-paper-300 w-full max-w-sm p-6 shadow-2xl space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-paper-300">
              <h3 className="text-sm font-serif-kr font-bold text-ink-900">
                회원 포인트 관리 ({pointModalUser.name})
              </h3>
              <button onClick={() => setPointModalUser(null)}>
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="text-xs space-y-3 font-serif-kr">
              <p>현재 보유 포인트: <strong>{pointModalUser.points.toLocaleString()}P</strong></p>
              <div>
                <label className="block text-ink-700 mb-1">지급/차감할 포인트 (음수는 차감)</label>
                <input
                  type="number"
                  value={pointDeltaInput}
                  onChange={(e) => setPointDeltaInput(parseInt(e.target.value, 10) || 0)}
                  className="w-full bg-paper-50 border border-paper-300 px-3 py-2 text-ink-900 font-sans"
                />
              </div>
              <div>
                <label className="block text-ink-700 mb-1">변동 사유</label>
                <input
                  type="text"
                  value={pointReasonInput}
                  onChange={(e) => setPointReasonInput(e.target.value)}
                  className="w-full bg-paper-50 border border-paper-300 px-3 py-2 text-ink-900"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setPointModalUser(null)}
                  className="flex-1 py-2 border border-paper-300 text-ink-700"
                >
                  취소
                </button>
                <button
                  type="button"
                  onClick={() => {
                    adminUpdateUserPoints(pointModalUser.id, pointDeltaInput, pointReasonInput);
                    setPointModalUser(null);
                  }}
                  className="flex-1 py-2 bg-ink-900 hover:bg-lacquer text-paper-100 font-medium"
                >
                  적용하기
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 신규 발주서 모달 */}
      {showPOModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink-900/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-paper-100 border border-paper-300 w-full max-w-md p-6 shadow-2xl space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-paper-300">
              <h3 className="text-sm font-serif-kr font-bold text-ink-900">
                신규 아틀리에/공방 발주서 등록
              </h3>
              <button onClick={() => setShowPOModal(false)}>
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreatePO} className="text-xs space-y-3 font-serif-kr">
              <div>
                <label className="block text-ink-700 mb-1">구분</label>
                <select
                  value={newPoType}
                  onChange={(e) => setNewPoType(e.target.value as any)}
                  className="w-full bg-paper-50 border border-paper-300 px-3 py-2 text-ink-900"
                >
                  <option value="완제품의류">완제품 의류</option>
                  <option value="원부자재">원부자재</option>
                  <option value="라이프스타일소재">라이프스타일 소재</option>
                </select>
              </div>
              <div>
                <label className="block text-ink-700 mb-1">품목명</label>
                <input
                  type="text"
                  required
                  placeholder="예: 울 캐시미어 도포 코트 먹색 (50벌)"
                  value={newPoItem}
                  onChange={(e) => setNewPoItem(e.target.value)}
                  className="w-full bg-paper-50 border border-paper-300 px-3 py-2 text-ink-900"
                />
              </div>
              <div>
                <label className="block text-ink-700 mb-1">제작/공급처</label>
                <input
                  type="text"
                  required
                  placeholder="예: 전주이씨 제1 아틀리에"
                  value={newPoSupplier}
                  onChange={(e) => setNewPoSupplier(e.target.value)}
                  className="w-full bg-paper-50 border border-paper-300 px-3 py-2 text-ink-900"
                />
              </div>
              <div className="grid grid-cols-2 gap-2 font-sans">
                <div>
                  <label className="block text-ink-700 mb-1 font-serif-kr">수량</label>
                  <input
                    type="number"
                    min={1}
                    value={newPoQty}
                    onChange={(e) => setNewPoQty(parseInt(e.target.value, 10) || 1)}
                    className="w-full bg-paper-50 border border-paper-300 px-3 py-2 text-ink-900"
                  />
                </div>
                <div>
                  <label className="block text-ink-700 mb-1 font-serif-kr">단가 (원)</label>
                  <input
                    type="number"
                    min={0}
                    value={newPoUnitCost}
                    onChange={(e) => setNewPoUnitCost(parseInt(e.target.value, 10) || 0)}
                    className="w-full bg-paper-50 border border-paper-300 px-3 py-2 text-ink-900"
                  />
                </div>
              </div>
              <div>
                <label className="block text-ink-700 mb-1 font-serif-kr">납기 예정일</label>
                <input
                  type="date"
                  value={newPoDate}
                  onChange={(e) => setNewPoDate(e.target.value)}
                  className="w-full bg-paper-50 border border-paper-300 px-3 py-2 text-ink-900"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowPOModal(false)}
                  className="flex-1 py-2 border border-paper-300 text-ink-700"
                >
                  취소
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 bg-ink-900 hover:bg-lacquer text-paper-100 font-medium"
                >
                  발주서 발행
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 신규 자재 모달 */}
      {showMatModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink-900/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-paper-100 border border-paper-300 w-full max-w-md p-6 shadow-2xl space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-paper-300">
              <h3 className="text-sm font-serif-kr font-bold text-ink-900">
                원부자재 품목 신규 등록
              </h3>
              <button onClick={() => setShowMatModal(false)}>
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateMaterial} className="text-xs space-y-3 font-serif-kr">
              <div>
                <label className="block text-ink-700 mb-1">분류</label>
                <select
                  value={newMatCategory}
                  onChange={(e) => setNewMatCategory(e.target.value as any)}
                  className="w-full bg-paper-50 border border-paper-300 px-3 py-2 text-ink-900"
                >
                  <option value="원단">원단</option>
                  <option value="자수실">자수실</option>
                  <option value="스트랩/버클">스트랩/버클</option>
                  <option value="라벨/부자재">라벨/부자재</option>
                  <option value="도자기소재">도자기소재</option>
                </select>
              </div>
              <div>
                <label className="block text-ink-700 mb-1">자재명</label>
                <input
                  type="text"
                  required
                  placeholder="예: 진주산 생사 천연 비단 자수실"
                  value={newMatName}
                  onChange={(e) => setNewMatName(e.target.value)}
                  className="w-full bg-paper-50 border border-paper-300 px-3 py-2 text-ink-900"
                />
              </div>
              <div className="grid grid-cols-2 gap-2 font-sans">
                <div>
                  <label className="block text-ink-700 mb-1 font-serif-kr">초기 재고수량</label>
                  <input
                    type="number"
                    min={0}
                    value={newMatStock}
                    onChange={(e) => setNewMatStock(parseInt(e.target.value, 10) || 0)}
                    className="w-full bg-paper-50 border border-paper-300 px-3 py-2 text-ink-900"
                  />
                </div>
                <div>
                  <label className="block text-ink-700 mb-1 font-serif-kr">단가 (원)</label>
                  <input
                    type="number"
                    min={0}
                    value={newMatCost}
                    onChange={(e) => setNewMatCost(parseInt(e.target.value, 10) || 0)}
                    className="w-full bg-paper-50 border border-paper-300 px-3 py-2 text-ink-900"
                  />
                </div>
              </div>
              <div>
                <label className="block text-ink-700 mb-1">공급/사입처</label>
                <input
                  type="text"
                  placeholder="예: 경남 진주 실크 공방"
                  value={newMatSupplier}
                  onChange={(e) => setNewMatSupplier(e.target.value)}
                  className="w-full bg-paper-50 border border-paper-300 px-3 py-2 text-ink-900"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowMatModal(false)}
                  className="flex-1 py-2 border border-paper-300 text-ink-700"
                >
                  취소
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 bg-ink-900 hover:bg-lacquer text-paper-100 font-medium"
                >
                  자재 등록
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
