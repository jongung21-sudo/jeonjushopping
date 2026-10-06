import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, Order } from '../types';
import { useToast } from './ToastContext';

interface AuthContextType {
  user: User | null;
  isLoggedIn: boolean;
  orders: Order[];
  login: (email: string, password?: string) => boolean;
  socialLogin: (provider: 'kakao' | 'naver' | 'google') => void;
  logout: () => void;
  signup: (userData: { name: string; email: string; phone: string; password?: string }) => boolean;
  addOrder: (newOrder: Omit<Order, 'id' | 'orderNumber' | 'orderDate'>) => Order;
  updateOrderStatus: (orderId: string, status: Order['status']) => void;
  usePoints: (amount: number) => boolean;
}

const AUTH_STORAGE_KEY = 'jeonju_lee_user_v1';
const ORDERS_STORAGE_KEY = 'jeonju_lee_orders_v1';

const INITIAL_USER: User = {
  id: 'usr-001',
  name: '이도현',
  email: 'heritage@jeonjulee.kr',
  phone: '010-8521-1392',
  membershipGrade: '전주이씨 가문회원',
  points: 7500,
  couponCount: 2,
  ordersCount: 2,
};

const INITIAL_ORDERS: Order[] = [
  {
    id: 'ord-20260302-01',
    orderNumber: 'JL20260302-8821',
    orderDate: '2026-03-02 14:22',
    items: [
      {
        productId: 'jl-out-01',
        name: '울 캐시미어 릴렉스드 도포 코트',
        image: 'https://images.unsplash.com/photo-1544441893-675973e31985?auto=format&fit=crop&w=600&q=80',
        color: '먹색 (Ink Black)',
        size: 'L (100-105)',
        price: 468000,
        quantity: 1,
      },
    ],
    totalProductPrice: 468000,
    discountPrice: 46800,
    usedPoints: 5000,
    shippingFee: 0,
    finalPrice: 416200,
    status: '배송중',
    recipientName: '이도현',
    recipientPhone: '010-8521-1392',
    postalCode: '04383',
    address: '서울특별시 용산구 이태원로 240',
    detailAddress: '전주이씨 한남 아틀리에 3층',
    paymentMethod: '카카오페이 (간편결제)',
    trackingNumber: 'CJ대한통운 6891-2384-9120',
  },
  {
    id: 'ord-20260214-02',
    orderNumber: 'JL20260214-1920',
    orderDate: '2026-02-14 11:05',
    items: [
      {
        productId: 'jl-top-01',
        name: '스탠드 칼라 한지 옥스포드 셔츠',
        image: 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&w=600&q=80',
        color: '한지 아이보리 (Hanji Ivory)',
        size: 'L (100-105)',
        price: 158000,
        quantity: 1,
      },
      {
        productId: 'jl-acc-01',
        name: '황동 노리개 모티브 레더 키링',
        image: 'https://images.unsplash.com/photo-1627123424574-724758594e93?auto=format&fit=crop&w=600&q=80',
        color: '에이지드 브론즈 (Aged Bronze)',
        size: 'FREE',
        price: 68000,
        quantity: 1,
      },
    ],
    totalProductPrice: 226000,
    discountPrice: 0,
    usedPoints: 0,
    shippingFee: 0,
    finalPrice: 226000,
    status: '배송완료',
    recipientName: '이도현',
    recipientPhone: '010-8521-1392',
    postalCode: '04383',
    address: '서울특별시 용산구 이태원로 240',
    detailAddress: '전주이씨 한남 아틀리에 3층',
    paymentMethod: '신용카드 (현대카드)',
    trackingNumber: 'CJ대한통운 5501-8392-1102',
  },
];

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { showToast } = useToast();
  const [user, setUser] = useState<User | null>(() => {
    try {
      const saved = localStorage.getItem(AUTH_STORAGE_KEY);
      return saved ? JSON.parse(saved) : INITIAL_USER;
    } catch {
      return INITIAL_USER;
    }
  });

  const [orders, setOrders] = useState<Order[]>(() => {
    try {
      const saved = localStorage.getItem(ORDERS_STORAGE_KEY);
      return saved ? JSON.parse(saved) : INITIAL_ORDERS;
    } catch {
      return INITIAL_ORDERS;
    }
  });

  useEffect(() => {
    if (user) {
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(AUTH_STORAGE_KEY);
    }
  }, [user]);

  useEffect(() => {
    localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(orders));
  }, [orders]);

  const login = (email: string, _password?: string): boolean => {
    const newUser: User = {
      id: `usr-${Date.now()}`,
      name: email.split('@')[0] || '가문회원',
      email,
      phone: '010-1234-5678',
      membershipGrade: '전주이씨 가문회원',
      points: 5000,
      couponCount: 2,
      ordersCount: orders.length,
    };
    setUser(newUser);
    showToast(`환영합니다, ${newUser.name}님.`, 'success');
    return true;
  };

  const socialLogin = (provider: 'kakao' | 'naver' | 'google') => {
    const providerName =
      provider === 'kakao' ? '카카오' : provider === 'naver' ? '네이버' : '구글';
    const mockUser: User = {
      id: `usr-${provider}-${Date.now()}`,
      name: `${providerName} 회원`,
      email: `${provider}_user@heritage.kr`,
      phone: '010-9876-5432',
      membershipGrade: '전주이씨 가문회원',
      points: 5000,
      couponCount: 2,
      ordersCount: 0,
    };
    setUser(mockUser);
    showToast(`${providerName} 계정으로 간편 로그인되었습니다.`, 'success');
  };

  const logout = () => {
    setUser(null);
    showToast('로그아웃되었습니다.', 'info');
  };

  const signup = (userData: {
    name: string;
    email: string;
    phone: string;
    password?: string;
  }): boolean => {
    const newUser: User = {
      id: `usr-${Date.now()}`,
      name: userData.name,
      email: userData.email,
      phone: userData.phone,
      membershipGrade: '전주이씨 가문회원',
      points: 3000,
      couponCount: 2,
      ordersCount: 0,
    };
    setUser(newUser);
    showToast(`전주이씨 가문 회원이 되신 것을 환영합니다! (3,000P 지급)`, 'success');
    return true;
  };

  const addOrder = (newOrderData: Omit<Order, 'id' | 'orderNumber' | 'orderDate'>): Order => {
    const now = new Date();
    const dateStr = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(
      now.getDate()
    ).padStart(2, '0')}`;
    const rand = Math.floor(1000 + Math.random() * 9000);

    const completeOrder: Order = {
      ...newOrderData,
      id: `ord-${Date.now()}`,
      orderNumber: `JL${dateStr}-${rand}`,
      orderDate: `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(
        now.getDate()
      ).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(
        now.getMinutes()
      ).padStart(2, '0')}`,
      status: '결제완료',
    };

    setOrders((prev) => [completeOrder, ...prev]);

    if (user) {
      setUser({
        ...user,
        ordersCount: user.ordersCount + 1,
        points: Math.max(0, user.points - (newOrderData.usedPoints || 0) + Math.round(newOrderData.finalPrice * 0.02)),
      });
    }

    return completeOrder;
  };

  const updateOrderStatus = (orderId: string, status: Order['status']) => {
    setOrders((prev) =>
      prev.map((ord) => (ord.id === orderId ? { ...ord, status } : ord))
    );
    showToast(`주문 상태가 '${status}'(으)로 변경되었습니다.`, 'info');
  };

  const usePoints = (amount: number): boolean => {
    if (!user || user.points < amount) return false;
    setUser({ ...user, points: user.points - amount });
    return true;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoggedIn: !!user,
        orders,
        login,
        socialLogin,
        logout,
        signup,
        addOrder,
        updateOrderStatus,
        usePoints,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
