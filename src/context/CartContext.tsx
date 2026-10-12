import React, { createContext, useContext, useState, useEffect, useMemo, useCallback, ReactNode } from 'react';
import { CartItem, Product, ProductColor, Coupon } from '../types';
import { INITIAL_COUPONS } from '../data/mockData';
import { useToast } from './ToastContext';
import { useAuth } from './AuthContext';
import { useProducts } from './ProductContext';
import { dbService } from '../services/dbService';
import { isSupabaseConfigured } from '../lib/supabaseClient';

interface CartContextType {
  items: CartItem[];
  addToCart: (product: Product, color: ProductColor, size: string, quantity?: number) => void;
  updateQuantity: (id: string, delta: number) => void;
  setQuantity: (id: string, qty: number) => void;
  removeFromCart: (id: string) => void;
  removeSelected: () => void;
  toggleSelect: (id: string) => void;
  selectAll: (selected: boolean) => void;
  clearCart: () => void;
  syncCartToDb: () => Promise<{ success: boolean; message: string }>;
  isSyncingCart: boolean;
  // Coupon
  appliedCoupon: Coupon | null;
  applyCoupon: (code: string) => boolean;
  removeCoupon: () => void;
  availableCoupons: Coupon[];
  // Calculations
  totalItemCount: number;
  totalProductPrice: number;
  couponDiscount: number;
  shippingFee: number;
  finalPrice: number;
  freeShippingProgress: number; // 0 to 100%
  amountUntilFreeShipping: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);
const CART_STORAGE_KEY = 'jeonju_lee_cart_v1';
const FREE_SHIPPING_THRESHOLD = 100000;
const BASE_SHIPPING_FEE = 3000;

export const CartProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { showToast } = useToast();
  const { user } = useAuth();
  const { products } = useProducts();
  const [isSyncingCart, setIsSyncingCart] = useState(false);

  const currentUserId = user?.id || 'guest';
  const currentUserEmail = user?.email || 'guest@jeonjulee.kr';
  const currentUserName = user?.name || '비회원 고객';

  const [items, setItems] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem(CART_STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);

  useEffect(() => {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  // Supabase cart_items 초기 로드 및 자동 동기화
  useEffect(() => {
    if (!isSupabaseConfigured() || products.length === 0) return;
    let cancelled = false;

    const loadOrSyncCart = async () => {
      const cloudItems = await dbService.fetchCartItems(currentUserId, products);
      if (cancelled) return;

      if (cloudItems && cloudItems.length > 0) {
        setItems(cloudItems);
      } else if (items.length > 0) {
        // 클라우드에 해당 유저 장바구니가 아직 없으면 현재 장바구니 자동 업로드
        await dbService.syncCartToSupabase({
          userId: currentUserId,
          userEmail: currentUserEmail,
          userName: currentUserName,
          items,
        });
      }
    };

    loadOrSyncCart();
    return () => {
      cancelled = true;
    };
  }, [currentUserId, products.length]);

  const addToCart = (product: Product, color: ProductColor, size: string, quantity = 1) => {
    const existingIndex = items.findIndex(
      (item) =>
        item.productId === product.id &&
        item.selectedColor.name === color.name &&
        item.selectedSize === size
    );

    if (existingIndex > -1) {
      const updatedItem: CartItem = {
        ...items[existingIndex],
        quantity: items[existingIndex].quantity + quantity,
      };
      setItems((prev) =>
        prev.map((item, index) => (index === existingIndex ? updatedItem : item))
      );
      void dbService.saveCartItem({
        userId: currentUserId,
        userEmail: currentUserEmail,
        userName: currentUserName,
        item: updatedItem,
      });
    } else {
      const newItem: CartItem = {
        id: `${currentUserId}_${product.id}_${color.name}_${size}`,
        productId: product.id,
        product,
        selectedColor: color,
        selectedSize: size,
        quantity,
        selected: true,
      };
      setItems((prev) => [newItem, ...prev]);
      void dbService.saveCartItem({
        userId: currentUserId,
        userEmail: currentUserEmail,
        userName: currentUserName,
        item: newItem,
      });
    }

    showToast(`"${product.name}" 장바구니(Supabase DB)에 담겼습니다.`, 'success');
  };

  const updateQuantity = (id: string, delta: number) => {
    const target = items.find((i) => i.id === id);
    if (!target) return;
    const newQty = target.quantity + delta;
    if (newQty <= 0) {
      setItems((prev) => prev.filter((item) => item.id !== id));
      void dbService.deleteCartItem(id);
      return;
    }
    const updatedItem = { ...target, quantity: newQty };
    setItems((prev) => prev.map((item) => (item.id === id ? updatedItem : item)));
    void dbService.saveCartItem({
      userId: currentUserId,
      userEmail: currentUserEmail,
      userName: currentUserName,
      item: updatedItem,
    });
  };

  const setQuantity = (id: string, qty: number) => {
    if (qty <= 0) {
      removeFromCart(id);
      return;
    }
    const target = items.find((i) => i.id === id);
    if (!target) return;
    const updatedItem = { ...target, quantity: qty };
    setItems((prev) => prev.map((item) => (item.id === id ? updatedItem : item)));
    void dbService.saveCartItem({
      userId: currentUserId,
      userEmail: currentUserEmail,
      userName: currentUserName,
      item: updatedItem,
    });
  };

  const removeFromCart = (id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
    showToast('선택한 상품이 장바구니(Supabase DB)에서 삭제되었습니다.', 'info');
    void dbService.deleteCartItem(id);
  };

  const removeSelected = () => {
    const selectedIds = items.filter((item) => item.selected !== false).map((item) => item.id);
    setItems((prev) => prev.filter((item) => !item.selected));
    showToast('선택된 상품들이 장바구니(Supabase DB)에서 삭제되었습니다.', 'info');
    void dbService.deleteCartItems(selectedIds);
  };

  const toggleSelect = (id: string) => {
    const target = items.find((i) => i.id === id);
    if (!target) return;
    const updatedItem = { ...target, selected: !target.selected };
    setItems((prev) => prev.map((item) => (item.id === id ? updatedItem : item)));
    void dbService.saveCartItem({
      userId: currentUserId,
      userEmail: currentUserEmail,
      userName: currentUserName,
      item: updatedItem,
    });
  };

  const selectAll = (selected: boolean) => {
    const nextItems = items.map((item) => ({ ...item, selected }));
    setItems(nextItems);
    void dbService.syncCartToSupabase({
      userId: currentUserId,
      userEmail: currentUserEmail,
      userName: currentUserName,
      items: nextItems,
    });
  };

  const clearCart = () => {
    setItems([]);
    setAppliedCoupon(null);
    void dbService.clearCartItems(currentUserId);
  };

  const syncCartToDb = useCallback(async () => {
    setIsSyncingCart(true);
    try {
      const res = await dbService.syncCartToSupabase({
        userId: currentUserId,
        userEmail: currentUserEmail,
        userName: currentUserName,
        items,
      });
      return { success: res.success, message: res.message };
    } finally {
      setIsSyncingCart(false);
    }
  }, [currentUserId, currentUserEmail, currentUserName, items]);

  // Calculations for selected items
  const selectedItems = useMemo(
    () => items.filter((item) => item.selected !== false),
    [items]
  );

  const totalItemCount = useMemo(
    () => items.reduce((acc, item) => acc + item.quantity, 0),
    [items]
  );

  const totalProductPrice = useMemo(
    () =>
      selectedItems.reduce(
        (acc, item) => acc + item.product.price * item.quantity,
        0
      ),
    [selectedItems]
  );

  const couponDiscount = useMemo(() => {
    if (!appliedCoupon || totalProductPrice === 0) return 0;
    const minPrice = appliedCoupon.minOrderPrice ?? appliedCoupon.minOrderAmount ?? 0;
    if (totalProductPrice < minPrice) return 0;
    if (appliedCoupon.discountType === 'PERCENT' || appliedCoupon.discountType === 'percentage') {
      return Math.round((totalProductPrice * appliedCoupon.discountValue) / 100);
    }
    return appliedCoupon.discountValue;
  }, [appliedCoupon, totalProductPrice]);

  const shippingFee = useMemo(() => {
    if (totalProductPrice === 0) return 0;
    return totalProductPrice >= FREE_SHIPPING_THRESHOLD ? 0 : BASE_SHIPPING_FEE;
  }, [totalProductPrice]);

  const finalPrice = Math.max(0, totalProductPrice - couponDiscount + shippingFee);

  const freeShippingProgress = Math.min(
    100,
    Math.round((totalProductPrice / FREE_SHIPPING_THRESHOLD) * 100)
  );

  const amountUntilFreeShipping = Math.max(
    0,
    FREE_SHIPPING_THRESHOLD - totalProductPrice
  );

  const applyCoupon = (code: string): boolean => {
    const found = INITIAL_COUPONS.find(
      (c) => c.code.toUpperCase() === code.trim().toUpperCase()
    );
    if (!found) {
      showToast('유효하지 않은 쿠폰 코드입니다.', 'error');
      return false;
    }
    const minPrice = found.minOrderPrice ?? found.minOrderAmount ?? 0;
    if (totalProductPrice < minPrice) {
      showToast(
        `이 쿠폰은 ${minPrice.toLocaleString()}원 이상 구매 시 사용 가능합니다.`,
        'error'
      );
      return false;
    }
    setAppliedCoupon(found);
    showToast(`'${found.title || found.name}' 쿠폰이 적용되었습니다.`, 'success');
    return true;
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    showToast('쿠폰 적용이 해제되었습니다.', 'info');
  };

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        updateQuantity,
        setQuantity,
        removeFromCart,
        removeSelected,
        toggleSelect,
        selectAll,
        clearCart,
        syncCartToDb,
        isSyncingCart,
        appliedCoupon,
        applyCoupon,
        removeCoupon,
        availableCoupons: INITIAL_COUPONS,
        totalItemCount,
        totalProductPrice,
        couponDiscount,
        shippingFee,
        finalPrice,
        freeShippingProgress,
        amountUntilFreeShipping,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within CartProvider');
  }
  return context;
};
