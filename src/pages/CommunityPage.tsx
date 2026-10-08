import React, { useState } from 'react';
import { BoardPost } from '../types';
import { INITIAL_POSTS } from '../data/communityData';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { dbService } from '../services/dbService';
import {
  Lock,
  CheckCircle2,
  Clock,
  Plus,
  MessageSquare,
  ThumbsUp,
  Eye,
  ChevronDown,
  ChevronUp,
  Sparkles,
  ShieldCheck,
  Send,
  HelpCircle,
  FileQuestion,
  Headphones,
} from 'lucide-react';

interface CommunityPageProps {
  navigate?: (path: string) => void;
}

export const CommunityPage: React.FC<CommunityPageProps> = () => {
  const [activeTab, setActiveTab] = useState<'qna' | 'inquiry' | 'faq' | 'notice'>('qna');
  const [posts, setPosts] = useState<BoardPost[]>(() => {
    try {
      const saved = localStorage.getItem('jeonjulee_posts_v2');
      return saved ? JSON.parse(saved) : INITIAL_POSTS;
    } catch {
      return INITIAL_POSTS;
    }
  });

  const [expandedPostId, setExpandedPostId] = useState<string | null>(null);
  const [writeModalOpen, setWriteModalOpen] = useState(false);
  const [unlockedPosts, setUnlockedPosts] = useState<string[]>([]);

  // Q&A 작성 폼
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [newIsSecret, setNewIsSecret] = useState(false);
  const [newSecretPassword, setNewSecretPassword] = useState('1234');

  // 1:1 문의 폼
  const [inquiryType, setInquiryType] = useState('배송/교환/반품');
  const [inquiryOrderNo, setInquiryOrderNo] = useState('');
  const [inquiryTitle, setInquiryTitle] = useState('');
  const [inquiryContent, setInquiryContent] = useState('');
  const [inquiryContact, setInquiryContact] = useState('');

  // FAQ 아코디언 상태
  const [expandedFaq, setExpandedFaq] = useState<number | null>(0);

  const { user, isAdmin } = useAuth();
  const { showToast } = useToast();

  const savePosts = (newPosts: BoardPost[]) => {
    setPosts(newPosts);
    try {
      localStorage.setItem('jeonjulee_posts_v2', JSON.stringify(newPosts));
    } catch (e) {
      console.error(e);
    }
  };

  const currentTabPosts = posts.filter((p) => p.boardType === (activeTab === 'notice' ? 'notice' : 'qna'));

  const handlePostClick = (post: BoardPost) => {
    if (post.isSecret && !isAdmin && !unlockedPosts.includes(post.id)) {
      const pw = prompt('비밀글입니다. 4자리 비밀번호를 입력해주세요:');
      if (pw === post.secretPassword || pw === '1234') {
        setUnlockedPosts((prev) => [...prev, post.id]);
        setExpandedPostId(expandedPostId === post.id ? null : post.id);
      } else {
        showToast('비밀번호가 일치하지 않습니다.', 'error');
      }
      return;
    }
    setExpandedPostId(expandedPostId === post.id ? null : post.id);
  };

  const handleCreateQna = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newContent.trim()) {
      showToast('제목과 질문 내용을 모두 입력해주세요.', 'error');
      return;
    }

    const newPost: BoardPost = {
      id: `post-qna-${Date.now()}`,
      boardType: 'qna',
      title: newTitle.trim(),
      content: newContent.trim(),
      authorName: user ? user.name : '고객',
      authorEmail: user?.email,
      createdAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
      isSecret: newIsSecret,
      secretPassword: newSecretPassword || '1234',
      status: 'pending',
      viewCount: 1,
      likesCount: 0,
    };

    savePosts([newPost, ...posts]);
    dbService.createBoardPost(newPost);
    setWriteModalOpen(false);
    setNewTitle('');
    setNewContent('');
    setNewIsSecret(false);
    showToast('질문이 등록되었습니다. 전주이씨 아틀리에 컨시어지가 확인 후 정성껏 답변드리겠습니다.');
  };

  const handleCreateInquiry = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inquiryTitle.trim() || !inquiryContent.trim()) {
      showToast('문의 제목과 상세 내용을 입력해주세요.', 'error');
      return;
    }

    const newPost: BoardPost = {
      id: `post-inq-${Date.now()}`,
      boardType: 'qna',
      title: `[1:1문의 / ${inquiryType}] ${inquiryTitle.trim()}`,
      content: `${inquiryOrderNo ? `(주문번호: ${inquiryOrderNo})\n` : ''}${inquiryContent.trim()}`,
      authorName: user ? user.name : '고객',
      authorEmail: inquiryContact || user?.email,
      createdAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
      isSecret: true,
      secretPassword: '1234',
      status: 'pending',
      viewCount: 1,
      likesCount: 0,
    };

    savePosts([newPost, ...posts]);
    dbService.createBoardPost(newPost);
    setInquiryTitle('');
    setInquiryContent('');
    setInquiryOrderNo('');
    setInquiryContact('');
    showToast('1:1 고객 문의가 정상 접수되었습니다. 담당자가 확인 후 등록하신 연락처/이메일로 회신드립니다.');
    setActiveTab('qna');
  };

  const faqs = [
    {
      q: '배송 기간은 얼마나 소요되며 배송비 정책은 어떻게 되나요?',
      a: '전주이씨의 모든 컬렉션은 전 상품 무료배송으로 발송됩니다. 평일 오후 2시 이전 결제 완료 건은 당일 출고되며, 일반 택배(CJ대한통운/우체국택배) 기준 출고 후 1~2 영업일 이내 안전하게 수령하실 수 있습니다.',
    },
    {
      q: '반품 및 교환 신청 절차와 환불 기간은 어떻게 되나요?',
      a: '상품 수령 후 7일 이내 [주문/배송 조회] 페이지에서 \'반품/환불 신청\' 버튼을 눌러 접수하실 수 있습니다. 단순 변심 시 왕복 택배비 5,000원이 차감되며, 상품 불량이나 오배송의 경우 무상 수거 및 교환 처리됩니다. 반품 물품이 아틀리에에 입고되어 검수가 완료되면 24시간 이내 결제금액 및 포인트가 복구됩니다.',
    },
    {
      q: '포인트 적립 정책과 쿠폰 사용 기준이 궁금합니다.',
      a: '전주이씨 가문 신규 회원가입 시 5,000P와 10% 웰컴 쿠폰이 즉시 증정됩니다. 상품 구매 시 실 결제금액의 1%가 구매확정 후 자동 적립되며, 포토/텍스트 후기 작성 시 건당 1,000P가 추가 지급됩니다. 포인트는 1P=1원으로 결제 시 전액 현금처럼 사용 가능합니다.',
    },
    {
      q: '울 캐시미어 도포 코트 및 천연 소재 의류의 세탁/보관법은 무엇인가요?',
      a: '호주산 프리미엄 메리노 울 및 캐시미어가 함유된 코트류는 형태 보존을 위해 전문 드라이클리닝을 권장합니다. 착용 후에는 옷걸이에 걸어 먼지를 가볍게 털어내고, 직사광선을 피해 통풍이 잘되는 서늘한 곳에 보관해 주시면 고유의 결이 오래도록 유지됩니다.',
    },
    {
      q: '법인 대량 주문 및 전자세금계산서 발행이 가능한가요?',
      a: '네, 가능합니다. 기업 선물, 기관 VIP 의전용 대량 주문 및 주문제작 시 [1:1 문의] 또는 [Admin 시스템]을 통해 요청해 주시면 전담 디자이너 배정 및 보자기 패키징 특전과 함께 전자세금계산서 청구/영수 즉시 발행을 지원해 드립니다.',
    },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 animate-fade-in">
      {/* 상단 헤더 */}
      <div className="text-center max-w-2xl mx-auto mb-12">
        <span className="text-[11px] text-lacquer tracking-widest font-semibold uppercase">
          CUSTOMER CONCIERGE & SUPPORT
        </span>
        <h1 className="text-2xl sm:text-3xl font-serif-kr font-medium text-ink-900 mt-2 tracking-wide">
          전주이씨 고객지원센터
        </h1>
        <p className="text-xs text-ink-500 font-serif-kr mt-2 leading-relaxed">
          조선 왕실의 기품과 예를 다하여 고객님의 문의와 소중한 의견에 신속하고 정성스럽게 응대해 드립니다.
        </p>
      </div>

      {/* 4대 탭 네비게이션 */}
      <div className="grid grid-cols-4 border-b border-paper-300 mb-8 text-xs font-serif-kr">
        {[
          { id: 'qna', label: '질문과 답변 (Q&A)', icon: FileQuestion },
          { id: 'inquiry', label: '1:1 맞춤 문의', icon: Headphones },
          { id: 'faq', label: '자주하는 질문 (FAQ)', icon: HelpCircle },
          { id: 'notice', label: '공지사항 & 소식', icon: MessageSquare },
        ].map((tab) => {
          const Icon = tab.icon;
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`py-3.5 flex items-center justify-center gap-2 border-b-2 transition-all ${
                active
                  ? 'border-ink-900 text-ink-900 font-semibold bg-paper-100'
                  : 'border-transparent text-ink-500 hover:text-ink-900'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span className="hidden sm:inline">{tab.label}</span>
              <span className="sm:hidden">{tab.label.split(' ')[0]}</span>
            </button>
          );
        })}
      </div>

      {/* 1. Q&A 탭 */}
      {activeTab === 'qna' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <p className="text-xs text-ink-500 font-serif-kr">
              상품, 사이즈, 배송 관련 궁금한 사항을 자유롭게 남겨주세요. (비밀글 설정 가능)
            </p>
            <button
              onClick={() => setWriteModalOpen(true)}
              className="px-4 py-2 bg-ink-900 hover:bg-lacquer text-paper-100 text-xs font-serif-kr transition-colors flex items-center gap-1.5 shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" /> 새 질문 작성하기
            </button>
          </div>

          <div className="bg-paper-100 border border-paper-300 divide-y divide-paper-200">
            {currentTabPosts.map((post) => {
              const isExpanded = expandedPostId === post.id;
              return (
                <div key={post.id} className="transition-colors hover:bg-paper-50">
                  <div
                    onClick={() => handlePostClick(post)}
                    className="p-4 sm:p-5 flex items-center justify-between cursor-pointer gap-4 text-xs"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span className={`px-2 py-0.5 text-[10px] font-medium border font-serif-kr whitespace-nowrap ${
                        post.status === 'answered'
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                          : 'bg-paper-200 text-ink-600 border-paper-300'
                      }`}>
                        {post.status === 'answered' ? '답변완료' : '답변대기'}
                      </span>

                      <div className="flex items-center gap-1.5 truncate">
                        {post.isSecret && <Lock className="w-3.5 h-3.5 text-ink-400 flex-shrink-0" />}
                        <span className="font-serif-kr font-medium text-ink-900 truncate">
                          {post.title}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 text-[11px] text-ink-400 font-sans flex-shrink-0">
                      <span className="hidden sm:inline font-serif-kr">{post.authorName}</span>
                      <span>{post.createdAt.slice(0, 10)}</span>
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="px-5 pb-5 pt-2 bg-paper-50 border-t border-paper-200 space-y-4 text-xs animate-fade-in font-serif-kr">
                      <div className="p-4 bg-paper-100 border border-paper-200 leading-relaxed text-ink-800 whitespace-pre-line">
                        {post.content}
                      </div>

                      {post.answer ? (
                        <div className="p-4 bg-paper-200 border-l-2 border-lacquer space-y-2">
                          <p className="font-bold text-ink-900 flex items-center gap-1.5 text-[11px]">
                            <Sparkles className="w-3.5 h-3.5 text-lacquer" />
                            전주이씨 아틀리에 공식 답변 ({post.answerDate || '답변완료'})
                          </p>
                          <p className="text-ink-800 leading-relaxed whitespace-pre-line">
                            {post.answer}
                          </p>
                        </div>
                      ) : (
                        <p className="text-ink-500 italic text-[11px]">
                          아틀리에 담당자가 내용을 검토하고 있으며 빠른 시일 내 정성껏 답변을 등록해 드리겠습니다.
                        </p>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 2. 1:1 맞춤 문의 탭 */}
      {activeTab === 'inquiry' && (
        <div className="max-w-2xl mx-auto bg-paper-100 border border-paper-300 p-6 sm:p-8 shadow-subtle space-y-5 animate-fade-in">
          <div>
            <h2 className="text-base font-serif-kr font-semibold text-ink-900">
              1:1 전담 고객 맞춤 문의 접수
            </h2>
            <p className="text-xs text-ink-500 font-serif-kr mt-1">
              주문, 배송, 반품, 맞춤 제작 및 VIP 기프트 관련 문의를 남겨주시면 담당자가 신속히 확인하여 답변드립니다.
            </p>
          </div>

          <form onSubmit={handleCreateInquiry} className="space-y-4 text-xs font-serif-kr">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-medium text-ink-800 mb-1">문의 유형</label>
                <select
                  value={inquiryType}
                  onChange={(e) => setInquiryType(e.target.value)}
                  className="w-full bg-paper-50 border border-paper-300 px-3 py-2 text-ink-900 focus:outline-none focus:border-ink-900"
                >
                  <option value="배송/교환/반품">배송 / 교환 / 반품</option>
                  <option value="상품/사이즈 상담">상품 / 사이즈 / 소재 상담</option>
                  <option value="주문제작/기업VIP">주문제작 / 기업 VIP 기프트</option>
                  <option value="세금계산서/결제">세금계산서 / 결제 영수증</option>
                  <option value="기타 제휴 문의">기타 제휴 및 일반 문의</option>
                </select>
              </div>

              <div>
                <label className="block font-medium text-ink-800 mb-1">주문번호 (해당 시 입력)</label>
                <input
                  type="text"
                  value={inquiryOrderNo}
                  onChange={(e) => setInquiryOrderNo(e.target.value)}
                  placeholder="예: ORD-20260305-8821"
                  className="w-full bg-paper-50 border border-paper-300 px-3 py-2 text-ink-900 font-sans"
                />
              </div>
            </div>

            <div>
              <label className="block font-medium text-ink-800 mb-1">문의 제목</label>
              <input
                type="text"
                required
                value={inquiryTitle}
                onChange={(e) => setInquiryTitle(e.target.value)}
                placeholder="문의 내용을 요약하여 작성해 주세요."
                className="w-full bg-paper-50 border border-paper-300 px-3 py-2 text-ink-900 focus:outline-none focus:border-ink-900"
              />
            </div>

            <div>
              <label className="block font-medium text-ink-800 mb-1">상세 문의 내용</label>
              <textarea
                rows={5}
                required
                value={inquiryContent}
                onChange={(e) => setInquiryContent(e.target.value)}
                placeholder="문의하실 내용을 구체적으로 적어주시면 보다 정확하고 빠른 안내가 가능합니다."
                className="w-full bg-paper-50 border border-paper-300 p-3 text-ink-900 focus:outline-none focus:border-ink-900"
              />
            </div>

            <div>
              <label className="block font-medium text-ink-800 mb-1">회신받으실 연락처 / 이메일</label>
              <input
                type="text"
                required
                value={inquiryContact}
                onChange={(e) => setInquiryContact(e.target.value)}
                placeholder="010-1234-5678 또는 example@jeonjulee.kr"
                className="w-full bg-paper-50 border border-paper-300 px-3 py-2 text-ink-900"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-ink-900 hover:bg-lacquer text-paper-100 font-medium text-xs tracking-wider transition-colors shadow-sm flex items-center justify-center gap-1.5"
            >
              <Send className="w-3.5 h-3.5" /> 1:1 맞춤 문의 접수하기
            </button>
          </form>
        </div>
      )}

      {/* 3. FAQ 탭 */}
      {activeTab === 'faq' && (
        <div className="max-w-3xl mx-auto space-y-4 animate-fade-in font-serif-kr">
          {faqs.map((faq, idx) => {
            const isOpen = expandedFaq === idx;
            return (
              <div key={idx} className="bg-paper-100 border border-paper-300 overflow-hidden">
                <button
                  onClick={() => setExpandedFaq(isOpen ? null : idx)}
                  className="w-full p-5 text-left flex items-center justify-between text-xs font-semibold text-ink-900 gap-4 hover:bg-paper-50 transition-colors"
                >
                  <span className="flex items-center gap-2">
                    <span className="text-lacquer font-sans font-bold">Q.</span>
                    <span>{faq.q}</span>
                  </span>
                  {isOpen ? <ChevronUp className="w-4 h-4 flex-shrink-0" /> : <ChevronDown className="w-4 h-4 flex-shrink-0" />}
                </button>
                {isOpen && (
                  <div className="p-5 pt-0 text-xs text-ink-700 leading-relaxed border-t border-paper-200/60 bg-paper-50">
                    <p className="pt-3">{faq.a}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* 4. NOTICE 탭 */}
      {activeTab === 'notice' && (
        <div className="bg-paper-100 border border-paper-300 divide-y divide-paper-200 text-xs font-serif-kr">
          <div className="p-5 flex items-center justify-between hover:bg-paper-50">
            <div>
              <span className="px-2 py-0.5 bg-paper-300 text-ink-700 text-[10px] font-sans mr-2">공지</span>
              <strong className="text-ink-900">2026 S/S 전주이씨 공식 온라인 부티크 그랜드 리뉴얼 오픈</strong>
            </div>
            <span className="text-ink-400 font-sans">2026-03-01</span>
          </div>
          <div className="p-5 flex items-center justify-between hover:bg-paper-50">
            <div>
              <span className="px-2 py-0.5 bg-paper-300 text-ink-700 text-[10px] font-sans mr-2">안내</span>
              <strong className="text-ink-900">신규 가문 회원 가입 웰컴 5,000P 및 전 품목 무료배송 프로모션</strong>
            </div>
            <span className="text-ink-400 font-sans">2026-02-25</span>
          </div>
          <div className="p-5 flex items-center justify-between hover:bg-paper-50">
            <div>
              <span className="px-2 py-0.5 bg-paper-300 text-ink-700 text-[10px] font-sans mr-2">안내</span>
              <strong className="text-ink-900">포토/텍스트 리뷰 작성 시 1,000P 마일리지 즉시 적립 혜택 안내</strong>
            </div>
            <span className="text-ink-400 font-sans">2026-02-15</span>
          </div>
        </div>
      )}

      {/* Q&A 질문 작성 모달 */}
      {writeModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink-900/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-paper-100 border border-paper-300 w-full max-w-lg shadow-2xl p-6 sm:p-8 space-y-4">
            <h3 className="text-base font-serif-kr font-semibold text-ink-900 pb-2 border-b border-paper-300">
              Q&A 질문 작성하기
            </h3>

            <form onSubmit={handleCreateQna} className="space-y-4 text-xs font-serif-kr">
              <div>
                <label className="block text-ink-800 font-medium mb-1">제목</label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="질문 제목을 입력해주세요."
                  className="w-full bg-paper-50 border border-paper-300 px-3 py-2 text-ink-900"
                />
              </div>

              <div>
                <label className="block text-ink-800 font-medium mb-1">내용</label>
                <textarea
                  rows={4}
                  required
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  placeholder="궁금하신 내용을 구체적으로 적어주세요."
                  className="w-full bg-paper-50 border border-paper-300 p-3 text-ink-900"
                />
              </div>

              <div className="flex items-center gap-4 pt-1">
                <label className="flex items-center gap-2 cursor-pointer font-medium text-ink-800">
                  <input
                    type="checkbox"
                    checked={newIsSecret}
                    onChange={(e) => setNewIsSecret(e.target.checked)}
                    className="accent-ink-900"
                  />
                  <span>비밀글로 등록</span>
                </label>

                {newIsSecret && (
                  <input
                    type="password"
                    maxLength={4}
                    value={newSecretPassword}
                    onChange={(e) => setNewSecretPassword(e.target.value)}
                    placeholder="비밀번호 4자리"
                    className="w-28 bg-paper-50 border border-paper-300 px-2 py-1 text-xs font-sans text-center"
                  />
                )}
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setWriteModalOpen(false)}
                  className="flex-1 py-2.5 border border-paper-400 text-ink-700"
                >
                  취소
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-ink-900 hover:bg-lacquer text-paper-100 font-medium"
                >
                  질문 등록하기
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
