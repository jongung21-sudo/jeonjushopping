import React, { useState } from 'react';
import { Product } from '../../types';
import { Heart, Eye, ShoppingBag } from 'lucide-react';
import { useWishlist } from '../../context/WishlistContext';
import { useCart } from '../../context/CartContext';

interface ProductCardProps {
  product: Product;
  onSelect: (product: Product) => void;
  onQuickView: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onSelect,
  onQuickView,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { addToCart } = useCart();
  const isWish = isInWishlist(product.id);

  const handleWishlistClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleWishlist(product.id);
  };

  const handleQuickViewClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onQuickView(product);
  };

  const handleDirectCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (product.colors[0] && product.sizes[0]) {
      addToCart(product, product.colors[0], product.sizes[0], 1);
    } else {
      onSelect(product);
    }
  };

  const hasDiscount = product.originalPrice && product.originalPrice > product.price;
  const discountRate = hasDiscount
    ? Math.round(((product.originalPrice! - product.price) / product.originalPrice!) * 100)
    : 0;

  return (
    <div
      className="group cursor-pointer flex flex-col"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => onSelect(product)}
    >
      {/* Image Container */}
      <div className="relative aspect-[3/4] w-full overflow-hidden bg-paper-200">
        {/* Primary Image */}
        <img
          src={product.images[0]}
          alt={`${product.name} - ${product.shortDesc}`}
          loading="lazy"
          className={`h-full w-full object-cover object-center transition-all duration-700 ease-out ${
            isHovered && product.images[1] ? 'opacity-0 scale-105' : 'opacity-100 scale-100'
          }`}
        />

        {/* Secondary (Hover) Image */}
        {product.images[1] && (
          <img
            src={product.images[1]}
            alt={`${product.name} 상세 모델 뷰`}
            loading="lazy"
            className={`absolute inset-0 h-full w-full object-cover object-center transition-all duration-700 ease-out ${
              isHovered ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
            }`}
          />
        )}

        {/* Badges (Top Left) */}
        <div className="absolute top-2.5 left-2.5 flex flex-col gap-1 z-10">
          {product.isSoldOut && (
            <span className="text-[10px] tracking-wider uppercase px-2 py-0.5 font-medium bg-ink-900 text-paper-100">
              품절 (SOLD OUT)
            </span>
          )}
          {product.isNew && !product.isSoldOut && (
            <span className="text-[9px] tracking-widest uppercase px-1.5 py-0.5 font-medium bg-paper-100 text-ink-900 border border-ink-900/20">
              NEW
            </span>
          )}
          {product.isBest && !product.isSoldOut && (
            <span className="text-[9px] tracking-widest uppercase px-1.5 py-0.5 font-medium bg-lacquer text-paper-100">
              BEST
            </span>
          )}
        </div>

        {/* Top Right: Wishlist Heart Button */}
        <button
          onClick={handleWishlistClick}
          className={`absolute top-2.5 right-2.5 z-10 w-8 h-8 rounded-none flex items-center justify-center transition-all duration-200 ${
            isWish
              ? 'text-lacquer bg-paper-100/90 shadow-sm'
              : 'text-ink-700 hover:text-ink-900 bg-paper-100/70 opacity-90 md:opacity-0 md:group-hover:opacity-100'
          }`}
          aria-label={isWish ? '찜 해제' : '찜하기'}
        >
          <Heart
            className="w-4 h-4 transition-transform active:scale-125"
            fill={isWish ? 'currentColor' : 'none'}
            strokeWidth={1.5}
          />
        </button>

        {/* Quick View & Quick Add Action Bar (Appears on Hover on Desktop) */}
        <div className="hidden md:flex absolute inset-x-2 bottom-2 z-10 gap-1.5 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
          <button
            onClick={handleQuickViewClick}
            className="flex-1 py-2 bg-paper-100/95 backdrop-blur-sm text-ink-900 text-[11px] font-medium tracking-wider flex items-center justify-center gap-1.5 border border-paper-300 hover:bg-ink-900 hover:text-paper-100 transition-colors"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>QUICK VIEW</span>
          </button>
          <button
            onClick={handleDirectCart}
            className="w-9 py-2 bg-paper-100/95 backdrop-blur-sm text-ink-900 flex items-center justify-center border border-paper-300 hover:bg-lacquer hover:text-paper-100 hover:border-lacquer transition-colors"
            title="바로 장바구니 담기"
          >
            <ShoppingBag className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Info Block */}
      <div className="pt-3 pb-1 flex flex-col space-y-1">
        {/* Color Dots */}
        <div className="flex items-center space-x-1.5 mb-0.5">
          {product.colors.map((c) => (
            <span
              key={c.name}
              className="w-2.5 h-2.5 rounded-full border border-paper-400 inline-block shadow-xs"
              style={{ backgroundColor: c.code }}
              title={c.name}
            />
          ))}
          <span className="text-[10px] text-ink-400 ml-1">
            {product.colors.length} colors
          </span>
        </div>

        {/* English Brand / Subtitle */}
        <p className="text-[10px] text-ink-400 tracking-wider uppercase font-sans truncate">
          {product.engName}
        </p>

        {/* Product Title */}
        <h3 className="text-xs sm:text-sm font-medium text-ink-900 group-hover:text-lacquer transition-colors font-serif-kr line-clamp-1">
          {product.name}
        </h3>

        {/* Price Section */}
        <div className="flex items-baseline space-x-2 pt-0.5">
          {hasDiscount && (
            <span className="text-xs font-semibold text-lacquer">
              {discountRate}%
            </span>
          )}
          <span className="text-xs sm:text-sm font-semibold text-ink-900 font-sans tracking-tight">
            {product.price.toLocaleString()}원
          </span>
          {hasDiscount && (
            <span className="text-[11px] text-ink-400 line-through">
              {product.originalPrice?.toLocaleString()}원
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
