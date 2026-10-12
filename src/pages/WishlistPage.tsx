import React from 'react';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import { Product } from '../types';
import { Heart, ShoppingBag, Trash2, Database, RefreshCw, Copy } from 'lucide-react';
import { isSupabaseConfigured } from '../lib/supabaseClient';

interface WishlistPageProps {
  navigate: (path: string) => void;
  onSelectProduct: (product: Product) => void;
  onQuickView: (product: Product) => void;
}

export const WishlistPage: React.FC<WishlistPageProps> = ({
  navigate,
  onSelectProduct,
}) => {
  const { wishlistProducts, removeFromWishlist, clearWishlist, syncWishlistToDb, isSyncingWishlist } = useWishlist();
  const { addToCart } = useCart();
  const { showToast } = useToast();

  const handleAddToCart = (product: Product) => {
    if (product.colors[0] && product.sizes[0]) {
      addToCart(product, product.colors[0], product.sizes[0], 1);
    } else {
      onSelectProduct(product);
    }
  };

  const handleCopyWishlistCartSql = () => {
    const sql = `-- 1. 찜한상품 테이블 (public.wishlist_items)
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

-- 3. 초기 데이터 (찜한상품 2건, 장바구니 1건)
INSERT INTO public.wishlist_items (id, user_id, user_email, user_name, product_id, product_name, category, price)
VALUES
  ('usr-customer-01_jl-out-01', 'usr-customer-01', 'customer@jeonjulee.kr', '김서연', 'jl-out-01', '울 캐시미어 릴렉스드 도포 코트', 'OUTER', 468000),
  ('usr-customer-01_jl-top-01', 'usr-customer-01', 'customer@jeonjulee.kr', '김서연', 'jl-top-01', '실크 코튼 블렌드 저고리 셔츠', 'TOP', 198000)
ON CONFLICT (id) DO UPDATE SET price = EXCLUDED.price, created_at = NOW();

INSERT INTO public.cart_items (id, user_id, user_email, user_name, product_id, product_name, selected_color, selected_size, quantity, unit_price, total_price, selected)
VALUES
  ('usr-customer-01_jl-out-01_L', 'usr-customer-01', 'customer@jeonjulee.kr', '김서연', 'jl-out-01', '울 캐시미어 릴렉스드 도포 코트', '먹색 (Ink Black)', 'L (100-105)', 1, 468000, 468000, true)
ON CONFLICT (id) DO UPDATE SET quantity = EXCLUDED.quantity, updated_at = NOW();`;
    navigator.clipboard.writeText(sql);
    showToast('찜한상품(wishlist_items) & 장바구니(cart_items) 전용 SQL이 복사되었습니다!');
  };

  const handleManualSync = async () => {
    const res = await syncWishlistToDb();
    if (res.success) {
      showToast(res.message, 'success');
    } else {
      showToast(res.message, 'error');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 animate-fade-in">
      <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-paper-300">
        <div>
          <span className="text-[11px] font-sans tracking-[0.25em] text-lacquer uppercase">
            ARCHIVE · SUPABASE DB
          </span>
          <h1 className="text-2xl sm:text-3xl font-serif-kr font-medium text-ink-900 mt-1">
            관심 상품 (WISHLIST)
          </h1>
          <p className="text-xs text-ink-500 mt-1 flex items-center gap-1.5">
            <Database className="w-3.5 h-3.5 text-emerald-600" />
            <span>
              {isSupabaseConfigured()
                ? 'Supabase 클라우드 DB (wishlist_items 테이블) 실시간 연동 중'
                : '로컬 세이프 모드 동작 중'}
            </span>
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={handleCopyWishlistCartSql}
            className="px-3.5 py-2 bg-ink-900 hover:bg-lacquer text-paper-100 text-xs font-medium rounded-sm flex items-center gap-1.5 transition-colors whitespace-nowrap"
          >
            <Copy className="w-3.5 h-3.5" />
            <span>찜/장바구니 SQL 복사</span>
          </button>
          {isSupabaseConfigured() && (
            <button
              onClick={handleManualSync}
              disabled={isSyncingWishlist}
              className="px-3.5 py-2 bg-paper-200 hover:bg-paper-300 border border-paper-300 text-xs font-medium text-ink-800 rounded-sm flex items-center gap-1.5 transition-colors disabled:opacity-50 whitespace-nowrap"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncingWishlist ? 'animate-spin' : ''}`} />
              <span>{isSyncingWishlist ? 'DB 저장 중...' : '찜 목록 DB 즉시 저장'}</span>
            </button>
          )}
          {wishlistProducts.length > 0 && (
            <button
              onClick={clearWishlist}
              className="text-xs text-ink-500 hover:text-lacquer underline whitespace-nowrap"
            >
              전체 비우기
            </button>
          )}
        </div>
      </div>

      {wishlistProducts.length === 0 ? (
        <div className="py-24 text-center">
          <Heart className="w-12 h-12 mx-auto text-paper-400 mb-3" strokeWidth={1} />
          <p className="text-sm font-serif-kr text-ink-700">찜한 상품이 없습니다.</p>
          <p className="text-xs text-ink-400 mt-1">마음에 드는 상품의 하트 아이콘을 눌러보세요.</p>
          <button
            onClick={() => navigate('/shop')}
            className="mt-6 px-8 py-3 bg-ink-900 text-paper-100 text-xs font-semibold tracking-widest uppercase hover:bg-lacquer"
          >
            컬렉션 탐색하기 (SHOP)
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-10 sm:gap-x-6 mt-8">
          {wishlistProducts.map((product) => (
            <div key={product.id} className="group flex flex-col justify-between">
              <div
                onClick={() => onSelectProduct(product)}
                className="cursor-pointer aspect-[3/4] bg-paper-200 overflow-hidden relative shadow-subtle"
              >
                <img
                  src={product.images[0]}
                  alt={product.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    removeFromWishlist(product.id);
                  }}
                  className="absolute top-2.5 right-2.5 p-1.5 bg-paper-100/90 text-lacquer hover:bg-paper-100 transition-colors"
                  title="찜 삭제"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <div className="pt-3 pb-1">
                <p className="text-[10px] text-ink-400 uppercase tracking-widest font-sans">
                  {product.category}
                </p>
                <h3
                  onClick={() => onSelectProduct(product)}
                  className="text-xs sm:text-sm font-medium font-serif-kr text-ink-900 line-clamp-1 hover:text-lacquer cursor-pointer"
                >
                  {product.name}
                </h3>
                <p className="text-xs sm:text-sm font-semibold text-ink-900 mt-0.5 font-sans">
                  {product.price.toLocaleString()}원
                </p>

                <button
                  onClick={() => handleAddToCart(product)}
                  className="w-full mt-3 py-2 border border-ink-900 text-[11px] font-medium tracking-wider flex items-center justify-center gap-1.5 text-ink-900 hover:bg-ink-900 hover:text-paper-100 transition-colors"
                >
                  <ShoppingBag className="w-3.5 h-3.5" />
                  <span>장바구니 담기</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
