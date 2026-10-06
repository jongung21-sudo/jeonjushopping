import React from 'react';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';
import { Product } from '../types';
import { Heart, ShoppingBag, Trash2, ArrowRight } from 'lucide-react';

interface WishlistPageProps {
  navigate: (path: string) => void;
  onSelectProduct: (product: Product) => void;
  onQuickView: (product: Product) => void;
}

export const WishlistPage: React.FC<WishlistPageProps> = ({
  navigate,
  onSelectProduct,
  onQuickView,
}) => {
  const { wishlistProducts, removeFromWishlist, clearWishlist } = useWishlist();
  const { addToCart } = useCart();

  const handleAddToCart = (product: Product) => {
    if (product.colors[0] && product.sizes[0]) {
      addToCart(product, product.colors[0], product.sizes[0], 1);
    } else {
      onSelectProduct(product);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 animate-fade-in">
      <div className="flex items-center justify-between pb-6 border-b border-paper-300">
        <div>
          <span className="text-[11px] font-sans tracking-[0.25em] text-lacquer uppercase">
            ARCHIVE
          </span>
          <h1 className="text-2xl sm:text-3xl font-serif-kr font-medium text-ink-900 mt-1">
            관심 상품 (WISHLIST)
          </h1>
        </div>
        {wishlistProducts.length > 0 && (
          <button
            onClick={clearWishlist}
            className="text-xs text-ink-500 hover:text-lacquer underline"
          >
            전체 비우기
          </button>
        )}
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
