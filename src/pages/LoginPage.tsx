import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Logo } from '../components/common/Logo';
import { Sparkles, ArrowRight, ShieldCheck, UserCheck } from 'lucide-react';

interface LoginPageProps {
  navigate: (path: string) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ navigate }) => {
  const { login, socialLogin } = useAuth();
  const [email, setEmail] = useState('customer@jeonjulee.kr');
  const [password, setPassword] = useState('123456');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      await login(email, password);
      navigate('/mypage');
    }
  };

  const handleSocial = (provider: 'kakao' | 'naver' | 'google') => {
    socialLogin(provider);
    navigate('/mypage');
  };

  const setTestAccount = (testEmail: string) => {
    setEmail(testEmail);
    setPassword('123456');
  };

  return (
    <div className="max-w-md mx-auto px-4 py-16 min-h-[75vh] flex flex-col justify-center">
      <div className="text-center mb-8">
        <div className="inline-block cursor-pointer" onClick={() => navigate('/')}>
          <Logo size="md" />
        </div>
        <h1 className="text-2xl font-serif-kr font-medium text-ink-900 mt-4 tracking-wide">
          전주이씨 가문 회원 로그인
        </h1>
        <p className="text-xs text-ink-500 mt-1 font-serif-kr">
          신규 회원 가입 시 <strong>5,000P 웰컴 포인트</strong>와 <strong>10% 할인 쿠폰</strong>을 즉시 드립니다.
        </p>
      </div>

      <div className="bg-paper-100 border border-paper-300/80 shadow-subtle p-6 sm:p-8 space-y-6">
        {/* 원클릭 테스트 계정 선택 바 */}
        <div className="p-3 bg-paper-200 border border-paper-300 text-xs">
          <p className="text-[11px] font-semibold text-ink-600 mb-2 font-serif-kr flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-bronze" />
            빠른 시연을 위한 테스트 계정 선택
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setTestAccount('customer@jeonjulee.kr')}
              className={`flex-1 py-1.5 px-2 border text-[11px] font-medium transition-colors ${
                email === 'customer@jeonjulee.kr'
                  ? 'border-ink-900 bg-ink-900 text-paper-100'
                  : 'border-paper-300 bg-paper-100 text-ink-700 hover:border-ink-700'
              }`}
            >
              일반회원 (김서연)
            </button>
            <button
              type="button"
              onClick={() => setTestAccount('admin@jeonjulee.kr')}
              className={`flex-1 py-1.5 px-2 border text-[11px] font-medium transition-colors ${
                email === 'admin@jeonjulee.kr'
                  ? 'border-ink-900 bg-ink-900 text-paper-100'
                  : 'border-paper-300 bg-paper-100 text-ink-700 hover:border-ink-700'
              }`}
            >
              관리자 ERP (이도윤)
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-ink-800 mb-1.5 font-serif-kr">
              이메일 아이디
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="example@jeonjulee.kr"
              className="w-full bg-paper-50 border border-paper-300 px-3.5 py-2.5 text-xs text-ink-900 focus:outline-none focus:border-ink-900"
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="text-xs font-medium text-ink-800 font-serif-kr">비밀번호</label>
              <button
                type="button"
                onClick={() => navigate('/find-account')}
                className="text-[11px] text-ink-500 hover:text-lacquer underline"
              >
                아이디/비밀번호 찾기 &rarr;
              </button>
            </div>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-paper-50 border border-paper-300 px-3.5 py-2.5 text-xs text-ink-900 focus:outline-none focus:border-ink-900"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-ink-900 hover:bg-lacquer text-paper-100 font-medium text-xs tracking-wider transition-colors shadow-sm"
          >
            로그인하기
          </button>
        </form>

        <div className="relative flex py-2 items-center">
          <div className="flex-grow border-t border-paper-300/80"></div>
          <span className="flex-shrink mx-4 text-[10px] text-ink-400 uppercase tracking-widest">
            또는 간편 로그인
          </span>
          <div className="flex-grow border-t border-paper-300/80"></div>
        </div>

        {/* 소셜 로그인 */}
        <div className="space-y-2">
          <button
            onClick={() => handleSocial('kakao')}
            className="w-full py-2.5 bg-[#FEE500] hover:bg-[#FDD835] text-[#3C1E1E] text-xs font-medium transition-colors flex items-center justify-center gap-2"
          >
            <span>카카오 1초 간편 로그인</span>
          </button>
          <button
            onClick={() => handleSocial('naver')}
            className="w-full py-2.5 bg-[#03C75A] hover:bg-[#02b351] text-white text-xs font-medium transition-colors flex items-center justify-center gap-2"
          >
            <span>네이버 간편 로그인</span>
          </button>
        </div>

        {/* 회원가입 안내 */}
        <div className="pt-4 border-t border-paper-300/80 text-center">
          <p className="text-xs text-ink-500 font-serif-kr">
            아직 전주이씨 가문 회원이 아니신가요?
          </p>
          <button
            onClick={() => navigate('/signup')}
            className="mt-2 text-xs font-medium text-lacquer hover:underline inline-flex items-center gap-1"
          >
            회원가입하고 5,000P 받기 <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
