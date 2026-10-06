import React, { useState } from 'react';
import { useToast } from '../context/ToastContext';
import { Phone, Mail, Clock, MapPin, Send } from 'lucide-react';

interface ContactPageProps {
  navigate: (path: string) => void;
}

export const ContactPage: React.FC<ContactPageProps> = () => {
  const { showToast } = useToast();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [category, setCategory] = useState('상품 문의');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !subject || !message) {
      showToast('필수 입력 항목을 모두 작성해 주세요.', 'error');
      return;
    }
    showToast('문의가 정상적으로 접수되었습니다. 가문 담당자가 빠른 시일 내에 회신드리겠습니다.', 'success');
    setName('');
    setEmail('');
    setPhone('');
    setSubject('');
    setMessage('');
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 animate-fade-in">
      <div className="pb-6 border-b border-paper-300">
        <span className="text-[11px] font-sans tracking-[0.25em] text-bronze uppercase">
          CUSTOMER CONCIERGE
        </span>
        <h1 className="text-2xl sm:text-3xl font-serif-kr font-medium text-ink-900 mt-1">
          1:1 고객 문의 (CONTACT)
        </h1>
        <p className="text-xs text-ink-500 font-sans mt-1">
          전주이씨의 가문 컨시어지가 정성을 다해 답변해 드리겠습니다.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-10 mt-8">
        {/* Left Column: Direct Info */}
        <div className="md:col-span-5 space-y-6">
          <div className="bg-paper-100 border border-paper-300 p-6 space-y-4">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-ink-900 border-b border-paper-300 pb-2">
              컨시어지 데스크 안내
            </h2>

            <div className="space-y-3 text-xs text-ink-700">
              <div className="flex items-start gap-3">
                <Phone className="w-4 h-4 text-bronze mt-0.5" />
                <div>
                  <p className="font-semibold text-ink-900 text-sm">02-1588-1392</p>
                  <p className="text-[11px] text-ink-500">평일 10:00 - 18:00 (점심 12:30 - 13:30)</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Mail className="w-4 h-4 text-bronze mt-0.5" />
                <div>
                  <p className="font-semibold text-ink-900">concierge@jeonjulee.kr</p>
                  <p className="text-[11px] text-ink-500">24시간 상시 접수 가능</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-bronze mt-0.5" />
                <div>
                  <p className="font-semibold text-ink-900">전주이씨 한남 아틀리에</p>
                  <p className="text-[11px] text-ink-500">서울특별시 용산구 이태원로 240, 4F</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-paper-200 border border-paper-300 p-5 text-xs text-ink-600 leading-relaxed">
            <p className="font-semibold text-ink-900 mb-1">상담 전 확인사항</p>
            <p>
              배송 조회, 교환/반품 신청은 <a href="/mypage" className="underline font-medium text-ink-900">마이페이지</a>에서 
              더욱 빠르게 처리하실 수 있습니다.
            </p>
          </div>
        </div>

        {/* Right Column: Inquiry Submission Form */}
        <div className="md:col-span-7">
          <form onSubmit={handleSubmit} className="bg-paper-100 border border-paper-300 p-6 sm:p-8 space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-ink-800 mb-1">성함 *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="홍길동"
                  className="w-full bg-paper-200 border border-paper-300 px-3 py-2 text-ink-900 focus:outline-none focus:border-ink-900"
                />
              </div>

              <div>
                <label className="block font-semibold text-ink-800 mb-1">연락처</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="010-0000-0000"
                  className="w-full bg-paper-200 border border-paper-300 px-3 py-2 text-ink-900 focus:outline-none focus:border-ink-900"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-ink-800 mb-1">답변 수신 이메일 *</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="example@jeonjulee.kr"
                className="w-full bg-paper-200 border border-paper-300 px-3 py-2 text-ink-900 focus:outline-none focus:border-ink-900"
              />
            </div>

            <div>
              <label className="block font-semibold text-ink-800 mb-1">문의 유형 *</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-paper-200 border border-paper-300 px-3 py-2 text-ink-900 focus:outline-none focus:border-ink-900"
              >
                <option value="상품 문의">상품 문의 (원단, 사이즈 등)</option>
                <option value="배송 문의">배송 일정 및 주소 변경</option>
                <option value="교환/환불">교환 및 반품 신청</option>
                <option value="회원 혜택">가문 등급 및 마일리지 혜택</option>
                <option value="제휴/협업">브랜드 제휴 및 비즈니스 협업</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-ink-800 mb-1">제목 *</label>
              <input
                type="text"
                required
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="문의 제목을 간결하게 적어주세요"
                className="w-full bg-paper-200 border border-paper-300 px-3 py-2 text-ink-900 focus:outline-none focus:border-ink-900"
              />
            </div>

            <div>
              <label className="block font-semibold text-ink-800 mb-1">문의 내용 *</label>
              <textarea
                rows={5}
                required
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="자세한 내용을 입력해 주시면 더욱 정확하고 빠른 안내가 가능합니다."
                className="w-full bg-paper-200 border border-paper-300 px-3 py-2 text-ink-900 focus:outline-none focus:border-ink-900"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3.5 bg-ink-900 text-paper-100 text-xs font-semibold tracking-[0.2em] uppercase hover:bg-lacquer transition-colors flex items-center justify-center gap-2 mt-4"
            >
              <Send className="w-3.5 h-3.5" />
              <span>문의 접수하기</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
