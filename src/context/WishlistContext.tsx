import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useToast } from './ToastContext';
import { useProducts } from './ProductContext';
import { Product } from '../types';

interface WishlistContextType {
  wishlistIds: string[];
  wishlistProducts: Product[];
  toggleWishlist: (productId: string) => void;
  isInWishlist: (productId: string) => boolean;
  removeFromWishlist: (productId: string) => void;
  clearWishlist: () => void;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);
const WISHLIST_STORAGE_KEY = 'jeonju_lee_wishlist_v1';

export const WishlistProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { showToast } = useToast();
  const { products } = useProducts();
  const [wishlistIds, setWishlistIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(WISHLIST_STORAGE_KEY);
      return saved ? JSON.parse(saved) : ['jl-out-01', 'jl-top-01'];
    } catch {
      return ['jl-out-01', 'jl-top-01'];
    }
  });

  useEffect(() => {
    localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(wishlistIds));
  }, [wishlistIds]);

  const isInWishlist = (productId: string) => wishlistIds.includes(productId);

  const toggleWishlist = (productId: string) => {
    const product = products.find((p) => p.id === productId);
    const prodName = product ? product.name : '상품';

    if (isInWishlist(productId)) {
      setWishlistIds((prev) => prev.filter((id) => id !== productId));
      showToast(`"${prodName}" 찜 목록에서 제외되었습니다.`, 'info');
    } else {
      setWishlistIds((prev) => [...prev, productId]);
      showToast(`"${prodName}" 찜 목록에 보관되었습니다.`, 'success');
    }
  };

  const removeFromWishlist = (productId: string) => {
    setWishlistIds((prev) => prev.filter((id) => id !== productId));
    showToast('찜 목록에서 삭제되었습니다.', 'info');
  };

  const clearWishlist = () => {
    setWishlistIds([]);
  };

  const wishlistProducts = products.filter((p) => wishlistIds.includes(p.id));

  return (
    <WishlistContext.Provider
      value={{
        wishlistIds,
        wishlistProducts,
        toggleWishlist,
        isInWishlist,
        removeFromWishlist,
        clearWishlist,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used within WishlistProvider');
  }
  return context;
};
