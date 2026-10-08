import React from 'react';
import { MessageSquare } from 'lucide-react';

export const KakaoFloatingButton: React.FC = () => {
  const kakaoUrl = import.meta.env.VITE_KAKAO_CHAT_URL || 'https://pf.kakao.com';

  return (
    <a
      href={kakaoUrl}
      target="_blank"
      rel="noreferrer"
      className="fixed bottom-20 sm:bottom-8 right-4 sm:right-6 z-40 bg-yellow-400 hover:bg-yellow-300 text-slate-950 p-3.5 rounded-full shadow-xl flex items-center gap-2 group transition-all duration-300 hover:scale-105"
      title="카카오톡 1:1 상담 문의"
    >
      <MessageSquare className="w-5 h-5 fill-slate-950" />
      <span className="hidden sm:inline text-xs font-black tracking-tight pr-1">
        카톡 상담
      </span>
    </a>
  );
};
