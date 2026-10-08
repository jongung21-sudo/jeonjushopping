import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Logo } from './Logo';
import { X, Sparkles, ArrowRight, ShieldCheck, Lock, Mail } from 'lucide-react';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSwitchToSignUp?: () => void;
  onNavigateToFindAccount?: () => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({
  isOpen,
  onClose,
  onSwitchToSignUp,
  onNavigateToFindAccount,
}) => {
  const { login, socialLogin } = useAuth();
  const { showToast } = useToast();

  const [email, setEmail] = useState('customer@jeonjulee.kr');
  const [password, setPassword] = useState('customer1234');
  const [rememberMe, setRememberMe] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      showToast('이메일을 입력해 주세요.', 'error');
      return;
    }
    setIsSubmitting(true);
    try {
      const success = await login(email, password);
      if (success) {
        onClose();
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTestAccount = (testEmail: string, testPw: string) => {
    setEmail(testEmail);
    setPassword(testPw);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-ink-900/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal Card */}
      <div className="relative w-full max-w-md bg-paper-100 border border-paper-300 shadow-2xl rounded-sm p-6 sm:p-8 z-10 my-8 animate-fade-in max-h-[90vh] overflow-y-auto selection:bg-ink-900 selection:text-paper-100">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-1.5 text-ink-500 hover:text-ink-900 hover:bg-paper-200 transition-colors rounded-sm"
          aria-label="닫기"
        >
          <X className="w-5 h-5" strokeWidth={1.5} />
        </button>

        {/* Header */}
        <div className="text-center pt-2 pb-5 border-b border-paper-300">
          <div className="flex justify-center mb-3">
            <Logo size="sm" variant="full" />
          </div>
          <h2 className="text-xl sm:text-2xl font-serif-kr font-medium text-ink-900 tracking-wide">
            전주이씨 가문 로그인
          </h2>
          <p className="text-xs text-ink-500 font-serif-kr mt-1">
            조선의 품격과 현대 미니멀리즘이 공존하는 온라인 부티크
          </p>
        </div>

        {/* One-click Demo Accounts */}
        <div className="mt-4 p-3 bg-paper-200 border border-paper-300 rounded-sm text-xs">
          <p className="text-[11px] font-semibold text-ink-600 mb-2 font-serif-kr flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-bronze" />
            빠른 시연을 위한 1초 테스트 계정 선택
          </p>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => handleTestAccount('customer@jeonjulee.kr', 'customer1234')}
              className={`py-1.5 px-2 border text-[11px] font-medium transition-colors rounded-xs ${
                email === 'customer@jeonjulee.kr'
                  ? 'border-ink-900 bg-ink-900 text-paper-100'
                  : 'border-paper-300 bg-paper-100 text-ink-700 hover:border-ink-700'
              }`}
            >
              일반회원 (김서연)
            </button>
            <button
              type="button"
              onClick={() => handleTestAccount('admin@jeonjulee.kr', 'admin1234')}
              className={`py-1.5 px-2 border text-[11px] font-medium transition-colors rounded-xs ${
                email === 'admin@jeonjulee.kr'
                  ? 'border-ink-900 bg-ink-900 text-paper-100'
                  : 'border-paper-300 bg-paper-100 text-ink-700 hover:border-ink-700'
              }`}
            >
              관리자 ERP (이도윤)
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="mt-5 space-y-4 text-xs">
          <div>
            <label className="block font-medium text-ink-800 mb-1 font-serif-kr flex items-center gap-1">
              <Mail className="w-3 h-3 text-bronze" />
              <span>이메일 아이디</span>
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="example@jeonjulee.kr"
              className="w-full bg-paper-50 border border-paper-300 px-3 py-2 text-ink-900 focus:outline-none focus:border-ink-900 rounded-sm"
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="font-medium text-ink-800 font-serif-kr flex items-center gap-1">
                <Lock className="w-3 h-3 text-bronze" />
                <span>비밀번호</span>
              </label>
              {onNavigateToFindAccount && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onNavigateToFindAccount();
                  }}
                  className="text-[11px] text-ink-500 hover:text-ink-900 underline"
                >
                  아이디 / 비밀번호 찾기
                </button>
              )}
            </div>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="비밀번호 입력"
              className="w-full bg-paper-50 border border-paper-300 px-3 py-2 text-ink-900 focus:outline-none focus:border-ink-900 rounded-sm"
            />
          </div>

          <div className="flex items-center justify-between text-xs text-ink-600">
            <label className="flex items-center gap-1.5 cursor-pointer">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="accent-ink-900 w-3.5 h-3.5"
              />
              <span>로그인 상태 유지</span>
            </label>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3.5 bg-ink-900 text-paper-100 hover:bg-lacquer font-serif-kr font-medium text-sm tracking-wider flex items-center justify-center gap-2 transition-colors duration-200 rounded-sm shadow-md disabled:opacity-50"
          >
            <span>{isSubmitting ? '로그인 중...' : '전주이씨 로그인'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Social Logins */}
        <div className="mt-5 pt-4 border-t border-paper-300">
          <p className="text-[11px] text-center text-ink-500 mb-2.5 font-sans">
            간편 소셜 로그인
          </p>
          <div className="grid grid-cols-2 gap-2.5">
            <button
              type="button"
              onClick={() => {
                socialLogin('kakao');
                onClose();
              }}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-3 bg-[#FEE500] hover:bg-[#FDD835] text-[#3C1E1E] text-xs font-medium rounded-sm transition-colors shadow-sm"
            >
              <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                <path d="M12 3c-5.52 0-10 3.58-10 8 0 2.87 1.88 5.39 4.73 6.78l-1.2 4.41c-.1.39.34.69.68.46l5.24-3.48c.18.02.36.03.55.03 5.52 0 10-3.58 10-8s-4.48-8-10-8z" />
              </svg>
              <span>카카오 로그인</span>
            </button>
            <button
              type="button"
              onClick={() => {
                socialLogin('naver');
                onClose();
              }}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-3 bg-[#03C75A] hover:bg-[#02B351] text-white text-xs font-medium rounded-sm transition-colors shadow-sm"
            >
              <span className="font-black text-xs">N</span>
              <span>네이버 로그인</span>
            </button>
          </div>
        </div>

        {/* Switch to Sign Up */}
        <div className="mt-5 text-center text-xs text-ink-600 border-t border-paper-300 pt-3">
          아직 회원이 아니신가요?{' '}
          <button
            type="button"
            onClick={() => {
              onClose();
              if (onSwitchToSignUp) onSwitchToSignUp();
            }}
            className="text-ink-900 font-semibold underline underline-offset-4 hover:text-lacquer inline-flex items-center gap-0.5 ml-1"
          >
            <span>회원가입 (+5,000P)</span>
          </button>
        </div>
      </div>
    </div>
  );
};
