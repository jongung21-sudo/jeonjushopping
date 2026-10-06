export type ProductCategory = 
  | 'ALL'
  | 'NEW'
  | 'BEST'
  | 'OUTER'
  | 'TOP'
  | 'BOTTOM'
  | 'ACCESSORIES'
  | 'LIFESTYLE';

export interface ProductColor {
  name: string;
  code: string; // hex
  image?: string;
}

export interface Product {
  id: string;
  name: string;
  engName: string;
  price: number;
  originalPrice?: number;
  category: 'OUTER' | 'TOP' | 'BOTTOM' | 'ACCESSORIES' | 'LIFESTYLE';
  isNew?: boolean;
  isBest?: boolean;
  isSoldOut?: boolean;
  colors: ProductColor[];
  sizes: string[];
  images: string[];
  shortDesc: string;
  detailDesc: string;
  fabric: string;
  fit: string;
  care: string[];
  modelInfo?: string;
  sizeGuide?: {
    chest?: string;
    shoulder?: string;
    length?: string;
    sleeve?: string;
    waist?: string;
    thigh?: string;
  };
  rating: number;
  reviewCount: number;
  salesCount: number;
  createdAt: string;
}

export interface CartItem {
  id: string; // unique cart line id
  productId: string;
  product: Product;
  selectedColor: ProductColor;
  selectedSize: string;
  quantity: number;
  selected?: boolean;
}

export interface WishlistItem {
  productId: string;
  addedAt: string;
}

export type OrderStatus = 
  | '결제완료'
  | '상품준비중'
  | '배송중'
  | '배송완료'
  | '구매확정'
  | '주문취소'
  | '교환신청'
  | '반품신청';

export interface OrderItem {
  productId: string;
  name: string;
  image: string;
  color: string;
  size: string;
  price: number;
  quantity: number;
}

export interface Order {
  id: string;
  orderNumber: string;
  orderDate: string;
  items: OrderItem[];
  totalProductPrice: number;
  discountPrice: number;
  usedPoints: number;
  shippingFee: number;
  finalPrice: number;
  status: OrderStatus;
  recipientName: string;
  recipientPhone: string;
  postalCode: string;
  address: string;
  detailAddress: string;
  deliveryMemo?: string;
  paymentMethod: string;
  trackingNumber?: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  phone: string;
  membershipGrade: '전주이씨 가문회원' | '로열 블랙' | '헤리티지 프레스티지';
  points: number;
  couponCount: number;
  ordersCount: number;
}

export interface Coupon {
  id: string;
  code: string;
  title: string;
  discountType: 'PERCENT' | 'FIXED';
  discountValue: number;
  minOrderPrice: number;
  expiresAt: string;
}

export interface Review {
  id: string;
  productId: string;
  author: string;
  rating: number;
  date: string;
  content: string;
  selectedOption: string;
  heightWeight?: string;
  images?: string[];
  helpfulCount: number;
}

export interface Notice {
  id: string;
  title: string;
  category: 'NOTICE' | 'EVENT' | 'PRESS' | 'DELIVERY';
  date: string;
  isPinned: boolean;
  content: string;
}

export interface FAQItem {
  id: string;
  category: '배송' | '주문/결제' | '교환/환불' | '회원/혜택' | '상품문의';
  question: string;
  answer: string;
}
