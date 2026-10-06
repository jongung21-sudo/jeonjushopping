import React, { useState } from 'react';
import { Product, ProductColor } from '../../types';
import { X, Heart, ShoppingBag, ArrowRight } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';

interface QuickViewModalProps {
  product: Product | null;
  onClose: () => void;
  onViewDetail: (product: Product) => void;
}

export const QuickViewModal: React.FC<QuickViewModalProps> = ({
  product,
  onClose,
  onViewDetail,
}) => {
  if (!product) return null;

  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedColor, setSelectedColor] = useState<ProductColor>(product.colors[0]);
  const [selectedSize, setSelectedSize] = useState<string>(product.sizes[0]);
  const [quantity, setQuantity] = useState(1);

  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const isWish = isInWishlist(product.id);

  const handleAddToCart = () => {
    addToCart(product, selectedColor, selectedSize, quantity);
    onClose();
  };

  const hasDiscount = product.originalPrice && product.originalPrice > product.price;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-ink-900/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal Card */}
      <div className="relative bg-paper-100 max-w-3xl w-full border border-paper-300 shadow-2xl z-10 overflow-hidden animate-fade-in flex flex-col md:flex-row max-h-[90vh]">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 z-20 p-2 text-ink-600 hover:text-ink-900 bg-paper-100/80 rounded-none transition-colors"
          aria-label="닫기"
        >
          <X className="w-5 h-5" strokeWidth={1.5} />
        </button>

        {/* Left: Gallery */}
        <div className="md:w-1/2 bg-paper-200 flex flex-col">
          <div className="relative aspect-[3/4] w-full overflow-hidden">
            <img
              src={product.images[selectedImage] || product.images[0]}
              alt={product.name}
              className="w-full h-full object-cover object-center transition-all duration-300"
            />
          </div>
          {/* Thumbnails */}
          {product.images.length > 1 && (
            <div className="flex gap-2 p-3 bg-paper-100/60 border-t border-paper-300">
              {product.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImage(idx)}
                  className={`w-12 h-16 border overflow-hidden ${
                    selectedImage === idx ? 'border-ink-900' : 'border-paper-300 opacity-60'
                  }`}
                >
                  <img src={img} alt="thumbnail" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right: Info & Actions */}
        <div className="md:w-1/2 p-6 flex flex-col justify-between overflow-y-auto">
          <div>
            <p className="text-[10px] uppercase tracking-widest text-ink-400 font-sans">
              {product.category} · {product.engName}
            </p>
            <h2 className="text-lg font-medium text-ink-900 font-serif-kr mt-1">
              {product.name}
            </h2>

            {/* Price */}
            <div className="flex items-baseline gap-2.5 mt-2">
              <span className="text-base font-bold text-ink-900">
                {product.price.toLocaleString()}원
              </span>
              {hasDiscount && (
                <span className="text-xs text-ink-400 line-through">
                  {product.originalPrice?.toLocaleString()}원
                </span>
              )}
            </div>

            <p className="text-xs text-ink-600 mt-3 font-serif-kr leading-relaxed line-clamp-3">
              {product.shortDesc}
            </p>

            {/* Color Option */}
            <div className="mt-5">
              <label className="text-[11px] font-medium text-ink-700 block mb-1.5">
                컬러 : <span className="font-semibold">{selectedColor.name}</span>
              </label>
              <div className="flex gap-2">
                {product.colors.map((c) => (
                  <button
                    key={c.name}
                    onClick={() => setSelectedColor(c)}
                    className={`w-7 h-7 rounded-none border p-0.5 transition-all ${
                      selectedColor.name === c.name ? 'border-ink-900 scale-105' : 'border-paper-300'
                    }`}
                    title={c.name}
                  >
                    <div className="w-full h-full" style={{ backgroundColor: c.code }} />
                  </button>
                ))}
              </div>
            </div>

            {/* Size Option */}
            <div className="mt-4">
              <label className="text-[11px] font-medium text-ink-700 block mb-1.5">
                사이즈
              </label>
              <div className="flex flex-wrap gap-2">
                {product.sizes.map((s) => (
                  <button
                    key={s}
                    onClick={() => setSelectedSize(s)}
                    className={`px-3 py-1.5 text-xs border transition-colors ${
                      selectedSize === s
                        ? 'border-ink-900 bg-ink-900 text-paper-100'
                        : 'border-paper-300 text-ink-700 hover:border-ink-900'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {/* Quantity */}
            <div className="mt-4 flex items-center gap-3">
              <label className="text-[11px] font-medium text-ink-700">수량</label>
              <div className="flex items-center border border-paper-300">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="px-2.5 py-1 text-xs text-ink-700 hover:bg-paper-200"
                >
                  -
                </button>
                <span className="px-3 py-1 text-xs font-medium text-ink-900">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="px-2.5 py-1 text-xs text-ink-700 hover:bg-paper-200"
                >
                  +
                </button>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-6 border-t border-paper-300 mt-6 space-y-2">
            <div className="flex gap-2">
              <button
                onClick={handleAddToCart}
                disabled={product.isSoldOut}
                className="flex-1 py-3 bg-ink-900 text-paper-100 text-xs font-semibold tracking-wider flex items-center justify-center gap-2 hover:bg-lacquer transition-colors disabled:opacity-50"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>장바구니 담기</span>
              </button>

              <button
                onClick={() => toggleWishlist(product.id)}
                className={`p-3 border transition-colors ${
                  isWish
                    ? 'border-lacquer text-lacquer bg-lacquer/5'
                    : 'border-paper-300 text-ink-700 hover:border-ink-900'
                }`}
                aria-label="찜하기"
              >
                <Heart className="w-4 h-4" fill={isWish ? 'currentColor' : 'none'} />
              </button>
            </div>

            <button
              onClick={() => {
                onClose();
                onViewDetail(product);
              }}
              className="w-full py-2.5 border border-paper-400 text-ink-800 text-xs font-medium flex items-center justify-center gap-1.5 hover:bg-paper-200 transition-colors"
            >
              <span>상세 페이지로 이동</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
