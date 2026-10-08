import React, { useRef } from 'react';
import { useProducts } from '../context/ProductContext';
import { INSTAGRAM_POSTS } from '../data/mockData';
import { ProductCard } from '../components/common/ProductCard';
import { Product } from '../types';
import { ArrowRight, Sparkles, ChevronRight, ShieldCheck, Truck, RefreshCw } from 'lucide-react';
import { KoreanDragonCursor } from '../components/common/KoreanDragonCursor';

interface HomePageProps {
  navigate: (path: string) => void;
  onSelectProduct: (product: Product) => void;
  onQuickView: (product: Product) => void;
}

export const HomePage: React.FC<HomePageProps> = ({
  navigate,
  onSelectProduct,
  onQuickView,
}) => {
  const { products } = useProducts();
  const heroRef = useRef<HTMLElement | null>(null);
  const newProducts = products.filter((p) => p.isNew).slice(0, 4);
  const bestProducts = products.filter((p) => p.isBest).slice(0, 4);

  return (
    <div className="space-y-20 md:space-y-32">
      {/* ==================================================
          HERO SECTION
          ================================================== */}
      <section
        ref={heroRef}
        className="relative min-h-[85vh] md:min-h-[92vh] flex items-center justify-center overflow-hidden bg-paper-200 cursor-default"
      >
        {/* Interactive Korean Royal Dragon Canvas */}
        <KoreanDragonCursor containerRef={heroRef} />
        {/* Authentic Korean Traditional Ink Landscape Background (조선 수묵산수화) */}
        <div className="absolute inset-0">
          <img
            src="/korean-landscape-bg.jpg"
            alt="조선 수묵산수화 배경 (Korean Traditional Landscape Painting)"
            className="w-full h-full object-cover object-center filter brightness-[0.98] contrast-[1.02]"
          />
          {/* Soft translucent Hanji mist overlay preserving painting details and ensuring text clarity */}
          <div className="absolute inset-0 bg-gradient-to-b from-paper-100/60 via-paper-100/35 to-paper-100/90" />
          <div className="absolute inset-0 bg-paper-100/20 backdrop-blur-[0.5px]" />
        </div>

        {/* Hero Content */}
        <div className="relative z-10 max-w-3xl mx-auto px-4 text-center flex flex-col items-center animate-fade-in py-10">
          {/* Subtle Royal Seal Tagline */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1 bg-paper-100/95 backdrop-blur-sm border border-paper-300 text-ink-900 text-[10px] md:text-xs tracking-[0.25em] uppercase mb-6 shadow-xs font-medium">
            <Sparkles className="w-3 h-3 text-lacquer" />
            <span>2026 S/S HERITAGE COLLECTION</span>
          </div>

          {/* Authentic Calligraphy Brand Artwork */}
          <div className="py-2 max-w-xs sm:max-w-md md:max-w-lg mx-auto">
            <img
              src="/logo-calligraphy.png"
              alt="전주이씨 (JEONJU LEE)"
              className="w-full h-auto max-h-20 sm:max-h-32 md:max-h-36 object-contain mx-auto filter drop-shadow-sm transition-transform hover:scale-[1.02] duration-500"
            />
          </div>

          <p className="text-xs sm:text-sm md:text-base text-ink-800 tracking-[0.4em] font-sans font-medium uppercase mt-2">
            JEONJU LEE
          </p>

          <div className="w-14 h-[1.5px] bg-ink-900/60 my-5" />

          <p className="text-xl sm:text-2xl md:text-3xl text-ink-900 font-serif-kr font-medium tracking-wide max-w-xl">
            “TRADITION, REDEFINED.”
          </p>

          {/* High contrast text container for crystal-clear readability */}
          <div className="mt-4 px-6 py-3.5 bg-paper-100/95 backdrop-blur-md border border-paper-300/80 shadow-xs max-w-lg">
            <p className="text-xs sm:text-sm text-ink-900 font-serif-kr font-medium leading-relaxed">
              한국의 오래된 미감을 오늘의 방식으로 다시 만듭니다. <br className="hidden sm:inline" />
              조선의 절제된 선과 현대 테일러링이 빚어낸 남자의 실루엣.
            </p>
          </div>

          {/* Minimalist CTA Buttons with thin borders */}
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mt-8 w-full sm:w-auto">
            <button
              onClick={() => navigate('/shop')}
              className="px-8 py-3.5 bg-ink-900 text-paper-100 text-xs font-semibold tracking-[0.2em] uppercase border border-ink-900 hover:bg-lacquer hover:border-lacquer transition-colors shadow-subtle"
            >
              SHOP COLLECTION
            </button>
            <button
              onClick={() => navigate('/brand')}
              className="px-8 py-3.5 bg-paper-100 text-ink-900 text-xs font-semibold tracking-[0.2em] uppercase border border-ink-900 hover:bg-ink-900 hover:text-paper-100 transition-colors shadow-subtle"
            >
              DISCOVER BRAND
            </button>
          </div>
        </div>

        {/* Scroll down indicator */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center text-ink-500 text-[10px] tracking-widest uppercase">
          <span>SCROLL</span>
          <div className="w-[1px] h-6 bg-ink-400 mt-1 animate-pulse" />
        </div>

        {/* Ambient Dragon Indicator */}
        <div className="hidden lg:flex absolute bottom-6 right-8 z-30 items-center gap-2 px-3 py-1.5 bg-paper-100/85 backdrop-blur-sm border border-paper-300 text-[11px] text-ink-700 font-serif-kr shadow-xs select-none">
          <span className="w-1.5 h-1.5 rounded-full bg-bronze animate-pulse" />
          <span>마우스를 움직이면 비룡(飛龍)이 따라 유영합니다</span>
        </div>
      </section>

      {/* ==================================================
          SECTION 01: NEW COLLECTION
          ================================================== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 pb-4 border-b border-paper-300">
          <div>
            <span className="text-[11px] font-sans tracking-[0.25em] text-bronze uppercase">
              SECTION 01
            </span>
            <h2 className="text-2xl sm:text-3xl font-serif-kr font-medium text-ink-900 mt-1">
              NEW ARRIVALS
            </h2>
            <p className="text-xs text-ink-500 font-serif-kr mt-1">
              2026년 봄, 전주이씨가 새롭게 제안하는 절제된 실루엣
            </p>
          </div>
          <button
            onClick={() => navigate('/shop?category=NEW')}
            className="group inline-flex items-center gap-2 text-xs font-medium text-ink-900 hover:text-lacquer transition-colors mt-4 md:mt-0 tracking-wider"
          >
            <span>전체 신상품 보기</span>
            <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
          </button>
        </div>

        {/* 4 Columns Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-10 sm:gap-x-6">
          {newProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onSelect={onSelectProduct}
              onQuickView={onQuickView}
            />
          ))}
        </div>
      </section>

      {/* ==================================================
          SECTION 02: BEST SELLERS
          ================================================== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 pb-4 border-b border-paper-300">
          <div>
            <span className="text-[11px] font-sans tracking-[0.25em] text-lacquer uppercase font-medium">
              SECTION 02
            </span>
            <h2 className="text-2xl sm:text-3xl font-serif-kr font-medium text-ink-900 mt-1">
              BEST SELLERS
            </h2>
            <p className="text-xs text-ink-500 font-serif-kr mt-1">
              시간을 관통해 가장 높은 완성도로 선택받은 대표 작품들
            </p>
          </div>
          <button
            onClick={() => navigate('/shop?category=BEST')}
            className="group inline-flex items-center gap-2 text-xs font-medium text-ink-900 hover:text-lacquer transition-colors mt-4 md:mt-0 tracking-wider"
          >
            <span>베스트 전체보기</span>
            <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-10 sm:gap-x-6">
          {bestProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onSelect={onSelectProduct}
              onQuickView={onQuickView}
            />
          ))}
        </div>
      </section>

      {/* ==================================================
          SECTION 03: BRAND STORY (EDITORIAL HERO)
          ================================================== */}
      <section className="bg-paper-200 border-y border-paper-300 py-20 md:py-28 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
            {/* Left Big Visual with subtle frame */}
            <div className="lg:col-span-7 relative">
              <div className="aspect-[4/5] bg-paper-300 overflow-hidden relative shadow-elevated">
                <img
                  src="https://images.unsplash.com/photo-1517445312882-bc9910d016b7?auto=format&fit=crop&w=1200&q=80"
                  alt="전주이씨 장인정신과 철학"
                  className="w-full h-full object-cover object-top filter contrast-[0.98]"
                />
              </div>
              {/* Floating quote card */}
              <div className="hidden sm:block absolute -bottom-6 -right-6 bg-paper-100 border border-paper-300 p-6 shadow-subtle max-w-xs">
                <p className="text-[10px] tracking-widest text-bronze uppercase font-sans">
                  HERITAGE ESSENCE
                </p>
                <p className="text-xs font-serif-kr text-ink-800 mt-2 leading-relaxed">
                  "과거의 것을 박제하지 않고, 현재의 삶에 스며들도록 재해석합니다."
                </p>
              </div>
            </div>

            {/* Right Philosophy Text */}
            <div className="lg:col-span-5 space-y-6">
              <div className="inline-block border-b border-ink-900 pb-1">
                <span className="text-[11px] font-sans tracking-[0.25em] text-ink-900 uppercase">
                  SECTION 03 · BRAND STORY
                </span>
              </div>

              <h2 className="text-3xl sm:text-4xl font-serif-kr font-medium text-ink-900 leading-snug">
                시간을 지나도 <br />
                남는 것.
              </h2>

              <p className="text-sm font-serif-kr text-ink-700 leading-relaxed pt-2">
                우리는 한국의 미감을 오늘의 방식으로 다시 만듭니다.
              </p>

              <div className="text-xs text-ink-600 font-sans space-y-3 leading-relaxed">
                <p>
                  전주이씨(JEONJU LEE)는 전통을 그저 과거의 유물로 바라보지 않습니다.
                  조선의 선비들이 추구했던 꼿꼿한 절제와 여백의 미학은 
                  오늘날 복잡한 도시를 살아가는 현대 남성에게 가장 세련된 쉼과 품격을 선사합니다.
                </p>
                <p>
                  화려한 장식 대신 단정한 선, 질 좋은 천연 소재의 촉감, 
                  그리고 몸을 구속하지 않는 편안한 실루엣으로 
                  오래도록 곁에 두고 입을 수 있는 옷을 짓습니다.
                </p>
              </div>

              <div className="pt-4">
                <button
                  onClick={() => navigate('/brand')}
                  className="inline-flex items-center gap-3 px-6 py-3 border border-ink-900 text-ink-900 text-xs tracking-[0.2em] uppercase hover:bg-ink-900 hover:text-paper-100 transition-colors"
                >
                  <span>브랜드 철학 더 알아보기</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ==================================================
          SECTION 04: EDITORIAL LOOKBOOK
          ================================================== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-[11px] font-sans tracking-[0.25em] text-bronze uppercase">
            SECTION 04 · EDITORIAL
          </span>
          <h2 className="text-2xl sm:text-3xl font-serif-kr font-medium text-ink-900 mt-2">
            2026 S/S 「시간의 결」
          </h2>
          <p className="text-xs text-ink-500 font-serif-kr mt-2">
            먹색과 백자색의 조화, 단정한 옷깃과 자연스러운 드레이프의 대화
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="group cursor-pointer" onClick={() => navigate('/shop?category=OUTER')}>
            <div className="aspect-[3/4] bg-paper-200 overflow-hidden relative">
              <img
                src="https://images.unsplash.com/photo-1544441893-675973e31985?auto=format&fit=crop&w=1000&q=80"
                alt="Outerwear Editorial"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-ink-900/15 group-hover:bg-ink-900/0 transition-colors" />
            </div>
            <div className="pt-4 text-center">
              <p className="text-[10px] tracking-widest text-ink-500 uppercase">CHAPTER 01</p>
              <h3 className="text-sm font-medium font-serif-kr text-ink-900 mt-1">
                유려한 외투 (Royal Outer)
              </h3>
              <p className="text-xs text-ink-500 font-sans mt-0.5">도포와 트렌치의 조우</p>
            </div>
          </div>

          <div className="group cursor-pointer" onClick={() => navigate('/shop?category=TOP')}>
            <div className="aspect-[3/4] bg-paper-200 overflow-hidden relative">
              <img
                src="https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&w=1000&q=80"
                alt="Tops Editorial"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-ink-900/15 group-hover:bg-ink-900/0 transition-colors" />
            </div>
            <div className="pt-4 text-center">
              <p className="text-[10px] tracking-widest text-ink-500 uppercase">CHAPTER 02</p>
              <h3 className="text-sm font-medium font-serif-kr text-ink-900 mt-1">
                단정한 깃과 상의 (Refined Tops)
              </h3>
              <p className="text-xs text-ink-500 font-sans mt-0.5">한지의 결을 품은 옥스포드</p>
            </div>
          </div>

          <div className="group cursor-pointer" onClick={() => navigate('/shop?category=LIFESTYLE')}>
            <div className="aspect-[3/4] bg-paper-200 overflow-hidden relative">
              <img
                src="https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?auto=format&fit=crop&w=1000&q=80"
                alt="Objects Editorial"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-ink-900/15 group-hover:bg-ink-900/0 transition-colors" />
            </div>
            <div className="pt-4 text-center">
              <p className="text-[10px] tracking-widest text-ink-500 uppercase">CHAPTER 03</p>
              <h3 className="text-sm font-medium font-serif-kr text-ink-900 mt-1">
                공간의 오브제 (Living Objects)
              </h3>
              <p className="text-xs text-ink-500 font-sans mt-0.5">소나무와 침향의 고요함</p>
            </div>
          </div>
        </div>
      </section>

      {/* Brand Value Assurance Badges */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 border-y border-paper-300">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
          <div className="flex flex-col items-center space-y-2">
            <ShieldCheck className="w-5 h-5 text-bronze" strokeWidth={1.5} />
            <h4 className="text-xs font-semibold tracking-wider text-ink-900 uppercase">
              PREMIUM NATURAL FIBERS
            </h4>
            <p className="text-[11px] text-ink-500 max-w-xs leading-relaxed">
              호주산 메리노 울, 오가닉 코튼, 천연 베지터블 레더만을 엄선하여 제작합니다.
            </p>
          </div>
          <div className="flex flex-col items-center space-y-2">
            <Truck className="w-5 h-5 text-bronze" strokeWidth={1.5} />
            <h4 className="text-xs font-semibold tracking-wider text-ink-900 uppercase">
              SAME-DAY PREMIUM DISPATCH
            </h4>
            <p className="text-[11px] text-ink-500 max-w-xs leading-relaxed">
              평일 오후 2시 이전 주문 시 CJ대한통운 안심 특송으로 당일 출고됩니다.
            </p>
          </div>
          <div className="flex flex-col items-center space-y-2">
            <RefreshCw className="w-5 h-5 text-bronze" strokeWidth={1.5} />
            <h4 className="text-xs font-semibold tracking-wider text-ink-900 uppercase">
              COMPLIMENTARY SIZE EXCHANGE
            </h4>
            <p className="text-[11px] text-ink-500 max-w-xs leading-relaxed">
              첫 구매 고객님께 부담 없는 1회 무료 사이즈 교환 서비스를 제공합니다.
            </p>
          </div>
        </div>
      </section>

      {/* ==================================================
          SECTION 05: INSTAGRAM / SOCIAL (6 GRID)
          ================================================== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 pb-4 border-b border-paper-300">
          <div>
            <span className="text-[11px] font-sans tracking-[0.25em] text-bronze uppercase">
              SECTION 05 · SOCIAL ARCHIVE
            </span>
            <h2 className="text-xl sm:text-2xl font-serif-kr font-medium text-ink-900 mt-1">
              @JEONJULEE_OFFICIAL
            </h2>
          </div>
          <a
            href="https://instagram.com"
            target="_blank"
            rel="noreferrer"
            className="text-xs text-ink-600 hover:text-ink-900 tracking-wider underline mt-2 sm:mt-0"
          >
            인스타그램 바로가기
          </a>
        </div>

        {/* 6 Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {INSTAGRAM_POSTS.map((post) => (
            <div
              key={post.id}
              className="relative aspect-square bg-paper-200 overflow-hidden group cursor-pointer"
            >
              <img
                src={post.image}
                alt={post.caption}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-ink-900/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-3 text-paper-100 text-[10px]">
                <p className="font-semibold">{post.tag}</p>
                <p className="line-clamp-2 text-paper-300 mt-0.5">{post.caption}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
