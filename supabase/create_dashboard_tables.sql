-- ====================================================================
-- 전주이씨 (JEONJU LEE) 어드민 대시보드(dashboard_summary, dashboard_orders, orders) 테이블 생성 SQL
-- 대상 프로젝트: https://cpzyrpaenvzfshqqpmrf.supabase.co
-- Supabase 대시보드 -> SQL Editor에 붙여넣고 [Run]을 실행하세요.
-- ====================================================================

-- 1. [대시보드 상단 요약 지표] 테이블 (public.dashboard_summary)
-- 대시보드 화면 상단의 4대 핵심 카드(누적 결제 매출, 배송/환불 대기, 등록 회원 수, 안전재고 부족 자재)가 저장됩니다.
CREATE TABLE IF NOT EXISTS public.dashboard_summary (
    id TEXT PRIMARY KEY DEFAULT 'main-dashboard',
    dashboard_title TEXT NOT NULL DEFAULT '전주이씨 공식 부티크 실시간 대시보드',
    total_revenue BIGINT NOT NULL DEFAULT 0,               -- 누적 결제 매출 (원)
    total_order_count INTEGER NOT NULL DEFAULT 0,          -- 전체 결제 주문 건수 (건)
    pending_shipping_count INTEGER NOT NULL DEFAULT 0,     -- 배송 및 환불 대기 건수 (건)
    refund_request_count INTEGER NOT NULL DEFAULT 0,       -- 반품/환불 신청 건수 (건)
    registered_member_count INTEGER NOT NULL DEFAULT 0,    -- 등록 회원 수 (명)
    low_stock_material_count INTEGER NOT NULL DEFAULT 0,   -- 안전재고 부족 자재 수 (종)
    total_product_count INTEGER NOT NULL DEFAULT 0,        -- 등록 상품 수 (개)
    total_po_count INTEGER NOT NULL DEFAULT 0,             -- 공방 발주서 수 (건)
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()          -- 최근 동기화 일시
);

COMMENT ON TABLE public.dashboard_summary IS '📊 [대시보드 요약] 누적 매출, 배송/환불 대기, 등록 회원 수, 부족 자재 현황';
COMMENT ON COLUMN public.dashboard_summary.id IS '대시보드 식별코드 (main-dashboard)';
COMMENT ON COLUMN public.dashboard_summary.dashboard_title IS '대시보드 명칭';
COMMENT ON COLUMN public.dashboard_summary.total_revenue IS '누적 결제 매출 (원)';
COMMENT ON COLUMN public.dashboard_summary.total_order_count IS '전체 결제 합산 건수 (건)';
COMMENT ON COLUMN public.dashboard_summary.pending_shipping_count IS '배송 및 환불 대기 건수 (건)';
COMMENT ON COLUMN public.dashboard_summary.refund_request_count IS '반품/환불 신청 건수 (건)';
COMMENT ON COLUMN public.dashboard_summary.registered_member_count IS '등록 회원 수 (명)';
COMMENT ON COLUMN public.dashboard_summary.low_stock_material_count IS '안전재고 부족 자재 (종)';
COMMENT ON COLUMN public.dashboard_summary.total_product_count IS '등록 상품 수 (개)';
COMMENT ON COLUMN public.dashboard_summary.total_po_count IS '공방 발주 건수 (건)';
COMMENT ON COLUMN public.dashboard_summary.updated_at IS '최근 DB 저장 일시';

ALTER TABLE public.dashboard_summary ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "dashboard_summary_select_policy" ON public.dashboard_summary;
CREATE POLICY "dashboard_summary_select_policy" ON public.dashboard_summary FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "dashboard_summary_insert_policy" ON public.dashboard_summary;
CREATE POLICY "dashboard_summary_insert_policy" ON public.dashboard_summary FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "dashboard_summary_update_policy" ON public.dashboard_summary;
CREATE POLICY "dashboard_summary_update_policy" ON public.dashboard_summary FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "dashboard_summary_delete_policy" ON public.dashboard_summary;
CREATE POLICY "dashboard_summary_delete_policy" ON public.dashboard_summary FOR DELETE TO anon, authenticated USING (true);

GRANT ALL ON public.dashboard_summary TO anon, authenticated, service_role;

-- 2. [대시보드 실시간 주문 접수 내역] 직관적 테이블 (public.dashboard_orders)
-- 대시보드 하단 표(주문번호 | 주문일시 | 주문자 | 품목명 | 실결제액 | 상태)와 1:1로 대응되는 알아보기 쉬운 테이블입니다.
CREATE TABLE IF NOT EXISTS public.dashboard_orders (
    id TEXT PRIMARY KEY,
    order_number TEXT UNIQUE NOT NULL,                     -- 주문번호 (예: ORD-20260305-8821)
    order_date TEXT NOT NULL,                              -- 주문일시 (예: 2026-03-05 14:20)
    customer_name TEXT NOT NULL,                           -- 주문자 성명 (예: 김서연)
    product_name TEXT NOT NULL,                            -- 품목명 요약 (예: 울 캐시미어 릴렉스드 도포 코트)
    final_price INTEGER NOT NULL DEFAULT 0,                -- 실결제액 (원)
    status TEXT NOT NULL DEFAULT '결제완료',                 -- 상태 (결제완료/배송중/배송완료/반품신청/환불완료)
    payment_method TEXT DEFAULT '신용/체크카드',             -- 결제수단
    tracking_carrier TEXT DEFAULT '',                      -- 택배사
    tracking_number TEXT DEFAULT '',                       -- 송장번호
    recipient_phone TEXT DEFAULT '',                       -- 주문자 연락처
    postal_code TEXT DEFAULT '',                           -- 우편번호
    address TEXT DEFAULT '',                               -- 배송지 주소
    detail_address TEXT DEFAULT '',                        -- 상세 주소
    delivery_memo TEXT DEFAULT '',                         -- 배송 메모
    total_product_price INTEGER DEFAULT 0,                 -- 상품 총액
    discount_price INTEGER DEFAULT 0,                      -- 할인 금액
    used_points INTEGER DEFAULT 0,                         -- 사용 포인트
    shipping_fee INTEGER DEFAULT 0,                        -- 배송비
    items JSONB DEFAULT '[]'::jsonb,                       -- 주문 상품 상세 목록
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.dashboard_orders IS '📦 [대시보드 실시간 주문내역] 주문번호, 주문일시, 주문자, 품목명, 실결제액, 배송상태';
COMMENT ON COLUMN public.dashboard_orders.order_number IS '주문번호 (예: ORD-20260305-8821)';
COMMENT ON COLUMN public.dashboard_orders.order_date IS '주문일시 (예: 2026-03-05 14:20)';
COMMENT ON COLUMN public.dashboard_orders.customer_name IS '주문자 (수령인 성명)';
COMMENT ON COLUMN public.dashboard_orders.product_name IS '주문 품목명';
COMMENT ON COLUMN public.dashboard_orders.final_price IS '실결제액 (원)';
COMMENT ON COLUMN public.dashboard_orders.status IS '주문/배송 상태';
COMMENT ON COLUMN public.dashboard_orders.tracking_carrier IS '택배사';
COMMENT ON COLUMN public.dashboard_orders.tracking_number IS '운송장번호';

ALTER TABLE public.dashboard_orders ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "dashboard_orders_select_policy" ON public.dashboard_orders;
CREATE POLICY "dashboard_orders_select_policy" ON public.dashboard_orders FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "dashboard_orders_insert_policy" ON public.dashboard_orders;
CREATE POLICY "dashboard_orders_insert_policy" ON public.dashboard_orders FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "dashboard_orders_update_policy" ON public.dashboard_orders;
CREATE POLICY "dashboard_orders_update_policy" ON public.dashboard_orders FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "dashboard_orders_delete_policy" ON public.dashboard_orders;
CREATE POLICY "dashboard_orders_delete_policy" ON public.dashboard_orders FOR DELETE TO anon, authenticated USING (true);

GRANT ALL ON public.dashboard_orders TO anon, authenticated, service_role;

-- 3. [주문/배송/환불 마스터] 테이블 (public.orders) 호환성 보강 및 권한 설정
CREATE TABLE IF NOT EXISTS public.orders (
    id TEXT PRIMARY KEY,
    order_number TEXT UNIQUE NOT NULL,
    customer_name TEXT DEFAULT '',
    product_name TEXT DEFAULT '',
    user_id TEXT,
    order_date TEXT NOT NULL,
    items JSONB NOT NULL DEFAULT '[]'::jsonb,
    total_product_price INTEGER NOT NULL DEFAULT 0,
    discount_price INTEGER DEFAULT 0,
    used_points INTEGER DEFAULT 0,
    coupon_discount INTEGER DEFAULT 0,
    coupon_code TEXT,
    shipping_fee INTEGER DEFAULT 0,
    final_price INTEGER NOT NULL DEFAULT 0,
    status TEXT NOT NULL DEFAULT '결제완료',
    recipient_name TEXT NOT NULL DEFAULT '',
    recipient_phone TEXT NOT NULL DEFAULT '',
    postal_code TEXT DEFAULT '',
    address TEXT NOT NULL DEFAULT '',
    detail_address TEXT DEFAULT '',
    delivery_memo TEXT DEFAULT '',
    payment_method TEXT NOT NULL DEFAULT '신용/체크카드',
    tracking_carrier TEXT,
    tracking_number TEXT,
    cancel_reason TEXT,
    refund_reason TEXT,
    refund_bank TEXT,
    refund_account TEXT,
    refund_holder TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS customer_name TEXT DEFAULT '';
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS product_name TEXT DEFAULT '';

COMMENT ON TABLE public.orders IS '🛒 [주문/배송/환불 관리] 전체 주문 상세 내역 및 송장/환불 정보';

ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "orders_select_policy" ON public.orders;
CREATE POLICY "orders_select_policy" ON public.orders FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "orders_insert_policy" ON public.orders;
CREATE POLICY "orders_insert_policy" ON public.orders FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "orders_update_policy" ON public.orders;
CREATE POLICY "orders_update_policy" ON public.orders FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "orders_delete_policy" ON public.orders;
CREATE POLICY "orders_delete_policy" ON public.orders FOR DELETE TO anon, authenticated USING (true);

GRANT ALL ON public.orders TO anon, authenticated, service_role;

-- 4. 기존 테이블들에도 한눈에 알아보기 쉬운 한글 설명(COMMENT) 부여
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'members') THEN
        EXECUTE 'COMMENT ON TABLE public.members IS ''👥 [회원/포인트 관리] 회원가입 이메일, 비밀번호, 등급, 보유 포인트''';
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'products') THEN
        EXECUTE 'COMMENT ON TABLE public.products IS ''🧥 [상품/재고 관리] 전주이씨 컬렉션 상품 정보, 가격, 재고, 이미지''';
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'materials') THEN
        EXECUTE 'COMMENT ON TABLE public.materials IS ''🧵 [원부자재 ERP] 원단, 자수실, 부자재 현재고 및 안전재고''';
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'purchase_orders') THEN
        EXECUTE 'COMMENT ON TABLE public.purchase_orders IS ''📋 [공방 발주서 관리] 아틀리에 및 원부자재 발주 내역, 납기일, 진행상태''';
    END IF;
END $$;

-- 5. 대시보드 초기 데이터(현재 화면과 동일한 기본값) 즉시 저장
INSERT INTO public.dashboard_summary (
    id, dashboard_title, total_revenue, total_order_count, pending_shipping_count,
    refund_request_count, registered_member_count, low_stock_material_count,
    total_product_count, total_po_count, updated_at
) VALUES (
    'main-dashboard',
    '전주이씨 공식 부티크 실시간 대시보드',
    484200,
    2,
    0,
    0,
    4,
    0,
    10,
    3,
    now()
)
ON CONFLICT (id) DO UPDATE SET
    total_revenue = EXCLUDED.total_revenue,
    total_order_count = EXCLUDED.total_order_count,
    pending_shipping_count = EXCLUDED.pending_shipping_count,
    refund_request_count = EXCLUDED.refund_request_count,
    registered_member_count = EXCLUDED.registered_member_count,
    low_stock_material_count = EXCLUDED.low_stock_material_count,
    updated_at = now();

INSERT INTO public.dashboard_orders (
    id, order_number, order_date, customer_name, product_name, final_price, status,
    payment_method, tracking_carrier, tracking_number, recipient_phone, postal_code,
    address, detail_address, delivery_memo, total_product_price, discount_price,
    used_points, shipping_fee, items
) VALUES
(
    'ord-20260305-01',
    'ORD-20260305-8821',
    '2026-03-05 14:20',
    '김서연',
    '울 캐시미어 릴렉스드 도포 코트',
    416200,
    '배송중',
    '신용/체크카드',
    'CJ대한통운',
    '6892-0192-3841',
    '010-9876-5432',
    '06000',
    '서울특별시 강남구 압구정로 10',
    '101동 502호',
    '부재 시 경비실에 보관해 주세요.',
    468000,
    46800,
    5000,
    0,
    '[{"productId": "jl-out-01", "name": "울 캐시미어 릴렉스드 도포 코트", "image": "https://images.unsplash.com/photo-1544441893-675973e31985?auto=format&fit=crop&w=600&q=80", "color": "먹색 (Ink Black)", "size": "L (100-105)", "price": 468000, "quantity": 1}]'::jsonb
),
(
    'ord-20260228-02',
    'ORD-20260228-3312',
    '2026-02-28 11:15',
    '김서연',
    '황동 노리개 모티브 레더 키링',
    68000,
    '배송완료',
    '카카오페이',
    '우체국택배',
    '7021-9981-2245',
    '010-9876-5432',
    '06000',
    '서울특별시 강남구 압구정로 10',
    '101동 502호',
    '문 앞에 놓아주세요.',
    68000,
    0,
    0,
    0,
    '[{"productId": "jl-acc-01", "name": "황동 노리개 모티브 레더 키링", "image": "https://images.unsplash.com/photo-1627123424574-724758594e93?auto=format&fit=crop&w=600&q=80", "color": "에이지드 브론즈 (Aged Bronze)", "size": "FREE", "price": 68000, "quantity": 1}]'::jsonb
)
ON CONFLICT (id) DO UPDATE SET
    order_number = EXCLUDED.order_number,
    order_date = EXCLUDED.order_date,
    customer_name = EXCLUDED.customer_name,
    product_name = EXCLUDED.product_name,
    final_price = EXCLUDED.final_price,
    status = EXCLUDED.status,
    tracking_carrier = EXCLUDED.tracking_carrier,
    tracking_number = EXCLUDED.tracking_number,
    updated_at = now();

INSERT INTO public.orders (
    id, order_number, customer_name, product_name, order_date, items,
    total_product_price, discount_price, used_points, coupon_discount, coupon_code,
    shipping_fee, final_price, status, recipient_name, recipient_phone,
    postal_code, address, detail_address, delivery_memo, payment_method,
    tracking_carrier, tracking_number
) VALUES
(
    'ord-20260305-01',
    'ORD-20260305-8821',
    '김서연',
    '울 캐시미어 릴렉스드 도포 코트',
    '2026-03-05 14:20',
    '[{"productId": "jl-out-01", "name": "울 캐시미어 릴렉스드 도포 코트", "image": "https://images.unsplash.com/photo-1544441893-675973e31985?auto=format&fit=crop&w=600&q=80", "color": "먹색 (Ink Black)", "size": "L (100-105)", "price": 468000, "quantity": 1}]'::jsonb,
    468000, 46800, 5000, 46800, 'WELCOME10', 0, 416200, '배송중',
    '김서연', '010-9876-5432', '06000', '서울특별시 강남구 압구정로 10', '101동 502호',
    '부재 시 경비실에 보관해 주세요.', '신용/체크카드', 'CJ대한통운', '6892-0192-3841'
),
(
    'ord-20260228-02',
    'ORD-20260228-3312',
    '김서연',
    '황동 노리개 모티브 레더 키링',
    '2026-02-28 11:15',
    '[{"productId": "jl-acc-01", "name": "황동 노리개 모티브 레더 키링", "image": "https://images.unsplash.com/photo-1627123424574-724758594e93?auto=format&fit=crop&w=600&q=80", "color": "에이지드 브론즈 (Aged Bronze)", "size": "FREE", "price": 68000, "quantity": 1}]'::jsonb,
    68000, 0, 0, 0, NULL, 0, 68000, '배송완료',
    '김서연', '010-9876-5432', '06000', '서울특별시 강남구 압구정로 10', '101동 502호',
    '문 앞에 놓아주세요.', '카카오페이', '우체국택배', '7021-9981-2245'
)
ON CONFLICT (id) DO UPDATE SET
    status = EXCLUDED.status,
    customer_name = EXCLUDED.customer_name,
    product_name = EXCLUDED.product_name,
    final_price = EXCLUDED.final_price,
    tracking_carrier = EXCLUDED.tracking_carrier,
    tracking_number = EXCLUDED.tracking_number;
