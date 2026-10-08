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

  // 회원 프로필 저장/업데이트 (members 테이블 및 profiles 테이블에 이메일, 비밀번호 등 저장)
  async saveProfile(user: User, password?: string): Promise<boolean> {
    if (!isSupabaseConfigured()) return false;
    try {
      const client = getSupabaseClient();
      const pwd = password || user.password || '';

      // 1. members 테이블에 저장 (사용자가 요청한 회원가입 테이블)
      await client.from('members').upsert([
        {
          id: user.id,
          email: user.email,
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

      // 2. profiles 테이블에도 동기화
      await client.from('profiles').upsert([
        {
          id: user.id,
          email: user.email,
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

      return true;
    } catch (e) {
      console.warn('Supabase saveProfile fallback:', e);
      return false;
    }
  },

  // 보안 로그인 인증 (Supabase authenticate_member RPC 함수 우선 사용)
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
        .eq('email', trimmed)
        .maybeSingle();

      if (!error && data) {
        if (data.password === password) {
          return {
            id: data.id,
            email: data.email,
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

  // 전체 회원 프로필 조회
  async fetchProfiles(): Promise<User[] | null> {
    if (!isSupabaseConfigured()) return null;
    try {
      const client = getSupabaseClient();
      const { data, error } = await client.from('profiles').select('*');
      if (error || !data) return null;
      return data.map((d: any) => ({
        id: d.id,
        name: d.name,
        email: d.email,
        phone: d.phone,
        postalCode: d.postal_code,
        address: d.address,
        detailAddress: d.detail_address,
        points: d.points,
        membershipGrade: d.membership_grade,
        role: d.role,
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
      const { data, error } = await client.from('products').select('*').order('created_at', { ascending: false });
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

  // 1. 신규 상품 등록 (Supabase products 테이블 insert)
  async createProduct(product: Product): Promise<{ success: boolean; message: string }> {
    if (!isSupabaseConfigured()) {
      return { success: false, message: 'Supabase가 설정되지 않았습니다. (로컬에만 저장됩니다)' };
    }
    try {
      const client = getSupabaseClient();
      const payload = {
        id: product.id,
        name: product.name,
        eng_name: product.engName || '',
        category: product.category,
        price: product.price,
        original_price: product.originalPrice || null,
        is_new: Boolean(product.isNew),
        is_best: Boolean(product.isBest),
        is_sold_out: Boolean(product.isSoldOut),
        colors: product.colors || [],
        sizes: product.sizes || [],
        images: product.images || [],
        thumbnail: product.thumbnail || product.images?.[0] || '',
        short_desc: product.shortDesc || '',
        detail_desc: product.detailDesc || '',
        fabric: product.fabric || '',
        fit: product.fit || '',
        care: product.care || [],
        stock: 30,
        rating: product.rating || 5.0,
        review_count: product.reviewCount || 0,
        sales_count: product.salesCount || 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const { error } = await client.from('products').insert([payload]);
      if (error) {
        console.error('Supabase createProduct error:', error);
        return { success: false, message: `등록 실패: ${error.message}` };
      }
      return { success: true, message: '상품이 Supabase 클라우드 DB에 성공적으로 등록되었습니다.' };
    } catch (e: any) {
      console.error('Supabase createProduct exception:', e);
      return { success: false, message: `등록 오류: ${e?.message || '네트워크 오류'}` };
    }
  },

  // 2. 상품 정보 수정 (Supabase products 테이블 update)
  async updateProduct(id: string, updates: Partial<Product>): Promise<{ success: boolean; message: string }> {
    if (!isSupabaseConfigured()) {
      return { success: false, message: 'Supabase가 설정되지 않았습니다. (로컬에만 반영됩니다)' };
    }
    try {
      const client = getSupabaseClient();
      const payload: any = {
        updated_at: new Date().toISOString(),
      };
      if (updates.name !== undefined) payload.name = updates.name;
      if (updates.engName !== undefined) payload.eng_name = updates.engName;
      if (updates.category !== undefined) payload.category = updates.category;
      if (updates.price !== undefined) payload.price = updates.price;
      if (updates.originalPrice !== undefined) payload.original_price = updates.originalPrice;
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

      const { error } = await client.from('products').update(payload).eq('id', id);
      if (error) {
        console.error('Supabase updateProduct error:', error);
        return { success: false, message: `수정 실패: ${error.message}` };
      }
      return { success: true, message: '상품 정보가 Supabase에 수정되었습니다.' };
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
        return { success: false, message: `삭제 실패: ${error.message}` };
      }
      return { success: true, message: '상품이 Supabase에서 삭제되었습니다.' };
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
      const client = getSupabaseClient();
      const payloads = products.map((p) => ({
        id: p.id,
        name: p.name,
        eng_name: p.engName || '',
        category: p.category,
        price: p.price,
        original_price: p.originalPrice || null,
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
        stock: 30,
        rating: p.rating || 5.0,
        review_count: p.reviewCount || 0,
        sales_count: p.salesCount || 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }));

      const { error } = await client.from('products').upsert(payloads, { onConflict: 'id' });
      if (error) {
        return { success: false, count: 0, message: `일괄 업로드 실패: ${error.message}` };
      }
      return { success: true, count: payloads.length, message: `${payloads.length}개 상품이 Supabase에 성공적으로 업로드되었습니다.` };
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

      // 1. 상품 주입
      const productPayload = PRODUCTS.map((p) => ({
        id: p.id,
        name: p.name,
        eng_name: p.engName || '',
        category: p.category,
        price: p.price,
        original_price: p.originalPrice || null,
        is_new: Boolean(p.isNew),
        is_best: Boolean(p.isBest),
        is_sold_out: Boolean(p.isSoldOut),
        colors: p.colors || [],
        sizes: p.sizes || [],
        images: p.images || [],
        thumbnail: p.thumbnail || p.images[0] || '',
        short_desc: p.shortDesc || '',
        description: p.detailDesc || '',
        material: p.fabric || '천연 오가닉 소재',
        stock: 20,
      }));

      const { error: pErr } = await client.from('products').upsert(productPayload);
      if (!pErr) productCount = productPayload.length;

      // 2. 원부자재 주입
      const matPayload = INITIAL_MATERIALS.map((m) => ({
        id: m.id,
        code: m.code,
        name: m.name,
        category: m.category,
        current_stock: m.currentStock,
        safety_stock: m.safeStock,
        unit: m.unit,
        unit_price: m.unitCost,
        supplier: m.supplier,
        status: m.currentStock <= m.safeStock ? '부족' : '정상',
      }));
      const { error: mErr } = await client.from('materials').upsert(matPayload);
      if (!mErr) materialCount = matPayload.length;

      // 3. 발주서 주입
      const poPayload = INITIAL_PURCHASE_ORDERS.map((po) => ({
        id: po.id,
        po_number: po.poNumber,
        order_date: po.createdAt,
        due_date: po.expectedDate,
        supplier_name: po.supplier,
        item_name: po.itemName,
        quantity: po.quantity,
        unit_price: po.unitCost,
        total_price: po.totalCost,
        status: po.status,
        notes: '',
      }));
      await client.from('purchase_orders').upsert(poPayload);

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

      return {
        success: true,
        message: `Supabase 데이터베이스에 데이터 동기화 완료! (상품 ${productCount}개, 원자재 ${materialCount}개 외)`,
        counts: { products: productCount, materials: materialCount },
      };
    } catch (err: any) {
      return {
        success: false,
        message: `데이터 주입 실패: ${err?.message || '네트워크 오류'}`,
      };
    }
  },
};
