import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Logo } from '../components/common/Logo';
import { Sparkles, Check, ArrowRight } from 'lucide-react';
import { useToast } from '../context/ToastContext';

interface SignUpPageProps {
  navigate: (path: string) => void;
}

export const SignUpPage: React.FC<SignUpPageProps> = ({ navigate }) => {
  const { signup } = useAuth();
  const { showToast } = useToast();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [address, setAddress] = useState('');
  const [detailAddress, setDetailAddress] = useState('');

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agreeTerms || !agreePrivacy) {
      showToast('필수 이용약관 및 개인정보 처리방침에 동의해 주세요.', 'error');
      return;
    }
    const success = await signup({
      name,
      email,
      phone,
      postalCode,
      address,
      detailAddress,
      password,
    });
    if (success) {
      navigate('/mypage');
    }
  };

  return (
    <div className="max-w-lg mx-auto px-4 py-16 min-h-[75vh] flex flex-col justify-center">
      <div className="text-center mb-8">
        <div className="inline-block cursor-pointer" onClick={() => navigate('/')}>
          <Logo size="md" />
        </div>
        <h1 className="text-2xl font-serif-kr font-medium text-ink-900 mt-4 tracking-wide">
          전주이씨 가문 회원가입
        </h1>
        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-paper-200 border border-paper-300 text-ink-900 text-xs font-serif-kr mt-3">
          <Sparkles className="w-3.5 h-3.5 text-bronze" />
          가입 즉시 <strong>5,000P 웰컴 포인트</strong>와 <strong>10% 할인 쿠폰</strong> 지급
        </div>
      </div>

      <div className="bg-paper-100 border border-paper-300/80 shadow-subtle p-6 sm:p-8">
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-medium text-ink-800 mb-1 font-serif-kr">성명 (이름)</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="예: 홍길동"
              className="w-full bg-paper-50 border border-paper-300 px-3.5 py-2.5 text-ink-900 focus:outline-none focus:border-ink-900"
            />
          </div>

          <div>
            <label className="block font-medium text-ink-800 mb-1 font-serif-kr">이메일 아이디</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="example@jeonjulee.kr"
              className="w-full bg-paper-50 border border-paper-300 px-3.5 py-2.5 text-ink-900 focus:outline-none focus:border-ink-900"
            />
          </div>

          <div>
            <label className="block font-medium text-ink-800 mb-1 font-serif-kr">휴대폰 번호</label>
            <input
              type="tel"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="010-1234-5678"
              className="w-full bg-paper-50 border border-paper-300 px-3.5 py-2.5 text-ink-900 focus:outline-none focus:border-ink-900"
            />
          </div>

          <div>
            <label className="block font-medium text-ink-800 mb-1 font-serif-kr">비밀번호</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="영문, 숫자 포함 6자리 이상"
              className="w-full bg-paper-50 border border-paper-300 px-3.5 py-2.5 text-ink-900 focus:outline-none focus:border-ink-900"
            />
          </div>

          <div className="pt-2 border-t border-paper-300/60">
            <label className="block font-medium text-ink-800 mb-1 font-serif-kr">기본 배송지 주소 (선택)</label>
            <div className="space-y-2">
              <input
                type="text"
                value={postalCode}
                onChange={(e) => setPostalCode(e.target.value)}
                placeholder="우편번호 (예: 06000)"
                className="w-1/3 bg-paper-50 border border-paper-300 px-3.5 py-2 text-ink-900 focus:outline-none focus:border-ink-900"
              />
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="기본 주소 (예: 서울특별시 강남구 압구정로 10)"
                className="w-full bg-paper-50 border border-paper-300 px-3.5 py-2 text-ink-900 focus:outline-none focus:border-ink-900"
              />
              <input
                type="text"
                value={detailAddress}
                onChange={(e) => setDetailAddress(e.target.value)}
                placeholder="상세 주소 (예: 101동 502호)"
                className="w-full bg-paper-50 border border-paper-300 px-3.5 py-2 text-ink-900 focus:outline-none focus:border-ink-900"
              />
            </div>
          </div>

          {/* 약관 동의 */}
          <div className="pt-4 border-t border-paper-300/80 space-y-2.5">
            <label className="flex items-center gap-2 font-semibold text-ink-900 cursor-pointer">
              <input
                type="checkbox"
                checked={agreeAll}
                onChange={(e) => handleAgreeAll(e.target.checked)}
                className="rounded accent-ink-900"
              />
              <span>전체 약관에 동의합니다.</span>
            </label>

            <div className="pl-6 space-y-1.5 text-[11px] text-ink-600">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  required
                  checked={agreeTerms}
                  onChange={(e) => setAgreeTerms(e.target.checked)}
                  className="rounded accent-ink-900"
                />
                <span>[필수] 전주이씨 서비스 이용약관 동의</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  required
                  checked={agreePrivacy}
                  onChange={(e) => setAgreePrivacy(e.target.checked)}
                  className="rounded accent-ink-900"
                />
                <span>[필수] 개인정보 수집 및 이용 동의</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={agreeMarketing}
                  onChange={(e) => setAgreeMarketing(e.target.checked)}
                  className="rounded accent-ink-900"
                />
                <span>[선택] 신제품 출시 및 VIP 프로모션 혜택 수신 동의</span>
              </label>
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3.5 bg-ink-900 hover:bg-lacquer text-paper-100 font-medium text-xs tracking-wider transition-colors shadow-sm mt-4"
          >
            전주이씨 가문 회원가입 완료 (+5,000P 지급)
          </button>
        </form>

        <div className="mt-6 pt-4 border-t border-paper-300/60 text-center text-xs text-ink-500">
          이미 계정이 있으신가요?{' '}
          <button
            onClick={() => navigate('/login')}
            className="font-medium text-lacquer hover:underline inline-flex items-center gap-0.5"
          >
            로그인하기 <ArrowRight className="w-3 h-3" />
          </button>
        </div>
      </div>
    </div>
  );
};
