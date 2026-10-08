import React, { useState, useEffect } from 'react';
import { Search, User, Heart, ShoppingBag, Menu, X, ArrowRight, Database, Sparkles, UserPlus, Lock } from 'lucide-react';
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
  const { totalItemCount } = useCart();
  const { wishlistIds } = useWishlist();
  const { isLoggedIn, user, logout } = useAuth();

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 40) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { label: 'SHOP', path: '/shop' },
    { label: 'COLLECTION', path: '/brand' },
    { label: 'NEW', path: '/shop?category=NEW' },
    { label: 'BEST', path: '/shop?category=BEST' },
    { label: 'COMMUNITY', path: '/community' },
    { label: 'ABOUT', path: '/brand' },
  ];

  const handleNavClick = (path: string) => {
    navigate(path);
    setMobileMenuOpen(false);
  };

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
          isScrolled
            ? 'bg-paper-100/95 backdrop-blur-md border-b border-paper-300/80 py-3 shadow-subtle'
            : currentPath === '/'
            ? 'bg-paper-100/80 backdrop-blur-sm border-b border-transparent py-5'
            : 'bg-paper-100 border-b border-paper-300 py-4'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            {/* Mobile Hamburger (Left on mobile) */}
            <div className="flex items-center lg:hidden">
              <button
                type="button"
                onClick={() => setMobileMenuOpen(true)}
                className="p-1.5 text-ink-900 hover:opacity-70 transition-opacity"
                aria-label="메뉴 열기"
              >
                <Menu className="w-5 h-5" strokeWidth={1.5} />
              </button>
            </div>

            {/* Left: Logo (Desktop) / Center on Mobile */}
            <div
              onClick={() => handleNavClick('/')}
              className="cursor-pointer transition-transform duration-200 active:scale-95"
            >
              <Logo
                size={isScrolled ? 'sm' : 'md'}
                variant={isScrolled ? 'compact' : 'full'}
              />
            </div>

            {/* Center: Desktop Navigation Links */}
            <nav className="hidden lg:flex items-center space-x-10">
              {navLinks.map((link) => {
                const isActive = currentPath === link.path;
                return (
                  <button
                    key={link.label}
                    onClick={() => handleNavClick(link.path)}
                    className={`relative text-xs tracking-[0.2em] font-medium transition-colors py-1 ${
                      isActive
                        ? 'text-ink-900'
                        : 'text-ink-600 hover:text-ink-900'
                    }`}
                  >
                    {link.label}
                    {isActive && (
                      <span className="absolute bottom-0 left-0 right-0 h-[1.5px] bg-ink-900" />
                    )}
                  </button>
                );
              })}
            </nav>

            {/* Right: Actions */}
            <div className="flex items-center space-x-2.5 sm:space-x-4">
              {/* DB Status Badge (클릭 시 Supabase DB 관리 모달 오픈) */}
              <button
                onClick={() => setDbModalOpen(true)}
                className={`flex items-center gap-1.5 px-2 py-1 text-[11px] font-sans border transition-colors cursor-pointer rounded-xs shadow-2xs ${
                  isSupabaseConfigured()
                    ? 'border-emerald-300 text-emerald-800 bg-emerald-50 hover:bg-emerald-100'
                    : 'border-amber-300 text-amber-800 bg-amber-50 hover:bg-amber-100'
                }`}
                title="Supabase 실시간 클라우드 DB 연동 관리 모달 열기"
              >
                <Database className="w-3.5 h-3.5 text-bronze" />
                <span className="font-medium">{isSupabaseConfigured() ? 'DB 연결됨' : '로컬 모드'}</span>
              </button>

              {/* 회원가입 & 로그인 버튼 그룹 */}
              {!isLoggedIn ? (
                <div className="flex items-center gap-1.5 sm:gap-2">
                  {/* 회원가입 버튼 */}
                  <button
                    onClick={() => setSignUpModalOpen(true)}
                    className="inline-flex items-center gap-1 px-2 sm:px-3 py-1 bg-ink-900 text-paper-100 hover:bg-lacquer text-xs font-serif-kr transition-all shadow-sm rounded-xs group"
                    title="전주이씨 가문 회원가입 창 열기 (+5,000P 즉시 지급)"
                  >
                    <Sparkles className="w-3 h-3 text-bronze group-hover:rotate-12 transition-transform" />
                    <span className="tracking-wide">회원가입</span>
                    <span className="text-[10px] text-bronze font-sans font-normal ml-0.5">(+5,000P)</span>
                  </button>

                  {/* 로그인 버튼 (회원가입 옆에 로그인창 열기) */}
                  <button
                    onClick={() => setLoginModalOpen(true)}
                    className="inline-flex items-center gap-1 px-2 sm:px-2.5 py-1 bg-paper-100 hover:bg-paper-200 text-ink-900 border border-paper-300 hover:border-ink-900 text-xs font-serif-kr transition-all shadow-2xs rounded-xs"
                    title="전주이씨 가문 로그인 창 열기"
                  >
                    <Lock className="w-3 h-3 text-bronze" />
                    <span className="tracking-wide">로그인</span>
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleNavClick('/mypage')}
                    className="hidden sm:inline-flex items-center gap-1.5 text-xs text-ink-700 font-serif-kr hover:text-ink-900"
                  >
                    <span className="text-bronze font-medium">{user?.name}</span>님
                    <span className="text-[10px] bg-paper-200 border border-paper-300 px-1.5 py-0.5 rounded text-ink-600">
                      {user?.points.toLocaleString()}P
                    </span>
                  </button>
                  <button
                    onClick={logout}
                    className="text-[11px] text-ink-500 hover:text-ink-900 border border-paper-300 px-2 py-0.5 rounded-xs hover:border-ink-600 transition-colors"
                  >
                    로그아웃
                  </button>
                </div>
              )}

              {/* Search */}
              <button
                onClick={openSearch}
                className="p-1 text-ink-900 hover:opacity-60 transition-opacity"
                aria-label="상품 검색"
              >
                <Search className="w-[18px] h-[18px]" strokeWidth={1.5} />
              </button>

              {/* User / My Page (Desktop) */}
              <button
                onClick={() => {
                  if (isLoggedIn) {
                    handleNavClick('/mypage');
                  } else {
                    setLoginModalOpen(true);
                  }
                }}
                className="flex items-center p-1 text-ink-900 hover:opacity-60 transition-opacity relative"
                aria-label="마이페이지"
                title={isLoggedIn ? `${user?.name}님 마이페이지` : '로그인 / 회원가입'}
              >
                <User className="w-[18px] h-[18px]" strokeWidth={1.5} />
                {isLoggedIn && (
                  <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-lacquer rounded-full" />
                )}
              </button>

              {/* Wishlist */}
              <button
                onClick={() => handleNavClick('/wishlist')}
                className="hidden sm:flex items-center p-1 text-ink-900 hover:opacity-60 transition-opacity relative"
                aria-label="찜 목록"
                title="찜 목록"
              >
                <Heart className="w-[18px] h-[18px]" strokeWidth={1.5} />
                {wishlistIds.length > 0 && (
                  <span className="absolute -top-1 -right-1.5 min-w-[15px] h-[15px] flex items-center justify-center text-[9px] font-medium text-paper-100 bg-ink-900 px-1">
                    {wishlistIds.length}
                  </span>
                )}
              </button>

              {/* Cart */}
              <button
                onClick={() => handleNavClick('/cart')}
                className="flex items-center p-1 text-ink-900 hover:opacity-60 transition-opacity relative"
                aria-label="장바구니"
                title="장바구니"
              >
                <ShoppingBag className="w-[18px] h-[18px]" strokeWidth={1.5} />
                {totalItemCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 min-w-[16px] h-[16px] flex items-center justify-center text-[10px] font-semibold text-paper-100 bg-lacquer px-1">
                    {totalItemCount}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Drawer Navigation */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-ink-900/40 backdrop-blur-sm transition-opacity"
            onClick={() => setMobileMenuOpen(false)}
          />

          {/* Drawer content */}
          <div className="relative w-4/5 max-w-sm bg-paper-100 h-full shadow-2xl flex flex-col justify-between p-6 z-10 animate-fade-in overflow-y-auto">
            <div>
              <div className="flex items-center justify-between pb-6 border-b border-paper-300">
                <Logo size="sm" variant="compact" />
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1 text-ink-900"
                  aria-label="메뉴 닫기"
                >
                  <X className="w-5 h-5" strokeWidth={1.5} />
                </button>
              </div>

              {/* User greeting */}
              <div className="py-4 border-b border-paper-300/60 mb-4">
                {isLoggedIn ? (
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-ink-500">{user?.membershipGrade}</p>
                      <p className="text-sm font-medium text-ink-900 font-serif-kr mt-0.5">
                        {user?.name} 님
                      </p>
                    </div>
                    <button
                      onClick={() => handleNavClick('/mypage')}
                      className="text-xs text-bronze hover:underline"
                    >
                      마이페이지
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => {
                        setMobileMenuOpen(false);
                        setLoginModalOpen(true);
                      }}
                      className="text-xs font-medium text-ink-900 border border-ink-900 px-3 py-1.5 flex items-center gap-1"
                    >
                      <Lock className="w-3 h-3 text-bronze" />
                      <span>로그인</span>
                    </button>
                    <button
                      onClick={() => {
                        setMobileMenuOpen(false);
                        setSignUpModalOpen(true);
                      }}
                      className="text-xs text-ink-600 hover:text-ink-900 flex items-center gap-1"
                    >
                      <Sparkles className="w-3 h-3 text-bronze" />
                      <span>회원가입 (5,000P 지급)</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Main Links */}
              <div className="space-y-4 py-2">
                <p className="text-[10px] tracking-widest text-ink-400 font-medium">COLLECTIONS</p>
                <div className="space-y-3 pl-1">
                  {navLinks.map((item) => (
                    <button
                      key={item.label}
                      onClick={() => handleNavClick(item.path)}
                      className="block w-full text-left text-sm tracking-wider font-medium text-ink-800 hover:text-lacquer transition-colors"
                    >
                      {item.label}
                    </button>
                  ))}
                </div>

                <div className="pt-4 border-t border-paper-300/60">
                  <p className="text-[10px] tracking-widest text-ink-400 font-medium mb-3">CATEGORIES</p>
                  <div className="grid grid-cols-2 gap-2 text-xs text-ink-700">
                    <button
                      onClick={() => handleNavClick('/shop?category=OUTER')}
                      className="text-left py-1 hover:text-ink-900"
                    >
                      아우터 (OUTER)
                    </button>
                    <button
                      onClick={() => handleNavClick('/shop?category=TOP')}
                      className="text-left py-1 hover:text-ink-900"
                    >
                      상의 (TOP)
                    </button>
                    <button
                      onClick={() => handleNavClick('/shop?category=BOTTOM')}
                      className="text-left py-1 hover:text-ink-900"
                    >
                      하의 (BOTTOM)
                    </button>
                    <button
                      onClick={() => handleNavClick('/shop?category=ACCESSORIES')}
                      className="text-left py-1 hover:text-ink-900"
                    >
                      액세서리 (ACC)
                    </button>
                    <button
                      onClick={() => handleNavClick('/shop?category=LIFESTYLE')}
                      className="text-left py-1 hover:text-ink-900"
                    >
                      라이프스타일
                    </button>
                  </div>
                </div>

                <div className="pt-4 border-t border-paper-300/60">
                  <p className="text-[10px] tracking-widest text-ink-400 font-medium mb-2">SERVICES</p>
                  <div className="space-y-2 text-xs text-ink-600">
                    <button onClick={() => handleNavClick('/wishlist')} className="block py-0.5">
                      찜한 상품 ({wishlistIds.length})
                    </button>
                    <button onClick={() => handleNavClick('/orders')} className="block py-0.5">
                      주문 및 배송 조회
                    </button>
                    <button onClick={() => handleNavClick('/notice')} className="block py-0.5">
                      공지사항
                    </button>
                    <button onClick={() => handleNavClick('/faq')} className="block py-0.5">
                      자주 묻는 질문 (FAQ)
                    </button>
                    <button onClick={() => handleNavClick('/contact')} className="block py-0.5">
                      1:1 고객 문의
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Admin Link & Brand tagline */}
            <div className="pt-6 border-t border-paper-300">
              <button
                onClick={() => handleNavClick('/admin')}
                className="flex items-center justify-between w-full text-xs text-ink-500 hover:text-ink-900 py-1"
              >
                <span>관리자 시스템 (Admin)</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
              <p className="text-[10px] text-ink-400 mt-2 font-serif-kr">
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
