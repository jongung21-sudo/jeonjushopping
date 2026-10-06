import React from 'react';
import { Logo } from './Logo';
import { ArrowUpRight } from 'lucide-react';

interface FooterProps {
  navigate: (path: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ navigate }) => {
  return (
    <footer className="bg-paper-200 border-t border-paper-300 text-ink-700 pt-16 pb-24 md:pb-16 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top Section: Brand Statement & Newsletter/Philosophy */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 pb-14 border-b border-paper-300/80">
          <div className="md:col-span-5 space-y-4">
            <div className="cursor-pointer inline-block" onClick={() => navigate('/')}>
              <Logo size="md" variant="full" />
            </div>
            <p className="text-xs text-ink-600 font-serif-kr leading-relaxed max-w-sm pt-2">
              "시간을 지나도 남는 것. <br />
              우리는 한국의 미감을 오늘의 방식으로 다시 만듭니다."
            </p>
            <p className="text-[11px] text-ink-500 font-sans tracking-wide">
              TRADITION, REDEFINED. KOREAN CONTEMPORARY HERITAGE.
            </p>
          </div>

          {/* Quick Navigation */}
          <div className="md:col-span-2 space-y-3">
            <h4 className="text-[11px] font-semibold tracking-widest text-ink-900 uppercase">
              EXPLORE
            </h4>
            <ul className="space-y-2 text-xs text-ink-600">
              <li>
                <button onClick={() => navigate('/shop')} className="hover:text-ink-900 transition-colors">
                  전체 상품 (SHOP)
                </button>
              </li>
              <li>
                <button onClick={() => navigate('/shop?category=NEW')} className="hover:text-ink-900 transition-colors">
                  신상품 (NEW)
                </button>
              </li>
              <li>
                <button onClick={() => navigate('/shop?category=BEST')} className="hover:text-ink-900 transition-colors">
                  베스트 (BEST)
                </button>
              </li>
              <li>
                <button onClick={() => navigate('/brand')} className="hover:text-ink-900 transition-colors">
                  브랜드 스토리 (ABOUT)
                </button>
              </li>
              <li>
                <button onClick={() => navigate('/wishlist')} className="hover:text-ink-900 transition-colors">
                  찜 목록 (WISHLIST)
                </button>
              </li>
            </ul>
          </div>

          {/* Customer Service & Help */}
          <div className="md:col-span-2 space-y-3">
            <h4 className="text-[11px] font-semibold tracking-widest text-ink-900 uppercase">
              CUSTOMER
            </h4>
            <ul className="space-y-2 text-xs text-ink-600">
              <li>
                <button onClick={() => navigate('/notice')} className="hover:text-ink-900 transition-colors">
                  공지사항 (NOTICE)
                </button>
              </li>
              <li>
                <button onClick={() => navigate('/faq')} className="hover:text-ink-900 transition-colors">
                  자주 묻는 질문 (FAQ)
                </button>
              </li>
              <li>
                <button onClick={() => navigate('/contact')} className="hover:text-ink-900 transition-colors">
                  1:1 문의 (CONTACT)
                </button>
              </li>
              <li>
                <button onClick={() => navigate('/shipping-returns')} className="hover:text-ink-900 transition-colors">
                  배송 / 교환 / 반품
                </button>
              </li>
              <li>
                <button onClick={() => navigate('/orders')} className="hover:text-ink-900 transition-colors">
                  주문 및 배송 조회
                </button>
              </li>
            </ul>
          </div>

          {/* Concierge & Contact Center */}
          <div className="md:col-span-3 space-y-3">
            <h4 className="text-[11px] font-semibold tracking-widest text-ink-900 uppercase">
              CONCIERGE
            </h4>
            <div className="text-xs text-ink-600 space-y-1">
              <p className="text-base font-semibold text-ink-900 font-sans tracking-wide">
                02-1588-1392
              </p>
              <p className="text-[11px] text-ink-500">
                평일 10:00 - 18:00 (점심 12:30 - 13:30)
              </p>
              <p className="text-[11px] text-ink-500">주말 및 공휴일 휴무</p>
              <p className="text-[11px] text-ink-600 pt-1">
                E-mail: <a href="mailto:concierge@jeonjulee.kr" className="underline hover:text-ink-900">concierge@jeonjulee.kr</a>
              </p>
            </div>

            {/* Social icons */}
            <div className="flex items-center space-x-3 pt-2">
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noreferrer"
                className="w-8 h-8 rounded-none border border-paper-400 flex items-center justify-center text-ink-700 hover:text-ink-900 hover:border-ink-900 transition-colors"
                aria-label="Instagram"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                  <rect width="20" height="20" x="2" y="2" rx="5" ry="5"/>
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
                  <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>
                </svg>
              </a>
              <a
                href="https://youtube.com"
                target="_blank"
                rel="noreferrer"
                className="w-8 h-8 rounded-none border border-paper-400 flex items-center justify-center text-ink-700 hover:text-ink-900 hover:border-ink-900 transition-colors"
                aria-label="YouTube"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                  <path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-16.2 0A2 2 0 0 1 2.5 17"/>
                  <polygon points="10 15 15 12 10 9 10 15" fill="currentColor"/>
                </svg>
              </a>
              <button
                onClick={() => navigate('/admin')}
                className="text-[11px] text-ink-400 hover:text-ink-900 underline flex items-center gap-0.5 ml-2"
                title="관리자 시스템 바로가기"
              >
                Admin <ArrowUpRight className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>

        {/* Legal & Business Registration Section */}
        <div className="pt-8 text-[11px] text-ink-500 space-y-3">
          <div className="flex flex-wrap gap-x-6 gap-y-2 font-medium text-ink-700">
            <button onClick={() => navigate('/privacy')} className="hover:underline">
              개인정보처리방침
            </button>
            <span className="text-paper-400">|</span>
            <button onClick={() => navigate('/terms')} className="hover:underline">
              이용약관
            </button>
            <span className="text-paper-400">|</span>
            <button onClick={() => navigate('/shipping-returns')} className="hover:underline">
              전자상거래 표준약관
            </button>
            <span className="text-paper-400">|</span>
            <button onClick={() => navigate('/admin')} className="hover:underline text-ink-500">
              관리자 모드
            </button>
          </div>

          <div className="leading-relaxed text-[11px] text-ink-400 space-y-1">
            <p>
              상호명: 주식회사 전주이씨 (JEONJU LEE Co., Ltd.) | 대표자: 이성계 | 사업자등록번호: 202-88-01392
              [<span className="underline cursor-pointer">사업자정보확인</span>]
            </p>
            <p>
              통신판매업 신고번호: 제2026-서울용산-0428호 | 개인정보보호책임자: 이방원 (privacy@jeonjulee.kr)
            </p>
            <p>
              사업장 주소: 서울특별시 용산구 이태원로 240 전주이씨 헤리티지 하우스 4F
            </p>
            <p className="pt-2 text-[10px] text-ink-400 tracking-wider font-sans">
              COPYRIGHT © JEONJU LEE ALL RIGHTS RESERVED.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};
