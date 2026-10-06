import React, { useState } from 'react';
import { FAQS } from '../data/mockData';
import { ChevronDown, ChevronUp, HelpCircle } from 'lucide-react';

interface FaqPageProps {
  navigate: (path: string) => void;
}

export const FaqPage: React.FC<FaqPageProps> = ({ navigate }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [openIds, setOpenIds] = useState<{ [key: string]: boolean }>({
    'faq-01': true,
  });

  const categories = ['ALL', '배송', '주문/결제', '교환/환불', '회원/혜택', '상품문의'];

  const filteredFaqs =
    selectedCategory === 'ALL'
      ? FAQS
      : FAQS.filter((f) => f.category === selectedCategory);

  const toggleFaq = (id: string) => {
    setOpenIds((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 animate-fade-in">
      <div className="pb-6 border-b border-paper-300">
        <span className="text-[11px] font-sans tracking-[0.25em] text-bronze uppercase">
          SUPPORT
        </span>
        <h1 className="text-2xl sm:text-3xl font-serif-kr font-medium text-ink-900 mt-1">
          자주 묻는 질문 (FAQ)
        </h1>
        <p className="text-xs text-ink-500 font-sans mt-1">
          전주이씨 이용에 관해 가장 자주 문의하시는 내용을 모았습니다.
        </p>
      </div>

      {/* Category Pills */}
      <div className="flex flex-wrap gap-2 py-6 border-b border-paper-300">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-3.5 py-1.5 text-xs transition-colors ${
              selectedCategory === cat
                ? 'bg-ink-900 text-paper-100 font-semibold'
                : 'bg-paper-200 border border-paper-300 text-ink-700 hover:border-ink-900'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Accordions */}
      <div className="divide-y divide-paper-300 border-b border-paper-300">
        {filteredFaqs.map((faq) => {
          const isOpen = !!openIds[faq.id];
          return (
            <div key={faq.id} className="bg-paper-100">
              <button
                onClick={() => toggleFaq(faq.id)}
                className="w-full py-4.5 px-4 flex items-center justify-between text-left hover:bg-paper-200/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span className="text-[11px] font-semibold text-bronze font-sans">
                    Q.
                  </span>
                  <span className="text-[10px] uppercase tracking-wider text-ink-400 font-sans">
                    [{faq.category}]
                  </span>
                  <span className="text-xs sm:text-sm font-medium font-serif-kr text-ink-900">
                    {faq.question}
                  </span>
                </div>
                {isOpen ? (
                  <ChevronUp className="w-4 h-4 text-ink-500" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-ink-500" />
                )}
              </button>

              {isOpen && (
                <div className="p-6 bg-paper-50 border-t border-paper-200 text-xs font-serif-kr text-ink-800 leading-relaxed animate-fade-in pl-10">
                  <span className="text-lacquer font-bold font-sans mr-2">A.</span>
                  {faq.answer}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Contact prompt */}
      <div className="mt-12 p-6 bg-paper-200 border border-paper-300 text-center">
        <p className="text-xs font-serif-kr text-ink-800">
          원하시는 답변을 찾지 못하셨나요?
        </p>
        <button
          onClick={() => navigate('/contact')}
          className="mt-3 px-6 py-2.5 bg-ink-900 text-paper-100 text-xs font-medium uppercase hover:bg-lacquer transition-colors"
        >
          1:1 고객 문의 접수하기
        </button>
      </div>
    </div>
  );
};
