import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { useToast } from './ToastContext';
import { useProducts } from './ProductContext';
import { useAuth } from './AuthContext';
import { Product } from '../types';
import { dbService } from '../services/dbService';
import { isSupabaseConfigured } from '../lib/supabaseClient';

interface WishlistContextType {
  wishlistIds: string[];
  wishlistProducts: Product[];
  toggleWishlist: (productId: string) => void;
  isInWishlist: (productId: string) => boolean;
  removeFromWishlist: (productId: string) => void;
  clearWishlist: () => void;
  syncWishlistToDb: () => Promise<{ success: boolean; message: string }>;
  isSyncingWishlist: boolean;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);
const WISHLIST_STORAGE_KEY = 'jeonju_lee_wishlist_v1';

export const WishlistProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { showToast } = useToast();
  const { products } = useProducts();
  const { user } = useAuth();
  const [isSyncingWishlist, setIsSyncingWishlist] = useState(false);

  const currentUserId = user?.id || 'guest';
  const currentUserEmail = user?.email || 'guest@jeonjulee.kr';
  const currentUserName = user?.name || '비회원 고객';

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

  // Supabase wishlist_items 초기 로드 및 자동 동기화
  useEffect(() => {
    if (!isSupabaseConfigured() || products.length === 0) return;
    let cancelled = false;

    const loadOrSyncWishlist = async () => {
      const cloudIds = await dbService.fetchWishlistItems(currentUserId);
      if (cancelled) return;

      if (cloudIds && cloudIds.length > 0) {
        setWishlistIds(cloudIds);
      } else if (wishlistIds.length > 0) {
        // 클라우드에 해당 유저 데이터가 아직 없으면 현재 찜 목록을 자동 업로드
        const targetProducts = products.filter((p) => wishlistIds.includes(p.id));
        if (targetProducts.length > 0) {
          await dbService.syncWishlistToSupabase({
            userId: currentUserId,
            userEmail: currentUserEmail,
            userName: currentUserName,
            products: targetProducts,
          });
        }
      }
    };

    loadOrSyncWishlist();
    return () => {
      cancelled = true;
    };
  }, [currentUserId, products.length]);

  const isInWishlist = (productId: string) => wishlistIds.includes(productId);

  const toggleWishlist = (productId: string) => {
    const product = products.find((p) => p.id === productId);
    const prodName = product ? product.name : '상품';

    if (isInWishlist(productId)) {
      setWishlistIds((prev) => prev.filter((id) => id !== productId));
      showToast(`"${prodName}" 찜 목록(DB)에서 제외되었습니다.`, 'info');
      void dbService.deleteWishlistItem(currentUserId, productId);
    } else {
      setWishlistIds((prev) => [...prev, productId]);
      showToast(`"${prodName}" 찜 목록(Supabase DB)에 저장되었습니다.`, 'success');
      if (product) {
        void dbService.saveWishlistItem({
          userId: currentUserId,
          userEmail: currentUserEmail,
          userName: currentUserName,
          product,
        });
      }
    }
  };

  const removeFromWishlist = (productId: string) => {
    setWishlistIds((prev) => prev.filter((id) => id !== productId));
    showToast('찜 목록(Supabase DB)에서 삭제되었습니다.', 'info');
    void dbService.deleteWishlistItem(currentUserId, productId);
  };

  const clearWishlist = () => {
    setWishlistIds([]);
    showToast('찜한 상품 목록이 모두 비워졌습니다.', 'info');
    void dbService.clearWishlistItems(currentUserId);
  };

  const wishlistProducts = products.filter((p) => wishlistIds.includes(p.id));

  const syncWishlistToDb = useCallback(async () => {
    setIsSyncingWishlist(true);
    try {
      const res = await dbService.syncWishlistToSupabase({
        userId: currentUserId,
        userEmail: currentUserEmail,
        userName: currentUserName,
        products: wishlistProducts,
      });
      return { success: res.success, message: res.message };
    } finally {
      setIsSyncingWishlist(false);
    }
  }, [currentUserId, currentUserEmail, currentUserName, wishlistProducts]);

  return (
    <WishlistContext.Provider
      value={{
        wishlistIds,
        wishlistProducts,
        toggleWishlist,
        isInWishlist,
        removeFromWishlist,
        clearWishlist,
        syncWishlistToDb,
        isSyncingWishlist,
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
