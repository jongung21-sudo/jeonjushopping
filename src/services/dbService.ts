import { getSupabaseClient, isSupabaseConfigured } from '../lib/supabaseClient';
import { User, Product, Order, ProductReview, BoardPost, MaterialItem, PurchaseOrder, TaxInvoice, PointTransaction } from '../types';
import { INITIAL_MATERIALS, INITIAL_PURCHASE_ORDERS, INITIAL_TAX_INVOICES, INITIAL_POSTS } from '../data/communityData';
import { PRODUCTS } from '../data/products';

// 1. 데이터베이스 서비스
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

  // 회원 프로필 저장/업데이트 (members 테이블 및 profiles 테이블에 이메일, 비밀번호 등 실제 저장)
  async saveProfile(user: User, password?: string): Promise<boolean> {
    if (!isSupabaseConfigured()) return false;
    try {
      const client = getSupabaseClient();
      const pwd = password || user.password || '123456';

      // 1. members 테이블에 저장 (사용자가 요청한 회원가입 테이블)
      const { error: memberErr } = await client.from('members').upsert(
        [
          {
            id: user.id,
            email: user.email.trim().toLowerCase(),
            password: pwd,
            name: user.name,
            phone: user.phone || '',
            postal_code: user.postalCode || '',
            address: user.address || '',
            detail_address: user.detailAddress || '',
            points: user.points ?? 5000,
            membership_grade: user.membershipGrade || '전주이씨 가문회원',
            role: user.role || 'customer',
            updated_at: new Date().toISOString(),
          },
        ],
        { onConflict: 'email' }
      );

      // 2. profiles 테이블에도 동기화 (있을 경우)
      await client.from('profiles').upsert([
        {
          id: user.id,
          email: user.email.trim().toLowerCase(),
          password: pwd,
          name: user.name,
          phone: user.phone || '',
          postal_code: user.postalCode || '',
          address: user.address || '',
          detail_address: user.detailAddress || '',
          points: user.points ?? 5000,
          membership_grade: user.membershipGrade || '전주이씨 가문회원',
          role: user.role || 'customer',
          updated_at: new Date().toISOString(),
        },
      ]);

      if (memberErr) {
        console.warn('Supabase members upsert error:', memberErr.message);
        return false;
      }

      return true;
    } catch (e) {
      console.warn('Supabase saveProfile fallback:', e);
      return false;
    }
  },

  // 회원가입 전용: Supabase members 테이블에 이메일 & 비밀번호 실시간 저장 및 상세 결과 반환
  async registerMember(
    user: User,
    password?: string
  ): Promise<{ success: boolean; savedToCloud: boolean; message: string }> {
    if (!isSupabaseConfigured()) {
      return {
        success: true,
        savedToCloud: false,
        message: '로컬에 가입 정보가 저장되었습니다. (상단 [DB 연결 설정]에서 Anon Key를 입력하시면 Supabase에 자동 동기화됩니다)',
      };
    }

    try {
      const client = getSupabaseClient();
      const pwd = password || user.password || '123456';

      const { error } = await client.from('members').upsert(
        [
          {
            id: user.id,
            email: user.email.trim().toLowerCase(),
            password: pwd,
            name: user.name,
            phone: user.phone || '',
            postal_code: user.postalCode || '',
            address: user.address || '',
            detail_address: user.detailAddress || '',
            points: user.points ?? 5000,
            membership_grade: user.membershipGrade || '전주이씨 가문회원',
            role: user.role || 'customer',
            updated_at: new Date().toISOString(),
          },
        ],
        { onConflict: 'email' }
      );

      if (error) {
        console.warn('Supabase registerMember error:', error);
        return {
          success: true,
          savedToCloud: false,
          message: `회원가입 완료 (Supabase 테이블 확인 필요: ${error.message})`,
        };
      }

      return {
        success: true,
        savedToCloud: true,
        message: '회원가입 완료! Supabase(cpzyrpaenvzfshqqpmrf) members 테이블에 이메일과 비밀번호가 실시간 저장되었습니다.',
      };
    } catch (e: any) {
      return {
        success: true,
        savedToCloud: false,
        message: `회원가입 완료 (로컬 저장됨: ${e?.message || '통신 오류'})`,
      };
    }
  },

  // 전체 회원 목록을 Supabase members 테이블에 일괄 업로드
  async syncAllMembersToSupabase(users: User[]): Promise<{ success: boolean; count: number; message: string }> {
    if (!isSupabaseConfigured()) {
      return { success: false, count: 0, message: 'Supabase Anon Key가 설정되지 않았습니다.' };
    }
    try {
      const client = getSupabaseClient();
      const payload = users.map((u) => ({
        id: u.id,
        email: u.email.trim().toLowerCase(),
        password: u.password || (u.role === 'admin' ? 'admin1234' : 'customer1234'),
        name: u.name,
        phone: u.phone || '',
        postal_code: u.postalCode || '',
        address: u.address || '',
        detail_address: u.detailAddress || '',
        points: u.points ?? 5000,
        membership_grade: u.membershipGrade || '전주이씨 가문회원',
        role: u.role || 'customer',
        updated_at: new Date().toISOString(),
      }));

      const { error } = await client.from('members').upsert(payload, { onConflict: 'email' });
      if (error) {
        return { success: false, count: 0, message: `회원 동기화 실패: ${error.message}` };
      }
      return {
        success: true,
        count: payload.length,
        message: `총 ${payload.length}명의 회원(이메일/비밀번호) 정보가 Supabase members 테이블에 저장되었습니다!`,
      };
    } catch (e: any) {
      return { success: false, count: 0, message: `오류: ${e?.message || '네트워크 오류'}` };
    }
  },

  // 보안 로그인 인증 (Supabase authenticate_member RPC 함수 및 members 테이블 직접 조회)
  async authenticateMember(email: string, password: string): Promise<User | null> {
    if (!isSupabaseConfigured() || !password) return null;
    try {
      const client = getSupabaseClient();
      const trimmed = email.trim().toLowerCase();

      // 1. 보안 RPC 함수 (비밀번호 비교를 DB 내부에서 안전하게 실행)
      const { data: rpcData, error: rpcErr } = await client.rpc('authenticate_member', {
        p_email: trimmed,
        p_password: password,
      });

      if (!rpcErr && rpcData && rpcData.length > 0) {
        const u = rpcData[0];
        return {
          id: u.id,
          email: u.email,
          password: password,
          name: u.name,
          phone: u.phone || '',
          postalCode: u.postal_code || '',
          address: u.address || '',
          detailAddress: u.detail_address || '',
          points: u.points ?? 5000,
          membershipGrade: u.membership_grade || '전주이씨 가문회원',
          role: u.role || 'customer',
          couponCount: 2,
          ordersCount: 0,
          createdAt: u.created_at ? new Date(u.created_at).toISOString().slice(0, 10) : undefined,
        };
      }

      // 2. RPC가 없는 경우 members 테이블 직접 조회 폴백
      const { data, error } = await client
        .from('members')
        .select('*')
        .ilike('email', trimmed)
        .maybeSingle();

      if (!error && data) {
        if (data.password === password) {
          return {
            id: data.id,
            email: data.email,
            password: data.password,
            name: data.name,
            phone: data.phone || '',
            postalCode: data.postal_code || '',
            address: data.address || '',
            detailAddress: data.detail_address || '',
            points: data.points ?? 5000,
            membershipGrade: data.membership_grade || '전주이씨 가문회원',
            role: data.role || 'customer',
            couponCount: 2,
            ordersCount: 0,
            createdAt: data.created_at ? new Date(data.created_at).toISOString().slice(0, 10) : undefined,
          };
        }
      }

      return null;
    } catch (e) {
      console.warn('authenticateMember fallback:', e);
      return null;
    }
  },

  // 전체 회원 목록 조회 (members 테이블 우선 조회)
  async fetchProfiles(): Promise<User[] | null> {
    if (!isSupabaseConfigured()) return null;
    try {
      const client = getSupabaseClient();
      const { data, error } = await client
        .from('members')
        .select('*')
        .order('created_at', { ascending: false });

      if (error || !data) return null;
      return data.map((d: any) => ({
        id: d.id,
        name: d.name,
        email: d.email,
        password: d.password || '',
        phone: d.phone || '',
        postalCode: d.postal_code || '',
        address: d.address || '',
        detailAddress: d.detail_address || '',
        points: d.points ?? 5000,
        membershipGrade: d.membership_grade || '전주이씨 가문회원',
        role: d.role || 'customer',
        couponCount: 2,
        ordersCount: 0,
        createdAt: d.created_at?.slice(0, 10),
      }));
    } catch {
      return null;
    }
  },

  // 상품 목록 조회 (Supabase products 테이블)
  async fetchProducts(): Promise<Product[] | null> {
    if (!isSupabaseConfigured()) return null;
    try {
      const client = getSupabaseClient();
      let { data, error } = await client.from('products').select('*').order('created_at', { ascending: false });
      if (error) {
        // created_at 컬럼이 없는 경우 정렬 없이 재시도
        const retry = await client.from('products').select('*');
        data = retry.data;
        error = retry.error;
      }
      if (error || !data || data.length === 0) return null;
      return (data as any[]).map((d: any) => {
        const fallback = PRODUCTS.find((p) => p.id === d.id);
        const images = Array.isArray(d.images) && d.images.length > 0 
          ? d.images 
          : (d.thumbnail ? [d.thumbnail] : (fallback?.images || ['https://images.unsplash.com/photo-1544441893-675973e31985?auto=format&fit=crop&w=1200&q=80']));
        const colors = Array.isArray(d.colors) && d.colors.length > 0 
          ? d.colors 
          : (fallback?.colors || [{ name: '기본 (Default)', code: '#121212' }]);
        const sizes = Array.isArray(d.sizes) && d.sizes.length > 0 
          ? d.sizes 
          : (fallback?.sizes || ['M', 'L', 'XL']);

        return {
          id: d.id,
          name: d.name,
          engName: d.eng_name || fallback?.engName || d.name,
          category: d.category || fallback?.category || 'LIFESTYLE',
          price: Number(d.price) || 0,
          originalPrice: d.original_price ? Number(d.original_price) : undefined,
          isNew: Boolean(d.is_new),
          isBest: Boolean(d.is_best),
          isSoldOut: Boolean(d.is_sold_out),
          colors,
          sizes,
          images,
          thumbnail: d.thumbnail || images[0],
          shortDesc: d.short_desc || fallback?.shortDesc || '전주이씨 가문의 기품을 담은 컬렉션',
          detailDesc: d.detail_desc || d.description || fallback?.detailDesc || d.name,
          fabric: d.fabric || d.material || fallback?.fabric || '프리미엄 소재',
          fit: d.fit || fallback?.fit || '릴렉스드 핏',
          care: Array.isArray(d.care) ? d.care : (fallback?.care || ['전문 드라이클리닝 권장']),
          stock: d.stock !== undefined && d.stock !== null ? Number(d.stock) : 30,
          rating: Number(d.rating) || 5.0,
          reviewCount: Number(d.review_count) || 0,
          salesCount: Number(d.sales_count) || 0,
          createdAt: d.created_at ? new Date(d.created_at).toISOString().slice(0, 10) : '2026-03-01',
        };
      });
    } catch {
      return null;
    }
  },

  // products 테이블 상태 및 행 개수 확인 (초기 자동 업로드 판단용)
  async checkProductsTableStatus(): Promise<{ exists: boolean; count: number }> {
    if (!isSupabaseConfigured()) return { exists: false, count: 0 };
    try {
      const client = getSupabaseClient();
      const { count, error } = await client.from('products').select('*', { count: 'exact', head: true });
      if (error) {
        return { exists: false, count: 0 };
      }
      return { exists: true, count: count ?? 0 };
    } catch {
      return { exists: false, count: 0 };
    }
  },

  // 내부 헬퍼: 스키마 컬럼 차이에 유연하게 대응하는 products upsert
  async _upsertProductsResilient(productsList: Product[]): Promise<{ error: any }> {
    const client = getSupabaseClient();
    let currentRows: Record<string, any>[] = productsList.map((p) => ({
      id: p.id,
      name: p.name,
      eng_name: p.engName || '',
      category: p.category,
      price: Number(p.price) || 0,
      original_price: p.originalPrice ?? null,
      is_new: Boolean(p.isNew),
      is_best: Boolean(p.isBest),
      is_sold_out: Boolean(p.isSoldOut),
      colors: p.colors || [],
      sizes: p.sizes || [],
      images: p.images || [],
      thumbnail: p.thumbnail || p.images?.[0] || '',
      short_desc: p.shortDesc || '',
      detail_desc: p.detailDesc || '',
      fabric: p.fabric || '',
      fit: p.fit || '',
      care: p.care || [],
      stock: p.stock !== undefined ? Number(p.stock) : 30,
      rating: p.rating ?? 5.0,
      review_count: p.reviewCount ?? 0,
      sales_count: p.salesCount ?? 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }));

    for (let attempt = 0; attempt < 6; attempt++) {
      const { error } = await client.from('products').upsert(currentRows, { onConflict: 'id' });
      if (!error) {
        return { error: null };
      }

      const msg = error.message || '';
      const colMatch = msg.match(/Could not find the '([^']+)' column|column "([^"]+)"/i);
      const missingCol = colMatch ? (colMatch[1] || colMatch[2]) : null;

      if (missingCol) {
        currentRows = currentRows.map((row) => {
          const copy = { ...row };
          delete copy[missingCol];
          return copy;
        });
        continue;
      }

      // stock, updated_at 컬럼이 없는 구버전 스키마 대비 일괄 제거 후 재시도
      if (attempt === 0 && (msg.includes('schema cache') || msg.includes('column'))) {
        currentRows = currentRows.map((row) => {
          const copy = { ...row };
          delete copy.stock;
          delete copy.updated_at;
          return copy;
        });
        continue;
      }

      return { error };
    }

    return { error: null };
  },

  // 1. 신규 상품 등록 (Supabase products 테이블 upsert)
  async createProduct(product: Product): Promise<{ success: boolean; message: string }> {
    if (!isSupabaseConfigured()) {
      return { success: false, message: 'Supabase가 설정되지 않았습니다. (로컬에만 저장됩니다)' };
    }
    try {
      const { error } = await this._upsertProductsResilient([product]);
      if (error) {
        console.error('Supabase createProduct error:', error);
        return {
          success: false,
          message: `Supabase products 업로드 실패: ${error.message} (상단 [DB 연결 설정]에서 [상품 테이블 SQL 복사하기]를 실행해주세요)`,
        };
      }
      return {
        success: true,
        message: `[${product.name}] 상품이 Supabase(cpzyrpaenvzfshqqpmrf) products 테이블에 업로드되었습니다!`,
      };
    } catch (e: any) {
      console.error('Supabase createProduct exception:', e);
      return { success: false, message: `등록 오류: ${e?.message || '네트워크 오류'}` };
    }
  },

  // 2. 상품 정보 수정 (Supabase products 테이블 upsert + update)
  async updateProduct(
    id: string,
    updates: Partial<Product>,
    fullProduct?: Product
  ): Promise<{ success: boolean; message: string }> {
    if (!isSupabaseConfigured()) {
      return { success: false, message: 'Supabase가 설정되지 않았습니다. (로컬에만 반영됩니다)' };
    }
    try {
      // 전체 상품 객체가 전달된 경우 upsert를 통해 DB에 아직 없던 기본 상품도 즉시 업로드+수정되도록 보장
      if (fullProduct) {
        const { error: upsertErr } = await this._upsertProductsResilient([fullProduct]);
        if (!upsertErr) {
          return {
            success: true,
            message: `[${fullProduct.name}] 상품 정보가 Supabase products 테이블에 수정 반영되었습니다!`,
          };
        }
      }

      const client = getSupabaseClient();
      const payload: Record<string, any> = {
        updated_at: new Date().toISOString(),
      };
      if (updates.name !== undefined) payload.name = updates.name;
      if (updates.engName !== undefined) payload.eng_name = updates.engName;
      if (updates.category !== undefined) payload.category = updates.category;
      if (updates.price !== undefined) payload.price = Number(updates.price);
      if (updates.originalPrice !== undefined) payload.original_price = updates.originalPrice ?? null;
      if (updates.isNew !== undefined) payload.is_new = updates.isNew;
      if (updates.isBest !== undefined) payload.is_best = updates.isBest;
      if (updates.isSoldOut !== undefined) payload.is_sold_out = updates.isSoldOut;
      if (updates.colors !== undefined) payload.colors = updates.colors;
      if (updates.sizes !== undefined) payload.sizes = updates.sizes;
      if (updates.images !== undefined) {
        payload.images = updates.images;
        if (!payload.thumbnail && updates.images.length > 0) payload.thumbnail = updates.images[0];
      }
      if (updates.thumbnail !== undefined) payload.thumbnail = updates.thumbnail;
      if (updates.shortDesc !== undefined) payload.short_desc = updates.shortDesc;
      if (updates.detailDesc !== undefined) payload.detail_desc = updates.detailDesc;
      if (updates.fabric !== undefined) payload.fabric = updates.fabric;
      if (updates.fit !== undefined) payload.fit = updates.fit;
      if (updates.care !== undefined) payload.care = updates.care;
      if (updates.stock !== undefined) payload.stock = Number(updates.stock);

      let { error } = await client.from('products').update(payload).eq('id', id);
      if (error && (error.message.includes('updated_at') || error.message.includes('stock'))) {
        delete payload.updated_at;
        delete payload.stock;
        const retry = await client.from('products').update(payload).eq('id', id);
        error = retry.error;
      }

      if (error) {
        console.error('Supabase updateProduct error:', error);
        return { success: false, message: `수정 실패: ${error.message}` };
      }
      return { success: true, message: '상품 정보가 Supabase products 테이블에 수정되었습니다.' };
    } catch (e: any) {
      console.error('Supabase updateProduct exception:', e);
      return { success: false, message: `수정 오류: ${e?.message || '네트워크 오류'}` };
    }
  },

  // 3. 상품 삭제 (Supabase products 테이블 delete)
  async deleteProduct(id: string): Promise<{ success: boolean; message: string }> {
    if (!isSupabaseConfigured()) {
      return { success: false, message: 'Supabase가 설정되지 않았습니다. (로컬에서만 삭제됩니다)' };
    }
    try {
      const client = getSupabaseClient();
      const { error } = await client.from('products').delete().eq('id', id);
      if (error) {
        console.error('Supabase deleteProduct error:', error);
        return { success: false, message: `Supabase 삭제 실패: ${error.message}` };
      }
      return { success: true, message: '상품이 Supabase(cpzyrpaenvzfshqqpmrf) products 테이블에서 영구 삭제되었습니다.' };
    } catch (e: any) {
      console.error('Supabase deleteProduct exception:', e);
      return { success: false, message: `삭제 오류: ${e?.message || '네트워크 오류'}` };
    }
  },

  // 4. 상품 전체를 Supabase에 일괄 주입
  async syncAllProductsToSupabase(products: Product[]): Promise<{ success: boolean; count: number; message: string }> {
    if (!isSupabaseConfigured()) {
      return { success: false, count: 0, message: 'Supabase가 설정되지 않았습니다.' };
    }
    try {
      const { error } = await this._upsertProductsResilient(products);
      if (error) {
        return {
          success: false,
          count: 0,
          message: `일괄 업로드 실패: ${error.message} (SQL Editor에서 products 테이블 생성 SQL을 실행해주세요)`,
        };
      }
      return {
        success: true,
        count: products.length,
        message: `${products.length}개 상품이 Supabase(cpzyrpaenvzfshqqpmrf) products 테이블에 성공적으로 업로드되었습니다!`,
      };
    } catch (e: any) {
      return { success: false, count: 0, message: `업로드 오류: ${e?.message || '통신 실패'}` };
    }
  },

  // 내부 헬퍼: DataURL(base64)을 실제 바이너리 Blob으로 변환
  _dataUrlToBlob(dataUrl: string): { blob: Blob; mimeType: string; ext: string } | null {
    try {
      const parts = dataUrl.split(',');
      if (parts.length < 2) return null;
      const mimeMatch = parts[0].match(/:(.*?);/);
      const mimeType = mimeMatch ? mimeMatch[1] : 'image/jpeg';
      const ext = mimeType.includes('png')
        ? 'png'
        : mimeType.includes('webp')
        ? 'webp'
        : mimeType.includes('gif')
        ? 'gif'
        : 'jpg';
      const byteString = atob(parts[1]);
      const ab = new ArrayBuffer(byteString.length);
      const ia = new Uint8Array(ab);
      for (let i = 0; i < byteString.length; i++) {
        ia[i] = byteString.charCodeAt(i);
      }
      return {
        blob: new Blob([ab], { type: mimeType }),
        mimeType,
        ext,
      };
    } catch (e) {
      console.warn('dataUrlToBlob failed:', e);
      return null;
    }
  },

  // 내부 헬퍼: Supabase Storage 'products' 버킷(및 'product-images' 호환)에 파일 업로드
  async _uploadToStorageBucket(
    filePath: string,
    fileOrBlob: File | Blob,
    contentType: string = 'image/jpeg'
  ): Promise<{ success: boolean; url: string; bucket: string; error?: string }> {
    const client = getSupabaseClient();
    const candidateBuckets = ['products', 'product-images'];

    let lastError = '';

    for (const bucketName of candidateBuckets) {
      let { error } = await client.storage.from(bucketName).upload(filePath, fileOrBlob, {
        cacheControl: '3600',
        upsert: true,
        contentType,
      });

      // 버킷이 아직 없으면 자동 생성 시도 후 재업로드
      if (error && (error.message.toLowerCase().includes('not found') || error.message.toLowerCase().includes('bucket'))) {
        await client.storage.createBucket(bucketName, { public: true }).catch(() => {});
        const retry = await client.storage.from(bucketName).upload(filePath, fileOrBlob, {
          cacheControl: '3600',
          upsert: true,
          contentType,
        });
        error = retry.error;
      }

      if (!error) {
        const { data: publicUrlData } = client.storage.from(bucketName).getPublicUrl(filePath);
        return {
          success: true,
          url: publicUrlData.publicUrl,
          bucket: bucketName,
        };
      }

      lastError = error.message;
    }

    return {
      success: false,
      url: '',
      bucket: 'products',
      error: lastError,
    };
  },

  // 5. 상품 이미지 업로드 (Supabase Storage 'products' 버킷 우선 저장 + 미설정 시 DataURL fallback)
  async uploadProductImage(
    file: File,
    fallbackDataUrl?: string
  ): Promise<{ success: boolean; url: string; message: string }> {
    if (!isSupabaseConfigured()) {
      if (fallbackDataUrl) {
        return {
          success: true,
          url: fallbackDataUrl,
          message: '로컬 최적화 이미지로 등록되었습니다.',
        };
      }
      return { success: false, url: '', message: 'Supabase가 설정되지 않았습니다.' };
    }

    try {
      const ext = file.name.split('.').pop() || 'jpg';
      const cleanName = file.name
        .replace(/\.[^/.]+$/, '')
        .replace(/[^a-zA-Z0-9_-]/g, '_')
        .slice(0, 40) || 'image';
      const fileName = `${Date.now()}_${cleanName}.${ext}`;

      const uploadRes = await this._uploadToStorageBucket(
        fileName,
        file,
        file.type || 'image/jpeg'
      );

      if (!uploadRes.success) {
        console.warn('Supabase storage upload failed, using fallback dataUrl:', uploadRes.error);
        if (fallbackDataUrl) {
          return {
            success: true,
            url: fallbackDataUrl,
            message: `스토리지(${uploadRes.bucket}) 권한 설정 필요 (${uploadRes.error}) — 우선 DB 인라인 이미지로 저장되었습니다. [스토리지(products) SQL 복사]를 실행해주세요.`,
          };
        }
        return { success: false, url: '', message: uploadRes.error || '업로드 실패' };
      }

      return {
        success: true,
        url: uploadRes.url,
        message: `Supabase Storage [${uploadRes.bucket}] 버킷에 이미지 파일(${fileName})이 저장되었습니다!`,
      };
    } catch (e: any) {
      console.warn('Supabase storage exception, using fallback dataUrl:', e);
      if (fallbackDataUrl) {
        return {
          success: true,
          url: fallbackDataUrl,
          message: '고화질 최적화 이미지로 등록되었습니다.',
        };
      }
      return { success: false, url: '', message: e?.message || '이미지 업로드 실패' };
    }
  },

  // 6. 사용자가 첨부했던 모든 이미지(로컬 첨부 에셋 + 상품 첨부 DataURL + 상품 대표 이미지)를 Supabase Storage 'products' 버킷에 일괄 저장
  async syncAttachedImagesToStorage(
    products: Product[]
  ): Promise<{
    success: boolean;
    uploadedCount: number;
    updatedProducts: Product[];
    uploadedFiles: string[];
    message: string;
  }> {
    if (!isSupabaseConfigured()) {
      return {
        success: false,
        uploadedCount: 0,
        updatedProducts: products,
        uploadedFiles: [],
        message: 'Supabase가 연결되지 않았습니다.',
      };
    }

    let uploadedCount = 0;
    const uploadedFiles: string[] = [];
    let lastBucketError = '';

    // Step 1: 사용자가 대화 및 프로젝트에 첨부했던 브랜드/상품 원본 이미지 파일들을 Storage 'products' 버킷에 저장
    const attachedLocalAssets = [
      { path: '/logo-original.png', storageName: 'attached_logo_original.png', mime: 'image/png' },
      { path: '/logo-calligraphy.png', storageName: 'attached_logo_calligraphy.png', mime: 'image/png' },
      { path: '/logo-calligraphy-white.png', storageName: 'attached_logo_calligraphy_white.png', mime: 'image/png' },
      { path: '/user-dragon-transparent.png', storageName: 'attached_user_dragon.png', mime: 'image/png' },
      { path: '/korean-dragon-transparent.png', storageName: 'attached_korean_dragon.png', mime: 'image/png' },
      { path: '/korean-landscape-bg-clean.jpg', storageName: 'attached_korean_landscape_clean.jpg', mime: 'image/jpeg' },
      { path: '/korean-landscape-bg.jpg', storageName: 'attached_korean_landscape_original.jpg', mime: 'image/jpeg' },
    ];

    for (const asset of attachedLocalAssets) {
      try {
        const res = await fetch(asset.path);
        if (res.ok) {
          const blob = await res.blob();
          const up = await this._uploadToStorageBucket(asset.storageName, blob, asset.mime);
          if (up.success) {
            uploadedCount++;
            uploadedFiles.push(asset.storageName);
          } else if (up.error) {
            lastBucketError = up.error;
          }
        }
      } catch (e) {
        console.warn(`Failed to upload attached asset ${asset.path}:`, e);
      }
    }

    // Step 2: 각 상품에 첨부된 이미지(DataURL 직접 업로드분 및 상품 이미지)를 Storage 'products' 버킷에 파일로 저장하고 URL 연동
    const updatedProducts: Product[] = [];
    const modifiedProductsForDb: Product[] = [];

    for (const prod of products) {
      const currentImages =
        prod.images && prod.images.length > 0
          ? [...prod.images]
          : prod.thumbnail
          ? [prod.thumbnail]
          : [];

      let prodChanged = false;
      const newImages: string[] = [];

      for (let idx = 0; idx < currentImages.length; idx++) {
        const imgStr = currentImages[idx];

        // 이미 Supabase Storage URL인 경우 그대로 유지
        if (imgStr.includes('.supabase.co/storage/v1/object/public/')) {
          newImages.push(imgStr);
          continue;
        }

        // 케이스 A: 사용자가 파일 업로드로 첨부했던 DataURL (data:image/...)
        if (imgStr.startsWith('data:image/')) {
          const parsed = this._dataUrlToBlob(imgStr);
          if (parsed) {
            const fileName = `${prod.id}_attached_${idx + 1}.${parsed.ext}`;
            const up = await this._uploadToStorageBucket(fileName, parsed.blob, parsed.mimeType);
            if (up.success && up.url) {
              newImages.push(up.url);
              uploadedCount++;
              uploadedFiles.push(fileName);
              prodChanged = true;
              continue;
            } else if (up.error) {
              lastBucketError = up.error;
            }
          }
          newImages.push(imgStr);
          continue;
        }

        // 케이스 B: 상품의 대표/상세 이미지 URL -> 패치하여 Storage 'products' 버킷에도 실제 이미지 파일로 저장
        if (imgStr.startsWith('http') || imgStr.startsWith('/')) {
          try {
            const resp = await fetch(imgStr);
            if (resp.ok) {
              const blob = await resp.blob();
              const mime = blob.type || 'image/jpeg';
              const ext = mime.includes('png') ? 'png' : mime.includes('webp') ? 'webp' : 'jpg';
              const fileName = `${prod.id}_img_${idx + 1}.${ext}`;
              const up = await this._uploadToStorageBucket(fileName, blob, mime);
              if (up.success && up.url) {
                newImages.push(up.url);
                uploadedCount++;
                uploadedFiles.push(fileName);
                prodChanged = true;
                continue;
              } else if (up.error) {
                lastBucketError = up.error;
              }
            }
          } catch (fetchErr) {
            console.warn(`Image fetch skipped for ${prod.id}:`, fetchErr);
          }
        }

        newImages.push(imgStr);
      }

      if (prodChanged && newImages.length > 0) {
        const nextProd: Product = {
          ...prod,
          images: newImages,
          thumbnail: newImages[0],
        };
        updatedProducts.push(nextProd);
        modifiedProductsForDb.push(nextProd);
      } else {
        updatedProducts.push(prod);
      }
    }

    // 변경된 상품 이미지 URL들을 Supabase products 테이블에도 즉시 업데이트
    if (modifiedProductsForDb.length > 0) {
      await this._upsertProductsResilient(modifiedProductsForDb);
    }

    if (uploadedCount === 0 && lastBucketError) {
      return {
        success: false,
        uploadedCount: 0,
        updatedProducts,
        uploadedFiles: [],
        message: `Supabase Storage(products) 업로드 권한/버킷 설정이 필요합니다 (${lastBucketError}). [스토리지(products) SQL 복사] 버튼을 눌러 SQL Editor에서 실행해주세요!`,
      };
    }

    return {
      success: true,
      uploadedCount,
      updatedProducts,
      uploadedFiles,
      message: `총 ${uploadedCount}개의 첨부 및 상품 이미지가 Supabase Storage [products] 버킷에 저장되고 DB에 연결되었습니다!`,
    };
  },

  // ==========================================
  // [MATERIALS (원부자재 수급/재고 ERP)] CRUD
  // ==========================================

  async checkMaterialsTableStatus(): Promise<{ exists: boolean; count: number; error?: string }> {
    if (!isSupabaseConfigured()) return { exists: false, count: 0, error: 'Not configured' };
    try {
      const client = getSupabaseClient();
      const { count, error } = await client
        .from('materials')
        .select('id', { count: 'exact', head: true });
      if (error) {
        return { exists: false, count: 0, error: error.message };
      }
      return { exists: true, count: count ?? 0 };
    } catch (e: any) {
      return { exists: false, count: 0, error: e?.message || 'Unknown error' };
    }
  },

  async fetchMaterials(): Promise<MaterialItem[] | null> {
    if (!isSupabaseConfigured()) return null;
    try {
      const client = getSupabaseClient();
      let { data, error } = await client
        .from('materials')
        .select('*')
        .order('updated_at', { ascending: false });

      if (error) {
        const retry = await client.from('materials').select('*');
        data = retry.data;
        error = retry.error;
      }

      if (error || !data) return null;

      return data.map((row: any): MaterialItem => ({
        id: row.id,
        code: row.code || `MAT-${String(row.id).slice(-4).toUpperCase()}`,
        name: row.name,
        category: (row.category || '원단') as MaterialItem['category'],
        unit: row.unit || '개(EA)',
        currentStock: Number(row.current_stock ?? 0),
        safeStock: Number(row.safe_stock ?? row.safety_stock ?? 20),
        unitCost: Number(row.unit_cost ?? row.unit_price ?? 0),
        supplier: row.supplier || '국내 공방',
        updatedAt: row.updated_at ? String(row.updated_at).slice(0, 10) : new Date().toISOString().slice(0, 10),
      }));
    } catch (e) {
      console.warn('Supabase materials fetch failed:', e);
      return null;
    }
  },

  async _upsertMaterialsResilient(materials: MaterialItem[]): Promise<{ error: any }> {
    const client = getSupabaseClient();
    const standardPayload = materials.map((m) => ({
      id: m.id,
      code: m.code,
      name: m.name,
      category: m.category,
      unit: m.unit,
      current_stock: Number(m.currentStock ?? 0),
      safe_stock: Number(m.safeStock ?? 20),
      unit_cost: Number(m.unitCost ?? 0),
      supplier: m.supplier || '국내 공방',
      updated_at: m.updatedAt || new Date().toISOString().slice(0, 10),
    }));

    let { error } = await client.from('materials').upsert(standardPayload, { onConflict: 'id' });
    if (!error) return { error: null };

    // 레거시 컬럼(safety_stock, unit_price) 호환 재시도
    if (error.message && (error.message.includes('safe_stock') || error.message.includes('unit_cost') || error.message.includes('updated_at'))) {
      const legacyPayload = materials.map((m) => ({
        id: m.id,
        code: m.code,
        name: m.name,
        category: m.category,
        unit: m.unit,
        current_stock: Number(m.currentStock ?? 0),
        safety_stock: Number(m.safeStock ?? 20),
        unit_price: Number(m.unitCost ?? 0),
        supplier: m.supplier || '국내 공방',
      }));
      const retry = await client.from('materials').upsert(legacyPayload, { onConflict: 'id' });
      error = retry.error;
    }

    return { error };
  },

  async saveMaterial(material: MaterialItem): Promise<{ success: boolean; message: string }> {
    if (!isSupabaseConfigured()) {
      return { success: false, message: 'Supabase가 설정되지 않았습니다. (로컬에만 저장됩니다)' };
    }
    try {
      const { error } = await this._upsertMaterialsResilient([material]);
      if (error) {
        console.error('Supabase saveMaterial error:', error);
        return {
          success: false,
          message: `Supabase materials 저장 실패: ${error.message} ([원부자재/발주 SQL 복사] 후 SQL Editor에서 실행해주세요)`,
        };
      }
      return {
        success: true,
        message: `[${material.name}] 원부자재가 Supabase(cpzyrpaenvzfshqqpmrf) materials 테이블에 저장되었습니다!`,
      };
    } catch (e: any) {
      return { success: false, message: `원부자재 저장 오류: ${e?.message || '네트워크 오류'}` };
    }
  },

  async updateMaterial(
    id: string,
    updates: Partial<MaterialItem>,
    fullMaterial?: MaterialItem
  ): Promise<{ success: boolean; message: string }> {
    if (!isSupabaseConfigured()) {
      return { success: false, message: 'Supabase 미설정 (로컬에만 반영)' };
    }
    try {
      if (fullMaterial) {
        const { error: upsertErr } = await this._upsertMaterialsResilient([fullMaterial]);
        if (!upsertErr) {
          return {
            success: true,
            message: `[${fullMaterial.name}] 원부자재 정보가 Supabase materials 테이블에 업데이트되었습니다!`,
          };
        }
      }

      const client = getSupabaseClient();
      const payload: Record<string, any> = {
        updated_at: new Date().toISOString().slice(0, 10),
      };
      if (updates.code !== undefined) payload.code = updates.code;
      if (updates.name !== undefined) payload.name = updates.name;
      if (updates.category !== undefined) payload.category = updates.category;
      if (updates.unit !== undefined) payload.unit = updates.unit;
      if (updates.currentStock !== undefined) payload.current_stock = Number(updates.currentStock);
      if (updates.safeStock !== undefined) payload.safe_stock = Number(updates.safeStock);
      if (updates.unitCost !== undefined) payload.unit_cost = Number(updates.unitCost);
      if (updates.supplier !== undefined) payload.supplier = updates.supplier;

      const { error } = await client.from('materials').update(payload).eq('id', id);
      if (error) {
        return { success: false, message: `원부자재 수정 실패: ${error.message}` };
      }
      return { success: true, message: '원부자재 정보가 Supabase materials 테이블에 수정되었습니다.' };
    } catch (e: any) {
      return { success: false, message: `수정 오류: ${e?.message || '네트워크 오류'}` };
    }
  },

  async deleteMaterial(id: string): Promise<{ success: boolean; message: string }> {
    if (!isSupabaseConfigured()) {
      return { success: false, message: 'Supabase 미설정 (로컬에서만 삭제)' };
    }
    try {
      const client = getSupabaseClient();
      const { error } = await client.from('materials').delete().eq('id', id);
      if (error) {
        return { success: false, message: `Supabase materials 삭제 실패: ${error.message}` };
      }
      return { success: true, message: '원부자재가 Supabase materials 테이블에서 삭제되었습니다.' };
    } catch (e: any) {
      return { success: false, message: `삭제 오류: ${e?.message || '네트워크 오류'}` };
    }
  },

  async syncAllMaterialsToSupabase(materials: MaterialItem[]): Promise<{ success: boolean; count: number; message: string }> {
    if (!isSupabaseConfigured()) {
      return { success: false, count: 0, message: 'Supabase가 설정되지 않았습니다.' };
    }
    try {
      const { error } = await this._upsertMaterialsResilient(materials);
      if (error) {
        return {
          success: false,
          count: 0,
          message: `원부자재 일괄 업로드 실패: ${error.message} ([원부자재/발주 SQL 복사]를 실행해주세요)`,
        };
      }
      return {
        success: true,
        count: materials.length,
        message: `${materials.length}건의 원부자재 데이터가 Supabase(cpzyrpaenvzfshqqpmrf) materials 테이블에 업로드되었습니다!`,
      };
    } catch (e: any) {
      return { success: false, count: 0, message: `업로드 오류: ${e?.message || '통신 실패'}` };
    }
  },

  // ==========================================
  // [PURCHASE ORDERS (공방/원부자재 발주 관리)] CRUD
  // ==========================================

  async checkPurchaseOrdersTableStatus(): Promise<{ exists: boolean; count: number; error?: string }> {
    if (!isSupabaseConfigured()) return { exists: false, count: 0, error: 'Not configured' };
    try {
      const client = getSupabaseClient();
      const { count, error } = await client
        .from('purchase_orders')
        .select('id', { count: 'exact', head: true });
      if (error) {
        return { exists: false, count: 0, error: error.message };
      }
      return { exists: true, count: count ?? 0 };
    } catch (e: any) {
      return { exists: false, count: 0, error: e?.message || 'Unknown error' };
    }
  },

  async fetchPurchaseOrders(): Promise<PurchaseOrder[] | null> {
    if (!isSupabaseConfigured()) return null;
    try {
      const client = getSupabaseClient();
      let { data, error } = await client
        .from('purchase_orders')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        const retry = await client.from('purchase_orders').select('*');
        data = retry.data;
        error = retry.error;
      }

      if (error || !data) return null;

      return data.map((row: any): PurchaseOrder => {
        const qty = Number(row.quantity ?? 1);
        const unitCost = Number(row.unit_cost ?? row.unit_price ?? 0);
        const totalCost = Number(row.total_cost ?? row.total_price ?? qty * unitCost);
        return {
          id: row.id,
          poNumber: row.po_number || `PO-${String(row.id).slice(-6).toUpperCase()}`,
          itemType: (row.item_type || '원부자재') as PurchaseOrder['itemType'],
          itemName: row.item_name || '',
          supplier: row.supplier || row.supplier_name || '국내 공방',
          quantity: qty,
          unitCost,
          totalCost,
          status: (row.status || '발주승인') as PurchaseOrder['status'],
          expectedDate: row.expected_date || row.due_date || new Date().toISOString().slice(0, 10),
          createdAt: row.created_at
            ? String(row.created_at).slice(0, 10)
            : row.order_date
            ? String(row.order_date).slice(0, 10)
            : new Date().toISOString().slice(0, 10),
        };
      });
    } catch (e) {
      console.warn('Supabase purchase_orders fetch failed:', e);
      return null;
    }
  },

  async _upsertPurchaseOrdersResilient(orders: PurchaseOrder[]): Promise<{ error: any }> {
    const client = getSupabaseClient();
    const standardPayload = orders.map((po) => ({
      id: po.id,
      po_number: po.poNumber,
      item_type: po.itemType || '원부자재',
      item_name: po.itemName,
      supplier: po.supplier,
      quantity: Number(po.quantity ?? 1),
      unit_cost: Number(po.unitCost ?? 0),
      total_cost: Number(po.totalCost ?? Number(po.quantity ?? 1) * Number(po.unitCost ?? 0)),
      status: po.status || '발주승인',
      expected_date: po.expectedDate || new Date().toISOString().slice(0, 10),
      created_at: po.createdAt || new Date().toISOString().slice(0, 10),
    }));

    let { error } = await client.from('purchase_orders').upsert(standardPayload, { onConflict: 'id' });
    if (!error) return { error: null };

    // 레거시 컬럼(supplier_name, unit_price, total_price, due_date, order_date) 호환 재시도
    if (
      error.message &&
      (error.message.includes('item_type') ||
        error.message.includes('supplier') ||
        error.message.includes('unit_cost') ||
        error.message.includes('expected_date'))
    ) {
      const legacyPayload = orders.map((po) => ({
        id: po.id,
        po_number: po.poNumber,
        order_date: po.createdAt || new Date().toISOString().slice(0, 10),
        due_date: po.expectedDate || new Date().toISOString().slice(0, 10),
        supplier_name: po.supplier,
        item_name: po.itemName,
        quantity: Number(po.quantity ?? 1),
        unit_price: Number(po.unitCost ?? 0),
        total_price: Number(po.totalCost ?? Number(po.quantity ?? 1) * Number(po.unitCost ?? 0)),
        status: po.status || '발주승인',
      }));
      const retry = await client.from('purchase_orders').upsert(legacyPayload, { onConflict: 'id' });
      error = retry.error;
    }

    return { error };
  },

  async savePurchaseOrder(po: PurchaseOrder): Promise<{ success: boolean; message: string }> {
    if (!isSupabaseConfigured()) {
      return { success: false, message: 'Supabase가 설정되지 않았습니다. (로컬에만 저장됩니다)' };
    }
    try {
      const { error } = await this._upsertPurchaseOrdersResilient([po]);
      if (error) {
        console.error('Supabase savePurchaseOrder error:', error);
        return {
          success: false,
          message: `Supabase purchase_orders 저장 실패: ${error.message} ([원부자재/발주 SQL 복사] 후 SQL Editor에서 실행해주세요)`,
        };
      }
      return {
        success: true,
        message: `발주서 [${po.poNumber}] (${po.itemName})가 Supabase(cpzyrpaenvzfshqqpmrf) purchase_orders 테이블에 저장되었습니다!`,
      };
    } catch (e: any) {
      return { success: false, message: `발주서 저장 오류: ${e?.message || '네트워크 오류'}` };
    }
  },

  async updatePurchaseOrder(
    id: string,
    updates: Partial<PurchaseOrder>,
    fullPo?: PurchaseOrder
  ): Promise<{ success: boolean; message: string }> {
    if (!isSupabaseConfigured()) {
      return { success: false, message: 'Supabase 미설정 (로컬에만 반영)' };
    }
    try {
      if (fullPo) {
        const { error: upsertErr } = await this._upsertPurchaseOrdersResilient([fullPo]);
        if (!upsertErr) {
          return {
            success: true,
            message: `발주서 [${fullPo.poNumber}] 상태(${fullPo.status})가 Supabase purchase_orders 테이블에 반영되었습니다!`,
          };
        }
      }

      const client = getSupabaseClient();
      const payload: Record<string, any> = {};
      if (updates.status !== undefined) payload.status = updates.status;
      if (updates.itemType !== undefined) payload.item_type = updates.itemType;
      if (updates.itemName !== undefined) payload.item_name = updates.itemName;
      if (updates.supplier !== undefined) payload.supplier = updates.supplier;
      if (updates.quantity !== undefined) payload.quantity = Number(updates.quantity);
      if (updates.unitCost !== undefined) payload.unit_cost = Number(updates.unitCost);
      if (updates.totalCost !== undefined) payload.total_cost = Number(updates.totalCost);
      if (updates.expectedDate !== undefined) payload.expected_date = updates.expectedDate;

      const { error } = await client.from('purchase_orders').update(payload).eq('id', id);
      if (error) {
        return { success: false, message: `발주서 수정 실패: ${error.message}` };
      }
      return { success: true, message: '발주서 정보가 Supabase purchase_orders 테이블에 업데이트되었습니다.' };
    } catch (e: any) {
      return { success: false, message: `발주서 수정 오류: ${e?.message || '네트워크 오류'}` };
    }
  },

  async deletePurchaseOrder(id: string): Promise<{ success: boolean; message: string }> {
    if (!isSupabaseConfigured()) {
      return { success: false, message: 'Supabase 미설정 (로컬에서만 삭제)' };
    }
    try {
      const client = getSupabaseClient();
      const { error } = await client.from('purchase_orders').delete().eq('id', id);
      if (error) {
        return { success: false, message: `Supabase purchase_orders 삭제 실패: ${error.message}` };
      }
      return { success: true, message: '발주서가 Supabase purchase_orders 테이블에서 삭제되었습니다.' };
    } catch (e: any) {
      return { success: false, message: `삭제 오류: ${e?.message || '네트워크 오류'}` };
    }
  },

  async syncAllPurchaseOrdersToSupabase(orders: PurchaseOrder[]): Promise<{ success: boolean; count: number; message: string }> {
    if (!isSupabaseConfigured()) {
      return { success: false, count: 0, message: 'Supabase가 설정되지 않았습니다.' };
    }
    try {
      const { error } = await this._upsertPurchaseOrdersResilient(orders);
      if (error) {
        return {
          success: false,
          count: 0,
          message: `발주서 일괄 업로드 실패: ${error.message} ([원부자재/발주 SQL 복사]를 실행해주세요)`,
        };
      }
      return {
        success: true,
        count: orders.length,
        message: `${orders.length}건의 발주서 데이터가 Supabase(cpzyrpaenvzfshqqpmrf) purchase_orders 테이블에 업로드되었습니다!`,
      };
    } catch (e: any) {
      return { success: false, count: 0, message: `업로드 오류: ${e?.message || '통신 실패'}` };
    }
  },

  // 원클릭 샘플 데이터베이스 동기화 (전주이씨 상품, 자재, 발주, 세금계산서)
  async syncSeedDataToSupabase(): Promise<{ success: boolean; message: string; counts?: any }> {
    if (!isSupabaseConfigured()) {
      return {
        success: false,
        message: 'Supabase Anon Key가 입력되지 않았습니다. 먼저 키를 설정해 주세요.',
      };
    }
    try {
      const client = getSupabaseClient();
      let productCount = 0;
      let materialCount = 0;
      let poCount = 0;

      // 1. 상품 주입
      const { error: pErr } = await this._upsertProductsResilient(PRODUCTS);
      if (!pErr) productCount = PRODUCTS.length;

      // 2. 원부자재 주입
      const { error: mErr } = await this._upsertMaterialsResilient(INITIAL_MATERIALS);
      if (!mErr) materialCount = INITIAL_MATERIALS.length;

      // 3. 발주서 주입
      const { error: poErr } = await this._upsertPurchaseOrdersResilient(INITIAL_PURCHASE_ORDERS);
      if (!poErr) poCount = INITIAL_PURCHASE_ORDERS.length;

      // 4. 전자세금계산서 주입
      const taxPayload = INITIAL_TAX_INVOICES.map((t) => ({
        id: t.id,
        invoice_number: t.invoiceNumber,
        order_id: t.orderId,
        issue_date: t.issueDate,
        supplier_info: t.supplierInfo,
        recipient_info: t.recipientInfo,
        supply_amount: t.supplyAmount,
        tax_amount: t.taxAmount,
        total_amount: t.totalAmount,
        status: t.status,
      }));
      await client.from('tax_invoices').upsert(taxPayload);

      // 5. 게시판 샘플 주입
      const postPayload = INITIAL_POSTS.map((bp) => ({
        id: bp.id,
        board_type: bp.boardType,
        title: bp.title,
        content: bp.content,
        author_name: bp.authorName,
        author_email: bp.authorEmail || '',
        is_secret: Boolean(bp.isSecret),
        secret_password: bp.secretPassword || '',
        status: bp.status,
        answer: bp.answer || '',
      }));
      await client.from('board_posts').upsert(postPayload);

      // 6. 첨부 이미지 및 상품 이미지를 Supabase Storage 'products' 버킷에 일괄 저장
      const imgRes = await this.syncAttachedImagesToStorage(PRODUCTS);

      return {
        success: true,
        message: `Supabase 동기화 완료! (상품 ${productCount}개, 원부자재 ${materialCount}건, 발주서 ${poCount}건, Storage(products) 이미지 ${imgRes.uploadedCount}장 저장)`,
        counts: {
          products: productCount,
          materials: materialCount,
          purchaseOrders: poCount,
          storageImages: imgRes.uploadedCount,
        },
      };
    } catch (err: any) {
      return {
        success: false,
        message: `데이터 주입 실패: ${err?.message || '네트워크 오류'}`,
      };
    }
  },
};
