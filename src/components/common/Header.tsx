import React, { useState, useEffect } from 'react';
import { Search, User, Heart, ShoppingBag, Menu, X, ArrowRight } from 'lucide-react';
import { Logo } from './Logo';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import { useAuth } from '../../context/AuthContext';

interface HeaderProps {
  currentPath: string;
  navigate: (path: string) => void;
  openSearch: () => void;
}

export const Header: React.FC<HeaderProps> = ({ currentPath, navigate, openSearch }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { totalItemCount } = useCart();
  const { wishlistIds } = useWishlist();
  const { isLoggedIn, user } = useAuth();

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
            <div className="flex items-center space-x-4 sm:space-x-6">
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
                onClick={() => handleNavClick(isLoggedIn ? '/mypage' : '/login')}
                className="hidden sm:flex items-center p-1 text-ink-900 hover:opacity-60 transition-opacity relative"
                aria-label="마이페이지"
                title={isLoggedIn ? `${user?.name}님 마이페이지` : '로그인'}
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
                      onClick={() => handleNavClick('/login')}
                      className="text-xs font-medium text-ink-900 border border-ink-900 px-3 py-1.5"
                    >
                      로그인
                    </button>
                    <button
                      onClick={() => handleNavClick('/signup')}
                      className="text-xs text-ink-600 hover:text-ink-900"
                    >
                      회원가입 (3,000P 지급)
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
    </>
  );
};
