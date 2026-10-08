import React, { createContext, useContext, useState, useEffect, useMemo, ReactNode } from 'react';
import { CartItem, Product, ProductColor, Coupon } from '../types';
import { INITIAL_COUPONS } from '../data/mockData';
import { useToast } from './ToastContext';

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

  const addToCart = (product: Product, color: ProductColor, size: string, quantity = 1) => {
    const existingIndex = items.findIndex(
      (item) =>
        item.productId === product.id &&
        item.selectedColor.name === color.name &&
        item.selectedSize === size
    );

    if (existingIndex > -1) {
      setItems((prev) =>
        prev.map((item, index) =>
          index === existingIndex
            ? { ...item, quantity: item.quantity + quantity }
            : item
        )
      );
    } else {
      const newItem: CartItem = {
        id: `${product.id}-${color.name}-${size}-${Date.now()}`,
        productId: product.id,
        product,
        selectedColor: color,
        selectedSize: size,
        quantity,
        selected: true,
      };
      setItems((prev) => [newItem, ...prev]);
    }

    showToast(`"${product.name}" 장바구니에 담겼습니다.`, 'success');
  };

  const updateQuantity = (id: string, delta: number) => {
    setItems((prev) =>
      prev
        .map((item) => {
          if (item.id === id) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean) as CartItem[]
    );
  };

  const setQuantity = (id: string, qty: number) => {
    if (qty <= 0) {
      removeFromCart(id);
      return;
    }
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, quantity: qty } : item))
    );
  };

  const removeFromCart = (id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
    showToast('선택한 상품이 장바구니에서 삭제되었습니다.', 'info');
  };

  const removeSelected = () => {
    setItems((prev) => prev.filter((item) => !item.selected));
    showToast('선택된 상품들이 삭제되었습니다.', 'info');
  };

  const toggleSelect = (id: string) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, selected: !item.selected } : item
      )
    );
  };

  const selectAll = (selected: boolean) => {
    setItems((prev) => prev.map((item) => ({ ...item, selected })));
  };

  const clearCart = () => {
    setItems([]);
    setAppliedCoupon(null);
  };

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
