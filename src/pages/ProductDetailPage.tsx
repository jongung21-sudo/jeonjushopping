import React, { useState } from 'react';
import { Product, ProductColor, ProductReview } from '../types';
import { useProducts } from '../context/ProductContext';
import { REVIEWS_POOL } from '../data/mockData';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';
import { dbService } from '../services/dbService';
import {
  Heart,
  ShoppingBag,
  CreditCard,
  Share2,
  ChevronDown,
  ChevronUp,
  Star,
  Check,
  Truck,
  ShieldCheck,
  HelpCircle,
  ArrowLeft,
  Sparkles,
  ThumbsUp,
  Camera,
  X,
} from 'lucide-react';
import { ProductCard } from '../components/common/ProductCard';

interface ProductDetailPageProps {
  product: Product;
  navigate: (path: string) => void;
  onSelectProduct: (product: Product) => void;
  onQuickView: (product: Product) => void;
}

export const ProductDetailPage: React.FC<ProductDetailPageProps> = ({
  product,
  navigate,
  onSelectProduct,
  onQuickView,
}) => {
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [selectedColor, setSelectedColor] = useState<ProductColor>(product.colors[0]);
  const [selectedSize, setSelectedSize] = useState<string>(product.sizes[0] || 'FREE');
  const [quantity, setQuantity] = useState(1);

  // Accordion active state
  const [openAccordions, setOpenAccordions] = useState<{ [key: string]: boolean }>({
    detail: true,
    sizeGuide: false,
    material: false,
    care: false,
    shipping: false,
  });

  const { user, earnPoints } = useAuth();
  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { showToast } = useToast();
  const { products } = useProducts();
  const isWish = isInWishlist(product.id);

  // Review & Q&A Modal States
  const [showQnaModal, setShowQnaModal] = useState(false);
  const [qnaTitle, setQnaTitle] = useState('');
  const [qnaContent, setQnaContent] = useState('');

  // 리뷰 작성 모달 상태
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewContent, setReviewContent] = useState('');
  const [reviewFit, setReviewFit] = useState('정사이즈예요');
  const [reviewHeightWeight, setReviewHeightWeight] = useState('');
  const [reviewImage, setReviewImage] = useState('');
  const [helpfulMap, setHelpfulMap] = useState<{ [id: string]: number }>({});

  const initialProductReviews = REVIEWS_POOL.filter((r) => r.productId === product.id);
  const [reviewsList, setReviewsList] = useState<any[]>(
    initialProductReviews.length > 0 ? initialProductReviews : REVIEWS_POOL.slice(0, 3)
  );

  const toggleAccordion = (key: string) => {
    setOpenAccordions((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleAddToCart = () => {
    addToCart(product, selectedColor, selectedSize, quantity);
  };

  const handleBuyNow = () => {
    addToCart(product, selectedColor, selectedSize, quantity);
    navigate('/checkout');
  };

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      showToast('상품 링크가 클립보드에 복사되었습니다.', 'info');
    }
  };

  const handleQnaSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!qnaTitle.trim() || !qnaContent.trim()) {
      showToast('문의 제목과 내용을 모두 입력해 주세요.', 'error');
      return;
    }
    setShowQnaModal(false);
    setQnaTitle('');
    setQnaContent('');
    showToast('문의가 정상적으로 접수되었습니다. 답변 완료 시 알림을 보내드립니다.');
  };

  const handleReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewContent.trim()) {
      showToast('리뷰 후기 내용을 작성해 주세요.', 'error');
      return;
    }

    const newRev = {
      id: `rev-${Date.now()}`,
      productId: product.id,
      author: user ? user.name : '김*연',
      rating: reviewRating,
      date: new Date().toISOString().slice(0, 10),
      selectedOption: `${selectedColor.name} / ${selectedSize}`,
      heightWeight: reviewHeightWeight || undefined,
      content: reviewContent.trim(),
      images: reviewImage ? [reviewImage] : [],
      helpfulCount: 0,
    };

    setReviewsList((prev) => [newRev, ...prev]);
    earnPoints(1000, '상품 포토/텍스트 리뷰 작성');
    dbService.addReview({
      id: newRev.id,
      productId: product.id,
      userName: newRev.author,
      rating: newRev.rating,
      comment: newRev.content,
      fitFeedback: reviewFit,
      images: newRev.images,
      createdAt: newRev.date,
      likesCount: 0,
      helpfulCount: 0,
    });

    setShowReviewModal(false);
    setReviewContent('');
    setReviewImage('');
    setReviewHeightWeight('');
    showToast('소중한 후기가 등록되었습니다! 1,000P 마일리지가 즉시 적립되었습니다.');
  };

  const handleToggleHelpful = (revId: string) => {
    setHelpfulMap((prev) => ({
      ...prev,
      [revId]: (prev[revId] || 0) + 1,
    }));
    showToast('이 후기가 도움이 되었다고 평가해 주셨습니다.');
  };

  const relatedProducts = products.filter(
    (p) => p.category === product.category && p.id !== product.id
  ).slice(0, 4);

  const productReviews = REVIEWS_POOL.filter((r) => r.productId === product.id);

  const hasDiscount = product.originalPrice && product.originalPrice > product.price;
  const discountRate = hasDiscount
    ? Math.round(((product.originalPrice! - product.price) / product.originalPrice!) * 100)
    : 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
      {/* Breadcrumb & Back button */}
      <div className="flex items-center justify-between pb-6 text-xs text-ink-500 border-b border-paper-300">
        <button
          onClick={() => navigate('/shop')}
          className="inline-flex items-center gap-1 hover:text-ink-900 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>목록으로 돌아가기</span>
        </button>
        <div className="hidden sm:flex items-center space-x-2 text-[11px] tracking-wider uppercase">
          <span>HOME</span>
          <span>/</span>
          <button onClick={() => navigate(`/shop?category=${product.category}`)} className="hover:underline">
            {product.category}
          </button>
          <span>/</span>
          <span className="text-ink-900 font-medium truncate max-w-xs">{product.name}</span>
        </div>
      </div>

      {/* Main Product Showcase Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14 pt-8">
        {/* ==========================================
            LEFT: Big Gallery & Thumbnails (col 7)
            ========================================== */}
        <div className="lg:col-span-7 flex flex-col gap-4">
          {/* Main Large Image */}
          <div className="relative aspect-[3/4] w-full bg-paper-200 overflow-hidden shadow-subtle">
            <img
              src={product.images[activeImageIndex] || product.images[0]}
              alt={product.name}
              className="w-full h-full object-cover object-center transition-all duration-500"
            />
            {product.isNew && (
              <span className="absolute top-4 left-4 text-[10px] font-medium tracking-widest bg-paper-100 text-ink-900 px-2 py-0.5 border border-ink-900/20">
                NEW 2026 S/S
              </span>
            )}
            {product.isBest && (
              <span className="absolute top-4 right-4 text-[10px] font-medium tracking-widest bg-lacquer text-paper-100 px-2 py-0.5">
                ROYAL SIGNATURE
              </span>
            )}
          </div>

          {/* Thumbnail Strip */}
          <div className="flex gap-3 overflow-x-auto pb-2">
            {product.images.map((img, idx) => (
              <button
                key={idx}
                onClick={() => setActiveImageIndex(idx)}
                className={`relative w-20 h-28 flex-shrink-0 bg-paper-200 overflow-hidden border transition-all ${
                  activeImageIndex === idx
                    ? 'border-ink-900 scale-100'
                    : 'border-paper-300 opacity-60 hover:opacity-100'
                }`}
              >
                <img src={img} alt={`${product.name} 썸네일 ${idx + 1}`} className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        </div>

        {/* ==========================================
            RIGHT: Information & Purchasing Options (col 5)
            ========================================== */}
        <div className="lg:col-span-5 flex flex-col justify-between space-y-6">
          <div>
            {/* Category & English Name */}
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-sans tracking-[0.25em] text-bronze uppercase">
                {product.category}
              </span>
              <button
                onClick={handleShare}
                className="text-ink-500 hover:text-ink-900 p-1 transition-colors"
                title="공유하기"
              >
                <Share2 className="w-4 h-4" />
              </button>
            </div>

            <h1 className="text-2xl sm:text-3xl font-serif-kr font-medium text-ink-900 mt-1">
              {product.name}
            </h1>
            <p className="text-xs text-ink-400 font-sans tracking-wider uppercase mt-1">
              {product.engName}
            </p>

            {/* Rating Stars & Review Count */}
            <div className="flex items-center gap-2 mt-3 pb-4 border-b border-paper-300">
              <div className="flex items-center text-lacquer">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className="w-3.5 h-3.5 fill-current"
                    strokeWidth={1}
                  />
                ))}
              </div>
              <span className="text-xs font-semibold text-ink-900">{product.rating}</span>
              <span className="text-xs text-ink-400">· 후기 ({product.reviewCount}건)</span>
            </div>

            {/* Price */}
            <div className="mt-5 flex items-baseline gap-3">
              {hasDiscount && (
                <span className="text-lg font-bold text-lacquer">{discountRate}%</span>
              )}
              <span className="text-2xl sm:text-3xl font-bold text-ink-900 font-sans tracking-tight">
                {product.price.toLocaleString()}원
              </span>
              {hasDiscount && (
                <span className="text-sm text-ink-400 line-through">
                  {product.originalPrice?.toLocaleString()}원
                </span>
              )}
            </div>

            {/* Short poetic summary */}
            <p className="text-xs sm:text-sm font-serif-kr text-ink-700 leading-relaxed mt-4 bg-paper-200/60 p-3.5 border-l-2 border-bronze">
              {product.shortDesc}
            </p>

            {/* Member Benefit Callout */}
            <div className="mt-4 p-3 bg-paper-200 border border-paper-300/80 text-[11px] text-ink-700 flex items-center justify-between">
              <div>
                <span className="font-semibold text-ink-900">가문 회원 혜택: </span>
                <span>웰컴 쿠폰 적용 시 최대 {(product.price * 0.9).toLocaleString()}원</span>
              </div>
              <span className="text-lacquer font-semibold">10% OFF</span>
            </div>

            {/* Color Option Selector */}
            <div className="mt-6">
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs font-semibold text-ink-900">
                  선택된 컬러: <span className="font-normal text-ink-700">{selectedColor.name}</span>
                </span>
              </div>
              <div className="flex gap-2.5">
                {product.colors.map((color) => {
                  const isSelected = selectedColor.name === color.name;
                  return (
                    <button
                      key={color.name}
                      onClick={() => setSelectedColor(color)}
                      className={`relative w-8 h-8 rounded-none border p-0.5 transition-all ${
                        isSelected ? 'border-ink-900 scale-105 ring-1 ring-ink-900' : 'border-paper-400 hover:border-ink-600'
                      }`}
                      title={color.name}
                    >
                      <div className="w-full h-full" style={{ backgroundColor: color.code }} />
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Size Option Selector */}
            <div className="mt-6">
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs font-semibold text-ink-900">사이즈 (SIZE)</span>
                <button
                  onClick={() => toggleAccordion('sizeGuide')}
                  className="text-[11px] text-bronze underline hover:text-ink-900"
                >
                  사이즈 가이드 보기
                </button>
              </div>
              <div className="grid grid-cols-4 gap-2">
                {product.sizes.map((size) => {
                  const isSelected = selectedSize === size;
                  return (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`py-2.5 text-xs font-medium border text-center transition-all ${
                        isSelected
                          ? 'border-ink-900 bg-ink-900 text-paper-100 font-semibold'
                          : 'border-paper-300 text-ink-800 hover:border-ink-900 bg-paper-100'
                      }`}
                    >
                      {size}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Quantity Selector */}
            <div className="mt-6 flex items-center justify-between border-y border-paper-300 py-3">
              <span className="text-xs font-semibold text-ink-900">수량 (QUANTITY)</span>
              <div className="flex items-center border border-paper-300">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-8 h-8 flex items-center justify-center text-ink-700 hover:bg-paper-200"
                >
                  -
                </button>
                <span className="w-10 text-center text-xs font-semibold text-ink-900">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="w-8 h-8 flex items-center justify-center text-ink-700 hover:bg-paper-200"
                >
                  +
                </button>
              </div>
            </div>

            {/* Total Price Summary */}
            <div className="flex justify-between items-baseline pt-4">
              <span className="text-xs text-ink-500">총 상품 금액</span>
              <span className="text-xl font-bold text-ink-900 font-sans">
                {(product.price * quantity).toLocaleString()}원
              </span>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="space-y-2 pt-4">
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-2">
              {/* Wishlist Button */}
              <button
                onClick={() => toggleWishlist(product.id)}
                className={`sm:col-span-2 py-3.5 border flex items-center justify-center transition-colors ${
                  isWish
                    ? 'border-lacquer text-lacquer bg-lacquer/5'
                    : 'border-paper-300 text-ink-800 hover:border-ink-900'
                }`}
                aria-label="찜하기"
              >
                <Heart className="w-4 h-4" fill={isWish ? 'currentColor' : 'none'} />
              </button>

              {/* Add to Cart */}
              <button
                onClick={handleAddToCart}
                disabled={product.isSoldOut}
                className="sm:col-span-5 py-3.5 border border-ink-900 text-ink-900 text-xs font-semibold tracking-wider flex items-center justify-center gap-2 hover:bg-ink-900 hover:text-paper-100 transition-colors disabled:opacity-50"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>장바구니 담기</span>
              </button>

              {/* Buy Now */}
              <button
                onClick={handleBuyNow}
                disabled={product.isSoldOut}
                className="sm:col-span-5 py-3.5 bg-ink-900 border border-ink-900 text-paper-100 text-xs font-semibold tracking-wider flex items-center justify-center gap-2 hover:bg-lacquer hover:border-lacquer transition-colors disabled:opacity-50"
              >
                <CreditCard className="w-4 h-4" />
                <span>바로 구매하기</span>
              </button>
            </div>

            <div className="flex items-center justify-center gap-6 pt-3 text-[11px] text-ink-500">
              <span className="flex items-center gap-1">
                <Truck className="w-3.5 h-3.5 text-bronze" /> 10만 원 이상 무료배송
              </span>
              <span className="flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-bronze" /> 전주이씨 정품 보증
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ==================================================
          ACCORDION TABS (DETAIL, SIZE GUIDE, MATERIAL, CARE, SHIPPING)
          ================================================== */}
      <div className="mt-20 border-t border-paper-300 pt-10">
        <div className="max-w-4xl mx-auto space-y-4">
          {/* 1. Detail Story */}
          <div className="border border-paper-300 bg-paper-100">
            <button
              onClick={() => toggleAccordion('detail')}
              className="w-full p-4 text-left flex justify-between items-center text-xs font-semibold tracking-wider text-ink-900 hover:bg-paper-200/50 transition-colors uppercase"
            >
              <span>DETAIL & STORY (작품 이야기)</span>
              {openAccordions.detail ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
            {openAccordions.detail && (
              <div className="p-5 border-t border-paper-300 text-xs font-serif-kr text-ink-700 leading-relaxed space-y-3 bg-paper-50">
                <p>{product.detailDesc}</p>
                {product.modelInfo && (
                  <p className="text-[11px] text-bronze font-sans font-medium">
                    · 모델 착용 스펙: {product.modelInfo}
                  </p>
                )}
              </div>
            )}
          </div>

          {/* 2. Size Guide */}
          <div className="border border-paper-300 bg-paper-100">
            <button
              onClick={() => toggleAccordion('sizeGuide')}
              className="w-full p-4 text-left flex justify-between items-center text-xs font-semibold tracking-wider text-ink-900 hover:bg-paper-200/50 transition-colors uppercase"
            >
              <span>SIZE GUIDE (실측 치수 및 핏)</span>
              {openAccordions.sizeGuide ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
            {openAccordions.sizeGuide && (
              <div className="p-5 border-t border-paper-300 text-xs text-ink-700 space-y-4 bg-paper-50">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-paper-300 text-ink-900 font-semibold bg-paper-200/50">
                        <th className="py-2 px-3">사이즈</th>
                        <th className="py-2 px-3">어깨 너비</th>
                        <th className="py-2 px-3">가슴 단면</th>
                        <th className="py-2 px-3">총 기장</th>
                        <th className="py-2 px-3">소매 길이</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-paper-300/60 font-sans">
                      <tr>
                        <td className="py-2.5 px-3 font-semibold">M (95-100)</td>
                        <td className="py-2.5 px-3">{product.sizeGuide?.shoulder || '51cm'}</td>
                        <td className="py-2.5 px-3">{product.sizeGuide?.chest || '58cm'}</td>
                        <td className="py-2.5 px-3">{product.sizeGuide?.length || '78cm'}</td>
                        <td className="py-2.5 px-3">{product.sizeGuide?.sleeve || '63cm'}</td>
                      </tr>
                      <tr>
                        <td className="py-2.5 px-3 font-semibold">L (100-105)</td>
                        <td className="py-2.5 px-3">53cm</td>
                        <td className="py-2.5 px-3">61cm</td>
                        <td className="py-2.5 px-3">80cm</td>
                        <td className="py-2.5 px-3">64cm</td>
                      </tr>
                      <tr>
                        <td className="py-2.5 px-3 font-semibold">XL (105-110)</td>
                        <td className="py-2.5 px-3">55cm</td>
                        <td className="py-2.5 px-3">64cm</td>
                        <td className="py-2.5 px-3">82cm</td>
                        <td className="py-2.5 px-3">65cm</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <div className="bg-paper-200 p-3 border-l-2 border-ink-900 text-[11px] leading-relaxed">
                  <strong className="text-ink-900 font-serif-kr">전주이씨의 치수 철학: </strong>
                  과거 선비의 옷은 신체를 옥죄지 않고 공기가 드나들도록 너그럽게 지었습니다. 
                  기존 체형보다 반 치수 여유 있는 오버 드레이프 핏을 권장합니다.
                </div>
              </div>
            )}
          </div>

          {/* 3. Material */}
          <div className="border border-paper-300 bg-paper-100">
            <button
              onClick={() => toggleAccordion('material')}
              className="w-full p-4 text-left flex justify-between items-center text-xs font-semibold tracking-wider text-ink-900 hover:bg-paper-200/50 transition-colors uppercase"
            >
              <span>MATERIAL & COMPOSITION (원단 조성)</span>
              {openAccordions.material ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
            {openAccordions.material && (
              <div className="p-5 border-t border-paper-300 text-xs text-ink-700 bg-paper-50 space-y-2">
                <p><strong className="text-ink-900">소재:</strong> {product.fabric}</p>
                <p><strong className="text-ink-900">실루엣:</strong> {product.fit}</p>
                <p className="text-[11px] text-ink-500 pt-1">
                  모든 원단은 친환경 지속가능성 인증(OEKO-TEX / RWS)을 획득한 최상급 천연 섬유만을 엄선하여 직조합니다.
                </p>
              </div>
            )}
          </div>

          {/* 4. Care */}
          <div className="border border-paper-300 bg-paper-100">
            <button
              onClick={() => toggleAccordion('care')}
              className="w-full p-4 text-left flex justify-between items-center text-xs font-semibold tracking-wider text-ink-900 hover:bg-paper-200/50 transition-colors uppercase"
            >
              <span>CARE INSTRUCTIONS (세탁 및 보관)</span>
              {openAccordions.care ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
            {openAccordions.care && (
              <div className="p-5 border-t border-paper-300 text-xs text-ink-700 bg-paper-50 space-y-1.5">
                {product.care.map((c, i) => (
                  <p key={i} className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-bronze" />
                    <span>{c}</span>
                  </p>
                ))}
              </div>
            )}
          </div>

          {/* 5. Shipping & Return */}
          <div className="border border-paper-300 bg-paper-100">
            <button
              onClick={() => toggleAccordion('shipping')}
              className="w-full p-4 text-left flex justify-between items-center text-xs font-semibold tracking-wider text-ink-900 hover:bg-paper-200/50 transition-colors uppercase"
            >
              <span>SHIPPING & RETURNS (배송 및 교환/환불)</span>
              {openAccordions.shipping ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
            {openAccordions.shipping && (
              <div className="p-5 border-t border-paper-300 text-xs text-ink-700 bg-paper-50 space-y-2 leading-relaxed">
                <p>· <strong>배송 안내:</strong> 100,000원 이상 구매 시 무료 배송 (미만 시 3,000원). 평일 14시 이전 결제 건은 당일 출고됩니다.</p>
                <p>· <strong>교환/반품:</strong> 제품 수령 후 7일 이내 교환 및 반품이 가능하며, 단순 변심 시 왕복 배송비 6,000원이 부과됩니다. (첫 구매 시 1회 무료 사이즈 교환 지원)</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ==================================================
          EDITORIAL DETAIL GALLERY (Large Lookbook Images)
          ================================================== */}
      <div className="mt-24 pt-16 border-t border-paper-300">
        <div className="text-center max-w-xl mx-auto mb-12">
          <span className="text-[11px] font-sans tracking-[0.3em] text-bronze uppercase">
            EDITORIAL DETAILS
          </span>
          <h2 className="text-2xl font-serif-kr font-medium text-ink-900 mt-2">
            단정한 결, 꼿꼿한 선
          </h2>
          <p className="text-xs text-ink-500 font-serif-kr mt-1">
            화려한 기교 대신 원단의 질감과 섬세한 봉제선으로 말합니다.
          </p>
        </div>

        <div className="space-y-12 max-w-4xl mx-auto">
          {product.images.map((img, i) => (
            <div key={i} className="aspect-[16/10] bg-paper-200 overflow-hidden shadow-subtle">
              <img
                src={img}
                alt={`${product.name} 화보 컷 ${i + 1}`}
                className="w-full h-full object-cover object-center"
              />
            </div>
          ))}
        </div>
      </div>

      {/* ==================================================
          REVIEWS & Q&A
          ================================================== */}
      <div className="mt-24 pt-16 border-t border-paper-300 max-w-4xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-paper-300 gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-serif-kr font-medium text-ink-900">
                고객 실착 후기 (REVIEWS)
              </h3>
              <span className="text-xs px-2 py-0.5 bg-paper-200 border border-paper-300 text-ink-700 font-sans">
                {reviewsList.length}건
              </span>
            </div>
            <p className="text-xs text-ink-500 font-serif-kr mt-1">
              실제 착용하신 회원님들의 솔직한 후기이며, 작성 시 <strong>1,000P 마일리지</strong>를 즉시 지급해 드립니다.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowReviewModal(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-ink-900 text-paper-100 hover:bg-lacquer text-xs font-serif-kr transition-colors shadow-sm"
            >
              <Sparkles className="w-3.5 h-3.5 text-bronze" />
              <span>리뷰 작성하기 (+1,000P)</span>
            </button>
            <button
              onClick={() => setShowQnaModal(true)}
              className="inline-flex items-center gap-1.5 px-3 py-2 border border-paper-300 text-xs font-serif-kr text-ink-700 hover:border-ink-900 transition-colors"
            >
              <HelpCircle className="w-3.5 h-3.5" />
              <span>1:1 상품 문의</span>
            </button>
          </div>
        </div>

        {/* 평점 요약 바 */}
        <div className="py-6 px-6 bg-paper-100 border-b border-paper-300 grid grid-cols-1 sm:grid-cols-3 gap-6 items-center">
          <div className="text-center sm:text-left sm:border-r border-paper-300/80 pr-4">
            <span className="text-3xl font-bold font-sans text-ink-900">{product.rating}</span>
            <span className="text-xs text-ink-500 font-sans"> / 5.0</span>
            <div className="flex justify-center sm:justify-start text-lacquer mt-1">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-4 h-4 fill-current" />
              ))}
            </div>
            <p className="text-[11px] text-ink-500 font-serif-kr mt-1">
              구매 고객의 98%가 만족하셨습니다.
            </p>
          </div>

          <div className="sm:col-span-2 space-y-1.5 text-xs font-serif-kr">
            {[
              { star: 5, pct: 88 },
              { star: 4, pct: 10 },
              { star: 3, pct: 2 },
            ].map((b) => (
              <div key={b.star} className="flex items-center gap-2 text-ink-600">
                <span className="w-8 text-[11px] font-sans">{b.star}점</span>
                <div className="flex-1 h-2 bg-paper-200 rounded-none overflow-hidden border border-paper-300/60">
                  <div className="h-full bg-lacquer" style={{ width: `${b.pct}%` }} />
                </div>
                <span className="w-8 text-right text-[11px] font-sans text-ink-400">{b.pct}%</span>
              </div>
            ))}
          </div>
        </div>

        {/* Reviews List */}
        <div className="divide-y divide-paper-300">
          {reviewsList.map((rev) => (
            <div key={rev.id} className="py-6 space-y-3 font-serif-kr">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="flex text-lacquer">
                    {[...Array(rev.rating)].map((_, idx) => (
                      <Star key={idx} className="w-3.5 h-3.5 fill-current" />
                    ))}
                  </div>
                  <span className="text-xs font-semibold text-ink-900">{rev.author}</span>
                  {rev.heightWeight && (
                    <span className="text-[11px] text-ink-400 font-sans">({rev.heightWeight})</span>
                  )}
                  {rev.fitFeedback && (
                    <span className="px-1.5 py-0.5 bg-paper-200 text-ink-600 text-[10px] border border-paper-300">
                      {rev.fitFeedback}
                    </span>
                  )}
                </div>
                <span className="text-[11px] text-ink-400 font-sans">{rev.date}</span>
              </div>

              {rev.selectedOption && (
                <p className="text-[11px] text-bronze font-medium">
                  구매 옵션: {rev.selectedOption}
                </p>
              )}

              <p className="text-xs text-ink-800 leading-relaxed whitespace-pre-line">
                {rev.content}
              </p>

              {rev.images && rev.images.length > 0 && (
                <div className="flex gap-2 pt-1">
                  {rev.images.map((img: string, i: number) => (
                    <img
                      key={i}
                      src={img}
                      alt="고객 착용 사진"
                      className="w-20 h-20 object-cover border border-paper-300 shadow-sm"
                    />
                  ))}
                </div>
              )}

              <div className="flex items-center justify-between pt-1 text-[11px] text-ink-400">
                <button
                  type="button"
                  onClick={() => handleToggleHelpful(rev.id)}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 border border-paper-300 text-ink-600 hover:border-ink-900 transition-colors"
                >
                  <ThumbsUp className="w-3 h-3 text-lacquer" />
                  <span>도움돼요 {(rev.helpfulCount || 0) + (helpfulMap[rev.id] || 0)}</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ==================================================
          RELATED PRODUCTS
          ================================================== */}
      {relatedProducts.length > 0 && (
        <div className="mt-28 pt-16 border-t border-paper-300">
          <div className="flex justify-between items-end mb-8">
            <div>
              <span className="text-[11px] font-sans tracking-[0.25em] text-bronze uppercase">
                CURATED SELECTION
              </span>
              <h3 className="text-xl sm:text-2xl font-serif-kr font-medium text-ink-900 mt-1">
                함께 매치하기 좋은 작품들
              </h3>
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6">
            {relatedProducts.map((p) => (
              <ProductCard
                key={p.id}
                product={p}
                onSelect={onSelectProduct}
                onQuickView={onQuickView}
              />
            ))}
          </div>
        </div>
      )}

      {/* Q&A Modal */}
      {showQnaModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-ink-900/60 backdrop-blur-sm" onClick={() => setShowQnaModal(false)} />
          <div className="relative bg-paper-100 max-w-lg w-full p-6 border border-paper-300 shadow-2xl z-10 animate-fade-in">
            <h3 className="text-base font-serif-kr font-medium text-ink-900 mb-1">
              상품 문의하기 (Q&A)
            </h3>
            <p className="text-xs text-ink-500 mb-4">{product.name}</p>

            <form onSubmit={handleQnaSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-ink-700 mb-1">제목</label>
                <input
                  type="text"
                  value={qnaTitle}
                  onChange={(e) => setQnaTitle(e.target.value)}
                  placeholder="문의 제목을 입력하세요 (예: 재입고 일정 문의)"
                  className="w-full bg-paper-200 border border-paper-300 px-3 py-2 text-xs text-ink-900 focus:outline-none focus:border-ink-900"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-ink-700 mb-1">내용</label>
                <textarea
                  rows={4}
                  value={qnaContent}
                  onChange={(e) => setQnaContent(e.target.value)}
                  placeholder="궁금하신 내용을 자세히 남겨주시면 가문 담당자가 신속히 답변드립니다."
                  className="w-full bg-paper-200 border border-paper-300 px-3 py-2 text-xs text-ink-900 focus:outline-none focus:border-ink-900"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowQnaModal(false)}
                  className="px-4 py-2 border border-paper-300 text-xs text-ink-700 hover:bg-paper-200"
                >
                  취소
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-ink-900 text-paper-100 text-xs font-medium hover:bg-lacquer transition-colors"
                >
                  문의 등록
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Review Writing Modal */}
      {showReviewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-ink-900/60 backdrop-blur-sm" onClick={() => setShowReviewModal(false)} />
          <div className="relative bg-paper-100 max-w-lg w-full p-6 sm:p-8 border border-paper-300 shadow-2xl z-10 animate-fade-in font-serif-kr">
            <div className="flex items-center justify-between pb-3 border-b border-paper-300 mb-4">
              <div>
                <h3 className="text-base font-semibold text-ink-900">
                  고객 착용 후기 작성
                </h3>
                <p className="text-xs text-lacquer mt-0.5">
                  &check; 포토/텍스트 후기 작성 시 <strong>1,000P 마일리지</strong> 즉시 적립!
                </p>
              </div>
              <button onClick={() => setShowReviewModal(false)} className="text-ink-400 hover:text-ink-900">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleReviewSubmit} className="space-y-4 text-xs">
              {/* 별점 선택 */}
              <div>
                <label className="block text-ink-800 font-medium mb-1.5">만족도 별점 평가</label>
                <div className="flex gap-2 text-lacquer">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setReviewRating(s)}
                      className="p-1 hover:scale-110 transition-transform"
                    >
                      <Star
                        className={`w-6 h-6 ${s <= reviewRating ? 'fill-current text-lacquer' : 'text-paper-300'}`}
                      />
                    </button>
                  ))}
                  <span className="ml-2 self-center text-xs font-bold text-ink-900 font-sans">
                    {reviewRating}점 / 5.0
                  </span>
                </div>
              </div>

              {/* 핏감 & 착용 사이즈 */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-ink-800 font-medium mb-1">핏감 평가</label>
                  <select
                    value={reviewFit}
                    onChange={(e) => setReviewFit(e.target.value)}
                    className="w-full bg-paper-50 border border-paper-300 px-3 py-2 text-ink-900"
                  >
                    <option value="정사이즈예요">정사이즈예요</option>
                    <option value="여유있는 릴렉스핏">여유있는 릴렉스핏</option>
                    <option value="약간 슬림해요">약간 슬림해요</option>
                  </select>
                </div>
                <div>
                  <label className="block text-ink-800 font-medium mb-1">신장/체중 (선택)</label>
                  <input
                    type="text"
                    value={reviewHeightWeight}
                    onChange={(e) => setReviewHeightWeight(e.target.value)}
                    placeholder="예: 182cm / 70kg"
                    className="w-full bg-paper-50 border border-paper-300 px-3 py-2 text-ink-900"
                  />
                </div>
              </div>

              {/* 후기 내용 */}
              <div>
                <label className="block text-ink-800 font-medium mb-1">착용 후기 내용</label>
                <textarea
                  rows={4}
                  required
                  value={reviewContent}
                  onChange={(e) => setReviewContent(e.target.value)}
                  placeholder="원단의 촉감, 마감의 완성도, 실착 핏감 등을 솔직하게 남겨주세요."
                  className="w-full bg-paper-50 border border-paper-300 p-3 text-ink-900"
                />
              </div>

              {/* 포토 첨부 */}
              <div>
                <label className="block text-ink-800 font-medium mb-1 flex items-center gap-1">
                  <Camera className="w-3.5 h-3.5 text-bronze" />
                  <span>착용 사진 첨부 (이미지 URL 또는 샘플 사진)</span>
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={reviewImage}
                    onChange={(e) => setReviewImage(e.target.value)}
                    placeholder="이미지 URL 입력 (https://...)"
                    className="flex-1 bg-paper-50 border border-paper-300 px-3 py-2 text-ink-900 font-sans"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setReviewImage(
                        'https://images.unsplash.com/photo-1544441893-675973e31985?auto=format&fit=crop&w=600&q=80'
                      )
                    }
                    className="px-3 py-2 bg-paper-200 border border-paper-300 text-[11px] whitespace-nowrap hover:bg-paper-300"
                  >
                    샘플 컷
                  </button>
                </div>
                {reviewImage && (
                  <div className="mt-2">
                    <img
                      src={reviewImage}
                      alt="미리보기"
                      className="w-16 h-16 object-cover border border-paper-300 shadow-sm"
                    />
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-paper-300">
                <button
                  type="button"
                  onClick={() => setShowReviewModal(false)}
                  className="px-4 py-2 border border-paper-300 text-xs text-ink-700 hover:bg-paper-200"
                >
                  취소
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-ink-900 text-paper-100 text-xs font-medium hover:bg-lacquer transition-colors shadow-sm"
                >
                  리뷰 등록 (+1,000P 받기)
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
