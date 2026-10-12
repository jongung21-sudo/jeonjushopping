-- 1. 찜한상품 테이블 (public.wishlist_items)
CREATE TABLE IF NOT EXISTS public.wishlist_items (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL DEFAULT 'guest',
  user_email TEXT DEFAULT '',
  user_name TEXT DEFAULT '비회원',
  product_id TEXT NOT NULL,
  product_name TEXT NOT NULL,
  category TEXT DEFAULT '',
  price INTEGER DEFAULT 0,
  thumbnail TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE public.wishlist_items ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "allow_all_wishlist_items" ON public.wishlist_items;
CREATE POLICY "allow_all_wishlist_items" ON public.wishlist_items FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
GRANT ALL ON public.wishlist_items TO anon, authenticated, service_role;

-- 2. 장바구니 테이블 (public.cart_items)
CREATE TABLE IF NOT EXISTS public.cart_items (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL DEFAULT 'guest',
  user_email TEXT DEFAULT '',
  user_name TEXT DEFAULT '비회원',
  product_id TEXT NOT NULL,
  product_name TEXT NOT NULL,
  selected_color TEXT DEFAULT '기본',
  color_hex TEXT DEFAULT '#181818',
  selected_size TEXT DEFAULT 'FREE',
  quantity INTEGER DEFAULT 1,
  unit_price INTEGER DEFAULT 0,
  total_price INTEGER DEFAULT 0,
  selected BOOLEAN DEFAULT true,
  thumbnail TEXT DEFAULT '',
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE public.cart_items ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "allow_all_cart_items" ON public.cart_items;
CREATE POLICY "allow_all_cart_items" ON public.cart_items FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
GRANT ALL ON public.cart_items TO anon, authenticated, service_role;

-- 3. 초기 샘플 데이터 (찜한상품 2건, 장바구니 1건)
INSERT INTO public.wishlist_items (id, user_id, user_email, user_name, product_id, product_name, category, price)
VALUES
  ('usr-customer-01_jl-out-01', 'usr-customer-01', 'customer@jeonjulee.kr', '김서연', 'jl-out-01', '울 캐시미어 릴렉스드 도포 코트', 'OUTER', 468000),
  ('usr-customer-01_jl-top-01', 'usr-customer-01', 'customer@jeonjulee.kr', '김서연', 'jl-top-01', '실크 코튼 블렌드 저고리 셔츠', 'TOP', 198000)
ON CONFLICT (id) DO UPDATE SET price = EXCLUDED.price, created_at = NOW();

INSERT INTO public.cart_items (id, user_id, user_email, user_name, product_id, product_name, selected_color, selected_size, quantity, unit_price, total_price, selected)
VALUES
  ('usr-customer-01_jl-out-01_L', 'usr-customer-01', 'customer@jeonjulee.kr', '김서연', 'jl-out-01', '울 캐시미어 릴렉스드 도포 코트', '먹색 (Ink Black)', 'L (100-105)', 1, 468000, 468000, true)
ON CONFLICT (id) DO UPDATE SET quantity = EXCLUDED.quantity, updated_at = NOW();
