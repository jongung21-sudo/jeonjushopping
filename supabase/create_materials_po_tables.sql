-- ============================================================================
-- 전주이씨 (JEONJU LEE) 원부자재(materials) 및 발주관리(purchase_orders) 테이블 생성 SQL
-- 대상 프로젝트: https://cpzyrpaenvzfshqqpmrf.supabase.co
-- 실행 방법: Supabase Dashboard -> SQL Editor -> New Query 에 붙여넣고 [Run] 클릭
-- ============================================================================

-- 1. 원부자재 수급 및 재고 관리 테이블 (public.materials)
CREATE TABLE IF NOT EXISTS public.materials (
    id TEXT PRIMARY KEY,
    code TEXT NOT NULL,
    name TEXT NOT NULL,
    category TEXT NOT NULL DEFAULT '원단',
    unit TEXT NOT NULL DEFAULT '야드(YD)',
    current_stock INTEGER NOT NULL DEFAULT 100,
    safe_stock INTEGER NOT NULL DEFAULT 20,
    unit_cost INTEGER NOT NULL DEFAULT 35000,
    supplier TEXT DEFAULT '',
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.materials DROP CONSTRAINT IF EXISTS materials_category_check;
ALTER TABLE public.materials ADD COLUMN IF NOT EXISTS code TEXT DEFAULT '';
ALTER TABLE public.materials ADD COLUMN IF NOT EXISTS name TEXT DEFAULT '';
ALTER TABLE public.materials ADD COLUMN IF NOT EXISTS category TEXT DEFAULT '원단';
ALTER TABLE public.materials ADD COLUMN IF NOT EXISTS unit TEXT DEFAULT '야드(YD)';
ALTER TABLE public.materials ADD COLUMN IF NOT EXISTS current_stock INTEGER DEFAULT 100;
ALTER TABLE public.materials ADD COLUMN IF NOT EXISTS safe_stock INTEGER DEFAULT 20;
ALTER TABLE public.materials ADD COLUMN IF NOT EXISTS unit_cost INTEGER DEFAULT 35000;
ALTER TABLE public.materials ADD COLUMN IF NOT EXISTS supplier TEXT DEFAULT '';
ALTER TABLE public.materials ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now();

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

-- 2. 원부자재 및 아틀리에 발주 관리 테이블 (public.purchase_orders)
CREATE TABLE IF NOT EXISTS public.purchase_orders (
    id TEXT PRIMARY KEY,
    po_number TEXT NOT NULL,
    item_type TEXT NOT NULL DEFAULT '원부자재',
    item_name TEXT NOT NULL,
    supplier TEXT NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 1,
    unit_cost INTEGER NOT NULL DEFAULT 0,
    total_cost INTEGER NOT NULL DEFAULT 0,
    status TEXT NOT NULL DEFAULT '발주승인',
    expected_date TEXT DEFAULT '',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.purchase_orders DROP CONSTRAINT IF EXISTS purchase_orders_item_type_check;
ALTER TABLE public.purchase_orders DROP CONSTRAINT IF EXISTS purchase_orders_status_check;
ALTER TABLE public.purchase_orders ADD COLUMN IF NOT EXISTS po_number TEXT DEFAULT '';
ALTER TABLE public.purchase_orders ADD COLUMN IF NOT EXISTS item_type TEXT DEFAULT '원부자재';
ALTER TABLE public.purchase_orders ADD COLUMN IF NOT EXISTS item_name TEXT DEFAULT '';
ALTER TABLE public.purchase_orders ADD COLUMN IF NOT EXISTS supplier TEXT DEFAULT '';
ALTER TABLE public.purchase_orders ADD COLUMN IF NOT EXISTS quantity INTEGER DEFAULT 1;
ALTER TABLE public.purchase_orders ADD COLUMN IF NOT EXISTS unit_cost INTEGER DEFAULT 0;
ALTER TABLE public.purchase_orders ADD COLUMN IF NOT EXISTS total_cost INTEGER DEFAULT 0;
ALTER TABLE public.purchase_orders ADD COLUMN IF NOT EXISTS status TEXT DEFAULT '발주승인';
ALTER TABLE public.purchase_orders ADD COLUMN IF NOT EXISTS expected_date TEXT DEFAULT '';
ALTER TABLE public.purchase_orders ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT now();

ALTER TABLE public.purchase_orders ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "purchase_orders_select_policy" ON public.purchase_orders;
CREATE POLICY "purchase_orders_select_policy" ON public.purchase_orders FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "purchase_orders_insert_policy" ON public.purchase_orders;
CREATE POLICY "purchase_orders_insert_policy" ON public.purchase_orders FOR INSERT TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "purchase_orders_update_policy" ON public.purchase_orders;
CREATE POLICY "purchase_orders_update_policy" ON public.purchase_orders FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "purchase_orders_delete_policy" ON public.purchase_orders;
CREATE POLICY "purchase_orders_delete_policy" ON public.purchase_orders FOR DELETE TO anon, authenticated USING (true);

GRANT ALL ON public.purchase_orders TO anon, authenticated, service_role;

-- 3. 기본 원부자재 6종 초기 데이터 삽입
INSERT INTO public.materials (id, code, name, category, unit, current_stock, safe_stock, unit_cost, supplier)
VALUES
    ('mat-01', 'FAB-WOOL-90', '호주산 프리미엄 메리노 울 90% (먹색)', '원단', '야드(YD)', 145, 30, 48000, '제일모직 VIP 라인'),
    ('mat-02', 'FAB-CASH-10', '몽골리안 유기농 캐시미어 10% 블렌딩 원사', '원단', 'KG', 68, 15, 125000, '몽골 헤리티지 울'),
    ('mat-03', 'SILK-THREAD-01', '진주산 생사 천연 비단 자수실 (금사/은사/먹사)', '자수실', '타래', 220, 50, 18000, '경남 진주 실크 공방'),
    ('mat-04', 'BRASS-KEY-01', '전통 주물 솔리드 브라스(황동) 카라비너 파츠', '스트랩/버클', '개(EA)', 310, 60, 14000, '문경 금속 공예사'),
    ('mat-05', 'LEATHER-BUTT-01', '이탈리안 뷰테로 베지터블 레더 (먹색/브라운)', '원단', '평(SQFT)', 95, 25, 32000, 'Conceria Walpier (Italia)'),
    ('mat-06', 'CERAMIC-CLAY-01', '조선 백자용 수비 정제 고령토 백토', '도자기소재', '포(20KG)', 42, 10, 55000, '문경 도자 공방')
ON CONFLICT (id) DO UPDATE SET
    code = EXCLUDED.code,
    name = EXCLUDED.name,
    category = EXCLUDED.category,
    unit = EXCLUDED.unit,
    current_stock = EXCLUDED.current_stock,
    safe_stock = EXCLUDED.safe_stock,
    unit_cost = EXCLUDED.unit_cost,
    supplier = EXCLUDED.supplier,
    updated_at = now();

-- 4. 기본 발주서 초기 데이터 삽입
INSERT INTO public.purchase_orders (id, po_number, item_type, item_name, supplier, quantity, unit_cost, total_cost, status, expected_date)
VALUES
    ('po-2026-01', 'PO-20260301-101', '원부자재', '진주산 생사 천연 비단 자수실 100타래', '경남 진주 실크 공방', 100, 18000, 1800000, '입고완료', '2026-03-04'),
    ('po-2026-02', 'PO-20260303-102', '완제품의류', '울 캐시미어 도포 코트 (먹색) 2차 리오더', '전주이씨 서울 본가 아틀리에', 30, 210000, 6300000, '생산중', '2026-03-15'),
    ('po-2026-03', 'PO-20260305-103', '라이프스타일소재', '분청사기 찻잔 세트 초벌/재벌 가마 소성', '문경 전통 도예 명장 요장', 50, 42000, 2100000, '발주승인', '2026-03-20')
ON CONFLICT (id) DO UPDATE SET
    po_number = EXCLUDED.po_number,
    item_type = EXCLUDED.item_type,
    item_name = EXCLUDED.item_name,
    supplier = EXCLUDED.supplier,
    quantity = EXCLUDED.quantity,
    unit_cost = EXCLUDED.unit_cost,
    total_cost = EXCLUDED.total_cost,
    status = EXCLUDED.status,
    expected_date = EXCLUDED.expected_date;
