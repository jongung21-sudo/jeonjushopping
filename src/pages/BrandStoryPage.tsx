import React from 'react';
import { Logo } from '../components/common/Logo';
import { ArrowRight } from 'lucide-react';

interface BrandStoryPageProps {
  navigate: (path: string) => void;
}

export const BrandStoryPage: React.FC<BrandStoryPageProps> = ({ navigate }) => {
  return (
    <div className="animate-fade-in bg-paper-100 text-ink-900">
      {/* 1. Header Statement Hero */}
      <section className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4 max-w-4xl mx-auto py-20">
        <Logo size="xl" variant="full" />
        <div className="w-16 h-[1.5px] bg-ink-900 my-8" />
        <h1 className="text-3xl sm:text-5xl font-serif-kr font-medium leading-tight text-ink-900">
          오래된 아름다움을 <br className="sm:hidden" /> 오늘의 감각으로.
        </h1>
        <p className="text-sm sm:text-base font-serif-kr text-ink-600 mt-6 max-w-xl leading-relaxed">
          한국적인 것에서 시작하지만, 결코 과거에 머물지 않습니다. <br />
          조선의 왕실과 선비의 기품을 21세기 컨템포러리 남성복으로 다시 정의합니다.
        </p>
      </section>

      {/* 2. Full-bleed Image 01 */}
      <section className="w-full h-[60vh] sm:h-[80vh] overflow-hidden bg-paper-200">
        <img
          src="https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=2000&q=85"
          alt="Brand Heritage Lookbook"
          className="w-full h-full object-cover object-center filter grayscale-[20%]"
        />
      </section>

      {/* 3. Narrative Section 01: The Lineage & Restraint */}
      <section className="py-24 sm:py-36 max-w-4xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 items-start">
          <div className="md:col-span-4">
            <span className="text-[11px] font-sans tracking-[0.3em] text-bronze uppercase block mb-2">
              CHAPTER 01
            </span>
            <h2 className="text-2xl font-serif-kr font-medium leading-snug">
              절제된 선의 미학, <br />
              여백이 품은 힘.
            </h2>
          </div>
          <div className="md:col-span-8 space-y-6 text-xs sm:text-sm font-serif-kr text-ink-700 leading-loose">
            <p>
              우리는 화려한 오방색이나 직설적인 전통 문양을 옷 위에 박제하지 않습니다. 
              조선의 복식이 지녔던 참된 본질은 겉으로 드러나는 과시가 아니라, 
              몸과 옷 사이에 흐르는 너그러운 '공간'과 '단정한 선'에 있었기 때문입니다.
            </p>
            <p>
              도포 자락의 우아한 드레이프는 모던 오버핏 코트의 밑단으로 흐르고, 
              꼿꼿한 동정 깃의 각도는 정밀하게 재단된 스탠드 칼라 셔츠의 목선으로 살아납니다. 
              덜어낼수록 본질은 더욱 또렷해집니다.
            </p>
          </div>
        </div>
      </section>

      {/* 4. Split Image & Texture Grid */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-10">
          <div className="space-y-4">
            <div className="aspect-[4/5] bg-paper-200 overflow-hidden shadow-subtle">
              <img
                src="https://images.unsplash.com/photo-1544441893-675973e31985?auto=format&fit=crop&w=1200&q=80"
                alt="Wool and Cashmere Texture"
                className="w-full h-full object-cover"
              />
            </div>
            <p className="text-[11px] font-sans text-ink-500 uppercase tracking-wider">
              FIG. 01 — 호주산 메리노 울과 캐시미어의 묵직한 조우
            </p>
          </div>
          <div className="space-y-4 md:mt-16">
            <div className="aspect-[4/5] bg-paper-200 overflow-hidden shadow-subtle">
              <img
                src="https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?auto=format&fit=crop&w=1200&q=80"
                alt="Incense and Ceramic Craft"
                className="w-full h-full object-cover"
              />
            </div>
            <p className="text-[11px] font-sans text-ink-500 uppercase tracking-wider">
              FIG. 02 — 백자의 곡선과 소나무 침향이 빚은 서재의 향기
            </p>
          </div>
        </div>
      </section>

      {/* 5. Narrative Section 02: Material & Craftsmanship */}
      <section className="py-24 sm:py-36 max-w-4xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 items-start">
          <div className="md:col-span-4">
            <span className="text-[11px] font-sans tracking-[0.3em] text-lacquer uppercase block mb-2">
              CHAPTER 02
            </span>
            <h2 className="text-2xl font-serif-kr font-medium leading-snug">
              먹(墨)과 한지(韓紙), <br />
              시간을 견디는 소재.
            </h2>
          </div>
          <div className="md:col-span-8 space-y-6 text-xs sm:text-sm font-serif-kr text-ink-700 leading-loose">
            <p>
              천년을 견디는 전통 한지처럼, 전주이씨는 시간이 흐를수록 더 깊은 풍미를 지니는 천연 섬유만을 고집합니다. 
              오가닉 콤마드 코튼의 포근함, 에이징될수록 부드러워지는 베지터블 레더, 
              그리고 황동의 그윽한 변색은 제품이 착용자의 삶과 함께 나이 들어가는 숭고한 과정입니다.
            </p>
            <p>
              단 한 벌을 입더라도 타협 없는 원단감과 정직한 마감으로, 
              소장 가치를 지닌 라이프스타일 웨어를 완성합니다.
            </p>
          </div>
        </div>
      </section>

      {/* 6. Closing Call to Action */}
      <section className="bg-paper-200 border-t border-paper-300 py-24 text-center px-4">
        <span className="text-[10px] tracking-[0.3em] uppercase text-bronze font-sans">
          THE ROYAL CONTEMPORARY
        </span>
        <h3 className="text-2xl sm:text-4xl font-serif-kr font-medium text-ink-900 mt-2 mb-6">
          전주이씨의 품격을 지금 경험해 보세요.
        </h3>
        <button
          onClick={() => navigate('/shop')}
          className="px-10 py-4 bg-ink-900 text-paper-100 text-xs font-semibold tracking-[0.25em] uppercase hover:bg-lacquer transition-colors inline-flex items-center gap-2"
        >
          <span>2026 S/S 컬렉션 보기</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </section>
    </div>
  );
};
