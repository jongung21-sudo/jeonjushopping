import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Logo } from '../components/common/Logo';
import { ArrowRight } from 'lucide-react';

interface LoginPageProps {
  navigate: (path: string) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ navigate }) => {
  const { login, socialLogin } = useAuth();
  const [email, setEmail] = useState('heritage@jeonjulee.kr');
  const [password, setPassword] = useState('********');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      login(email, password);
      navigate('/mypage');
    }
  };

  const handleSocial = (provider: 'kakao' | 'naver' | 'google') => {
    socialLogin(provider);
    navigate('/mypage');
  };

  return (
    <div className="max-w-md mx-auto px-4 py-16 animate-fade-in">
      <div className="text-center mb-8">
        <Logo size="md" variant="full" />
        <h1 className="text-xl font-serif-kr font-medium text-ink-900 mt-6">
          가문 로그인 (LOGIN)
        </h1>
        <p className="text-xs text-ink-500 font-sans mt-1">
          전주이씨의 회원이 되어 특별한 로열 혜택을 누려보세요.
        </p>
      </div>

      <div className="bg-paper-100 border border-paper-300 p-8 shadow-subtle space-y-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-ink-800 mb-1">
              이메일 아이디
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="example@jeonjulee.kr"
              className="w-full bg-paper-200 border border-paper-300 px-3.5 py-2.5 text-xs text-ink-900 focus:outline-none focus:border-ink-900"
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-xs font-semibold text-ink-800">비밀번호</label>
              <button
                type="button"
                onClick={() => alert('가입하신 이메일로 비밀번호 재설정 링크가 전송되었습니다.')}
                className="text-[11px] text-ink-500 hover:text-ink-900 underline"
              >
                비밀번호 찾기
              </button>
            </div>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-paper-200 border border-paper-300 px-3.5 py-2.5 text-xs text-ink-900 focus:outline-none focus:border-ink-900"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3.5 bg-ink-900 text-paper-100 text-xs font-semibold tracking-[0.2em] uppercase hover:bg-lacquer transition-colors mt-2"
          >
            로그인
          </button>
        </form>

        {/* Social Logins */}
        <div className="space-y-3 pt-4 border-t border-paper-300">
          <p className="text-center text-[11px] text-ink-400">간편 SNS 로그인</p>
          <div className="space-y-2">
            <button
              onClick={() => handleSocial('kakao')}
              className="w-full py-2.5 bg-[#FEE500] text-[#191919] text-xs font-semibold flex items-center justify-center gap-2 hover:opacity-90 transition-opacity"
            >
              <span>카카오 1초 로그인</span>
            </button>
            <button
              onClick={() => handleSocial('naver')}
              className="w-full py-2.5 bg-[#03C75A] text-white text-xs font-semibold flex items-center justify-center gap-2 hover:opacity-90 transition-opacity"
            >
              <span>네이버 아이디로 로그인</span>
            </button>
            <button
              onClick={() => handleSocial('google')}
              className="w-full py-2.5 bg-paper-200 border border-paper-300 text-ink-800 text-xs font-medium flex items-center justify-center gap-2 hover:border-ink-900 transition-colors"
            >
              <span>Google 계정으로 계속하기</span>
            </button>
          </div>
        </div>

        {/* Sign up prompt */}
        <div className="pt-4 border-t border-paper-300 flex items-center justify-between text-xs text-ink-600">
          <span>아직 회원이 아니신가요?</span>
          <button
            onClick={() => navigate('/signup')}
            className="text-ink-900 font-semibold underline flex items-center gap-1 hover:text-lacquer"
          >
            <span>가문 회원가입 (3,000P 지급)</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>
      </div>
    </div>
  );
};
