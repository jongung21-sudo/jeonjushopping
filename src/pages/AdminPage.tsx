import React, { useState } from 'react';
import { PRODUCTS } from '../data/products';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useProducts } from '../context/ProductContext';
import { INITIAL_MATERIALS, INITIAL_PURCHASE_ORDERS, INITIAL_TAX_INVOICES } from '../data/communityData';
import { Product, ProductCategory, Order, MaterialItem, PurchaseOrder, TaxInvoice, User, OrderStatus } from '../types';
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
  UploadCloud,
  Tag,
  Eye,
  Check,
} from 'lucide-react';

interface AdminPageProps {
  navigate: (path: string) => void;
}

export const AdminPage: React.FC<AdminPageProps> = ({ navigate }) => {
  const { orders, updateOrderStatus, allUsers, adminUpdateUserPoints, adminUpdateUserRole } = useAuth();
  const { showToast } = useToast();
  const {
    products: productsList,
    addProduct,
    updateProduct,
    deleteProduct,
    refreshProducts,
    syncAllToSupabase,
    isLoading: isProductLoading,
  } = useProducts();

  const [activeTab, setActiveTab] = useState<
    'DASHBOARD' | 'ORDERS' | 'INVENTORY' | 'MATERIALS' | 'PURCHASE' | 'TAX' | 'MEMBERS' | 'DB_SETTINGS'
  >('DASHBOARD');

  // 상품/재고 관리 상태
  const [stockAdjustment, setStockAdjustment] = useState<{ [id: string]: number }>({});
  const [productSearchTerm, setProductSearchTerm] = useState('');
  const [productCategoryFilter, setProductCategoryFilter] = useState<string>('ALL');
  const [productSoldOutFilter, setProductSoldOutFilter] = useState<'ALL' | 'ACTIVE' | 'SOLDOUT'>('ALL');
  const [isSyncingProducts, setIsSyncingProducts] = useState(false);

  // 상품 등록 / 수정 모달 상태
  const [showProductModal, setShowProductModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // 모달 폼 필드 상태
  const [prodFormName, setProdFormName] = useState('');
  const [prodFormEngName, setProdFormEngName] = useState('');
  const [prodFormCategory, setProdFormCategory] = useState<ProductCategory>('TOP');
  const [prodFormPrice, setProdFormPrice] = useState<number>(150000);
  const [prodFormOrigPrice, setProdFormOrigPrice] = useState<number | ''>('');
  const [prodFormStock, setProdFormStock] = useState<number>(30);
  const [prodFormIsNew, setProdFormIsNew] = useState(true);
  const [prodFormIsBest, setProdFormIsBest] = useState(false);
  const [prodFormIsSoldOut, setProdFormIsSoldOut] = useState(false);
  const [prodFormImage, setProdFormImage] = useState('');
  const [prodFormShortDesc, setProdFormShortDesc] = useState('');
  const [prodFormDetailDesc, setProdFormDetailDesc] = useState('');
  const [prodFormFabric, setProdFormFabric] = useState('');
  const [prodFormFit, setProdFormFit] = useState('');
  const [prodFormSizes, setProdFormSizes] = useState('M, L, XL');
  const [prodFormColors, setProdFormColors] = useState('먹색 (Ink Black), 한지 아이보리 (Hanji Ivory)');

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

  // 상품 목록 필터링
  const filteredProducts = productsList.filter((prod) => {
    const matchesSearch =
      productSearchTerm.trim() === '' ||
      prod.name.toLowerCase().includes(productSearchTerm.toLowerCase()) ||
      (prod.engName && prod.engName.toLowerCase().includes(productSearchTerm.toLowerCase())) ||
      prod.id.toLowerCase().includes(productSearchTerm.toLowerCase());

    const matchesCategory =
      productCategoryFilter === 'ALL' || prod.category === productCategoryFilter;

    const matchesStatus =
      productSoldOutFilter === 'ALL' ||
      (productSoldOutFilter === 'ACTIVE' && !prod.isSoldOut) ||
      (productSoldOutFilter === 'SOLDOUT' && prod.isSoldOut);

    return matchesSearch && matchesCategory && matchesStatus;
  });

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

  // 상품 등록 모달 열기
  const handleOpenCreateModal = () => {
    setEditingProduct(null);
    setProdFormName('');
    setProdFormEngName('');
    setProdFormCategory('TOP');
    setProdFormPrice(150000);
    setProdFormOrigPrice('');
    setProdFormStock(30);
    setProdFormIsNew(true);
    setProdFormIsBest(false);
    setProdFormIsSoldOut(false);
    setProdFormImage('https://images.unsplash.com/photo-1544441893-675973e31985?auto=format&fit=crop&w=1200&q=80');
    setProdFormShortDesc('');
    setProdFormDetailDesc('');
    setProdFormFabric('프리미엄 천연 소재');
    setProdFormFit('릴렉스드 컴포트 핏');
    setProdFormSizes('M, L, XL');
    setProdFormColors('먹색 (Ink Black), 한지 아이보리 (Hanji Ivory)');
    setShowProductModal(true);
  };

  // 상품 수정 모달 열기
  const handleOpenEditModal = (prod: Product) => {
    setEditingProduct(prod);
    setProdFormName(prod.name);
    setProdFormEngName(prod.engName || '');
    setProdFormCategory(prod.category);
    setProdFormPrice(prod.price);
    setProdFormOrigPrice(prod.originalPrice || '');
    setProdFormStock(30 + (stockAdjustment[prod.id] || 0));
    setProdFormIsNew(Boolean(prod.isNew));
    setProdFormIsBest(Boolean(prod.isBest));
    setProdFormIsSoldOut(Boolean(prod.isSoldOut));
    setProdFormImage(prod.images?.[0] || prod.thumbnail || '');
    setProdFormShortDesc(prod.shortDesc || '');
    setProdFormDetailDesc(prod.detailDesc || '');
    setProdFormFabric(prod.fabric || '');
    setProdFormFit(prod.fit || '');
    setProdFormSizes(prod.sizes?.join(', ') || 'FREE');
    setProdFormColors(prod.colors?.map((c) => c.name).join(', ') || '');
    setShowProductModal(true);
  };

  // 상품 등록 / 수정 완료 제출
  const handleSubmitProductForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prodFormName.trim()) {
      showToast('상품명을 입력해주세요.', 'error');
      return;
    }
    if (prodFormPrice <= 0) {
      showToast('올바른 판매 가격을 입력해주세요.', 'error');
      return;
    }

    const imageList = prodFormImage.trim()
      ? [prodFormImage.trim()]
      : ['https://images.unsplash.com/photo-1544441893-675973e31985?auto=format&fit=crop&w=1200&q=80'];

    const sizeList = prodFormSizes
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
    const colorList = prodFormColors
      .split(',')
      .map((c) => c.trim())
      .filter(Boolean)
      .map((c) => ({
        name: c,
        code: '#2B2B2B',
      }));

    if (editingProduct) {
      // 수정 모드
      const updates: Partial<Product> = {
        name: prodFormName.trim(),
        engName: prodFormEngName.trim(),
        category: prodFormCategory,
        price: Number(prodFormPrice),
        originalPrice: prodFormOrigPrice ? Number(prodFormOrigPrice) : undefined,
        isNew: prodFormIsNew,
        isBest: prodFormIsBest,
        isSoldOut: prodFormIsSoldOut,
        images: imageList,
        thumbnail: imageList[0],
        shortDesc: prodFormShortDesc.trim(),
        detailDesc: prodFormDetailDesc.trim(),
        fabric: prodFormFabric.trim(),
        fit: prodFormFit.trim(),
        sizes: sizeList.length > 0 ? sizeList : ['FREE'],
        colors: colorList.length > 0 ? colorList : [{ name: '기본 (Default)', code: '#121212' }],
      };

      const res = await updateProduct(editingProduct.id, updates);
      if (res.success) {
        showToast(`[${prodFormName}] 상품이 성공적으로 수정되었습니다.`, 'success');
      } else {
        showToast(res.message, 'error');
      }
    } else {
      // 신규 등록 모드
      const newProduct: Product = {
        id: `jl-${prodFormCategory.toLowerCase().slice(0, 3)}-${Date.now().toString(36)}`,
        name: prodFormName.trim(),
        engName: prodFormEngName.trim() || prodFormName.trim(),
        category: prodFormCategory,
        price: Number(prodFormPrice),
        originalPrice: prodFormOrigPrice ? Number(prodFormOrigPrice) : undefined,
        isNew: prodFormIsNew,
        isBest: prodFormIsBest,
        isSoldOut: prodFormIsSoldOut,
        images: imageList,
        thumbnail: imageList[0],
        shortDesc: prodFormShortDesc.trim() || '전주이씨 가문의 기품을 담은 컬렉션.',
        detailDesc: prodFormDetailDesc.trim() || '최고급 장인 기술로 완성된 전주이씨 명품 라인업입니다.',
        fabric: prodFormFabric.trim() || '프리미엄 천연 소재',
        fit: prodFormFit.trim() || '레귤러 핏',
        care: ['전문 세탁 권장'],
        sizes: sizeList.length > 0 ? sizeList : ['FREE'],
        colors: colorList.length > 0 ? colorList : [{ name: '기본 (Default)', code: '#121212' }],
        rating: 5.0,
        reviewCount: 0,
        salesCount: 0,
        createdAt: new Date().toISOString().slice(0, 10),
      };

      const res = await addProduct(newProduct);
      if (res.success) {
        showToast(`[${newProduct.name}] 신규 상품이 등록되었습니다!`, 'success');
      } else {
        showToast(res.message, 'error');
      }
    }

    setShowProductModal(false);
  };

  // 상품 삭제
  const handleDeleteProduct = async (prod: Product) => {
    if (
      window.confirm(
        `정말로 "[${prod.name}]" 상품을 삭제하시겠습니까?\n\n이 작업은 되돌릴 수 없으며, Supabase DB 및 쇼핑몰 목록에서 영구 삭제됩니다.`
      )
    ) {
      const res = await deleteProduct(prod.id);
      if (res.success) {
        showToast(`[${prod.name}] 상품이 성공적으로 삭제되었습니다.`, 'success');
      } else {
        showToast(res.message, 'error');
      }
    }
  };

  // 품절 토글
  const handleToggleSoldOut = async (prod: Product) => {
    const nextState = !prod.isSoldOut;
    const res = await updateProduct(prod.id, { isSoldOut: nextState });
    if (res.success) {
      showToast(`[${prod.name}] 상태가 "${nextState ? '품절' : '판매중'}"으로 변경되었습니다.`);
    }
  };

  // 기본 상품 10종 DB 일괄 업로드
  const handleSyncSeedToSupabase = async () => {
    if (
      !window.confirm(
        '전주이씨 기본 명품 컬렉션 10종 상품을 Supabase products 테이블에 일괄 업로드하시겠습니까?'
      )
    ) {
      return;
    }
    setIsSyncingProducts(true);
    try {
      const res = await syncAllToSupabase();
      if (res.success) {
        showToast(res.message, 'success');
      } else {
        showToast(res.message, 'error');
      }
    } finally {
      setIsSyncingProducts(false);
    }
  };

  // DB 실시간 동기화 새로고침
  const handleRefreshProducts = async () => {
    setIsSyncingProducts(true);
    try {
      await refreshProducts();
      showToast('Supabase products 테이블과 최신 동기화 완료!');
    } finally {
      setIsSyncingProducts(false);
    }
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
            { id: 'INVENTORY', label: `상품/재고 관리 (${productsList.length})`, icon: Boxes },
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

        {/* 3. INVENTORY TAB (상품 및 완제품 재고 관리 - Supabase 실시간 연동) */}
        {activeTab === 'INVENTORY' && (
          <div className="bg-paper-100 border border-paper-300 p-6 shadow-subtle space-y-6 animate-fade-in">
            {/* 상단 헤더 & 컨트롤 */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-paper-300">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-serif-kr font-bold text-ink-900">
                    전주이씨 명품 컬렉션 상품 &amp; 재고 관리
                  </h2>
                  <span className="text-xs px-2 py-0.5 bg-paper-300 text-ink-700 font-sans font-medium rounded">
                    총 {productsList.length}개 상품
                  </span>
                </div>
                <p className="text-xs text-ink-500 font-serif-kr mt-1">
                  Supabase <code className="text-lacquer font-mono font-bold">products</code> 테이블과 실시간 연동되어 신규 상품 등록, 정보 수정, 품절 처리 및 삭제가 즉각 반영됩니다.
                </p>
              </div>

              {/* 액션 버튼 그룹 */}
              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={handleRefreshProducts}
                  disabled={isSyncingProducts}
                  className="flex items-center gap-1.5 px-3 py-2 bg-paper-50 border border-paper-300 hover:bg-paper-200 text-xs font-serif-kr text-ink-700 transition-colors disabled:opacity-50"
                  title="Supabase DB의 최신 상품 데이터 가져오기"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isSyncingProducts ? 'animate-spin' : ''}`} />
                  <span>DB 동기화</span>
                </button>

                <button
                  onClick={handleSyncSeedToSupabase}
                  disabled={isSyncingProducts}
                  className="flex items-center gap-1.5 px-3 py-2 bg-paper-50 border border-paper-300 hover:border-ink-700 text-xs font-serif-kr text-ink-800 transition-colors disabled:opacity-50"
                  title="전주이씨 기본 10종 상품 데이터를 Supabase DB에 일괄 저장"
                >
                  <UploadCloud className="w-3.5 h-3.5 text-blue-600" />
                  <span>기본 10종 DB 일괄 업로드</span>
                </button>

                <button
                  onClick={handleOpenCreateModal}
                  className="flex items-center gap-1.5 px-4 py-2 bg-ink-900 hover:bg-lacquer text-paper-100 text-xs font-serif-kr font-medium shadow-sm transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  <span>신규 상품 등록</span>
                </button>
              </div>
            </div>

            {/* 필터 및 검색 바 */}
            <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between bg-paper-50 p-3.5 border border-paper-300">
              <div className="flex flex-1 flex-wrap items-center gap-2">
                {/* 검색 인풋 */}
                <div className="relative flex-1 min-w-[200px] max-w-md">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-ink-400" />
                  <input
                    type="text"
                    placeholder="상품명, 영문명, 코드 검색..."
                    value={productSearchTerm}
                    onChange={(e) => setProductSearchTerm(e.target.value)}
                    className="w-full pl-8 pr-3 py-1.5 bg-paper-100 border border-paper-300 text-xs font-serif-kr focus:outline-none focus:border-ink-900"
                  />
                  {productSearchTerm && (
                    <button
                      onClick={() => setProductSearchTerm('')}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-ink-400 hover:text-ink-700"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* 카테고리 필터 */}
                <select
                  value={productCategoryFilter}
                  onChange={(e) => setProductCategoryFilter(e.target.value)}
                  className="bg-paper-100 border border-paper-300 px-3 py-1.5 text-xs font-serif-kr text-ink-800"
                >
                  <option value="ALL">전체 카테고리</option>
                  <option value="TOP">상의 (TOP)</option>
                  <option value="OUTER">아우터 (OUTER)</option>
                  <option value="BOTTOM">하의 (BOTTOM)</option>
                  <option value="ACCESSORIES">액세서리 (ACCESSORIES)</option>
                  <option value="LIFESTYLE">라이프스타일 (LIFESTYLE)</option>
                </select>

                {/* 판매 상태 필터 */}
                <select
                  value={productSoldOutFilter}
                  onChange={(e) => setProductSoldOutFilter(e.target.value as any)}
                  className="bg-paper-100 border border-paper-300 px-3 py-1.5 text-xs font-serif-kr text-ink-800"
                >
                  <option value="ALL">판매 상태 전체</option>
                  <option value="ACTIVE">판매중</option>
                  <option value="SOLDOUT">품절 상품</option>
                </select>
              </div>

              <div className="text-xs text-ink-500 font-serif-kr flex items-center justify-between md:justify-end gap-3">
                <span>검색 결과: <strong className="text-ink-900">{filteredProducts.length}</strong>개</span>
                {(productSearchTerm || productCategoryFilter !== 'ALL' || productSoldOutFilter !== 'ALL') && (
                  <button
                    onClick={() => {
                      setProductSearchTerm('');
                      setProductCategoryFilter('ALL');
                      setProductSoldOutFilter('ALL');
                    }}
                    className="text-xs text-lacquer hover:underline"
                  >
                    필터 초기화
                  </button>
                )}
              </div>
            </div>

            {/* 상품 목록 그리드 */}
            {filteredProducts.length === 0 ? (
              <div className="text-center py-16 bg-paper-50 border border-dashed border-paper-300 p-8 space-y-3">
                <Boxes className="w-10 h-10 mx-auto text-ink-300" />
                <h3 className="text-sm font-serif-kr font-bold text-ink-700">해당하는 상품이 없습니다</h3>
                <p className="text-xs text-ink-500 font-serif-kr">
                  검색어나 필터를 변경하시거나, 새로운 전주이씨 명품 상품을 등록해보세요.
                </p>
                <button
                  onClick={handleOpenCreateModal}
                  className="mt-2 inline-flex items-center gap-1.5 px-3 py-1.5 bg-ink-900 text-paper-100 text-xs font-serif-kr"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>신규 상품 등록</span>
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {filteredProducts.map((prod) => {
                  const currentStock = 30 + (stockAdjustment[prod.id] || 0);
                  const isSold = Boolean(prod.isSoldOut);

                  return (
                    <div
                      key={prod.id}
                      className={`border bg-paper-50 p-4 transition-all duration-200 flex flex-col justify-between hover:shadow-md ${
                        isSold ? 'border-paper-300 opacity-80' : 'border-paper-300 hover:border-lacquer/40'
                      }`}
                    >
                      {/* 카드 상단: 이미지 & 기본정보 */}
                      <div>
                        <div className="flex gap-3.5">
                          {/* 썸네일 */}
                          <div className="relative w-20 h-24 bg-paper-200 border border-paper-300 overflow-hidden flex-shrink-0 group">
                            <img
                              src={prod.images?.[0] || prod.thumbnail || 'https://images.unsplash.com/photo-1544441893-675973e31985?auto=format&fit=crop&w=600&q=80'}
                              alt={prod.name}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1544441893-675973e31985?auto=format&fit=crop&w=600&q=80';
                              }}
                            />
                            {isSold && (
                              <div className="absolute inset-0 bg-ink-900/60 flex items-center justify-center">
                                <span className="text-[10px] font-bold text-white tracking-widest uppercase">SOLD OUT</span>
                              </div>
                            )}
                          </div>

                          {/* 메타 정보 */}
                          <div className="flex-1 min-w-0">
                            <div className="flex flex-wrap items-center gap-1 mb-1">
                              <span className="text-[9px] px-1.5 py-0.5 bg-paper-200 text-ink-700 font-sans uppercase font-medium">
                                {prod.category}
                              </span>
                              {prod.isNew && (
                                <span className="text-[9px] px-1.5 py-0.5 bg-amber-100 text-amber-900 font-serif-kr">
                                  NEW
                                </span>
                              )}
                              {prod.isBest && (
                                <span className="text-[9px] px-1.5 py-0.5 bg-lacquer/10 text-lacquer font-serif-kr font-bold">
                                  BEST
                                </span>
                              )}
                              {isSold ? (
                                <span className="text-[9px] px-1.5 py-0.5 bg-rose-100 text-rose-700 font-serif-kr font-bold">
                                  품절
                                </span>
                              ) : (
                                <span className="text-[9px] px-1.5 py-0.5 bg-emerald-100 text-emerald-800 font-serif-kr">
                                  판매중
                                </span>
                              )}
                            </div>

                            <h3 className="text-sm font-serif-kr font-bold text-ink-900 truncate" title={prod.name}>
                              {prod.name}
                            </h3>
                            <p className="text-[11px] text-ink-400 font-sans truncate mb-1">
                              {prod.engName || prod.id}
                            </p>

                            <div className="flex items-baseline gap-2 mt-1">
                              <span className="text-sm font-bold text-lacquer font-sans">
                                {prod.price.toLocaleString()}원
                              </span>
                              {prod.originalPrice && prod.originalPrice > prod.price && (
                                <span className="text-[11px] text-ink-400 line-through font-sans">
                                  {prod.originalPrice.toLocaleString()}원
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* 짧은 설명 / 스펙 요약 */}
                        <div className="mt-3 pt-2.5 border-t border-paper-200 text-[11px] text-ink-600 font-serif-kr space-y-1">
                          <p className="line-clamp-1 text-ink-500">
                            {prod.shortDesc || '전주이씨 가문의 기품을 담은 컬렉션'}
                          </p>
                          <div className="flex items-center justify-between text-[10px] text-ink-400 font-sans">
                            <span>코드: {prod.id}</span>
                            <span>누적 판매: {prod.salesCount || 0}건 · 평점: {prod.rating || 5.0}★</span>
                          </div>
                        </div>
                      </div>

                      {/* 카드 하단: 재고 조정 & 액션 버튼 */}
                      <div className="mt-3 pt-2.5 border-t border-paper-200 space-y-2.5">
                        {/* 재고 제어 */}
                        <div className="flex items-center justify-between text-xs font-serif-kr bg-paper-100 px-2.5 py-1.5">
                          <span className="text-ink-600">실시간 재고:</span>
                          <div className="flex items-center gap-2">
                            <span className={`font-bold font-sans ${currentStock <= 5 ? 'text-rose-600' : 'text-ink-900'}`}>
                              {currentStock} EA
                            </span>
                            <div className="flex gap-1">
                              <button
                                onClick={() => {
                                  const next = Math.max(0, currentStock - 1);
                                  setStockAdjustment({
                                    ...stockAdjustment,
                                    [prod.id]: next - 30,
                                  });
                                  if (next === 0) {
                                    updateProduct(prod.id, { isSoldOut: true });
                                  }
                                }}
                                className="w-5 h-5 flex items-center justify-center bg-paper-200 border border-paper-300 hover:bg-paper-300 text-[11px] font-sans"
                                title="1개 감소"
                              >
                                -
                              </button>
                              <button
                                onClick={() => {
                                  setStockAdjustment({
                                    ...stockAdjustment,
                                    [prod.id]: (stockAdjustment[prod.id] || 0) + 1,
                                  });
                                  if (isSold) {
                                    updateProduct(prod.id, { isSoldOut: false });
                                  }
                                }}
                                className="w-5 h-5 flex items-center justify-center bg-paper-200 border border-paper-300 hover:bg-paper-300 text-[11px] font-sans"
                                title="1개 증가"
                              >
                                +
                              </button>
                              <button
                                onClick={() => {
                                  setStockAdjustment({
                                    ...stockAdjustment,
                                    [prod.id]: (stockAdjustment[prod.id] || 0) + 10,
                                  });
                                  showToast(`${prod.name} +10개 입고 완료`);
                                }}
                                className="px-1.5 py-0.5 bg-paper-200 border border-paper-300 hover:bg-paper-300 text-[10px] font-serif-kr"
                                title="10개 대량 입고"
                              >
                                +10
                              </button>
                            </div>
                          </div>
                        </div>

                        {/* 작업 버튼들 */}
                        <div className="grid grid-cols-4 gap-1.5 pt-0.5">
                          <button
                            onClick={() => handleToggleSoldOut(prod)}
                            className={`py-1.5 text-[11px] font-serif-kr border text-center transition-colors ${
                              isSold
                                ? 'bg-emerald-50 border-emerald-300 text-emerald-800 hover:bg-emerald-100'
                                : 'bg-amber-50 border-amber-300 text-amber-800 hover:bg-amber-100'
                            }`}
                            title="판매중 / 품절 상태 전환"
                          >
                            {isSold ? '판매재개' : '품절처리'}
                          </button>

                          <button
                            onClick={() => handleOpenEditModal(prod)}
                            className="py-1.5 bg-paper-200 hover:bg-paper-300 border border-paper-300 text-ink-800 text-[11px] font-serif-kr flex items-center justify-center gap-1 transition-colors"
                          >
                            <Edit className="w-3 h-3 text-ink-600" />
                            <span>수정</span>
                          </button>

                          <button
                            onClick={() => navigate(`/product/${prod.id}`)}
                            className="py-1.5 bg-paper-200 hover:bg-paper-300 border border-paper-300 text-ink-800 text-[11px] font-serif-kr flex items-center justify-center gap-1 transition-colors"
                            title="고객 쇼핑몰 상품 상세 페이지 바로가기"
                          >
                            <Eye className="w-3 h-3 text-ink-600" />
                            <span>상세</span>
                          </button>

                          <button
                            onClick={() => handleDeleteProduct(prod)}
                            className="py-1.5 bg-rose-50 hover:bg-rose-100 border border-rose-300 text-rose-700 text-[11px] font-serif-kr flex items-center justify-center gap-1 transition-colors"
                          >
                            <Trash2 className="w-3 h-3" />
                            <span>삭제</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
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

      {/* 상품 등록 및 수정 모달 (Supabase 연동) */}
      {showProductModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink-900/60 backdrop-blur-sm animate-fade-in overflow-y-auto">
          <div className="bg-paper-100 border border-paper-300 w-full max-w-2xl my-8 p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            {/* 모달 헤더 */}
            <div className="flex justify-between items-center pb-3 border-b border-paper-300">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 bg-lacquer"></div>
                <h3 className="text-base font-serif-kr font-bold text-ink-900">
                  {editingProduct ? `상품 정보 수정: ${editingProduct.name}` : '신규 명품 상품 등록'}
                </h3>
              </div>
              <button
                onClick={() => setShowProductModal(false)}
                className="p-1 hover:bg-paper-200 text-ink-500 hover:text-ink-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitProductForm} className="space-y-4 font-serif-kr text-xs">
              {/* 1. 기본 정보 */}
              <div className="bg-paper-50 p-3.5 border border-paper-300 space-y-3">
                <h4 className="font-bold text-ink-900 flex items-center gap-1.5 pb-1 border-b border-paper-200 text-xs">
                  <Tag className="w-3.5 h-3.5 text-lacquer" /> 기본 정보
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-ink-700 mb-1 font-medium">상품명 (국문) *</label>
                    <input
                      type="text"
                      required
                      placeholder="예: 전주이씨 어진 자수 오버핏 코트"
                      value={prodFormName}
                      onChange={(e) => setProdFormName(e.target.value)}
                      className="w-full bg-paper-100 border border-paper-300 px-3 py-2 text-ink-900 font-sans focus:outline-none focus:border-ink-900"
                    />
                  </div>
                  <div>
                    <label className="block text-ink-700 mb-1 font-medium">영문 상품명</label>
                    <input
                      type="text"
                      placeholder="예: Royal Portrait Embroidery Overcoat"
                      value={prodFormEngName}
                      onChange={(e) => setProdFormEngName(e.target.value)}
                      className="w-full bg-paper-100 border border-paper-300 px-3 py-2 text-ink-900 font-sans focus:outline-none focus:border-ink-900"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-ink-700 mb-1 font-medium">카테고리 *</label>
                    <select
                      value={prodFormCategory}
                      onChange={(e) => setProdFormCategory(e.target.value as ProductCategory)}
                      className="w-full bg-paper-100 border border-paper-300 px-3 py-2 text-ink-900 font-sans focus:outline-none focus:border-ink-900"
                    >
                      <option value="TOP">상의 (TOP)</option>
                      <option value="OUTER">아우터 (OUTER)</option>
                      <option value="BOTTOM">하의 (BOTTOM)</option>
                      <option value="ACCESSORIES">액세서리 (ACCESSORIES)</option>
                      <option value="LIFESTYLE">라이프스타일 (LIFESTYLE)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-ink-700 mb-1 font-medium">판매 가격 (원) *</label>
                    <input
                      type="number"
                      required
                      min={0}
                      step={1000}
                      placeholder="180000"
                      value={prodFormPrice}
                      onChange={(e) => setProdFormPrice(Number(e.target.value) || 0)}
                      className="w-full bg-paper-100 border border-paper-300 px-3 py-2 text-ink-900 font-sans focus:outline-none focus:border-ink-900"
                    />
                  </div>
                  <div>
                    <label className="block text-ink-700 mb-1 font-medium">정상가 (할인 전, 선택)</label>
                    <input
                      type="number"
                      min={0}
                      step={1000}
                      placeholder="220000"
                      value={prodFormOrigPrice}
                      onChange={(e) => setProdFormOrigPrice(e.target.value ? Number(e.target.value) : '')}
                      className="w-full bg-paper-100 border border-paper-300 px-3 py-2 text-ink-900 font-sans focus:outline-none focus:border-ink-900"
                    />
                  </div>
                </div>

                {/* 뱃지 토글 옵션 */}
                <div className="flex flex-wrap items-center gap-6 pt-1">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={prodFormIsNew}
                      onChange={(e) => setProdFormIsNew(e.target.checked)}
                      className="w-4 h-4 text-ink-900 rounded border-paper-300 focus:ring-0"
                    />
                    <span className="text-ink-800">NEW 뱃지 표시</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={prodFormIsBest}
                      onChange={(e) => setProdFormIsBest(e.target.checked)}
                      className="w-4 h-4 text-ink-900 rounded border-paper-300 focus:ring-0"
                    />
                    <span className="text-ink-800">BEST 뱃지 표시</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={prodFormIsSoldOut}
                      onChange={(e) => setProdFormIsSoldOut(e.target.checked)}
                      className="w-4 h-4 text-ink-900 rounded border-paper-300 focus:ring-0"
                    />
                    <span className="text-rose-700 font-semibold">품절 상태 (Sold Out)</span>
                  </label>
                </div>
              </div>

              {/* 2. 이미지 설정 및 미리보기 */}
              <div className="bg-paper-50 p-3.5 border border-paper-300 space-y-3">
                <h4 className="font-bold text-ink-900 flex items-center gap-1.5 pb-1 border-b border-paper-200 text-xs">
                  <UploadCloud className="w-3.5 h-3.5 text-lacquer" /> 대표 상품 이미지 URL
                </h4>

                <div className="flex gap-3 items-center">
                  <div className="w-20 h-24 bg-paper-200 border border-paper-300 flex-shrink-0 overflow-hidden flex items-center justify-center">
                    {prodFormImage ? (
                      <img
                        src={prodFormImage}
                        alt="미리보기"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1544441893-675973e31985?auto=format&fit=crop&w=600&q=80';
                        }}
                      />
                    ) : (
                      <span className="text-[10px] text-ink-400">미리보기</span>
                    )}
                  </div>
                  <div className="flex-1 space-y-1.5">
                    <input
                      type="text"
                      placeholder="https://images.unsplash.com/... 또는 이미지 URL 입력"
                      value={prodFormImage}
                      onChange={(e) => setProdFormImage(e.target.value)}
                      className="w-full bg-paper-100 border border-paper-300 px-3 py-2 text-ink-900 font-sans focus:outline-none focus:border-ink-900 text-xs"
                    />
                    <div className="flex flex-wrap gap-1 text-[10px] text-ink-500">
                      <span>빠른 샘플 이미지:</span>
                      <button
                        type="button"
                        onClick={() => setProdFormImage('https://images.unsplash.com/photo-1544441893-675973e31985?auto=format&fit=crop&w=1200&q=80')}
                        className="text-lacquer underline hover:text-ink-900"
                      >
                        [의류]
                      </button>
                      <button
                        type="button"
                        onClick={() => setProdFormImage('https://images.unsplash.com/photo-1551232864-3f0890e580d9?auto=format&fit=crop&w=1200&q=80')}
                        className="text-lacquer underline hover:text-ink-900"
                      >
                        [니트]
                      </button>
                      <button
                        type="button"
                        onClick={() => setProdFormImage('https://images.unsplash.com/photo-1617038220319-276d3cfab638?auto=format&fit=crop&w=1200&q=80')}
                        className="text-lacquer underline hover:text-ink-900"
                      >
                        [도자기]
                      </button>
                      <button
                        type="button"
                        onClick={() => setProdFormImage('https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=1200&q=80')}
                        className="text-lacquer underline hover:text-ink-900"
                      >
                        [소품]
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* 3. 상품 설명 및 상세 정보 */}
              <div className="bg-paper-50 p-3.5 border border-paper-300 space-y-3">
                <h4 className="font-bold text-ink-900 flex items-center gap-1.5 pb-1 border-b border-paper-200 text-xs">
                  <FileText className="w-3.5 h-3.5 text-lacquer" /> 상세 소개 및 스펙
                </h4>

                <div>
                  <label className="block text-ink-700 mb-1">한 줄 요약 설명</label>
                  <input
                    type="text"
                    placeholder="조선 왕실의 정갈한 품격을 담은 프리미엄 코트"
                    value={prodFormShortDesc}
                    onChange={(e) => setProdFormShortDesc(e.target.value)}
                    className="w-full bg-paper-100 border border-paper-300 px-3 py-2 text-ink-900 focus:outline-none focus:border-ink-900"
                  />
                </div>

                <div>
                  <label className="block text-ink-700 mb-1">상세 스토리 / 설명</label>
                  <textarea
                    rows={3}
                    placeholder="상품의 기획 의도, 장인의 손길, 전통 공예 스토리 등을 적어주세요."
                    value={prodFormDetailDesc}
                    onChange={(e) => setProdFormDetailDesc(e.target.value)}
                    className="w-full bg-paper-100 border border-paper-300 px-3 py-2 text-ink-900 focus:outline-none focus:border-ink-900 leading-relaxed"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-ink-700 mb-1">소재 및 원단 (Fabric)</label>
                    <input
                      type="text"
                      placeholder="천연 울 90%, 캐시미어 10%"
                      value={prodFormFabric}
                      onChange={(e) => setProdFormFabric(e.target.value)}
                      className="w-full bg-paper-100 border border-paper-300 px-3 py-2 text-ink-900 focus:outline-none focus:border-ink-900"
                    />
                  </div>
                  <div>
                    <label className="block text-ink-700 mb-1">핏 / 실루엣 (Fit)</label>
                    <input
                      type="text"
                      placeholder="릴렉스드 오버핏 / 레귤러 핏"
                      value={prodFormFit}
                      onChange={(e) => setProdFormFit(e.target.value)}
                      className="w-full bg-paper-100 border border-paper-300 px-3 py-2 text-ink-900 focus:outline-none focus:border-ink-900"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-ink-700 mb-1">사이즈 목록 (쉼표 구분)</label>
                    <input
                      type="text"
                      placeholder="S, M, L, XL"
                      value={prodFormSizes}
                      onChange={(e) => setProdFormSizes(e.target.value)}
                      className="w-full bg-paper-100 border border-paper-300 px-3 py-2 text-ink-900 font-sans focus:outline-none focus:border-ink-900"
                    />
                  </div>
                  <div>
                    <label className="block text-ink-700 mb-1">색상 목록 (쉼표 구분)</label>
                    <input
                      type="text"
                      placeholder="먹색 (Ink Black), 한지 아이보리 (Hanji Ivory)"
                      value={prodFormColors}
                      onChange={(e) => setProdFormColors(e.target.value)}
                      className="w-full bg-paper-100 border border-paper-300 px-3 py-2 text-ink-900 font-sans focus:outline-none focus:border-ink-900"
                    />
                  </div>
                </div>
              </div>

              {/* 하단 저장 / 취소 버튼 */}
              <div className="flex gap-2 pt-2 border-t border-paper-300">
                <button
                  type="button"
                  onClick={() => setShowProductModal(false)}
                  className="flex-1 py-2.5 border border-paper-300 text-ink-700 hover:bg-paper-200 transition-colors"
                >
                  취소
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-ink-900 hover:bg-lacquer text-paper-100 font-semibold transition-colors flex items-center justify-center gap-1.5 shadow-sm"
                >
                  <Check className="w-4 h-4" />
                  <span>{editingProduct ? '상품 정보 수정 완료' : '신규 상품 등록 완료'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
