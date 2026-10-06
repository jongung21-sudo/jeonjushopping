import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Logo } from '../components/common/Logo';
import { Check } from 'lucide-react';

interface SignUpPageProps {
  navigate: (path: string) => void;
}

export const SignUpPage: React.FC<SignUpPageProps> = ({ navigate }) => {
  const { signup } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [agreeAll, setAgreeAll] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [agreePrivacy, setAgreePrivacy] = useState(false);
  const [agreeMarketing, setAgreeMarketing] = useState(false);

  const handleAgreeAll = (checked: boolean) => {
    setAgreeAll(checked);
    setAgreeTerms(checked);
    setAgreePrivacy(checked);
    setAgreeMarketing(checked);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!agreeTerms || !agreePrivacy) {
      alert('필수 이용약관 및 개인정보 처리방침에 동의해 주세요.');
      return;
    }
    signup({ name, email, phone, password });
    navigate('/mypage');
  };

  return (
    <div className="max-w-lg mx-auto px-4 py-16 animate-fade-in">
      <div className="text-center mb-8">
        <Logo size="md" variant="full" />
        <h1 className="text-xl font-serif-kr font-medium text-ink-900 mt-6">
          전주이씨 가문 회원가입
        </h1>
        <p className="text-xs text-ink-500 font-sans mt-1">
          신규 가입 시 웰컴 10% 쿠폰 및 3,000P 즉시 적립
        </p>
      </div>

      <div className="bg-paper-100 border border-paper-300 p-8 shadow-subtle">
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-ink-800 mb-1">이름</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="성함을 입력해 주세요"
              className="w-full bg-paper-200 border border-paper-300 px-3.5 py-2.5 text-ink-900 focus:outline-none focus:border-ink-900"
            />
          </div>

          <div>
            <label className="block font-semibold text-ink-800 mb-1">이메일 (아이디)</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="example@jeonjulee.kr"
              className="w-full bg-paper-200 border border-paper-300 px-3.5 py-2.5 text-ink-900 focus:outline-none focus:border-ink-900"
            />
          </div>

          <div>
            <label className="block font-semibold text-ink-800 mb-1">비밀번호</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="영문, 숫자 포함 8자리 이상"
              className="w-full bg-paper-200 border border-paper-300 px-3.5 py-2.5 text-ink-900 focus:outline-none focus:border-ink-900"
            />
          </div>

          <div>
            <label className="block font-semibold text-ink-800 mb-1">휴대폰 번호</label>
            <input
              type="tel"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="010-0000-0000"
              className="w-full bg-paper-200 border border-paper-300 px-3.5 py-2.5 text-ink-900 focus:outline-none focus:border-ink-900"
            />
          </div>

          {/* Terms agreements */}
          <div className="pt-4 border-t border-paper-300 space-y-2.5">
            <label className="flex items-center gap-2 font-semibold text-ink-900 cursor-pointer pb-1 border-b border-paper-300/60">
              <input
                type="checkbox"
                checked={agreeAll}
                onChange={(e) => handleAgreeAll(e.target.checked)}
                className="accent-ink-900"
              />
              <span>전체 약관에 모두 동의합니다</span>
            </label>

            <div className="space-y-1.5 pl-1 text-[11px] text-ink-600">
              <label className="flex items-center justify-between cursor-pointer">
                <span className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={agreeTerms}
                    onChange={(e) => setAgreeTerms(e.target.checked)}
                    className="accent-ink-900"
                  />
                  <span>[필수] 이용약관 동의</span>
                </span>
                <span className="text-ink-400 underline">전문보기</span>
              </label>

              <label className="flex items-center justify-between cursor-pointer">
                <span className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={agreePrivacy}
                    onChange={(e) => setAgreePrivacy(e.target.checked)}
                    className="accent-ink-900"
                  />
                  <span>[필수] 개인정보 수집 및 이용 동의</span>
                </span>
                <span className="text-ink-400 underline">전문보기</span>
              </label>

              <label className="flex items-center justify-between cursor-pointer">
                <span className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={agreeMarketing}
                    onChange={(e) => setAgreeMarketing(e.target.checked)}
                    className="accent-ink-900"
                  />
                  <span>[선택] 신상품 및 프라이빗 혜택 수신 동의</span>
                </span>
              </label>
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3.5 bg-ink-900 text-paper-100 text-xs font-semibold tracking-[0.2em] uppercase hover:bg-lacquer transition-colors mt-4"
          >
            가입 완료하고 혜택 받기
          </button>
        </form>

        <div className="text-center pt-6 text-xs text-ink-500">
          <span>이미 계정이 있으신가요? </span>
          <button onClick={() => navigate('/login')} className="text-ink-900 underline font-semibold">
            로그인하기
          </button>
        </div>
      </div>
    </div>
  );
};
