import React, { useState, useMemo, useEffect } from 'react';
import { PRODUCTS, CATEGORIES_CONFIG } from '../data/products';
import { ProductCard } from '../components/common/ProductCard';
import { Product, ProductCategory } from '../types';
import { SlidersHorizontal, X, RotateCcw, ChevronDown } from 'lucide-react';

interface ShopPageProps {
  initialCategory?: ProductCategory;
  initialSearchQuery?: string;
  onSelectProduct: (product: Product) => void;
  onQuickView: (product: Product) => void;
}

type SortOption = 'RECOMMENDED' | 'NEWEST' | 'PRICE_ASC' | 'PRICE_DESC' | 'SALES';

export const ShopPage: React.FC<ShopPageProps> = ({
  initialCategory = 'ALL',
  initialSearchQuery = '',
  onSelectProduct,
  onQuickView,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<ProductCategory>(initialCategory);
  const [sortOption, setSortOption] = useState<SortOption>('RECOMMENDED');
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);

  // Filters
  const [priceRange, setPriceRange] = useState<string>('ALL');
  const [selectedColor, setSelectedColor] = useState<string>('ALL');
  const [selectedSize, setSelectedSize] = useState<string>('ALL');
  const [onlyInStock, setOnlyInStock] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>(initialSearchQuery);

  // Pagination
  const [visibleCount, setVisibleCount] = useState<number>(8);

  useEffect(() => {
    if (initialCategory) {
      setSelectedCategory(initialCategory);
    }
  }, [initialCategory]);

  useEffect(() => {
    if (initialSearchQuery) {
      setSearchQuery(initialSearchQuery);
    }
  }, [initialSearchQuery]);

  const resetFilters = () => {
    setPriceRange('ALL');
    setSelectedColor('ALL');
    setSelectedSize('ALL');
    setOnlyInStock(false);
    setSearchQuery('');
  };

  const filteredAndSortedProducts = useMemo(() => {
    let result = [...PRODUCTS];

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.engName.toLowerCase().includes(q) ||
          p.shortDesc.toLowerCase().includes(q)
      );
    }

    // Category filter
    if (selectedCategory === 'NEW') {
      result = result.filter((p) => p.isNew);
    } else if (selectedCategory === 'BEST') {
      result = result.filter((p) => p.isBest);
    } else if (selectedCategory !== 'ALL') {
      result = result.filter((p) => p.category === selectedCategory);
    }

    // Price range
    if (priceRange === 'UNDER_10') {
      result = result.filter((p) => p.price < 100000);
    } else if (priceRange === '10_TO_20') {
      result = result.filter((p) => p.price >= 100000 && p.price < 200000);
    } else if (priceRange === '20_TO_30') {
      result = result.filter((p) => p.price >= 200000 && p.price < 300000);
    } else if (priceRange === 'OVER_30') {
      result = result.filter((p) => p.price >= 300000);
    }

    // Color filter
    if (selectedColor !== 'ALL') {
      result = result.filter((p) =>
        p.colors.some((c) => c.name.includes(selectedColor))
      );
    }

    // Size filter
    if (selectedSize !== 'ALL') {
      result = result.filter((p) =>
        p.sizes.some((s) => s.startsWith(selectedSize))
      );
    }

    // In stock
    if (onlyInStock) {
      result = result.filter((p) => !p.isSoldOut);
    }

    // Sorting
    switch (sortOption) {
      case 'NEWEST':
        result.sort((a, b) => (b.createdAt > a.createdAt ? 1 : -1));
        break;
      case 'PRICE_ASC':
        result.sort((a, b) => a.price - b.price);
        break;
      case 'PRICE_DESC':
        result.sort((a, b) => b.price - a.price);
        break;
      case 'SALES':
        result.sort((a, b) => b.salesCount - a.salesCount);
        break;
      case 'RECOMMENDED':
      default:
        result.sort((a, b) => (b.isBest ? 1 : 0) - (a.isBest ? 1 : 0));
        break;
    }

    return result;
  }, [
    selectedCategory,
    priceRange,
    selectedColor,
    selectedSize,
    onlyInStock,
    searchQuery,
    sortOption,
  ]);

  const hasActiveFilters =
    priceRange !== 'ALL' ||
    selectedColor !== 'ALL' ||
    selectedSize !== 'ALL' ||
    onlyInStock ||
    searchQuery !== '';

  const activeCategoryMeta = CATEGORIES_CONFIG.find((c) => c.slug === selectedCategory);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
      {/* Category Header */}
      <div className="text-center py-6 sm:py-10 border-b border-paper-300">
        <span className="text-[11px] font-sans tracking-[0.3em] text-bronze uppercase">
          COLLECTIONS
        </span>
        <h1 className="text-2xl sm:text-4xl font-serif-kr font-medium text-ink-900 mt-2">
          {activeCategoryMeta?.name || '전체 상품 (SHOP)'}
        </h1>
        <p className="text-xs text-ink-500 font-serif-kr mt-2">
          {activeCategoryMeta?.desc || '시간의 결을 품은 전주이씨의 남성복 라인업'}
        </p>

        {searchQuery && (
          <div className="mt-4 inline-flex items-center gap-2 px-3 py-1 bg-paper-200 border border-paper-300 text-xs">
            <span>검색어: <strong>"{searchQuery}"</strong></span>
            <button
              onClick={() => setSearchQuery('')}
              className="text-ink-500 hover:text-ink-900"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>

      {/* Category Tabs (Desktop & Mobile Horizontal Scroll) */}
      <div className="flex items-center justify-start md:justify-center overflow-x-auto py-5 border-b border-paper-300 gap-6 sm:gap-8 no-scrollbar">
        {CATEGORIES_CONFIG.map((cat) => (
          <button
            key={cat.slug}
            onClick={() => {
              setSelectedCategory(cat.slug as ProductCategory);
              setVisibleCount(8);
            }}
            className={`whitespace-nowrap text-xs tracking-widest font-medium py-1.5 transition-colors relative ${
              selectedCategory === cat.slug
                ? 'text-ink-900 font-semibold'
                : 'text-ink-500 hover:text-ink-900'
            }`}
          >
            {cat.name.split(' ')[0]}
            {selectedCategory === cat.slug && (
              <span className="absolute bottom-0 left-0 right-0 h-[1.5px] bg-ink-900" />
            )}
          </button>
        ))}
      </div>

      {/* Filter and Sort Control Bar */}
      <div className="flex flex-wrap items-center justify-between py-4 border-b border-paper-300 gap-3">
        {/* Left: Filter Toggle Button & Count */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => setFilterDrawerOpen(!filterDrawerOpen)}
            className="inline-flex items-center gap-2 text-xs font-medium border border-paper-300 px-3.5 py-1.5 bg-paper-100 hover:border-ink-900 transition-colors"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>상세 필터</span>
            {hasActiveFilters && (
              <span className="w-2 h-2 rounded-full bg-lacquer" />
            )}
          </button>

          {hasActiveFilters && (
            <button
              onClick={resetFilters}
              className="hidden sm:inline-flex items-center gap-1 text-[11px] text-ink-500 hover:text-ink-900 underline"
            >
              <RotateCcw className="w-3 h-3" />
              <span>초기화</span>
            </button>
          )}

          <span className="text-xs text-ink-500">
            총 <strong className="text-ink-900">{filteredAndSortedProducts.length}</strong>개의 상품
          </span>
        </div>

        {/* Right: Sort Dropdown */}
        <div className="flex items-center gap-2">
          <span className="text-[11px] text-ink-400">정렬</span>
          <div className="relative">
            <select
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value as SortOption)}
              className="appearance-none bg-paper-100 border border-paper-300 px-3 py-1.5 pr-8 text-xs font-medium text-ink-900 focus:outline-none focus:border-ink-900 cursor-pointer"
            >
              <option value="RECOMMENDED">추천순</option>
              <option value="NEWEST">신상품순</option>
              <option value="SALES">판매량순</option>
              <option value="PRICE_ASC">낮은 가격순</option>
              <option value="PRICE_DESC">높은 가격순</option>
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-ink-500 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Filter Drawer / Panel (Collapsible) */}
      {filterDrawerOpen && (
        <div className="bg-paper-200 border-b border-paper-300 p-5 mb-6 animate-fade-in">
          <div className="flex items-center justify-between pb-3 border-b border-paper-300 mb-4">
            <span className="text-xs font-semibold uppercase tracking-wider text-ink-900">
              FILTER ATTRIBUTES
            </span>
            <button
              onClick={resetFilters}
              className="text-xs text-ink-600 hover:text-ink-900 underline flex items-center gap-1"
            >
              <RotateCcw className="w-3 h-3" />
              전체 초기화
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            {/* Price Filter */}
            <div>
              <p className="text-[11px] font-semibold text-ink-900 mb-2">가격대</p>
              <div className="flex flex-col space-y-1 text-xs text-ink-600">
                {[
                  { id: 'ALL', label: '전체 가격' },
                  { id: 'UNDER_10', label: '10만원 미만' },
                  { id: '10_TO_20', label: '10만원 - 20만원' },
                  { id: '20_TO_30', label: '20만원 - 30만원' },
                  { id: 'OVER_30', label: '30만원 이상' },
                ].map((item) => (
                  <label key={item.id} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="price"
                      checked={priceRange === item.id}
                      onChange={() => setPriceRange(item.id)}
                      className="accent-ink-900"
                    />
                    <span>{item.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Color Filter */}
            <div>
              <p className="text-[11px] font-semibold text-ink-900 mb-2">색상 계열</p>
              <div className="flex flex-wrap gap-1.5">
                {[
                  { id: 'ALL', label: 'ALL' },
                  { id: '먹', label: '먹색/블랙' },
                  { id: '아이보리', label: '아이보리' },
                  { id: '네이비', label: '네이비' },
                  { id: '카키', label: '카키' },
                  { id: '브론즈', label: '브론즈' },
                ].map((col) => (
                  <button
                    key={col.id}
                    onClick={() => setSelectedColor(col.id)}
                    className={`px-2.5 py-1 text-xs border ${
                      selectedColor === col.id
                        ? 'border-ink-900 bg-ink-900 text-paper-100'
                        : 'border-paper-300 bg-paper-100 text-ink-700'
                    }`}
                  >
                    {col.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Size Filter */}
            <div>
              <p className="text-[11px] font-semibold text-ink-900 mb-2">사이즈</p>
              <div className="flex flex-wrap gap-1.5">
                {['ALL', 'S', 'M', 'L', 'XL', 'FREE'].map((sz) => (
                  <button
                    key={sz}
                    onClick={() => setSelectedSize(sz)}
                    className={`w-9 h-8 text-xs border ${
                      selectedSize === sz
                        ? 'border-ink-900 bg-ink-900 text-paper-100 font-semibold'
                        : 'border-paper-300 bg-paper-100 text-ink-700'
                    }`}
                  >
                    {sz}
                  </button>
                ))}
              </div>
            </div>

            {/* In stock toggle */}
            <div>
              <p className="text-[11px] font-semibold text-ink-900 mb-2">기타 조건</p>
              <label className="flex items-center gap-2 text-xs text-ink-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={onlyInStock}
                  onChange={(e) => setOnlyInStock(e.target.checked)}
                  className="accent-ink-900"
                />
                <span>품절 상품 제외하고 보기</span>
              </label>
            </div>
          </div>
        </div>
      )}

      {/* Product Grid: PC 4 cols, Tablet 3 cols, Mobile 2 cols */}
      {filteredAndSortedProducts.length > 0 ? (
        <div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-10 sm:gap-x-6 pt-6">
            {filteredAndSortedProducts.slice(0, visibleCount).map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onSelect={onSelectProduct}
                onQuickView={onQuickView}
              />
            ))}
          </div>

          {/* Load More / Pagination */}
          {visibleCount < filteredAndSortedProducts.length && (
            <div className="text-center mt-16 pt-8 border-t border-paper-300">
              <button
                onClick={() => setVisibleCount((prev) => prev + 8)}
                className="px-8 py-3.5 border border-ink-900 text-xs font-semibold tracking-[0.2em] text-ink-900 uppercase hover:bg-ink-900 hover:text-paper-100 transition-colors"
              >
                더 많은 상품 보기 ({visibleCount} / {filteredAndSortedProducts.length})
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="py-24 text-center">
          <p className="text-sm font-serif-kr text-ink-700">
            조건에 부합하는 상품이 없습니다.
          </p>
          <p className="text-xs text-ink-400 mt-1">
            필터를 재설정하거나 다른 카테고리를 선택해 보세요.
          </p>
          <button
            onClick={resetFilters}
            className="mt-4 px-4 py-2 border border-ink-900 text-xs font-medium text-ink-900 hover:bg-ink-900 hover:text-paper-100 transition-colors"
          >
            필터 초기화
          </button>
        </div>
      )}
    </div>
  );
};
