-- ====================================================================
-- 전주이씨 (JEONJU LEE) 상품(products) 마스터 테이블 생성 및 권한 설정 SQL
-- Supabase 대시보드 (SQL Editor)에 붙여넣고 [Run]을 실행하세요.
-- 대상 프로젝트: https://bjofkwwzeapgjahsjdzb.supabase.co
-- ====================================================================

-- 1. 상품(products) 테이블 생성
CREATE TABLE IF NOT EXISTS public.products (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    eng_name TEXT DEFAULT '',
    category TEXT NOT NULL,
    price INTEGER NOT NULL CHECK (price >= 0),
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
    stock INTEGER DEFAULT 30 CHECK (stock >= 0),
    rating NUMERIC(2,1) DEFAULT 5.0,
    review_count INTEGER DEFAULT 0,
    sales_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 기존 테이블이 존재할 경우를 대비한 컬럼 안전 보강
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS stock INTEGER DEFAULT 30;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT now();

-- 2. 검색 및 분류 성능 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_products_category ON public.products (category);
CREATE INDEX IF NOT EXISTS idx_products_created_at ON public.products (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_products_price ON public.products (price);

-- 3. 수정일자(updated_at) 자동 갱신 트리거
CREATE OR REPLACE FUNCTION public.handle_products_updated_at()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    NEW.updated_at := now();
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_products_updated_at ON public.products;
CREATE TRIGGER trg_products_updated_at
BEFORE UPDATE ON public.products
FOR EACH ROW
EXECUTE FUNCTION public.handle_products_updated_at();

-- 4. Row Level Security (RLS) 활성화 및 CRUD 보안 정책
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- 정책 1: 상품 조회 (SELECT) - 누구나 자유롭게 조회 가능
DROP POLICY IF EXISTS "products_select_policy" ON public.products;
CREATE POLICY "products_select_policy"
ON public.products
FOR SELECT
TO anon, authenticated
USING (true);

-- 정책 2: 상품 등록 (INSERT) - 관리자/클라이언트 등록 허용 (가격 및 이름 유효성 검증)
DROP POLICY IF EXISTS "products_insert_policy" ON public.products;
CREATE POLICY "products_insert_policy"
ON public.products
FOR INSERT
TO anon, authenticated
WITH CHECK (
    name IS NOT NULL AND 
    length(trim(name)) >= 1 AND 
    price >= 0
);

-- 정책 3: 상품 수정 (UPDATE) - 상품 정보, 재고, 품절 여부 수정 허용
DROP POLICY IF EXISTS "products_update_policy" ON public.products;
CREATE POLICY "products_update_policy"
ON public.products
FOR UPDATE
TO anon, authenticated
USING (true)
WITH CHECK (
    price >= 0 AND 
    length(trim(name)) >= 1
);

-- 정책 4: 상품 삭제 (DELETE) - 관리자/클라이언트 삭제 허용
DROP POLICY IF EXISTS "products_delete_policy" ON public.products;
CREATE POLICY "products_delete_policy"
ON public.products
FOR DELETE
TO anon, authenticated
USING (true);

-- 5. 전주이씨 명품 컬렉션 기본 10종 상품 시드 데이터 주입 (중복 시 업데이트)
INSERT INTO public.products (
    id, name, eng_name, category, price, original_price, is_new, is_best, is_sold_out,
    colors, sizes, images, thumbnail, short_desc, detail_desc, fabric, fit, stock, rating, review_count, sales_count
) VALUES
(
    'jl-out-01',
    '울 캐시미어 릴렉스드 도포 코트',
    'Wool Cashmere Relaxed Duru Coat',
    'OUTER',
    468000,
    520000,
    true,
    true,
    false,
    '[{"name": "먹색 (Ink Black)", "code": "#121212"}, {"name": "오트밀 베이지 (Oatmeal)", "code": "#D9D3C7"}, {"name": "석청 네이비 (Slate Navy)", "code": "#1B2430"}]'::jsonb,
    ARRAY['M (95-100)', 'L (100-105)', 'XL (105-110)'],
    ARRAY[
        'https://images.unsplash.com/photo-1544441893-675973e31985?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1490114538077-0a7f8cb49891?auto=format&fit=crop&w=1200&q=80'
    ],
    'https://images.unsplash.com/photo-1544441893-675973e31985?auto=format&fit=crop&w=1200&q=80',
    '전통 도포의 유려한 자락 곡선과 모던 미니멀 테일러링을 접목한 시그니처 롱 코트.',
    '전주이씨의 독자적인 숄더 라인과 절제된 히든 버튼 플래킷 구조로 완성되었습니다. 걸을 때마다 드러나는 유려한 밑단 드레이프가 우아하면서도 강인한 실루엣을 자아냅니다. 프리미엄 호주산 메리노 울 90%와 몽골리안 캐시미어 10%의 깊이 있는 원단감을 경험해보세요.',
    'Wool 90%, Cashmere 10% (호주산 메리노 울 & 몽골리안 캐시미어 블렌드)',
    '자연스럽게 떨어지는 릴렉스드 오버핏',
    35,
    4.9,
    42,
    380
),
(
    'jl-top-01',
    '스탠드 칼라 한지 옥스포드 셔츠',
    'Stand Collar Hanji Oxford Shirt',
    'TOP',
    158000,
    NULL,
    true,
    true,
    false,
    '[{"name": "한지 아이보리 (Hanji Ivory)", "code": "#F4F1EA"}, {"name": "차콜 먹 (Charcoal Ink)", "code": "#2B2B2B"}, {"name": "연청록 (Muted Celadon)", "code": "#5F7161"}]'::jsonb,
    ARRAY['M (95-100)', 'L (100-105)', 'XL (105-110)'],
    ARRAY[
        'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1598033129183-c4f50c736f10?auto=format&fit=crop&w=1200&q=80'
    ],
    'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&w=1200&q=80',
    '조선의 곧은 깃(동정) 선을 현대적인 밴드 칼라로 단정하게 풀어낸 오가닉 코튼 셔츠.',
    '전통 한지의 은은하고 자연스러운 결을 80수 고밀도 오가닉 콤마드 코튼에 표현했습니다. 목선을 우아하게 감싸는 단아한 스탠드 깃과 자개 단추의 미세한 광택이 정제된 고급스러움을 자아냅니다.',
    'Organic Cotton 100% (80수 2합 고밀도 포플린 워싱)',
    '단정하면서도 편안한 레귤러 컴포트 핏',
    40,
    4.8,
    68,
    520
),
(
    'jl-bot-01',
    '투턱 와이드 테이퍼드 하카마 슬랙스',
    'Two-Tuck Wide Tapered Slacks',
    'BOTTOM',
    188000,
    210000,
    false,
    true,
    false,
    '[{"name": "묵흑 (Pitch Black)", "code": "#1A1A1A"}, {"name": "토색 (Earthy Khaki)", "code": "#8A8175"}, {"name": "현무암 회색 (Basalt Grey)", "code": "#595959"}]'::jsonb,
    ARRAY['S (28-30)', 'M (31-33)', 'L (34-36)'],
    ARRAY[
        'https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1479064555552-3ef4979f8908?auto=format&fit=crop&w=1200&q=80'
    ],
    'https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=1200&q=80',
    '깊은 앞주름(투턱)으로 풍성한 볼륨감을 구현한 현대적 실루엣의 와이드 팬츠.',
    '조선 선비들의 기품 있는 하의 곡선에서 영감을 얻어 제작된 투턱 슬랙스입니다. 허벅지 라인은 여유롭고 밑단으로 갈수록 정교하게 모아지는 테이퍼드 라인으로 어떤 체형에도 군더더기 없는 핏을 완성합니다.',
    'Wool 60%, Tencel 38%, Polyurethane 2%',
    '구김 없이 찰랑이는 와이드 테이퍼드 핏',
    28,
    4.7,
    31,
    290
),
(
    'jl-acc-01',
    '칠보 각인 솔리드 브라스 버클 레더 벨트',
    'Solid Brass Chilbo Buckle Belt',
    'ACCESSORIES',
    128000,
    NULL,
    true,
    false,
    false,
    '[{"name": "천연 베지터블 블랙 (Vegetable Black)", "code": "#0D0D0D"}, {"name": "엔틱 탄 브라운 (Antique Tan)", "code": "#5C3A21"}]'::jsonb,
    ARRAY['FREE (허리 28-36인치 호환)'],
    ARRAY[
        'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1624222247344-550fb60583dc?auto=format&fit=crop&w=1200&q=80'
    ],
    'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=1200&q=80',
    '통신주 황동 버클에 전주이씨 가문 문양을 은은하게 타각한 최고급 가죽 벨트.',
    '이탈리아 토스카나 협회 인증 최고급 풀그레인 베지터블 소가죽으로 제작되어 사용할수록 깊은 에이징과 광택이 돕니다. 솔리드 황동 버클은 묵직한 무게감과 은은한 황금빛으로 헤리티지의 품격을 보여줍니다.',
    'Italian Vegetable Tanned Cowhide 100%, Solid Brass 100%',
    '폭 3.2cm 표준 드레스 & 캐주얼 겸용 핏',
    50,
    5.0,
    19,
    180
),
(
    'jl-life-01',
    '달항아리 세라믹 시그니처 룸 디퓨저 (솔향 & 백단목)',
    'Moon Jar Ceramic Room Diffuser',
    'LIFESTYLE',
    89000,
    98000,
    true,
    true,
    false,
    '[{"name": "조선 백자 유백색 (Moon Porcelain White)", "code": "#FAF8F5"}]'::jsonb,
    ARRAY['단일 규격 (200ml 본품 + 리드스틱 8ea)'],
    ARRAY[
        'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&w=1200&q=80'
    ],
    'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?auto=format&fit=crop&w=1200&q=80',
    '달항아리의 순백미를 도예 공예로 빚어낸 오브제 겸 천연 아로마 디퓨저.',
    '조선 왕실의 소나무 숲에서 영감을 얻은 적송의 맑은 솔잎 향과 백단향(샌달우드)의 묵직한 흙내음이 조화를 이룹니다. 전북 도예 장인이 직접 손물레로 빚은 백자 용기는 인테리어 오브제로도 훌륭합니다.',
    '용기: 여주 순수 백자토, 용액: 천연 에센셜 오일 블렌드',
    '직경 11cm x 높이 13cm',
    60,
    4.9,
    88,
    890
)
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    eng_name = EXCLUDED.eng_name,
    category = EXCLUDED.category,
    price = EXCLUDED.price,
    original_price = EXCLUDED.original_price,
    is_new = EXCLUDED.is_new,
    is_best = EXCLUDED.is_best,
    is_sold_out = EXCLUDED.is_sold_out,
    colors = EXCLUDED.colors,
    sizes = EXCLUDED.sizes,
    images = EXCLUDED.images,
    thumbnail = EXCLUDED.thumbnail,
    short_desc = EXCLUDED.short_desc,
    detail_desc = EXCLUDED.detail_desc,
    fabric = EXCLUDED.fabric,
    stock = EXCLUDED.stock,
    updated_at = now();
