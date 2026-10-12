-- =====================================================================================
-- 전주이씨 (JEONJU LEE) 대시보드 · 주문 · 원부자재 · 발주 통합 테이블 생성 및 초기 데이터 SQL
-- 대상 프로젝트: https://cpzyrpaenvzfshqqpmrf.supabase.co
-- (어떤 테이블이 없더라도 에러(42P01) 없이 한 번에 모두 생성 및 한글 설명이 적용됩니다)
-- =====================================================================================

-- 1. 📊 [대시보드 요약] (public.dashboard_summary)
CREATE TABLE IF NOT EXISTS public.dashboard_summary (
    id TEXT PRIMARY KEY DEFAULT 'main',
    brand_name TEXT NOT NULL DEFAULT '전주이씨 (JEONJU LEE)',
    ceo_name TEXT NOT NULL DEFAULT '이종웅 대표',
    total_revenue INTEGER NOT NULL DEFAULT 0,             -- 누적 결제 매출 (원)
    total_order_count INTEGER NOT NULL DEFAULT 0,         -- 전체 결제 합산 건수 (건)
    pending_shipping_count INTEGER NOT NULL DEFAULT 0,    -- 배송 및 환불 대기 건수 (건)
    refund_request_count INTEGER NOT NULL DEFAULT 0,      -- 반품/환불 신청 건수 (건)
    registered_member_count INTEGER NOT NULL DEFAULT 0,   -- 등록 회원 수 (명)
    low_stock_material_count INTEGER NOT NULL DEFAULT 0,  -- 안전재고 부족 자재 수 (종)
    total_product_count INTEGER NOT NULL DEFAULT 0,       -- 등록 상품 수 (종)
    total_po_count INTEGER NOT NULL DEFAULT 0,            -- 원부자재 발주 건수 (건)
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE public.dashboard_summary IS '📊 [대시보드 요약] 누적 매출, 배송/환불 대기, 등록 회원 수, 부족 자재 현황';
COMMENT ON COLUMN public.dashboard_summary.total_revenue IS '누적 결제 매출 (원)';
COMMENT ON COLUMN public.dashboard_summary.total_order_count IS '전체 결제 합산 건수 (건)';
COMMENT ON COLUMN public.dashboard_summary.pending_shipping_count IS '배송 및 환불 대기 건수 (건)';
COMMENT ON COLUMN public.dashboard_summary.refund_request_count IS '반품/환불 신청 건수 (건)';
COMMENT ON COLUMN public.dashboard_summary.registered_member_count IS '등록 회원 수 (명)';
COMMENT ON COLUMN public.dashboard_summary.low_stock_material_count IS '안전재고 부족 자재 수 (종)';

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


-- 2. 📦 [대시보드 실시간 주문내역] (public.dashboard_orders)
CREATE TABLE IF NOT EXISTS public.dashboard_orders (
    id TEXT PRIMARY KEY,
    order_number TEXT UNIQUE NOT NULL,                    -- 주문번호 (예: ORD-20260305-8821)
    order_date TEXT NOT NULL,                             -- 주문일시 (예: 2026-03-05 14:20)
    customer_name TEXT NOT NULL,                          -- 주문자 (예: 김서연)
    product_name TEXT NOT NULL,                           -- 품목명 (예: 울 캐시미어 릴렉스드 도포 코트)
    final_price INTEGER NOT NULL DEFAULT 0,               -- 실결제액 (예: 416200)
    status TEXT NOT NULL DEFAULT '결제완료',              -- 상태 (결제완료 / 배송중 / 배송완료 / 반품신청 / 환불완료)
    payment_method TEXT DEFAULT '신용/체크카드',          -- 결제수단
    tracking_carrier TEXT DEFAULT '',                     -- 택배사
    tracking_number TEXT DEFAULT '',                      -- 송장번호
    recipient_phone TEXT DEFAULT '',                      -- 연락처
    address TEXT DEFAULT '',                              -- 배송지 주소
    items JSONB NOT NULL DEFAULT '[]'::jsonb,             -- 주문 상품 상세(JSON)
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE public.dashboard_orders IS '📦 [대시보드 실시간 주문내역] 주문번호, 주문일시, 주문자, 품목명, 실결제액, 배송상태';
COMMENT ON COLUMN public.dashboard_orders.order_number IS '주문번호';
COMMENT ON COLUMN public.dashboard_orders.order_date IS '주문일시';
COMMENT ON COLUMN public.dashboard_orders.customer_name IS '주문자 성명';
COMMENT ON COLUMN public.dashboard_orders.product_name IS '주문 품목명 요약';
COMMENT ON COLUMN public.dashboard_orders.final_price IS '실결제액 (원)';
COMMENT ON COLUMN public.dashboard_orders.status IS '주문/배송 상태';

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


-- 3. 🛒 [주문/배송/환불 관리] (public.orders)
CREATE TABLE IF NOT EXISTS public.orders (
    id TEXT PRIMARY KEY,
    order_number TEXT UNIQUE NOT NULL,
    customer_name TEXT DEFAULT '고객',
    product_summary TEXT DEFAULT '',
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
    recipient_name TEXT NOT NULL,
    recipient_phone TEXT NOT NULL,
    postal_code TEXT NOT NULL DEFAULT '',
    address TEXT NOT NULL DEFAULT '',
    detail_address TEXT DEFAULT '',
    delivery_memo TEXT DEFAULT '',
    payment_method TEXT NOT NULL DEFAULT '신용/체크카드',
    tracking_carrier TEXT,
    tracking_number TEXT,
    cancel_reason TEXT,
    refund_status TEXT DEFAULT 'none',
    refund_reason TEXT,
    refund_account JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS customer_name TEXT DEFAULT '고객';
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS product_summary TEXT DEFAULT '';
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS refund_status TEXT DEFAULT 'none';
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS refund_account JSONB;

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


-- 4. 🧵 [원부자재 재고] (public.materials) - 없을 경우 함께 자동 생성
CREATE TABLE IF NOT EXISTS public.materials (
    id TEXT PRIMARY KEY,
    code TEXT NOT NULL,
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    unit TEXT NOT NULL,
    current_stock INTEGER NOT NULL DEFAULT 0,
    safe_stock INTEGER NOT NULL DEFAULT 20,
    unit_cost INTEGER NOT NULL DEFAULT 0,
    supplier TEXT NOT NULL,
    updated_at DATE NOT NULL DEFAULT CURRENT_DATE
);

ALTER TABLE public.materials ADD COLUMN IF NOT EXISTS safe_stock INTEGER NOT NULL DEFAULT 20;
ALTER TABLE public.materials ADD COLUMN IF NOT EXISTS unit_cost INTEGER NOT NULL DEFAULT 0;
ALTER TABLE public.materials ADD COLUMN IF NOT EXISTS updated_at DATE NOT NULL DEFAULT CURRENT_DATE;
COMMENT ON TABLE public.materials IS '🧵 [원부자재 재고] 원단, 안감, 부자재, 패키지 현재고 및 안전재고';

ALTER TABLE public.materials ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "materials_select_policy" ON public.materials;
CREATE POLICY "materials_select_policy" ON public.materials FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "materials_insert_policy" ON public.materials;
CREATE POLICY "materials_insert_policy" ON public.materials FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "materials_update_policy" ON public.materials;
CREATE POLICY "materials_update_policy" ON public.materials FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "materials_delete_policy" ON public.materials;
CREATE POLICY "materials_delete_policy" ON public.materials FOR DELETE TO anon, authenticated USING (true);
GRANT ALL ON public.materials TO anon, authenticated, service_role;


-- 5. 📋 [원부자재 발주관리] (public.purchase_orders) - 없을 경우 함께 자동 생성
CREATE TABLE IF NOT EXISTS public.purchase_orders (
    id TEXT PRIMARY KEY,
    po_number TEXT UNIQUE NOT NULL,
    item_type TEXT NOT NULL DEFAULT '원부자재',
    item_name TEXT NOT NULL,
    supplier TEXT NOT NULL DEFAULT '국내 공방',
    quantity INTEGER NOT NULL DEFAULT 1,
    unit_cost INTEGER NOT NULL DEFAULT 0,
    total_cost INTEGER NOT NULL DEFAULT 0,
    status TEXT NOT NULL DEFAULT '발주승인',
    expected_date DATE NOT NULL DEFAULT CURRENT_DATE,
    created_at DATE NOT NULL DEFAULT CURRENT_DATE
);

COMMENT ON TABLE public.purchase_orders IS '📋 [원부자재 발주관리] 거래처 발주서, 입고예정일 및 입고상태';

ALTER TABLE public.purchase_orders ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "po_select_policy" ON public.purchase_orders;
CREATE POLICY "po_select_policy" ON public.purchase_orders FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "po_insert_policy" ON public.purchase_orders;
CREATE POLICY "po_insert_policy" ON public.purchase_orders FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "po_update_policy" ON public.purchase_orders;
CREATE POLICY "po_update_policy" ON public.purchase_orders FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "po_delete_policy" ON public.purchase_orders;
CREATE POLICY "po_delete_policy" ON public.purchase_orders FOR DELETE TO anon, authenticated USING (true);
GRANT ALL ON public.purchase_orders TO anon, authenticated, service_role;


-- 6. 초기 대시보드 데이터(매출 요약 + 실시간 주문 2건) 즉시 삽입
INSERT INTO public.dashboard_summary (
    id, brand_name, ceo_name, total_revenue, total_order_count,
    pending_shipping_count, refund_request_count, registered_member_count,
    low_stock_material_count, total_product_count, total_po_count, updated_at
) VALUES (
    'main', '전주이씨 (JEONJU LEE)', '이종웅 대표',
    484200, 2, 0, 0, 3, 2, 20, 3, NOW()
) ON CONFLICT (id) DO UPDATE SET
    ceo_name = EXCLUDED.ceo_name,
    total_revenue = EXCLUDED.total_revenue,
    total_order_count = EXCLUDED.total_order_count,
    pending_shipping_count = EXCLUDED.pending_shipping_count,
    refund_request_count = EXCLUDED.refund_request_count,
    registered_member_count = EXCLUDED.registered_member_count,
    low_stock_material_count = EXCLUDED.low_stock_material_count,
    updated_at = NOW();

INSERT INTO public.dashboard_orders (
    id, order_number, order_date, customer_name, product_name,
    final_price, status, payment_method, tracking_carrier, tracking_number,
    recipient_phone, address, items, updated_at
) VALUES
(
    'ord-20260305-01',
    'ORD-20260305-8821',
    '2026-03-05 14:20',
    '김서연',
    '울 캐시미어 릴렉스드 도포 코트',
    416200,
    '배송중',
    '신용/체크카드 (현대카드)',
    'CJ대한통운',
    '6482-9103-4412',
    '010-9876-5432',
    '서울특별시 강남구 압구정로 10 101동 502호',
    '[{"productId":"jl-out-01","name":"울 캐시미어 릴렉스드 도포 코트","image":"https://images.unsplash.com/photo-1544441893-675973e31985?auto=format&fit=crop&w=600&q=80","color":"먹색 (Ink Black)","size":"L (100-105)","price":468000,"quantity":1}]'::jsonb,
    NOW()
),
(
    'ord-20260228-02',
    'ORD-20260228-3312',
    '2026-02-28 19:05',
    '김서연',
    '전통 매듭 노리개 키링 & 가죽 참',
    68000,
    '배송완료',
    '간편결제 (카카오페이)',
    '우체국택배',
    '1049-2281-9930',
    '010-9876-5432',
    '서울특별시 강남구 압구정로 10 101동 502호',
    '[{"productId":"jl-acc-02","name":"전통 매듭 노리개 키링 & 가죽 참","image":"https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=600&q=80","color":"비취/적색 (Jade & Crimson)","size":"FREE","price":68000,"quantity":1}]'::jsonb,
    NOW()
)
ON CONFLICT (id) DO UPDATE SET
    order_number = EXCLUDED.order_number,
    order_date = EXCLUDED.order_date,
    customer_name = EXCLUDED.customer_name,
    product_name = EXCLUDED.product_name,
    final_price = EXCLUDED.final_price,
    status = EXCLUDED.status,
    updated_at = NOW();

INSERT INTO public.orders (
    id, order_number, customer_name, product_summary, order_date, items,
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
    '[{"productId":"jl-out-01","name":"울 캐시미어 릴렉스드 도포 코트","image":"https://images.unsplash.com/photo-1544441893-675973e31985?auto=format&fit=crop&w=600&q=80","color":"먹색 (Ink Black)","size":"L (100-105)","price":468000,"quantity":1}]'::jsonb,
    468000, 46800, 5000, 46800, 'WELCOME10',
    0, 416200, '배송중', '김서연', '010-9876-5432',
    '06000', '서울특별시 강남구 압구정로 10', '101동 502호', '문 앞에 놓아주세요.',
    '신용/체크카드 (현대카드)', 'CJ대한통운', '6482-9103-4412'
),
(
    'ord-20260228-02',
    'ORD-20260228-3312',
    '김서연',
    '전통 매듭 노리개 키링 & 가죽 참',
    '2026-02-28 19:05',
    '[{"productId":"jl-acc-02","name":"전통 매듭 노리개 키링 & 가죽 참","image":"https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=600&q=80","color":"비취/적색 (Jade & Crimson)","size":"FREE","price":68000,"quantity":1}]'::jsonb,
    68000, 0, 0, 0, NULL,
    0, 68000, '배송완료', '김서연', '010-9876-5432',
    '06000', '서울특별시 강남구 압구정로 10', '101동 502호', '경비실에 맡겨주세요.',
    '간편결제 (카카오페이)', '우체국택배', '1049-2281-9930'
)
ON CONFLICT (id) DO UPDATE SET
    order_number = EXCLUDED.order_number,
    customer_name = EXCLUDED.customer_name,
    product_summary = EXCLUDED.product_summary,
    final_price = EXCLUDED.final_price,
    status = EXCLUDED.status;
