CREATE TABLE IF NOT EXISTS public.dashboard_summary (
  id TEXT PRIMARY KEY DEFAULT 'main',
  brand_name TEXT DEFAULT '전주이씨 (JEONJU LEE)',
  ceo_name TEXT DEFAULT '이종웅 대표',
  total_revenue INTEGER DEFAULT 0,
  total_order_count INTEGER DEFAULT 0,
  pending_shipping_count INTEGER DEFAULT 0,
  refund_request_count INTEGER DEFAULT 0,
  registered_member_count INTEGER DEFAULT 0,
  low_stock_material_count INTEGER DEFAULT 0,
  total_product_count INTEGER DEFAULT 0,
  total_po_count INTEGER DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE public.dashboard_summary ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "allow_all_dashboard_summary" ON public.dashboard_summary;
CREATE POLICY "allow_all_dashboard_summary" ON public.dashboard_summary FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
GRANT ALL ON public.dashboard_summary TO anon, authenticated, service_role;

CREATE TABLE IF NOT EXISTS public.dashboard_orders (
  id TEXT PRIMARY KEY,
  order_number TEXT UNIQUE NOT NULL,
  order_date TEXT NOT NULL,
  customer_name TEXT NOT NULL,
  product_name TEXT NOT NULL,
  final_price INTEGER DEFAULT 0,
  status TEXT DEFAULT '결제완료',
  payment_method TEXT DEFAULT '신용/체크카드',
  tracking_carrier TEXT DEFAULT '',
  tracking_number TEXT DEFAULT '',
  recipient_phone TEXT DEFAULT '',
  address TEXT DEFAULT '',
  items JSONB DEFAULT '[]'::jsonb,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE public.dashboard_orders ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "allow_all_dashboard_orders" ON public.dashboard_orders;
CREATE POLICY "allow_all_dashboard_orders" ON public.dashboard_orders FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
GRANT ALL ON public.dashboard_orders TO anon, authenticated, service_role;

CREATE TABLE IF NOT EXISTS public.orders (
  id TEXT PRIMARY KEY,
  order_number TEXT UNIQUE NOT NULL,
  customer_name TEXT DEFAULT '고객',
  product_summary TEXT DEFAULT '',
  user_id TEXT,
  order_date TEXT NOT NULL,
  items JSONB DEFAULT '[]'::jsonb,
  total_product_price INTEGER DEFAULT 0,
  discount_price INTEGER DEFAULT 0,
  used_points INTEGER DEFAULT 0,
  coupon_discount INTEGER DEFAULT 0,
  coupon_code TEXT,
  shipping_fee INTEGER DEFAULT 0,
  final_price INTEGER DEFAULT 0,
  status TEXT DEFAULT '결제완료',
  recipient_name TEXT NOT NULL,
  recipient_phone TEXT NOT NULL,
  postal_code TEXT DEFAULT '',
  address TEXT DEFAULT '',
  detail_address TEXT DEFAULT '',
  delivery_memo TEXT DEFAULT '',
  payment_method TEXT DEFAULT '신용/체크카드',
  tracking_carrier TEXT,
  tracking_number TEXT,
  cancel_reason TEXT,
  refund_status TEXT DEFAULT 'none',
  refund_reason TEXT,
  refund_account JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "allow_all_orders" ON public.orders;
CREATE POLICY "allow_all_orders" ON public.orders FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
GRANT ALL ON public.orders TO anon, authenticated, service_role;

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

INSERT INTO public.dashboard_summary (id, brand_name, ceo_name, total_revenue, total_order_count, pending_shipping_count, refund_request_count, registered_member_count, low_stock_material_count, total_product_count, total_po_count)
VALUES ('main', '전주이씨 (JEONJU LEE)', '이종웅 대표', 484200, 2, 0, 0, 3, 2, 20, 3)
ON CONFLICT (id) DO UPDATE SET total_revenue = EXCLUDED.total_revenue, updated_at = NOW();

INSERT INTO public.dashboard_orders (id, order_number, order_date, customer_name, product_name, final_price, status, payment_method, tracking_carrier, tracking_number, recipient_phone, address)
VALUES
  ('ord-20260305-01', 'ORD-20260305-8821', '2026-03-05 14:20', '김서연', '울 캐시미어 릴렉스드 도포 코트', 416200, '배송중', '신용/체크카드', 'CJ대한통운', '6482-9103-4412', '010-9876-5432', '서울 강남구 압구정로 10'),
  ('ord-20260228-02', 'ORD-20260228-3312', '2026-02-28 19:05', '김서연', '전통 매듭 노리개 키링 & 가죽 참', 68000, '배송완료', '카카오페이', '우체국택배', '1049-2281-9930', '010-9876-5432', '서울 강남구 압구정로 10')
ON CONFLICT (id) DO UPDATE SET status = EXCLUDED.status, updated_at = NOW();

INSERT INTO public.wishlist_items (id, user_id, user_email, user_name, product_id, product_name, category, price)
VALUES
  ('usr-customer-01_jl-out-01', 'usr-customer-01', 'customer@jeonjulee.kr', '김서연', 'jl-out-01', '울 캐시미어 릴렉스드 도포 코트', 'OUTER', 468000),
  ('usr-customer-01_jl-top-01', 'usr-customer-01', 'customer@jeonjulee.kr', '김서연', 'jl-top-01', '실크 코튼 블렌드 저고리 셔츠', 'TOP', 198000)
ON CONFLICT (id) DO UPDATE SET price = EXCLUDED.price, created_at = NOW();

INSERT INTO public.cart_items (id, user_id, user_email, user_name, product_id, product_name, selected_color, selected_size, quantity, unit_price, total_price, selected)
VALUES
  ('usr-customer-01_jl-out-01_L', 'usr-customer-01', 'customer@jeonjulee.kr', '김서연', 'jl-out-01', '울 캐시미어 릴렉스드 도포 코트', '먹색 (Ink Black)', 'L (100-105)', 1, 468000, 468000, true)
ON CONFLICT (id) DO UPDATE SET quantity = EXCLUDED.quantity, updated_at = NOW();
