-- ====================================================================
-- 전주이씨 (JEONJU LEE) 명품 부티크 - Supabase 통합 데이터베이스 스키마
-- Supabase 대시보드 (SQL Editor)에 복사하여 실행(Run)하세요.
-- 프로젝트 URL: https://opyqqllhhirdrcilqsev.supabase.co
-- ====================================================================

-- 1. 확장 기능 활성화 (UUID 생성용)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ====================================================================
-- 2. 회원 프로필 테이블 (포인트/등급/회원가입 관리)
-- ====================================================================
CREATE TABLE IF NOT EXISTS public.profiles (
    id TEXT PRIMARY KEY,
    email TEXT NOT NULL,
    name TEXT NOT NULL DEFAULT '고객',
    phone TEXT DEFAULT '',
    postal_code TEXT DEFAULT '',
    address TEXT DEFAULT '',
    detail_address TEXT DEFAULT '',
    points INTEGER NOT NULL DEFAULT 5000, -- 신규가입 축하 5,000P 즉시 지급
    membership_grade TEXT NOT NULL DEFAULT '전주이씨 가문회원',
    role TEXT NOT NULL DEFAULT 'customer' CHECK (role IN ('customer', 'admin')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ====================================================================
-- 3. 상품 마스터 테이블 (전주이씨 컬렉션)
-- ====================================================================
CREATE TABLE IF NOT EXISTS public.products (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    eng_name TEXT DEFAULT '',
    category TEXT NOT NULL CHECK (category IN ('ALL', 'NEW', 'BEST', 'OUTER', 'TOP', 'BOTTOM', 'ACCESSORIES', 'LIFESTYLE', 'SALE')),
    price INTEGER NOT NULL,
    original_price INTEGER DEFAULT NULL,
    is_new BOOLEAN DEFAULT false,
    is_best BOOLEAN DEFAULT false,
    is_sold_out BOOLEAN DEFAULT false,
    colors JSONB DEFAULT '[]'::jsonb,
    sizes TEXT[] DEFAULT ARRAY[]::text[],
    images TEXT[] DEFAULT ARRAY[]::text[],
    thumbnail TEXT DEFAULT '',
    short_desc TEXT DEFAULT '',
    detail_desc TEXT DEFAULT '',
    fabric TEXT DEFAULT '',
    fit TEXT DEFAULT '',
    care TEXT[] DEFAULT ARRAY[]::text[],
    rating NUMERIC(2,1) DEFAULT 5.0,
    review_count INTEGER DEFAULT 0,
    sales_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ====================================================================
-- 4. 주문 마스터 테이블 (결제, 쿠폰, 포인트, 송장, 환불 사유)
-- ====================================================================
CREATE TABLE IF NOT EXISTS public.orders (
    id TEXT PRIMARY KEY,
    order_number TEXT UNIQUE NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    order_date TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    items JSONB NOT NULL,
    total_product_price INTEGER NOT NULL,
    discount_price INTEGER DEFAULT 0,
    used_points INTEGER DEFAULT 0,
    coupon_discount INTEGER DEFAULT 0,
    coupon_code TEXT DEFAULT '',
    shipping_fee INTEGER DEFAULT 0,
    final_price INTEGER NOT NULL,
    status TEXT NOT NULL DEFAULT '결제완료',
    recipient_name TEXT NOT NULL,
    recipient_phone TEXT NOT NULL,
    postal_code TEXT DEFAULT '',
    address TEXT DEFAULT '',
    detail_address TEXT DEFAULT '',
    delivery_memo TEXT DEFAULT '',
    payment_method TEXT NOT NULL DEFAULT '신용/체크카드',
    tracking_carrier TEXT DEFAULT 'CJ대한통운',
    tracking_number TEXT DEFAULT '',
    refund_status TEXT DEFAULT 'none' CHECK (refund_status IN ('none', 'requested', 'completed')),
    cancel_reason TEXT DEFAULT '',
    refund_reason TEXT DEFAULT '',
    refund_account JSONB DEFAULT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ====================================================================
-- 5. ERP 원부자재 관리 테이블 (생사 명주, 몽골 캐시미어, 황동 부속 등)
-- ====================================================================
CREATE TABLE IF NOT EXISTS public.materials (
    id TEXT PRIMARY KEY,
    code TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    category TEXT NOT NULL CHECK (category IN ('원단', '자수실', '스트랩/버클', '라벨/부자재', '포장재', '도자기소재')),
    unit TEXT NOT NULL DEFAULT '야드(YD)',
    current_stock INTEGER NOT NULL DEFAULT 100,
    safe_stock INTEGER NOT NULL DEFAULT 20,
    unit_cost INTEGER NOT NULL DEFAULT 35000,
    supplier TEXT DEFAULT '제일모직 VIP 라인',
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ====================================================================
-- 6. ERP 발주 관리 테이블 (공방/제작처 발주서)
-- ====================================================================
CREATE TABLE IF NOT EXISTS public.purchase_orders (
    id TEXT PRIMARY KEY,
    po_number TEXT UNIQUE NOT NULL,
    item_type TEXT NOT NULL CHECK (item_type IN ('완제품의류', '원부자재', '라이프스타일소재')),
    item_name TEXT NOT NULL,
    supplier TEXT NOT NULL,
    quantity INTEGER NOT NULL,
    unit_cost INTEGER NOT NULL,
    total_cost INTEGER NOT NULL,
    status TEXT NOT NULL DEFAULT '발주대기' CHECK (status IN ('발주대기', '발주승인', '생산중', '입고완료', '발주취소')),
    expected_date DATE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ====================================================================
-- 7. 전자세금계산서 / 세금명세서 테이블
-- ====================================================================
CREATE TABLE IF NOT EXISTS public.tax_invoices (
    id TEXT PRIMARY KEY,
    invoice_number TEXT UNIQUE NOT NULL,
    order_id TEXT NOT NULL,
    issue_date DATE NOT NULL DEFAULT CURRENT_DATE,
    supplier_info JSONB NOT NULL,
    recipient_info JSONB NOT NULL,
    supply_amount INTEGER NOT NULL,
    tax_amount INTEGER NOT NULL,
    total_amount INTEGER NOT NULL,
    status TEXT NOT NULL DEFAULT '발행완료' CHECK (status IN ('발행완료', '발행대기', '취소됨')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ====================================================================
-- 8. 고객센터 Q&A 및 문의 게시판 테이블 (비밀글 기능)
-- ====================================================================
CREATE TABLE IF NOT EXISTS public.board_posts (
    id TEXT PRIMARY KEY,
    board_type TEXT NOT NULL DEFAULT 'qna' CHECK (board_type IN ('qna', 'free', 'reservation', 'notice')),
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    author_name TEXT NOT NULL,
    author_email TEXT DEFAULT '',
    is_secret BOOLEAN DEFAULT false,
    secret_password TEXT DEFAULT '',
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'answered')),
    answer TEXT DEFAULT '',
    answer_date TIMESTAMPTZ DEFAULT NULL,
    view_count INTEGER DEFAULT 0,
    likes_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ====================================================================
-- 9. 상품 리뷰 테이블 (별점, 포토리뷰, 1,000P 지급)
-- ====================================================================
CREATE TABLE IF NOT EXISTS public.reviews (
    id TEXT PRIMARY KEY,
    product_id TEXT NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    user_name TEXT NOT NULL,
    rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
    comment TEXT NOT NULL,
    fit_feedback TEXT DEFAULT '',
    images TEXT[] DEFAULT ARRAY[]::text[],
    likes_count INTEGER DEFAULT 0,
    helpful_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ====================================================================
-- 10. 포인트 이용 원장 테이블 (신규가입 5,000P, 구매 1%, 리뷰 1,000P, 결제차감)
-- ====================================================================
CREATE TABLE IF NOT EXISTS public.points_ledger (
    id TEXT PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    amount INTEGER NOT NULL,
    reason TEXT NOT NULL,
    balance_after INTEGER NOT NULL,
    type TEXT DEFAULT 'EARN' CHECK (type IN ('EARN', 'USE', 'REFUND')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ====================================================================
-- 11. 쿠폰 마스터 테이블
-- ====================================================================
CREATE TABLE IF NOT EXISTS public.coupons (
    id TEXT PRIMARY KEY,
    code TEXT UNIQUE NOT NULL,
    title TEXT NOT NULL,
    discount_type TEXT NOT NULL CHECK (discount_type IN ('PERCENT', 'FIXED')),
    discount_value INTEGER NOT NULL,
    min_order_price INTEGER DEFAULT 0,
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ====================================================================
-- 12. RLS (Row Level Security) 설정
-- ====================================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchase_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tax_invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.board_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.points_ledger ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;

-- 공용 읽기 허용 정책
CREATE POLICY "Public read products" ON public.products FOR SELECT USING (true);
CREATE POLICY "Public read materials" ON public.materials FOR SELECT USING (true);
CREATE POLICY "Public read purchase_orders" ON public.purchase_orders FOR SELECT USING (true);
CREATE POLICY "Public read tax_invoices" ON public.tax_invoices FOR SELECT USING (true);
CREATE POLICY "Public read board_posts" ON public.board_posts FOR SELECT USING (true);
CREATE POLICY "Public read reviews" ON public.reviews FOR SELECT USING (true);
CREATE POLICY "Public read coupons" ON public.coupons FOR SELECT USING (true);

-- 주문 및 사용자 데이터 정책
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can view own orders" ON public.orders FOR SELECT USING (auth.uid() = user_id OR user_id IS NULL);
CREATE POLICY "Users can insert orders" ON public.orders FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update orders" ON public.orders FOR UPDATE USING (true);
CREATE POLICY "Users can insert reviews" ON public.reviews FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can insert board posts" ON public.board_posts FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update board posts" ON public.board_posts FOR UPDATE USING (true);
CREATE POLICY "Admin full access products" ON public.products FOR ALL USING (true);
CREATE POLICY "Admin full access materials" ON public.materials FOR ALL USING (true);
CREATE POLICY "Admin full access purchase_orders" ON public.purchase_orders FOR ALL USING (true);
CREATE POLICY "Admin full access tax_invoices" ON public.tax_invoices FOR ALL USING (true);

-- ====================================================================
-- 13. 초기 데이터 시드 (Initial Seed Data)
-- ====================================================================
INSERT INTO public.coupons (id, code, title, discount_type, discount_value, min_order_price, expires_at)
VALUES
  ('cpn-01', 'WELCOME10', '전주이씨 가문 가입 축하 10% 할인 쿠폰', 'PERCENT', 10, 50000, now() + interval '365 days'),
  ('cpn-02', 'ROYAL15', '조선 왕실 VIP 멤버십 15% 특별 우대 쿠폰', 'PERCENT', 15, 100000, now() + interval '180 days'),
  ('cpn-03', 'JEONJU30', '헤리티지 컬렉션 30,000원 정액 할인권', 'FIXED', 30000, 150000, now() + interval '90 days')
ON CONFLICT (code) DO NOTHING;
