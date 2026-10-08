export type ProductCategory = 
  | 'ALL'
  | 'NEW'
  | 'BEST'
  | 'OUTER'
  | 'TOP'
  | 'BOTTOM'
  | 'ACCESSORIES'
  | 'LIFESTYLE'
  | 'SALE';

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
  category: ProductCategory;
  isNew?: boolean;
  isBest?: boolean;
  isSoldOut?: boolean;
  colors: ProductColor[];
  sizes: string[];
  images: string[];
  thumbnail?: string;
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
  | '입금대기'
  | '결제완료'
  | '상품준비중'
  | '배송중'
  | '배송완료'
  | '구매확정'
  | '주문취소'
  | '취소요청'
  | '취소완료'
  | '교환신청'
  | '반품신청'
  | '환불요청'
  | '환불완료';

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
  couponDiscount?: number;
  couponCode?: string;
  shippingFee: number;
  finalPrice: number;
  status: OrderStatus;
  recipientName: string;
  recipientPhone: string;
  postalCode: string;
  address: string;
  detailAddress: string;
  deliveryRequest?: string;
  deliveryMemo?: string;
  paymentMethod: string;
  trackingCarrier?: string;
  trackingNumber?: string;
  cancelReason?: string;
  refundReason?: string;
  refundAccount?: {
    bank: string;
    accountNumber: string;
    holder: string;
  };
  refundStatus?: 'none' | 'requested' | 'completed';
}

export interface User {
  id: string;
  email: string;
  name: string;
  phone: string;
  postalCode?: string;
  address?: string;
  detailAddress?: string;
  password?: string;
  role: 'customer' | 'admin';
  membershipGrade: '전주이씨 가문회원' | '로열 블랙' | '헤리티지 프레스티지';
  points: number;
  couponCount: number;
  ordersCount: number;
  createdAt?: string;
}

export interface PointTransaction {
  id: string;
  userId?: string;
  date: string;
  amount: number; // +5000, -2000
  type?: 'EARN' | 'USE' | 'REFUND';
  reason: string;
  balanceAfter: number;
}

export interface Coupon {
  id: string;
  code: string;
  name?: string;
  title?: string;
  discountType: 'percentage' | 'fixed' | 'PERCENT' | 'FIXED';
  discountValue: number;
  minOrderPrice?: number;
  minOrderAmount?: number;
  maxDiscount?: number;
  expiresAt: string;
  isUsed?: boolean;
}

export interface ProductReview {
  id: string;
  productId: string;
  userId?: string;
  userName?: string;
  author?: string; // 하위 호환
  rating: number;
  comment?: string;
  content?: string; // 하위 호환
  selectedOption?: string;
  fitFeedback?: string;
  heightWeight?: string;
  images?: string[];
  createdAt?: string;
  date?: string; // 하위 호환
  likesCount?: number;
  helpfulCount?: number;
}

// 하위 호환
export type Review = ProductReview;

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

export interface BoardPost {
  id: string;
  boardType: 'qna' | 'free' | 'reservation' | 'notice';
  title: string;
  content: string;
  authorName: string;
  authorEmail?: string;
  createdAt: string;
  isSecret?: boolean;
  secretPassword?: string;
  status?: 'pending' | 'answered';
  answer?: string;
  answerDate?: string;
  viewCount: number;
  likesCount: number;
  commentsCount?: number;
  reservationNo?: string;
  reservationProcess?: string;
}

export interface MaterialItem {
  id: string;
  code: string;
  name: string;
  category: '원단' | '자수실' | '스트랩/버클' | '라벨/부자재' | '포장재' | '도자기소재';
  unit: string;
  currentStock: number;
  safeStock: number;
  unitCost: number;
  supplier: string;
  updatedAt: string;
}

export interface PurchaseOrder {
  id: string;
  poNumber: string;
  itemType: '완제품의류' | '원부자재' | '라이프스타일소재';
  itemName: string;
  supplier: string;
  quantity: number;
  unitCost: number;
  totalCost: number;
  status: '발주대기' | '발주승인' | '생산중' | '입고완료' | '발주취소';
  expectedDate: string;
  createdAt: string;
}

export interface TaxInvoice {
  id: string;
  invoiceNumber: string;
  orderId: string;
  issueDate: string;
  supplierInfo: {
    bizNumber: string;
    companyName: string;
    ceoName: string;
    address: string;
    bizType: string;
    bizItem: string;
  };
  recipientInfo: {
    bizNumber: string;
    companyName: string;
    ceoName: string;
    email: string;
  };
  supplyAmount: number;
  taxAmount: number;
  totalAmount: number;
  status: '발행완료' | '발행대기' | '취소됨';
}
