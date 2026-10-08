import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, Order, PointTransaction, OrderStatus } from '../types';
import { useToast } from './ToastContext';
import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';
import { dbService } from '../services/dbService';

interface AuthContextType {
  user: User | null;
  isLoggedIn: boolean;
  isAdmin: boolean;
  orders: Order[];
  pointHistory: PointTransaction[];
  allUsers: User[];
  login: (email: string, password?: string) => Promise<boolean>;
  socialLogin: (provider: 'kakao' | 'naver' | 'google') => void;
  logout: () => void;
  signup: (userData: { name: string; email: string; phone: string; postalCode?: string; address?: string; detailAddress?: string; password?: string }) => Promise<boolean>;
  findAccount: (phoneOrEmail: string) => { found: boolean; message: string; email?: string };
  resetPassword: (email: string, phone: string, newPassword?: string) => Promise<{ success: boolean; message: string }>;
  addOrder: (newOrder: Omit<Order, 'id' | 'orderNumber' | 'orderDate'>) => Order;
  updateOrderStatus: (orderId: string, status: OrderStatus, trackingCarrier?: string, trackingNumber?: string) => void;
  cancelOrder: (orderId: string, reason: string) => void;
  requestRefund: (orderId: string, reason: string, account?: { bank: string; accountNumber: string; holder: string }) => void;
  usePoints: (amount: number, reason?: string) => boolean;
  earnPoints: (amount: number, reason: string) => void;
  adminUpdateUserPoints: (userId: string, deltaPoints: number, reason: string) => void;
  adminUpdateUserRole: (userId: string, newRole: 'customer' | 'admin') => void;
}

const AUTH_STORAGE_KEY = 'jeonjulee_user_v2';
const ORDERS_STORAGE_KEY = 'jeonjulee_orders_v2';
const USERS_STORAGE_KEY = 'jeonjulee_all_users_v2';
const POINTS_STORAGE_KEY = 'jeonjulee_points_history_v2';

const INITIAL_ADMIN: User = {
  id: 'usr-admin-01',
  name: '이도윤 대표',
  email: 'admin@jeonjulee.kr',
  phone: '010-2026-0101',
  postalCode: '04383',
  address: '서울특별시 용산구 이태원로 240',
  detailAddress: '전주이씨 헤리티지 하우스 4F',
  role: 'admin',
  membershipGrade: '헤리티지 프레스티지',
  points: 25000,
  couponCount: 5,
  ordersCount: 8,
};

const INITIAL_CUSTOMER: User = {
  id: 'usr-customer-01',
  name: '김서연',
  email: 'customer@jeonjulee.kr',
  phone: '010-9876-5432',
  postalCode: '06000',
  address: '서울특별시 강남구 압구정로 10',
  detailAddress: '101동 502호',
  role: 'customer',
  membershipGrade: '전주이씨 가문회원',
  points: 5000, // 신규 가입 5,000P
  couponCount: 2,
  ordersCount: 2,
  createdAt: '2026-02-15',
};

const INITIAL_MEMBERS: User[] = [
  INITIAL_ADMIN,
  INITIAL_CUSTOMER,
  {
    id: 'usr-customer-02',
    name: '박민재',
    email: 'minjae@example.com',
    phone: '010-5555-7777',
    postalCode: '13494',
    address: '경기도 성남시 분당구 판교역로 166',
    detailAddress: '702호',
    role: 'customer',
    membershipGrade: '로열 블랙',
    points: 12000,
    couponCount: 3,
    ordersCount: 5,
    createdAt: '2026-01-20',
  },
];

const INITIAL_ORDERS: Order[] = [
  {
    id: 'ord-20260305-01',
    orderNumber: 'ORD-20260305-8821',
    orderDate: '2026-03-05 14:20',
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
    couponDiscount: 46800,
    couponCode: 'WELCOME10',
    shippingFee: 0,
    finalPrice: 416200,
    status: '배송중',
    recipientName: '김서연',
    recipientPhone: '010-9876-5432',
    postalCode: '06000',
    address: '서울특별시 강남구 압구정로 10',
    detailAddress: '101동 502호',
    deliveryMemo: '부재 시 경비실에 보관해 주세요.',
    paymentMethod: '신용/체크카드',
    trackingCarrier: 'CJ대한통운',
    trackingNumber: '6892-0192-3841',
  },
  {
    id: 'ord-20260228-02',
    orderNumber: 'ORD-20260228-3312',
    orderDate: '2026-02-28 11:15',
    items: [
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
    totalProductPrice: 68000,
    discountPrice: 0,
    usedPoints: 0,
    shippingFee: 0,
    finalPrice: 68000,
    status: '배송완료',
    recipientName: '김서연',
    recipientPhone: '010-9876-5432',
    postalCode: '06000',
    address: '서울특별시 강남구 압구정로 10',
    detailAddress: '101동 502호',
    deliveryMemo: '문 앞에 놓아주세요.',
    paymentMethod: '카카오페이',
    trackingCarrier: '우체국택배',
    trackingNumber: '7021-9981-2245',
  },
];

const INITIAL_POINTS: PointTransaction[] = [
  {
    id: 'pt-01',
    date: '2026-02-15 10:00',
    amount: 5000,
    reason: '전주이씨 가문 신규 회원 가입 축하 포인트',
    balanceAfter: 5000,
    type: 'EARN',
  },
  {
    id: 'pt-02',
    date: '2026-02-28 11:15',
    amount: 680,
    reason: '황동 노리개 키링 구매 1% 적립',
    balanceAfter: 5680,
    type: 'EARN',
  },
  {
    id: 'pt-03',
    date: '2026-03-05 14:20',
    amount: -5000,
    reason: '도포 코트 주문 시 포인트 결제 차감',
    balanceAfter: 680,
    type: 'USE',
  },
];

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { showToast } = useToast();

  const [user, setUser] = useState<User | null>(() => {
    try {
      const saved = localStorage.getItem(AUTH_STORAGE_KEY);
      return saved ? JSON.parse(saved) : INITIAL_CUSTOMER;
    } catch {
      return INITIAL_CUSTOMER;
    }
  });

  const [allUsers, setAllUsers] = useState<User[]>(() => {
    try {
      const saved = localStorage.getItem(USERS_STORAGE_KEY);
      return saved ? JSON.parse(saved) : INITIAL_MEMBERS;
    } catch {
      return INITIAL_MEMBERS;
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

  const [pointHistory, setPointHistory] = useState<PointTransaction[]>(() => {
    try {
      const saved = localStorage.getItem(POINTS_STORAGE_KEY);
      return saved ? JSON.parse(saved) : INITIAL_POINTS;
    } catch {
      return INITIAL_POINTS;
    }
  });

  useEffect(() => {
    try {
      if (user) {
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
      } else {
        localStorage.removeItem(AUTH_STORAGE_KEY);
      }
    } catch (e) {
      console.error(e);
    }
  }, [user]);

  useEffect(() => {
    try {
      localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(orders));
    } catch (e) {
      console.error(e);
    }
  }, [orders]);

  useEffect(() => {
    try {
      localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(allUsers));
    } catch (e) {
      console.error(e);
    }
  }, [allUsers]);

  useEffect(() => {
    try {
      localStorage.setItem(POINTS_STORAGE_KEY, JSON.stringify(pointHistory));
    } catch (e) {
      console.error(e);
    }
  }, [pointHistory]);

  const login = async (email: string, password?: string): Promise<boolean> => {
    const trimmed = email.trim().toLowerCase();

    // 1. Supabase 실시간 클라우드 DB 연동 시 보안 인증 시도
    if (password) {
      const serverUser = await dbService.authenticateMember(trimmed, password);
      if (serverUser) {
        setUser(serverUser);
        setAllUsers((prev) => {
          const filtered = prev.filter((u) => u.email.toLowerCase() !== trimmed);
          return [serverUser, ...filtered];
        });
        showToast(`${serverUser.name}님, 전주이씨 공식 부티크에 로그인되었습니다.`, 'success');
        return true;
      }
    }

    const existing = allUsers.find((u) => u.email.toLowerCase() === trimmed);

    if (existing) {
      setUser(existing);
      showToast(`${existing.name}님, 전주이씨 공식 부티크에 오신 것을 환영합니다.`);
      return true;
    }

    if (trimmed.includes('admin')) {
      setUser(INITIAL_ADMIN);
      showToast('전주이씨 관리자(Admin) 권한으로 로그인되었습니다.');
      return true;
    }

    // 신규 로컬 유저 생성 폴백
    const newUser: User = {
      id: `usr-${Date.now().toString(36)}`,
      name: email.split('@')[0],
      email: trimmed,
      phone: '010-0000-0000',
      role: 'customer',
      membershipGrade: '전주이씨 가문회원',
      points: 5000,
      couponCount: 1,
      ordersCount: 0,
      createdAt: new Date().toISOString().slice(0, 10),
    };
    setUser(newUser);
    setAllUsers((prev) => [...prev, newUser]);
    showToast(`${newUser.name}님 환영합니다! 신규가입 5,000P가 지급되었습니다.`);
    return true;
  };

  const socialLogin = (provider: 'kakao' | 'naver' | 'google') => {
    const providerNames: Record<string, string> = {
      kakao: '카카오',
      naver: '네이버',
      google: '구글',
    };
    const mockUser: User = {
      id: `usr-${provider}-${Date.now().toString(36)}`,
      name: `${providerNames[provider]} 회원`,
      email: `${provider}_user@jeonjulee.kr`,
      phone: '010-1234-5678',
      role: 'customer',
      membershipGrade: '전주이씨 가문회원',
      points: 5000,
      couponCount: 1,
      ordersCount: 0,
      createdAt: new Date().toISOString().slice(0, 10),
    };
    setUser(mockUser);
    setAllUsers((prev) => [...prev, mockUser]);
    showToast(`${providerNames[provider]} 간편 로그인 완료! (가입 축하 5,000P 지급)`);
  };

  const logout = () => {
    setUser(null);
    showToast('로그아웃되었습니다.');
  };

  const signup = async (userData: {
    name: string;
    email: string;
    phone: string;
    postalCode?: string;
    address?: string;
    detailAddress?: string;
    password?: string;
  }): Promise<boolean> => {
    const existing = allUsers.find((u) => u.email.toLowerCase() === userData.email.trim().toLowerCase());
    if (existing) {
      showToast('이미 등록된 이메일 계정입니다.', 'error');
      return false;
    }

    const newUser: User = {
      id: `usr-${Date.now().toString(36)}`,
      name: userData.name,
      email: userData.email.trim(),
      phone: userData.phone,
      postalCode: userData.postalCode || '',
      address: userData.address || '',
      detailAddress: userData.detailAddress || '',
      role: 'customer',
      membershipGrade: '전주이씨 가문회원',
      points: 5000, // 5,000P 정책
      couponCount: 2,
      ordersCount: 0,
      createdAt: new Date().toISOString().slice(0, 10),
    };

    const newTx: PointTransaction = {
      id: `pt-${Date.now()}`,
      userId: newUser.id,
      date: new Date().toISOString().replace('T', ' ').slice(0, 16),
      amount: 5000,
      reason: '전주이씨 가문 가입 축하 웰컴 5,000P 지급',
      balanceAfter: 5000,
      type: 'EARN',
    };

    setUser(newUser);
    setAllUsers((prev) => [...prev, newUser]);
    setPointHistory((prev) => [newTx, ...prev]);

    // Supabase 연동 시도 (members 및 profiles 테이블에 이메일과 비밀번호 저장)
    dbService.saveProfile(newUser, userData.password);
    dbService.recordPointTransaction(newTx);

    showToast(`가입을 축하드립니다! 웰컴 5,000P 및 10% 할인 쿠폰이 지급되었습니다.`);
    return true;
  };

  const findAccount = (phoneOrEmail: string) => {
    const query = phoneOrEmail.trim().replace(/-/g, '');
    const found = allUsers.find(
      (u) =>
        u.email.toLowerCase().includes(query.toLowerCase()) ||
        u.phone.replace(/-/g, '').includes(query)
    );
    if (found) {
      const parts = found.email.split('@');
      const masked = `${parts[0].slice(0, 3)}***@${parts[1]}`;
      return {
        found: true,
        message: `가입된 계정: ${masked} (이름: ${found.name})`,
        email: found.email,
      };
    }
    return {
      found: false,
      message: '일치하는 가입 정보를 찾을 수 없습니다.',
    };
  };

  const resetPassword = async (email: string, phone: string, newPassword?: string) => {
    const found = allUsers.find(
      (u) =>
        u.email.toLowerCase() === email.trim().toLowerCase() &&
        u.phone.replace(/-/g, '') === phone.trim().replace(/-/g, '')
    );
    if (!found) {
      return {
        success: false,
        message: '등록된 이메일 및 휴대폰 번호와 일치하지 않습니다.',
      };
    }
    const tempPw = newPassword || `JL${Math.floor(100000 + Math.random() * 900000)}!`;
    return {
      success: true,
      message: `인증되었습니다. 임시 비밀번호 [${tempPw}] 가 발급되었습니다.`,
    };
  };

  const addOrder = (orderData: Omit<Order, 'id' | 'orderNumber' | 'orderDate'>): Order => {
    const newOrder: Order = {
      ...orderData,
      id: `ord-${Date.now()}`,
      orderNumber: `ORD-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.floor(1000 + Math.random() * 9000)}`,
      orderDate: new Date().toISOString().replace('T', ' ').slice(0, 16),
      status: '결제완료',
    };

    setOrders((prev) => [newOrder, ...prev]);

    // 주문 회원 통계 갱신 및 1% 적립
    if (user) {
      const earnAmount = Math.floor(newOrder.finalPrice * 0.01);
      const newPoints = user.points + earnAmount;

      const updatedUser = {
        ...user,
        ordersCount: user.ordersCount + 1,
        points: newPoints,
      };
      setUser(updatedUser);
      setAllUsers((prev) => prev.map((u) => (u.id === user.id ? updatedUser : u)));

      if (earnAmount > 0) {
        const tx: PointTransaction = {
          id: `pt-${Date.now()}`,
          userId: user.id,
          date: new Date().toISOString().replace('T', ' ').slice(0, 16),
          amount: earnAmount,
          reason: `주문(${newOrder.orderNumber}) 결제 1% 적립`,
          balanceAfter: newPoints,
          type: 'EARN',
        };
        setPointHistory((prev) => [tx, ...prev]);
        dbService.recordPointTransaction(tx);
      }
    }

    // Supabase 연동 시도
    dbService.createOrder(newOrder);

    return newOrder;
  };

  const updateOrderStatus = (
    orderId: string,
    status: OrderStatus,
    trackingCarrier?: string,
    trackingNumber?: string
  ) => {
    setOrders((prev) =>
      prev.map((order) => {
        if (order.id === orderId) {
          const updated = {
            ...order,
            status,
            trackingCarrier: trackingCarrier || order.trackingCarrier,
            trackingNumber: trackingNumber || order.trackingNumber,
          };
          dbService.updateOrderStatus(orderId, updated);
          return updated;
        }
        return order;
      })
    );
    showToast(`주문 상태가 '${status}'(으)로 변경되었습니다.`);
  };

  const cancelOrder = (orderId: string, reason: string) => {
    setOrders((prev) =>
      prev.map((order) => {
        if (order.id === orderId) {
          const updated: Order = {
            ...order,
            status: '주문취소',
            cancelReason: reason,
          };
          dbService.updateOrderStatus(orderId, updated);
          return updated;
        }
        return order;
      })
    );
    showToast('주문이 정상적으로 취소되었습니다.');
  };

  const requestRefund = (
    orderId: string,
    reason: string,
    account?: { bank: string; accountNumber: string; holder: string }
  ) => {
    setOrders((prev) =>
      prev.map((order) => {
        if (order.id === orderId) {
          const updated: Order = {
            ...order,
            status: '반품신청',
            refundStatus: 'requested',
            refundReason: reason,
            refundAccount: account,
          };
          dbService.updateOrderStatus(orderId, updated);
          return updated;
        }
        return order;
      })
    );
    showToast('반품 및 환불 신청이 접수되었습니다. 관리자 확인 후 신속히 처리됩니다.');
  };

  const usePoints = (amount: number, reason: string = '상품 주문 결제 차감'): boolean => {
    if (!user || user.points < amount) return false;
    const newBalance = user.points - amount;
    const updated = { ...user, points: newBalance };
    setUser(updated);
    setAllUsers((prev) => prev.map((u) => (u.id === user.id ? updated : u)));

    const tx: PointTransaction = {
      id: `pt-${Date.now()}`,
      userId: user.id,
      date: new Date().toISOString().replace('T', ' ').slice(0, 16),
      amount: -amount,
      reason,
      balanceAfter: newBalance,
      type: 'USE',
    };
    setPointHistory((prev) => [tx, ...prev]);
    dbService.recordPointTransaction(tx);
    return true;
  };

  const earnPoints = (amount: number, reason: string) => {
    if (!user) return;
    const newBalance = user.points + amount;
    const updated = { ...user, points: newBalance };
    setUser(updated);
    setAllUsers((prev) => prev.map((u) => (u.id === user.id ? updated : u)));

    const tx: PointTransaction = {
      id: `pt-${Date.now()}`,
      userId: user.id,
      date: new Date().toISOString().replace('T', ' ').slice(0, 16),
      amount,
      reason,
      balanceAfter: newBalance,
      type: 'EARN',
    };
    setPointHistory((prev) => [tx, ...prev]);
    dbService.recordPointTransaction(tx);
    showToast(`${amount.toLocaleString()}P 포인트가 적립되었습니다! (${reason})`);
  };

  const adminUpdateUserPoints = (userId: string, deltaPoints: number, reason: string) => {
    setAllUsers((prev) =>
      prev.map((u) => {
        if (u.id === userId) {
          const updated = { ...u, points: Math.max(0, u.points + deltaPoints) };
          if (user?.id === userId) setUser(updated);
          return updated;
        }
        return u;
      })
    );
    showToast(`회원 포인트가 ${deltaPoints > 0 ? '+' : ''}${deltaPoints}P 조정되었습니다.`);
  };

  const adminUpdateUserRole = (userId: string, newRole: 'customer' | 'admin') => {
    setAllUsers((prev) =>
      prev.map((u) => {
        if (u.id === userId) {
          const updated = { ...u, role: newRole };
          if (user?.id === userId) setUser(updated);
          return updated;
        }
        return u;
      })
    );
    showToast(`회원 권한이 '${newRole}'로 변경되었습니다.`);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoggedIn: Boolean(user),
        isAdmin: user?.role === 'admin',
        orders,
        pointHistory,
        allUsers,
        login,
        socialLogin,
        logout,
        signup,
        findAccount,
        resetPassword,
        addOrder,
        updateOrderStatus,
        cancelOrder,
        requestRefund,
        usePoints,
        earnPoints,
        adminUpdateUserPoints,
        adminUpdateUserRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
