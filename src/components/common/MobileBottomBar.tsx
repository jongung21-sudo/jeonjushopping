import React from 'react';
import { Home, Compass, Search, Heart, ShoppingBag, User } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import { useAuth } from '../../context/AuthContext';

interface MobileBottomBarProps {
  currentPath: string;
  navigate: (path: string) => void;
  openSearch: () => void;
}

export const MobileBottomBar: React.FC<MobileBottomBarProps> = ({
  currentPath,
  navigate,
  openSearch,
}) => {
  const { totalItemCount } = useCart();
  const { wishlistIds } = useWishlist();
  const { isLoggedIn } = useAuth();

  return (
    <nav
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-paper-100/95 backdrop-blur-md border-t border-paper-300 py-1.5 px-3 flex items-center justify-around shadow-[0_-4px_12px_rgba(0,0,0,0.03)]"
      aria-label="모바일 하단 네비게이션"
    >
      {/* Home */}
      <button
        onClick={() => navigate('/')}
        className={`flex flex-col items-center justify-center py-1 px-2 transition-colors ${
          currentPath === '/' ? 'text-ink-900 font-semibold' : 'text-ink-500'
        }`}
      >
        <Home className="w-5 h-5" strokeWidth={1.5} />
        <span className="text-[10px] mt-1 tracking-tight">홈</span>
      </button>

      {/* Shop */}
      <button
        onClick={() => navigate('/shop')}
        className={`flex flex-col items-center justify-center py-1 px-2 transition-colors ${
          currentPath.startsWith('/shop') || currentPath.startsWith('/category')
            ? 'text-ink-900 font-semibold'
            : 'text-ink-500'
        }`}
      >
        <Compass className="w-5 h-5" strokeWidth={1.5} />
        <span className="text-[10px] mt-1 tracking-tight">쇼핑</span>
      </button>

      {/* Search */}
      <button
        onClick={openSearch}
        className="flex flex-col items-center justify-center py-1 px-2 text-ink-500 hover:text-ink-900 transition-colors"
      >
        <Search className="w-5 h-5" strokeWidth={1.5} />
        <span className="text-[10px] mt-1 tracking-tight">검색</span>
      </button>

      {/* Wishlist */}
      <button
        onClick={() => navigate('/wishlist')}
        className={`flex flex-col items-center justify-center py-1 px-2 relative transition-colors ${
          currentPath === '/wishlist' ? 'text-ink-900 font-semibold' : 'text-ink-500'
        }`}
      >
        <Heart className="w-5 h-5" strokeWidth={1.5} />
        {wishlistIds.length > 0 && (
          <span className="absolute top-0.5 right-1.5 min-w-[14px] h-[14px] flex items-center justify-center text-[9px] font-bold text-paper-100 bg-ink-900 px-0.5">
            {wishlistIds.length}
          </span>
        )}
        <span className="text-[10px] mt-1 tracking-tight">찜</span>
      </button>

      {/* Cart */}
      <button
        onClick={() => navigate('/cart')}
        className={`flex flex-col items-center justify-center py-1 px-2 relative transition-colors ${
          currentPath === '/cart' ? 'text-ink-900 font-semibold' : 'text-ink-500'
        }`}
      >
        <ShoppingBag className="w-5 h-5" strokeWidth={1.5} />
        {totalItemCount > 0 && (
          <span className="absolute top-0.5 right-1.5 min-w-[14px] h-[14px] flex items-center justify-center text-[9px] font-bold text-paper-100 bg-lacquer px-0.5">
            {totalItemCount}
          </span>
        )}
        <span className="text-[10px] mt-1 tracking-tight">장바구니</span>
      </button>

      {/* My Page */}
      <button
        onClick={() => navigate(isLoggedIn ? '/mypage' : '/login')}
        className={`flex flex-col items-center justify-center py-1 px-2 transition-colors ${
          currentPath === '/mypage' || currentPath === '/login'
            ? 'text-ink-900 font-semibold'
            : 'text-ink-500'
        }`}
      >
        <User className="w-5 h-5" strokeWidth={1.5} />
        <span className="text-[10px] mt-1 tracking-tight">MY</span>
      </button>
    </nav>
  );
};
