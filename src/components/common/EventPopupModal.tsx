import React, { useState, useEffect } from 'react';
import { X, Sparkles, ArrowRight } from 'lucide-react';

const HIDE_POPUP_KEY = 'jeonjulee_hide_popup_until_v2';

interface EventPopupModalProps {
  navigate: (path: string) => void;
}

export const EventPopupModal: React.FC<EventPopupModalProps> = ({ navigate }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [doNotShowToday, setDoNotShowToday] = useState(false);

  useEffect(() => {
    try {
      const hideUntil = localStorage.getItem(HIDE_POPUP_KEY);
      if (hideUntil) {
        const timestamp = parseInt(hideUntil, 10);
        if (Date.now() < timestamp) {
          return;
        }
      }
      const timer = setTimeout(() => setIsOpen(true), 1200);
      return () => clearTimeout(timer);
    } catch {
      setIsOpen(false);
    }
  }, []);

  const handleClose = () => {
    if (doNotShowToday) {
      const expireTime = Date.now() + 24 * 60 * 60 * 1000;
      localStorage.setItem(HIDE_POPUP_KEY, expireTime.toString());
    }
    setIsOpen(false);
  };

  const handleAction = () => {
    handleClose();
    navigate('/signup');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink-900/60 backdrop-blur-sm animate-fade-in font-serif-kr">
      <div className="bg-paper-100 border border-paper-300 shadow-2xl max-w-sm w-full overflow-hidden relative">
        <button
          onClick={handleClose}
          className="absolute top-3 right-3 p-1.5 bg-paper-100/80 text-ink-700 hover:text-ink-900 border border-paper-300 z-10"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="p-6 text-center space-y-4">
          <div className="w-12 h-12 rounded-full border border-paper-400 bg-lacquer/10 text-lacquer flex items-center justify-center font-serif text-xl font-bold mx-auto">
            李
          </div>

          <div>
            <span className="text-[10px] text-bronze tracking-widest font-sans uppercase">
              WELCOME PRIVILEGE
            </span>
            <h3 className="text-lg font-medium text-ink-900 mt-1">
              전주이씨 가문 회원 특별 우대
            </h3>
            <p className="text-xs text-ink-600 mt-1.5 leading-relaxed">
              지금 가입하시면 <strong>5,000P 웰컴 마일리지</strong>와 <strong>10% 할인 쿠폰</strong>을 즉시 지급해 드립니다.
            </p>
          </div>

          <button
            onClick={handleAction}
            className="w-full py-3 bg-ink-900 hover:bg-lacquer text-paper-100 text-xs font-medium tracking-wider transition-colors shadow-sm flex items-center justify-center gap-1.5"
          >
            <span>회원가입 혜택 받기</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="bg-paper-200 px-4 py-2.5 border-t border-paper-300 flex items-center justify-between text-[11px] text-ink-600">
          <label className="flex items-center gap-1.5 cursor-pointer">
            <input
              type="checkbox"
              checked={doNotShowToday}
              onChange={(e) => setDoNotShowToday(e.target.checked)}
              className="accent-ink-900"
            />
            <span>오늘 하루 열지 않기</span>
          </label>
          <button onClick={handleClose} className="hover:text-ink-900">
            닫기
          </button>
        </div>
      </div>
    </div>
  );
};
