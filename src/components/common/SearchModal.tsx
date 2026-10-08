import React, { useState, useMemo } from 'react';
import { Search, X, ArrowRight, TrendingUp } from 'lucide-react';
import { useProducts } from '../../context/ProductContext';
import { Product } from '../../types';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectProduct: (product: Product) => void;
  onNavigateToShop: (query: string) => void;
}

const POPULAR_SEARCHES = [
  '도포 코트',
  '한지 옥스포드 셔츠',
  '와이드 슬랙스',
  '황동 키링',
  '오브제 인센스',
  '블레이저',
  '캐시미어',
];

export const SearchModal: React.FC<SearchModalProps> = ({
  isOpen,
  onClose,
  onSelectProduct,
  onNavigateToShop,
}) => {
  const { products } = useProducts();
  const [searchTerm, setSearchTerm] = useState('');

  const filteredProducts = useMemo(() => {
    if (!searchTerm.trim()) return [];
    const term = searchTerm.toLowerCase().trim();
    return products.filter(
      (p) =>
        p.name.toLowerCase().includes(term) ||
        p.engName.toLowerCase().includes(term) ||
        p.shortDesc.toLowerCase().includes(term) ||
        p.category.toLowerCase().includes(term)
    );
  }, [searchTerm, products]);

  if (!isOpen) return null;

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      onNavigateToShop(searchTerm.trim());
      onClose();
    }
  };

  const handlePopularClick = (term: string) => {
    setSearchTerm(term);
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-start">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-ink-900/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Search Overlay */}
      <div className="relative bg-paper-100 border-b border-paper-300 w-full shadow-2xl z-10 animate-fade-in pt-6 pb-10 px-4 sm:px-8 max-h-[85vh] overflow-y-auto">
        <div className="max-w-4xl mx-auto">
          {/* Top Bar with Close */}
          <div className="flex justify-between items-center pb-4">
            <span className="text-[11px] uppercase tracking-widest text-ink-400 font-medium">
              SEARCH JEONJU LEE
            </span>
            <button
              onClick={onClose}
              className="p-1 text-ink-600 hover:text-ink-900 transition-colors"
              aria-label="닫기"
            >
              <X className="w-5 h-5" strokeWidth={1.5} />
            </button>
          </div>

          {/* Search Input Form */}
          <form onSubmit={handleSearchSubmit} className="relative mt-2">
            <input
              type="text"
              autoFocus
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="찾으시는 제품명이나 스타일을 입력하세요 (예: 코트, 셔츠, 슬랙스)"
              className="w-full bg-transparent border-b-2 border-ink-900 py-3 pl-2 pr-12 text-lg sm:text-2xl font-serif-kr text-ink-900 placeholder:text-ink-400 placeholder:font-sans focus:outline-none"
            />
            <button
              type="submit"
              className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-ink-900 hover:text-lacquer transition-colors"
              aria-label="검색 실행"
            >
              <Search className="w-6 h-6" strokeWidth={1.5} />
            </button>
          </form>

          {/* Popular Keywords */}
          <div className="mt-6 flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1.5 text-xs text-bronze mr-2 font-medium">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>추천 검색어</span>
            </div>
            {POPULAR_SEARCHES.map((keyword) => (
              <button
                key={keyword}
                type="button"
                onClick={() => handlePopularClick(keyword)}
                className="px-2.5 py-1 text-xs bg-paper-200 border border-paper-300 text-ink-700 hover:border-ink-900 hover:text-ink-900 transition-colors"
              >
                {keyword}
              </button>
            ))}
          </div>

          {/* Results Area */}
          <div className="mt-8">
            {searchTerm.trim() ? (
              <div>
                <div className="flex justify-between items-center mb-4 pb-2 border-b border-paper-300">
                  <p className="text-xs text-ink-600">
                    '<span className="font-semibold text-ink-900">{searchTerm}</span>' 검색 결과 ({filteredProducts.length}개)
                  </p>
                  {filteredProducts.length > 0 && (
                    <button
                      onClick={() => {
                        onNavigateToShop(searchTerm);
                        onClose();
                      }}
                      className="text-xs text-ink-600 hover:text-ink-900 underline flex items-center gap-1"
                    >
                      전체 결과 보기 <ArrowRight className="w-3 h-3" />
                    </button>
                  )}
                </div>

                {filteredProducts.length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {filteredProducts.slice(0, 4).map((product) => (
                      <div
                        key={product.id}
                        onClick={() => {
                          onSelectProduct(product);
                          onClose();
                        }}
                        className="cursor-pointer group flex flex-col"
                      >
                        <div className="aspect-[3/4] bg-paper-200 overflow-hidden mb-2">
                          <img
                            src={product.images[0]}
                            alt={product.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                        </div>
                        <p className="text-[10px] text-ink-400 uppercase">{product.category}</p>
                        <p className="text-xs font-medium text-ink-900 font-serif-kr line-clamp-1 group-hover:text-lacquer">
                          {product.name}
                        </p>
                        <p className="text-xs font-semibold text-ink-900 mt-0.5">
                          {product.price.toLocaleString()}원
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-12 text-center text-ink-500 text-xs">
                    일치하는 상품이 없습니다. 다른 검색어로 시도해보세요.
                  </div>
                )}
              </div>
            ) : (
              /* When empty, show Recommended Best items */
              <div>
                <h4 className="text-xs font-semibold text-ink-900 uppercase tracking-wider mb-4">
                  NOW POPULAR
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {products.filter((p) => p.isBest).slice(0, 4).map((product) => (
                    <div
                      key={product.id}
                      onClick={() => {
                        onSelectProduct(product);
                        onClose();
                      }}
                      className="cursor-pointer group flex flex-col"
                    >
                      <div className="aspect-[3/4] bg-paper-200 overflow-hidden mb-2 relative">
                        <img
                          src={product.images[0]}
                          alt={product.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <span className="absolute top-2 left-2 text-[9px] font-semibold bg-lacquer text-paper-100 px-1 py-0.5">
                          BEST
                        </span>
                      </div>
                      <p className="text-[10px] text-ink-400 uppercase">{product.category}</p>
                      <p className="text-xs font-medium text-ink-900 font-serif-kr line-clamp-1 group-hover:text-lacquer">
                        {product.name}
                      </p>
                      <p className="text-xs font-semibold text-ink-900 mt-0.5">
                        {product.price.toLocaleString()}원
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
