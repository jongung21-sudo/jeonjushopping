import React, { useState } from 'react';
import { NOTICES } from '../data/mockData';
import { Notice } from '../types';
import { ChevronDown, ChevronUp, Bell, Pin } from 'lucide-react';

interface NoticePageProps {
  navigate: (path: string) => void;
}

export const NoticePage: React.FC<NoticePageProps> = () => {
  const [activeNoticeId, setActiveNoticeId] = useState<string | null>(NOTICES[0]?.id || null);

  const toggleNotice = (id: string) => {
    setActiveNoticeId((prev) => (prev === id ? null : id));
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 animate-fade-in">
      <div className="pb-6 border-b border-paper-300">
        <span className="text-[11px] font-sans tracking-[0.25em] text-bronze uppercase">
          COMMUNICATION
        </span>
        <h1 className="text-2xl sm:text-3xl font-serif-kr font-medium text-ink-900 mt-1">
          공지사항 (NOTICE)
        </h1>
        <p className="text-xs text-ink-500 font-sans mt-1">
          전주이씨의 신규 컬렉션 릴리즈 및 서비스 소식을 전해드립니다.
        </p>
      </div>

      <div className="mt-8 divide-y divide-paper-300 border-y border-paper-300">
        {NOTICES.map((notice) => {
          const isOpen = activeNoticeId === notice.id;
          return (
            <div key={notice.id} className="bg-paper-100">
              <button
                onClick={() => toggleNotice(notice.id)}
                className="w-full py-4.5 px-4 flex items-center justify-between text-left hover:bg-paper-200/60 transition-colors"
              >
                <div className="flex items-center gap-3">
                  {notice.isPinned ? (
                    <span className="p-1 text-lacquer" title="주요 공지">
                      <Pin className="w-3.5 h-3.5" />
                    </span>
                  ) : (
                    <span className="w-3.5" />
                  )}
                  <span className="text-[10px] tracking-wider font-semibold text-ink-500 uppercase font-sans">
                    [{notice.category}]
                  </span>
                  <span className="text-xs sm:text-sm font-medium font-serif-kr text-ink-900">
                    {notice.title}
                  </span>
                </div>

                <div className="flex items-center gap-4 flex-shrink-0 ml-4">
                  <span className="text-[11px] text-ink-400 font-sans">{notice.date}</span>
                  {isOpen ? (
                    <ChevronUp className="w-4 h-4 text-ink-500" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-ink-500" />
                  )}
                </div>
              </button>

              {isOpen && (
                <div className="p-6 bg-paper-50 border-t border-paper-200 text-xs font-serif-kr text-ink-800 leading-loose whitespace-pre-line animate-fade-in">
                  {notice.content}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
