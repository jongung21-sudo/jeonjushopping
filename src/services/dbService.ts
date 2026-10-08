import { getSupabaseClient, isSupabaseConfigured } from '../lib/supabaseClient';
import { Order, ProductReview, BoardPost, MaterialItem, PurchaseOrder, TaxInvoice, PointTransaction } from '../types';
import { INITIAL_MATERIALS, INITIAL_PURCHASE_ORDERS, INITIAL_TAX_INVOICES, INITIAL_POSTS } from '../data/communityData';

// 1. 주문 데이터 동기화
export const dbService = {
  // 주문 생성
  async createOrder(order: Order): Promise<boolean> {
    if (!isSupabaseConfigured()) return false;
    try {
      const client = getSupabaseClient();
      const { error } = await client.from('orders').insert([
        {
          id: order.id,
          order_number: order.orderNumber,
          order_date: order.orderDate,
          items: order.items,
          total_product_price: order.totalProductPrice,
          discount_price: order.discountPrice,
          used_points: order.usedPoints,
          coupon_discount: order.couponDiscount || 0,
          coupon_code: order.couponCode || '',
          shipping_fee: order.shippingFee,
          final_price: order.finalPrice,
          status: order.status,
          recipient_name: order.recipientName,
          recipient_phone: order.recipientPhone,
          postal_code: order.postalCode,
          address: order.address,
          detail_address: order.detailAddress,
          delivery_memo: order.deliveryMemo || order.deliveryRequest || '',
          payment_method: order.paymentMethod,
          refund_status: order.refundStatus || 'none',
          refund_reason: order.refundReason || '',
          refund_account: order.refundAccount || null,
        },
      ]);
      return !error;
    } catch (e) {
      console.warn('Supabase createOrder fallback:', e);
      return false;
    }
  },

  // 주문 상태 업데이트 (배송, 취소, 환불 등)
  async updateOrderStatus(orderId: string, updates: Partial<Order>): Promise<boolean> {
    if (!isSupabaseConfigured()) return false;
    try {
      const client = getSupabaseClient();
      const payload: any = {};
      if (updates.status) payload.status = updates.status;
      if (updates.trackingCarrier) payload.tracking_carrier = updates.trackingCarrier;
      if (updates.trackingNumber) payload.tracking_number = updates.trackingNumber;
      if (updates.refundStatus) payload.refund_status = updates.refundStatus;
      if (updates.refundReason) payload.refund_reason = updates.refundReason;
      if (updates.refundAccount) payload.refund_account = updates.refundAccount;

      const { error } = await client.from('orders').update(payload).eq('id', orderId);
      return !error;
    } catch (e) {
      console.warn('Supabase updateOrderStatus fallback:', e);
      return false;
    }
  },

  // 리뷰 등록
  async addReview(review: ProductReview): Promise<boolean> {
    if (!isSupabaseConfigured()) return false;
    try {
      const client = getSupabaseClient();
      const { error } = await client.from('reviews').insert([
        {
          id: review.id,
          product_id: review.productId,
          user_id: review.userId || null,
          user_name: review.userName,
          rating: review.rating,
          comment: review.comment,
          fit_feedback: review.fitFeedback || '',
          images: review.images || [],
          likes_count: review.likesCount || 0,
          helpful_count: review.helpfulCount || 0,
        },
      ]);
      return !error;
    } catch (e) {
      console.warn('Supabase addReview fallback:', e);
      return false;
    }
  },

  // Q&A / 1:1 문의글 작성
  async createBoardPost(post: BoardPost): Promise<boolean> {
    if (!isSupabaseConfigured()) return false;
    try {
      const client = getSupabaseClient();
      const { error } = await client.from('board_posts').insert([
        {
          id: post.id,
          board_type: post.boardType,
          title: post.title,
          content: post.content,
          author_name: post.authorName,
          author_email: post.authorEmail || '',
          is_secret: Boolean(post.isSecret),
          secret_password: post.secretPassword || '',
          status: post.status || 'pending',
          answer: post.answer || '',
        },
      ]);
      return !error;
    } catch (e) {
      console.warn('Supabase createBoardPost fallback:', e);
      return false;
    }
  },

  // 포인트 변동 기록 (신규가입 5000P, 구매적립 1%, 리뷰 1000P, 결제차감)
  async recordPointTransaction(transaction: PointTransaction): Promise<boolean> {
    if (!isSupabaseConfigured()) return false;
    try {
      const client = getSupabaseClient();
      const { error } = await client.from('points_ledger').insert([
        {
          id: transaction.id,
          amount: transaction.amount,
          reason: transaction.reason,
          balance_after: transaction.balanceAfter,
          type: transaction.type || (transaction.amount > 0 ? 'EARN' : 'USE'),
        },
      ]);
      return !error;
    } catch (e) {
      console.warn('Supabase recordPointTransaction fallback:', e);
      return false;
    }
  },

  // 세금명세서/계산서 발급 저장
  async saveTaxInvoice(tax: TaxInvoice): Promise<boolean> {
    if (!isSupabaseConfigured()) return false;
    try {
      const client = getSupabaseClient();
      const { error } = await client.from('tax_invoices').insert([
        {
          id: tax.id,
          invoice_number: tax.invoiceNumber,
          order_id: tax.orderId,
          issue_date: tax.issueDate,
          supplier_info: tax.supplierInfo,
          recipient_info: tax.recipientInfo,
          supply_amount: tax.supplyAmount,
          tax_amount: tax.taxAmount,
          total_amount: tax.totalAmount,
          status: tax.status,
        },
      ]);
      return !error;
    } catch (e) {
      console.warn('Supabase saveTaxInvoice fallback:', e);
      return false;
    }
  },
};
