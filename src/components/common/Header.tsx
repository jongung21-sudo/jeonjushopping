import React, { useState, useEffect } from 'react';
import {
  Search,
  User,
  Heart,
  ShoppingBag,
  Menu,
  X,
  ArrowRight,
  Database,
  Sparkles,
  Lock,
  ChevronDown,
  LayoutDashboard,
  Boxes,
  Package,
  ClipboardList,
  Users,
  Truck,
  HelpCircle,
  Bell,
  MessageSquare,
  ShieldCheck,
} from 'lucide-react';
import { Logo } from './Logo';
import { SignUpModal } from './SignUpModal';
import { LoginModal } from './LoginModal';
import { SupabaseDbModal } from './SupabaseDbModal';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import { useAuth } from '../../context/AuthContext';
import { isSupabaseConfigured } from '../../lib/supabaseClient';

interface HeaderProps {
  currentPath: string;
  navigate: (path: string) => void;
  openSearch: () => void;
}

export const Header: React.FC<HeaderProps> = ({ currentPath, navigate, openSearch }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [signUpModalOpen, setSignUpModalOpen] = useState(false);
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const [dbModalOpen, setDbModalOpen] = useState(false);
  const [dbConnected, setDbConnected] = useState<boolean>(() => isSupabaseConfigured());
  const [openDropdown, setOpenDropdown] = useState<'SHOP' | 'COMMUNITY' | 'ADMIN' | null>(null);

  const { totalItemCount } = useCart();
  const { wishlistIds } = useWishlist();
  const { isLoggedIn, isAdmin, user, logout } = useAuth();

  useEffect(() => {
    const syncDbState = () => setDbConnected(isSupabaseConfigured());
    window.addEventListener('supabase-connection-changed', syncDbState);
    window.addEventListener('storage', syncDbState);
    return () => {
      window.removeEventListener('supabase-connection-changed', syncDbState);
      window.removeEventListener('storage', syncDbState);
    };
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 30);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const currentSearch = typeof window !== 'undefined' ? window.location.search : '';
  const currentFullUrl = `${currentPath}${currentSearch}`;

  // 직관적인 한국어 중심 메인 메뉴 구성 (하위 드롭다운 포함)
  const shopSubMenus = [
    { label: '전체 상품 보기', sub: 'ALL COLLECTION', path: '/shop' },
    { label: '신상품 컬렉션', sub: 'NEW ARRIVALS', path: '/shop?category=NEW', badge: 'NEW' },
    { label: '베스트셀러', sub: 'BEST SELLERS', path: '/shop?category=BEST', badge: 'HOT' },
    { label: '아우터 (도포/코트/자켓)', sub: 'OUTERWEAR', path: '/shop?category=OUTER' },
    { label: '상의 (셔츠/니트/저고리)', sub: 'TOPS & KNIT', path: '/shop?category=TOP' },
    { label: '하의 (와이드 팬츠/슬랙스)', sub: 'BOTTOMS', path: '/shop?category=BOTTOM' },
    { label: '액세서리 (노리개/가죽소품)', sub: 'ACCESSORIES', path: '/shop?category=ACCESSORIES' },
    { label: '라이프스타일 (다기/인센스)', sub: 'LIFESTYLE', path: '/shop?category=LIFESTYLE' },
  ];

  const communitySubMenus = [
    { label: '커뮤니티 라운지 (리뷰 · Q&A)', sub: 'COMMUNITY & REVIEW', path: '/community', icon: MessageSquare },
    { label: '공지사항 & 브랜드 소식', sub: 'NOTICE', path: '/notice', icon: Bell },
    { label: '자주 묻는 질문 (FAQ)', sub: 'CUSTOMER FAQ', path: '/faq', icon: HelpCircle },
    { label: '1:1 컨시어지 문의', sub: 'DIRECT INQUIRY', path: '/contact', icon: ShieldCheck },
    { label: '주문 및 배송 조회', sub: 'ORDER TRACKING', path: '/orders', icon: Truck },
  ];

  const adminSubMenus = [
    { label: '📊 대시보드 요약', path: '/admin?tab=DASHBOARD', icon: LayoutDashboard },
    { label: '📦 주문 / 배송 / 환불 관리', path: '/admin?tab=ORDERS', icon: ShoppingBag },
    { label: '👘 상품 / 재고 관리', path: '/admin?tab=INVENTORY', icon: Boxes },
    { label: '🧵 원부자재 재고 ERP', path: '/admin?tab=MATERIALS', icon: Package },
    { label: '📋 공방 발주서 관리', path: '/admin?tab=PURCHASE', icon: ClipboardList },
    { label: '👥 회원 / 포인트 관리', path: '/admin?tab=MEMBERS', icon: Users },
    { label: '🗄️ Supabase DB 설정', path: '/admin?tab=DB_SETTINGS', icon: Database },
  ];

  const mainNavItems = [
    { id: 'SHOP', label: '전체상품', eng: 'SHOP', path: '/shop', hasDropdown: 'SHOP' as const },
    { id: 'NEW', label: '신상품', eng: 'NEW', path: '/shop?category=NEW', highlight: true },
    { id: 'BEST', label: '베스트', eng: 'BEST', path: '/shop?category=BEST' },
    { id: 'OUTER', label: '아우터', eng: 'OUTER', path: '/shop?category=OUTER' },
    { id: 'TOP', label: '상의·하의', eng: 'APPAREL', path: '/shop?category=TOP' },
    { id: 'ACC', label: '소품·라이프', eng: 'LIVING', path: '/shop?category=ACCESSORIES' },
    { id: 'BRAND', label: '브랜드 소개', eng: 'BRAND', path: '/brand' },
    { id: 'COMMUNITY', label: '커뮤니티·고객센터', eng: 'COMMUNITY', path: '/community', hasDropdown: 'COMMUNITY' as const },
  ];

  const handleNavClick = (path: string) => {
    setOpenDropdown(null);
    setMobileMenuOpen(false);
    navigate(path);
  };

  const isNavItemActive = (itemPath: string) => {
    if (itemPath.includes('?')) {
      return currentFullUrl === itemPath;
    }
    if (itemPath === '/shop') {
      return currentPath === '/shop' && !currentSearch.includes('category=');
    }
    return currentPath === itemPath;
  };

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
          isScrolled
            ? 'bg-paper-100/98 backdrop-blur-md border-b border-paper-300 shadow-subtle'
            : 'bg-paper-100/95 backdrop-blur-sm border-b border-paper-300/80'
        }`}
      >
        {/* =========================================================
            1단: 상단 유틸리티 바 (회원 정보 / 관리자 메뉴 / 고객센터)
            - 모든 버튼에 whitespace-nowrap 적용하여 줄바꿈 현상 완벽 방지
           ========================================================= */}
        <div className="bg-paper-200/80 border-b border-paper-300/70">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-9 flex items-center justify-between text-[11px] whitespace-nowrap">
            {/* 좌측: 브랜드 안내 & 빠른 바로가기 */}
            <div className="flex items-center gap-3 text-ink-600 overflow-x-auto no-scrollbar">
              <span className="font-serif-kr font-medium text-ink-800 hidden sm:inline">
                전주이씨 (JEONJU LEE) 공식 온라인 부티크
              </span>
              <span className="text-paper-400 hidden sm:inline">|</span>
              <button
                onClick={() => handleNavClick('/notice')}
                className="hover:text-ink-900 transition-colors font-serif-kr"
              >
                공지사항
              </button>
              <span className="text-paper-400">|</span>
              <button
                onClick={() => handleNavClick('/faq')}
                className="hover:text-ink-900 transition-colors font-serif-kr"
              >
                자주 묻는 질문
              </button>
              <span className="text-paper-400 hidden md:inline">|</span>
              <button
                onClick={() => handleNavClick('/orders')}
                className="hover:text-ink-900 transition-colors font-serif-kr hidden md:inline"
              >
                주문/배송조회
              </button>
            </div>

            {/* 우측: 관리자 전용 컨트롤 + 로그인/회원 상태 */}
            <div className="flex items-center gap-2 sm:gap-2.5 whitespace-nowrap">
              {/* 관리자로 로그인했을 때만 노출되는 관리자 전용 바로가기 & DB 상태 */}
              {isLoggedIn && isAdmin && (
                <div className="flex items-center gap-1.5 pr-2 border-r border-paper-300">
                  {/* 관리자 페이지 드롭다운 & 원클릭 이동 */}
                  <div
                    className="relative"
                    onMouseEnter={() => setOpenDropdown('ADMIN')}
                    onMouseLeave={() => setOpenDropdown(null)}
                  >
                    <button
                      onClick={() => handleNavClick('/admin')}
                      className="inline-flex items-center gap-1 px-2.5 py-1 bg-lacquer text-paper-100 hover:bg-lacquer-light text-[11px] font-serif-kr font-semibold rounded-xs shadow-2xs transition-colors whitespace-nowrap"
                    >
                      <LayoutDashboard className="w-3 h-3" />
                      <span>관리자 페이지</span>
                      <ChevronDown className="w-3 h-3 opacity-80" />
                    </button>

                    {openDropdown === 'ADMIN' && (
                      <div className="absolute right-0 top-full pt-1 w-52 z-50 animate-fade-in">
                        <div className="bg-paper-100 border border-paper-300 shadow-elevated py-1.5 rounded-xs">
                          <div className="px-3 py-1.5 border-b border-paper-200 text-[10px] font-serif-kr text-ink-500 font-semibold">
                            관리자 메뉴 바로가기
                          </div>
                          {adminSubMenus.map((sub) => {
                            const Icon = sub.icon;
                            return (
                              <button
                                key={sub.path}
                                onClick={() => handleNavClick(sub.path)}
                                className="w-full px-3 py-2 text-left text-xs font-serif-kr text-ink-800 hover:bg-paper-200 hover:text-lacquer flex items-center gap-2 transition-colors whitespace-nowrap"
                              >
                                <Icon className="w-3.5 h-3.5 text-bronze flex-shrink-0" />
                                <span>{sub.label}</span>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* DB 연결 상태 뱃지 */}
                  <button
                    onClick={() => setDbModalOpen(true)}
                    className={`inline-flex items-center gap-1 px-2 py-1 text-[11px] font-sans border transition-colors cursor-pointer rounded-xs whitespace-nowrap ${
                      dbConnected || isSupabaseConfigured()
                        ? 'border-emerald-400 text-emerald-900 bg-emerald-50 hover:bg-emerald-100'
                        : 'border-amber-400 text-amber-900 bg-amber-50 hover:bg-amber-100'
                    }`}
                    title="Supabase 클라우드 DB 설정 열기"
                  >
                    <Database className="w-3 h-3 text-emerald-700 flex-shrink-0" />
                    <span className="font-semibold">
                      {dbConnected || isSupabaseConfigured() ? 'DB 연결됨' : '로컬 모드'}
                    </span>
                  </button>
                </div>
              )}

              {/* 로그인 전 / 후 회원 영역 */}
              {!isLoggedIn ? (
                <div className="flex items-center gap-1.5 whitespace-nowrap">
                  <button
                    onClick={() => setSignUpModalOpen(true)}
                    className="inline-flex items-center gap-1 px-2.5 py-1 bg-ink-900 text-paper-100 hover:bg-lacquer text-[11px] font-serif-kr font-medium rounded-xs transition-colors whitespace-nowrap"
                  >
                    <Sparkles className="w-3 h-3 text-bronze flex-shrink-0" />
                    <span>회원가입</span>
                    <span className="text-[10px] text-bronze font-sans">(+5,000P)</span>
                  </button>
                  <button
                    onClick={() => setLoginModalOpen(true)}
                    className="inline-flex items-center gap-1 px-2.5 py-1 bg-paper-100 hover:bg-paper-300 text-ink-900 border border-paper-300 text-[11px] font-serif-kr font-medium rounded-xs transition-colors whitespace-nowrap"
                  >
                    <Lock className="w-3 h-3 text-bronze flex-shrink-0" />
                    <span>로그인</span>
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2 whitespace-nowrap">
                  <button
                    onClick={() => handleNavClick('/mypage')}
                    className="inline-flex items-center gap-1.5 text-[11px] text-ink-800 hover:text-lacquer font-serif-kr transition-colors whitespace-nowrap"
                  >
                    <span className="font-bold text-bronze">{user?.name}</span>
                    <span>님</span>
                    <span className="text-[10px] font-sans font-semibold bg-paper-100 border border-paper-300 px-1.5 py-0.5 rounded-xs text-ink-700">
                      {user?.points.toLocaleString()}P
                    </span>
                  </button>
                  <button
                    onClick={logout}
                    className="px-2 py-0.5 text-[11px] font-serif-kr text-ink-600 hover:text-ink-900 bg-paper-100 hover:bg-paper-300 border border-paper-300 rounded-xs transition-colors whitespace-nowrap"
                  >
                    로그아웃
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* =========================================================
            2단: 메인 로고 & 직관적인 카테고리 네비게이션 바
           ========================================================= */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-[68px] gap-4">
            {/* 좌측: 모바일 햄버거 버튼 + 브랜드 로고 */}
            <div className="flex items-center gap-3 flex-shrink-0">
              <button
                type="button"
                onClick={() => setMobileMenuOpen(true)}
                className="lg:hidden p-1.5 text-ink-900 hover:bg-paper-200 rounded-xs transition-colors"
                aria-label="전체 메뉴 열기"
              >
                <Menu className="w-5 h-5" strokeWidth={1.6} />
              </button>

              <div
                onClick={() => handleNavClick('/')}
                className="cursor-pointer transition-transform duration-200 active:scale-95 flex-shrink-0 pr-2"
              >
                <Logo size="sm" variant="full" />
              </div>
            </div>

            {/* 중앙: 한눈에 보기 쉬운 한국어 + 영문 메인 메뉴 (드롭다운 지원) */}
            <nav className="hidden lg:flex items-center gap-1 xl:gap-2 flex-1 justify-center whitespace-nowrap">
              {mainNavItems.map((item) => {
                const active = isNavItemActive(item.path);
                const hasMenu = item.hasDropdown;

                return (
                  <div
                    key={item.id}
                    className="relative"
                    onMouseEnter={() => hasMenu && setOpenDropdown(hasMenu)}
                    onMouseLeave={() => hasMenu && setOpenDropdown(null)}
                  >
                    <button
                      onClick={() => handleNavClick(item.path)}
                      className={`group relative px-3 py-2 flex items-center gap-1 text-xs font-serif-kr transition-all rounded-xs whitespace-nowrap ${
                        active
                          ? 'text-lacquer font-bold bg-paper-200/70'
                          : 'text-ink-800 hover:text-lacquer hover:bg-paper-200/40 font-medium'
                      }`}
                    >
                      <span>{item.label}</span>
                      {item.highlight && (
                        <span className="w-1.5 h-1.5 rounded-full bg-lacquer mb-2" />
                      )}
                      {hasMenu && (
                        <ChevronDown className="w-3 h-3 text-ink-400 group-hover:text-lacquer transition-transform group-hover:rotate-180" />
                      )}
                      {active && (
                        <span className="absolute bottom-0 left-2.5 right-2.5 h-[2px] bg-lacquer" />
                      )}
                    </button>

                    {/* 전체상품 (SHOP) 세부 카테고리 드롭다운 */}
                    {hasMenu === 'SHOP' && openDropdown === 'SHOP' && (
                      <div className="absolute left-0 top-full pt-1 w-64 z-50 animate-fade-in">
                        <div className="bg-paper-100 border border-paper-300 shadow-elevated py-2 rounded-xs">
                          <div className="px-3.5 py-1.5 border-b border-paper-200 flex items-center justify-between">
                            <span className="text-[10px] font-sans tracking-widest text-bronze font-semibold">
                              SHOP CATEGORIES
                            </span>
                            <span className="text-[10px] font-serif-kr text-ink-400">카테고리 바로가기</span>
                          </div>
                          {shopSubMenus.map((sub) => (
                            <button
                              key={sub.path}
                              onClick={() => handleNavClick(sub.path)}
                              className="w-full px-3.5 py-2 text-left hover:bg-paper-200 flex items-center justify-between group transition-colors"
                            >
                              <div>
                                <p className="text-xs font-serif-kr font-medium text-ink-900 group-hover:text-lacquer">
                                  {sub.label}
                                </p>
                                <p className="text-[9px] font-sans text-ink-400 tracking-wider">
                                  {sub.sub}
                                </p>
                              </div>
                              {sub.badge && (
                                <span className="px-1.5 py-0.5 text-[9px] font-sans font-bold bg-lacquer text-paper-100 rounded-xs">
                                  {sub.badge}
                                </span>
                              )}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* 커뮤니티 · 고객센터 드롭다운 */}
                    {hasMenu === 'COMMUNITY' && openDropdown === 'COMMUNITY' && (
                      <div className="absolute left-0 top-full pt-1 w-60 z-50 animate-fade-in">
                        <div className="bg-paper-100 border border-paper-300 shadow-elevated py-2 rounded-xs">
                          <div className="px-3.5 py-1.5 border-b border-paper-200 flex items-center justify-between">
                            <span className="text-[10px] font-sans tracking-widest text-bronze font-semibold">
                              COMMUNITY & CS
                            </span>
                            <span className="text-[10px] font-serif-kr text-ink-400">고객 라운지</span>
                          </div>
                          {communitySubMenus.map((sub) => {
                            const Icon = sub.icon;
                            return (
                              <button
                                key={sub.path}
                                onClick={() => handleNavClick(sub.path)}
                                className="w-full px-3.5 py-2 text-left hover:bg-paper-200 flex items-center gap-2.5 group transition-colors"
                              >
                                <Icon className="w-3.5 h-3.5 text-bronze flex-shrink-0" />
                                <div>
                                  <p className="text-xs font-serif-kr font-medium text-ink-900 group-hover:text-lacquer">
                                    {sub.label}
                                  </p>
                                  <p className="text-[9px] font-sans text-ink-400 tracking-wider">
                                    {sub.sub}
                                  </p>
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </nav>

            {/* 우측: 직관적인 한글 라벨 아이콘 메뉴 (검색 / 마이 / 찜 / 장바구니) */}
            <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0 whitespace-nowrap">
              {/* 검색 */}
              <button
                onClick={openSearch}
                className="flex flex-col items-center justify-center px-2 py-1 text-ink-800 hover:text-lacquer hover:bg-paper-200/60 rounded-xs transition-colors"
                aria-label="상품 검색"
              >
                <Search className="w-4 h-4" strokeWidth={1.6} />
                <span className="text-[10px] font-serif-kr mt-0.5">검색</span>
              </button>

              {/* 마이페이지 */}
              <button
                onClick={() => {
                  if (isLoggedIn) {
                    handleNavClick('/mypage');
                  } else {
                    setLoginModalOpen(true);
                  }
                }}
                className="flex flex-col items-center justify-center px-2 py-1 text-ink-800 hover:text-lacquer hover:bg-paper-200/60 rounded-xs transition-colors relative"
                aria-label="마이페이지"
              >
                <User className="w-4 h-4" strokeWidth={1.6} />
                <span className="text-[10px] font-serif-kr mt-0.5">마이</span>
                {isLoggedIn && (
                  <span className="absolute top-1 right-2 w-1.5 h-1.5 bg-lacquer rounded-full" />
                )}
              </button>

              {/* 찜 목록 */}
              <button
                onClick={() => handleNavClick('/wishlist')}
                className="hidden sm:flex flex-col items-center justify-center px-2 py-1 text-ink-800 hover:text-lacquer hover:bg-paper-200/60 rounded-xs transition-colors relative"
                aria-label="찜 목록"
              >
                <Heart className="w-4 h-4" strokeWidth={1.6} />
                <span className="text-[10px] font-serif-kr mt-0.5">찜</span>
                {wishlistIds.length > 0 && (
                  <span className="absolute top-0.5 right-1 min-w-[15px] h-[15px] flex items-center justify-center text-[9px] font-bold text-paper-100 bg-ink-900 rounded-full px-1">
                    {wishlistIds.length}
                  </span>
                )}
              </button>

              {/* 장바구니 */}
              <button
                onClick={() => handleNavClick('/cart')}
                className="flex flex-col items-center justify-center px-2 py-1 text-ink-800 hover:text-lacquer hover:bg-paper-200/60 rounded-xs transition-colors relative"
                aria-label="장바구니"
              >
                <ShoppingBag className="w-4 h-4" strokeWidth={1.6} />
                <span className="text-[10px] font-serif-kr mt-0.5">장바구니</span>
                {totalItemCount > 0 && (
                  <span className="absolute top-0.5 right-1 min-w-[15px] h-[15px] flex items-center justify-center text-[9px] font-bold text-paper-100 bg-lacquer rounded-full px-1">
                    {totalItemCount}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* =========================================================
          모바일 & 태블릿 전체 메뉴 드로어 (한눈에 보기 쉬운 아코디언/그리드 정리)
         ========================================================= */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-ink-900/50 backdrop-blur-xs transition-opacity"
            onClick={() => setMobileMenuOpen(false)}
          />

          <div className="relative w-4/5 max-w-sm bg-paper-100 h-full shadow-2xl flex flex-col justify-between p-6 z-10 animate-fade-in overflow-y-auto">
            <div className="space-y-5">
              {/* 상단 로고 & 닫기 */}
              <div className="flex items-center justify-between pb-4 border-b border-paper-300">
                <Logo size="sm" variant="compact" />
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1.5 text-ink-900 hover:bg-paper-200 rounded-xs"
                  aria-label="메뉴 닫기"
                >
                  <X className="w-5 h-5" strokeWidth={1.5} />
                </button>
              </div>

              {/* 회원 / 관리자 상태 카드 */}
              <div className="p-3.5 bg-paper-200/80 border border-paper-300 rounded-xs">
                {isLoggedIn ? (
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-[10px] px-1.5 py-0.5 bg-paper-100 border border-paper-300 text-bronze font-semibold">
                          {user?.membershipGrade}
                        </span>
                        <p className="text-sm font-bold text-ink-900 font-serif-kr mt-1">
                          {user?.name} 님 ({user?.points.toLocaleString()}P)
                        </p>
                      </div>
                      <button
                        onClick={() => handleNavClick('/mypage')}
                        className="px-2.5 py-1 bg-ink-900 text-paper-100 text-xs font-serif-kr rounded-xs"
                      >
                        마이페이지
                      </button>
                    </div>
                    {isAdmin && (
                      <button
                        onClick={() => handleNavClick('/admin')}
                        className="w-full py-2 bg-lacquer text-paper-100 text-xs font-serif-kr font-semibold rounded-xs flex items-center justify-center gap-1.5 shadow-xs"
                      >
                        <LayoutDashboard className="w-3.5 h-3.5" />
                        <span>관리자 페이지 (ERP 콘솔) 바로가기</span>
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => {
                        setMobileMenuOpen(false);
                        setLoginModalOpen(true);
                      }}
                      className="py-2 bg-paper-100 border border-ink-900 text-ink-900 text-xs font-serif-kr font-medium flex items-center justify-center gap-1"
                    >
                      <Lock className="w-3 h-3 text-bronze" />
                      <span>로그인</span>
                    </button>
                    <button
                      onClick={() => {
                        setMobileMenuOpen(false);
                        setSignUpModalOpen(true);
                      }}
                      className="py-2 bg-ink-900 text-paper-100 text-xs font-serif-kr font-medium flex items-center justify-center gap-1"
                    >
                      <Sparkles className="w-3 h-3 text-bronze" />
                      <span>회원가입 (+5,000P)</span>
                    </button>
                  </div>
                )}
              </div>

              {/* 쇼핑 카테고리 그리드 */}
              <div>
                <p className="text-[11px] font-serif-kr font-bold text-ink-500 mb-2.5">
                  쇼핑 카테고리 바로가기
                </p>
                <div className="grid grid-cols-2 gap-2 text-xs font-serif-kr">
                  {shopSubMenus.map((item) => (
                    <button
                      key={item.path}
                      onClick={() => handleNavClick(item.path)}
                      className="p-2.5 bg-paper-50 hover:bg-paper-200 border border-paper-300 text-left text-ink-900 font-medium rounded-xs flex items-center justify-between"
                    >
                      <span className="truncate">{item.label.split(' (')[0]}</span>
                      <ArrowRight className="w-3 h-3 text-ink-400 flex-shrink-0" />
                    </button>
                  ))}
                </div>
              </div>

              {/* 브랜드 & 고객 라운지 */}
              <div className="pt-3 border-t border-paper-300">
                <p className="text-[11px] font-serif-kr font-bold text-ink-500 mb-2.5">
                  브랜드 & 고객센터
                </p>
                <div className="space-y-1.5 text-xs font-serif-kr">
                  <button
                    onClick={() => handleNavClick('/brand')}
                    className="w-full py-2 px-3 bg-paper-50 hover:bg-paper-200 border border-paper-300 text-left text-ink-900 font-medium flex items-center justify-between"
                  >
                    <span>브랜드 스토리 (전주이씨 철학)</span>
                    <ArrowRight className="w-3.5 h-3.5 text-ink-400" />
                  </button>
                  {communitySubMenus.map((sub) => (
                    <button
                      key={sub.path}
                      onClick={() => handleNavClick(sub.path)}
                      className="w-full py-2 px-3 hover:bg-paper-200 text-left text-ink-700 flex items-center justify-between"
                    >
                      <span>{sub.label}</span>
                      <ArrowRight className="w-3 h-3 text-ink-400" />
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* 하단 카피라이트 */}
            <div className="pt-5 border-t border-paper-300 mt-6">
              <p className="text-[10px] text-ink-400 font-serif-kr">
                TRADITION, REDEFINED. © JEONJU LEE
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 회원가입 모달창 */}
      <SignUpModal
        isOpen={signUpModalOpen}
        onClose={() => setSignUpModalOpen(false)}
        onSwitchToLogin={() => setLoginModalOpen(true)}
      />

      {/* 로그인 모달창 */}
      <LoginModal
        isOpen={loginModalOpen}
        onClose={() => setLoginModalOpen(false)}
        onSwitchToSignUp={() => setSignUpModalOpen(true)}
        onNavigateToFindAccount={() => handleNavClick('/find-account')}
      />

      {/* Supabase 데이터베이스 관리 모달 */}
      <SupabaseDbModal
        isOpen={dbModalOpen}
        onClose={() => setDbModalOpen(false)}
      />
    </>
  );
};
