import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Mail, Phone, KeyRound, ArrowRight, CheckCircle2 } from 'lucide-react';
import { Logo } from '../components/common/Logo';

interface FindAccountPageProps {
  navigate: (path: string) => void;
}

export const FindAccountPage: React.FC<FindAccountPageProps> = ({ navigate }) => {
  const [tab, setTab] = useState<'id' | 'password'>('id');
  const [phoneInput, setPhoneInput] = useState('');
  const [emailInput, setEmailInput] = useState('');
  const [resultMessage, setResultMessage] = useState<string | null>(null);
  const [foundEmail, setFoundEmail] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const { findAccount, resetPassword } = useAuth();
  const { showToast } = useToast();

  const handleFindId = (e: React.FormEvent) => {
    e.preventDefault();
    if (!phoneInput.trim()) {
      showToast('휴대폰 번호를 입력해주세요.', 'error');
      return;
    }
    const res = findAccount(phoneInput.trim());
    setResultMessage(res.message);
    if (res.found && res.email) {
      setFoundEmail(res.email);
    } else {
      setFoundEmail(null);
    }
  };

  const handleFindPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailInput.trim() || !phoneInput.trim()) {
      showToast('이메일과 휴대폰 번호를 모두 입력해주세요.', 'error');
      return;
    }
    setIsLoading(true);
    const res = await resetPassword(emailInput.trim(), phoneInput.trim());
    setIsLoading(false);
    setResultMessage(res.message);
    if (res.success) {
      showToast('비밀번호 재설정 확인이 완료되었습니다.');
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-16 min-h-[75vh] flex flex-col justify-center">
      <div className="text-center mb-8">
        <div className="inline-block cursor-pointer" onClick={() => navigate('/')}>
          <Logo size="md" />
        </div>
        <h1 className="text-2xl font-serif-kr font-medium text-ink-900 mt-4 tracking-wide">
          아이디 / 비밀번호 찾기
        </h1>
        <p className="text-xs text-ink-500 mt-1 font-serif-kr">
          가입 시 등록하신 회원 정보를 입력하시면 신속하게 계정을 확인해 드립니다.
        </p>
      </div>

      <div className="bg-paper-100 border border-paper-300/80 shadow-subtle p-6 sm:p-8">
        {/* 탭 전환 */}
        <div className="grid grid-cols-2 gap-1 p-1 bg-paper-200 mb-6 text-xs font-medium">
          <button
            onClick={() => {
              setTab('id');
              setResultMessage(null);
              setFoundEmail(null);
            }}
            className={`py-2.5 transition-all tracking-wider ${
              tab === 'id' ? 'bg-paper-100 text-ink-900 shadow-sm font-semibold' : 'text-ink-500 hover:text-ink-900'
            }`}
          >
            아이디(이메일) 찾기
          </button>
          <button
            onClick={() => {
              setTab('password');
              setResultMessage(null);
              setFoundEmail(null);
            }}
            className={`py-2.5 transition-all tracking-wider ${
              tab === 'password' ? 'bg-paper-100 text-ink-900 shadow-sm font-semibold' : 'text-ink-500 hover:text-ink-900'
            }`}
          >
            비밀번호 재설정
          </button>
        </div>

        {tab === 'id' ? (
          <form onSubmit={handleFindId} className="space-y-4">
            <div>
              <label className="text-xs font-medium text-ink-800 block mb-1.5 font-serif-kr">
                가입 시 등록한 휴대폰 번호
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={phoneInput}
                  onChange={(e) => setPhoneInput(e.target.value)}
                  placeholder="예: 010-9876-5432 (또는 숫자만)"
                  className="w-full bg-paper-50 border border-paper-300 pl-9 pr-3 py-2.5 text-xs text-ink-900 focus:outline-none focus:border-ink-900"
                  required
                />
                <Phone className="w-4 h-4 text-ink-400 absolute left-3 top-3" />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-ink-900 hover:bg-lacquer text-paper-100 font-medium text-xs tracking-wider transition-colors shadow-sm"
            >
              아이디 찾기
            </button>
          </form>
        ) : (
          <form onSubmit={handleFindPassword} className="space-y-4">
            <div>
              <label className="text-xs font-medium text-ink-800 block mb-1.5 font-serif-kr">
                가입된 이메일 주소 (아이디)
              </label>
              <div className="relative">
                <input
                  type="email"
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  placeholder="example@jeonjulee.kr"
                  className="w-full bg-paper-50 border border-paper-300 pl-9 pr-3 py-2.5 text-xs text-ink-900 focus:outline-none focus:border-ink-900"
                  required
                />
                <Mail className="w-4 h-4 text-ink-400 absolute left-3 top-3" />
              </div>
            </div>

            <div>
              <label className="text-xs font-medium text-ink-800 block mb-1.5 font-serif-kr">
                가입 시 등록한 휴대폰 번호
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={phoneInput}
                  onChange={(e) => setPhoneInput(e.target.value)}
                  placeholder="010-9876-5432"
                  className="w-full bg-paper-50 border border-paper-300 pl-9 pr-3 py-2.5 text-xs text-ink-900 focus:outline-none focus:border-ink-900"
                  required
                />
                <Phone className="w-4 h-4 text-ink-400 absolute left-3 top-3" />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-ink-900 hover:bg-lacquer text-paper-100 font-medium text-xs tracking-wider transition-colors shadow-sm disabled:opacity-50"
            >
              {isLoading ? '확인 중...' : '임시 비밀번호 발급'}
            </button>
          </form>
        )}

        {/* 결과 메시지 표시창 */}
        {resultMessage && (
          <div className="mt-6 p-4 bg-paper-200 border border-paper-300 animate-fade-in text-xs">
            <div className="flex items-start gap-2 text-ink-900">
              <CheckCircle2 className="w-4 h-4 text-lacquer flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-serif-kr leading-relaxed">{resultMessage}</p>
                {foundEmail && (
                  <button
                    onClick={() => navigate('/login')}
                    className="mt-3 inline-flex items-center gap-1 text-xs text-lacquer hover:underline font-medium"
                  >
                    로그인 페이지로 이동 <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* 하단 링크 */}
        <div className="mt-6 pt-4 border-t border-paper-300/60 flex items-center justify-between text-xs text-ink-500">
          <button onClick={() => navigate('/login')} className="hover:text-ink-900 transition-colors">
            &larr; 로그인으로 돌아가기
          </button>
          <button onClick={() => navigate('/signup')} className="hover:text-lacquer font-medium transition-colors">
            신규 회원가입 (5,000P)
          </button>
        </div>
      </div>
    </div>
  );
};
