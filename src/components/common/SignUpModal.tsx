import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Logo } from './Logo';
import { X, Sparkles, ArrowRight } from 'lucide-react';

interface SignUpModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSwitchToLogin?: () => void;
}

export const SignUpModal: React.FC<SignUpModalProps> = ({
  isOpen,
  onClose,
  onSwitchToLogin,
}) => {
  const { signup, socialLogin } = useAuth();
  const { showToast } = useToast();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [address, setAddress] = useState('');
  const [detailAddress, setDetailAddress] = useState('');

  const [agreeAll, setAgreeAll] = useState(true);
  const [agreeTerms, setAgreeTerms] = useState(true);
  const [agreePrivacy, setAgreePrivacy] = useState(true);
  const [agreeMarketing, setAgreeMarketing] = useState(true);

  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleAgreeAll = (checked: boolean) => {
    setAgreeAll(checked);
    setAgreeTerms(checked);
    setAgreePrivacy(checked);
    setAgreeMarketing(checked);
  };

  const formatPhoneNumber = (val: string) => {
    const raw = val.replace(/[^0-9]/g, '').slice(0, 11);
    if (raw.length <= 3) return raw;
    if (raw.length <= 7) return `${raw.slice(0, 3)}-${raw.slice(3)}`;
    return `${raw.slice(0, 3)}-${raw.slice(3, 7)}-${raw.slice(7)}`;
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPhone(formatPhoneNumber(e.target.value));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agreeTerms || !agreePrivacy) {
      showToast('필수 약관에 동의해 주세요.', 'error');
      return;
    }
    if (password && passwordConfirm && password !== passwordConfirm) {
      showToast('비밀번호가 일치하지 않습니다.', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
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
        onClose();
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-ink-900/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal Card */}
      <div className="relative w-full max-w-lg bg-paper-100 border border-paper-300 shadow-2xl rounded-sm p-6 sm:p-8 z-10 my-8 animate-fade-in max-h-[90vh] overflow-y-auto selection:bg-ink-900 selection:text-paper-100">
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
            전주이씨 가문 회원가입
          </h2>
          <p className="text-xs text-ink-500 font-serif-kr mt-1">
            한국의 전통 미감을 오늘의 방식으로 짓는 전주이씨 멤버십에 오신 것을 환영합니다.
          </p>

          {/* Benefit Badge */}
          <div className="mt-3.5 inline-flex items-center gap-2 px-3 py-1.5 bg-ink-900 text-paper-100 text-xs font-serif-kr rounded-sm shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-bronze animate-pulse" />
            <span>가입 즉시 <strong>5,000P 웰컴 포인트</strong> + <strong>10% 감사 쿠폰</strong> 지급</span>
          </div>
        </div>

        {/* Social Quick Sign Up */}
        <div className="pt-4 pb-3">
          <p className="text-[11px] text-center text-ink-500 mb-2.5 font-sans">
            간편 1초 회원가입
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
              <span>카카오 1초 가입</span>
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
              <span>네이버 간편가입</span>
            </button>
          </div>

          <div className="relative flex items-center justify-center my-4">
            <div className="border-t border-paper-300 w-full" />
            <span className="bg-paper-100 px-3 text-[10px] text-ink-400 font-sans uppercase tracking-widest absolute">
              또는 직접 정보 입력
            </span>
          </div>
        </div>

        {/* Registration Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          <div>
            <label className="block font-medium text-ink-800 mb-1 font-serif-kr">
              성명 (이름) <span className="text-lacquer">*</span>
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="예: 홍길동"
              className="w-full bg-paper-50 border border-paper-300 px-3 py-2 text-ink-900 focus:outline-none focus:border-ink-900 rounded-sm"
            />
          </div>

          <div>
            <label className="block font-medium text-ink-800 mb-1 font-serif-kr">
              이메일 주소 (로그인 계정) <span className="text-lacquer">*</span>
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

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <div>
              <label className="block font-medium text-ink-800 mb-1 font-serif-kr">
                비밀번호 <span className="text-lacquer">*</span>
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="8자리 이상 입력"
                className="w-full bg-paper-50 border border-paper-300 px-3 py-2 text-ink-900 focus:outline-none focus:border-ink-900 rounded-sm"
              />
            </div>
            <div>
              <label className="block font-medium text-ink-800 mb-1 font-serif-kr">
                비밀번호 확인 <span className="text-lacquer">*</span>
              </label>
              <input
                type="password"
                required
                value={passwordConfirm}
                onChange={(e) => setPasswordConfirm(e.target.value)}
                placeholder="비밀번호 재입력"
                className="w-full bg-paper-50 border border-paper-300 px-3 py-2 text-ink-900 focus:outline-none focus:border-ink-900 rounded-sm"
              />
            </div>
          </div>

          <div>
            <label className="block font-medium text-ink-800 mb-1 font-serif-kr">
              휴대폰 번호 <span className="text-lacquer">*</span>
            </label>
            <input
              type="tel"
              required
              value={phone}
              onChange={handlePhoneChange}
              placeholder="010-0000-0000"
              className="w-full bg-paper-50 border border-paper-300 px-3 py-2 text-ink-900 focus:outline-none focus:border-ink-900 rounded-sm"
            />
          </div>

          {/* Delivery Address */}
          <div>
            <label className="block font-medium text-ink-800 mb-1 font-serif-kr">
              기본 배송지 주소 (선택)
            </label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={postalCode}
                onChange={(e) => setPostalCode(e.target.value)}
                placeholder="우편번호"
                className="w-28 bg-paper-50 border border-paper-300 px-3 py-2 text-ink-900 focus:outline-none focus:border-ink-900 rounded-sm"
              />
              <button
                type="button"
                onClick={() => {
                  setPostalCode('04383');
                  setAddress('서울특별시 용산구 이태원로 240');
                  setDetailAddress('전주이씨 가문하우스');
                  showToast('기본 테스트 주소가 자동 입력되었습니다.');
                }}
                className="px-3 py-2 bg-paper-200 border border-paper-300 text-ink-800 hover:bg-paper-300 transition-colors text-[11px] rounded-sm"
              >
                주소 자동완성
              </button>
            </div>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="기본 주소"
              className="w-full bg-paper-50 border border-paper-300 px-3 py-2 text-ink-900 focus:outline-none focus:border-ink-900 rounded-sm mb-2"
            />
            <input
              type="text"
              value={detailAddress}
              onChange={(e) => setDetailAddress(e.target.value)}
              placeholder="상세 주소 (동·호수)"
              className="w-full bg-paper-50 border border-paper-300 px-3 py-2 text-ink-900 focus:outline-none focus:border-ink-900 rounded-sm"
            />
          </div>

          {/* Agreements */}
          <div className="pt-2 border-t border-paper-300 space-y-2">
            <label className="flex items-center gap-2 cursor-pointer font-medium text-ink-900 font-serif-kr">
              <input
                type="checkbox"
                checked={agreeAll}
                onChange={(e) => handleAgreeAll(e.target.checked)}
                className="accent-ink-900 w-3.5 h-3.5"
              />
              <span>약관 전체 동의</span>
            </label>
            <div className="space-y-1.5 pl-5 text-[11px] text-ink-600">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  required
                  checked={agreeTerms}
                  onChange={(e) => setAgreeTerms(e.target.checked)}
                  className="accent-ink-900 w-3 h-3"
                />
                <span>(필수) 이용약관 동의</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  required
                  checked={agreePrivacy}
                  onChange={(e) => setAgreePrivacy(e.target.checked)}
                  className="accent-ink-900 w-3 h-3"
                />
                <span>(필수) 개인정보 수집 및 이용 동의</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={agreeMarketing}
                  onChange={(e) => setAgreeMarketing(e.target.checked)}
                  className="accent-ink-900 w-3 h-3"
                />
                <span>(선택) 신상품 및 가문 회원 전용 혜택 소식 알림</span>
              </label>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3.5 bg-ink-900 text-paper-100 hover:bg-lacquer font-serif-kr font-medium text-sm tracking-wider flex items-center justify-center gap-2 transition-colors duration-200 mt-4 rounded-sm shadow-md disabled:opacity-50"
          >
            <Sparkles className="w-4 h-4 text-bronze" />
            <span>{isSubmitting ? '가입 처리 중...' : '가입 완료하고 5,000P 받기'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Footer switch to login */}
        <div className="mt-5 text-center text-xs text-ink-600 border-t border-paper-300 pt-3">
          이미 전주이씨 회원이신가요?{' '}
          <button
            type="button"
            onClick={() => {
              onClose();
              if (onSwitchToLogin) onSwitchToLogin();
            }}
            className="text-ink-900 font-semibold underline underline-offset-4 hover:text-lacquer"
          >
            로그인하기
          </button>
        </div>
      </div>
    </div>
  );
};
