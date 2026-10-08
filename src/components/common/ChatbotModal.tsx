import React, { useState } from 'react';
import { Bot, X, Send, Sparkles, Truck, HelpCircle, MessageSquare, RotateCcw, Coins, FileText, ChevronRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface ChatMessage {
  id: string;
  sender: 'bot' | 'user';
  text: string;
  time: string;
  quickReplies?: { label: string; action: () => void }[];
}

export const ChatbotModal: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [inputText, setInputText] = useState('');
  const { orders } = useAuth();

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'init-1',
      sender: 'bot',
      text: '안녕하십니까. 조선 왕실의 기품과 현대 럭셔리 미니멀리즘을 잇는 「전주이씨(JEONJU LEE)」 온라인 부티크 AI 컨시어지입니다. 원하시는 안내를 선택하시거나 편안하게 질문해 주십시오.',
      time: '지금',
    },
  ]);

  const addBotMessage = (text: string, quickReplies?: { label: string; action: () => void }[]) => {
    const newMsg: ChatMessage = {
      id: `bot-${Date.now()}`,
      sender: 'bot',
      text,
      time: new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }),
      quickReplies,
    };
    setMessages((prev) => [...prev, newMsg]);
  };

  const handleSend = (textToSend?: string) => {
    const content = textToSend || inputText;
    if (!content.trim()) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: content,
      time: new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText('');

    // 스마트 자연어 응답 로직
    setTimeout(() => {
      const lower = content.toLowerCase();

      if (lower.includes('배송') || lower.includes('언제') || lower.includes('택배') || lower.includes('출고')) {
        const latestOrder = orders[0];
        let deliveryMsg = '전주이씨의 모든 컬렉션은 전 품목 무료배송으로 발송됩니다. 평일 오후 2시 이전 결제 건은 당일 출고되며, 출고 후 1~2일 이내 수령하실 수 있습니다.';
        if (latestOrder) {
          deliveryMsg += `\n\n고객님의 최근 주문 [${latestOrder.orderNumber}] 건은 현재 '${latestOrder.status}' 상태입니다.${latestOrder.trackingNumber ? ` (송장번호: ${latestOrder.trackingCarrier} ${latestOrder.trackingNumber})` : ''}`;
        }
        addBotMessage(deliveryMsg, [
          { label: '주문/배송 상세조회 바로가기', action: () => (window.location.href = '/orders') },
        ]);
      } else if (lower.includes('환불') || lower.includes('반품') || lower.includes('교환') || lower.includes('취소')) {
        addBotMessage(
          '상품 수령 후 7일 이내 [주문/배송 조회] 페이지에서 반품/환불 신청을 접수하실 수 있습니다. 단순 변심 시 왕복 배송비 5,000원이 차감되며, 상품 불량 시 무상 처리됩니다. 결제 시 사용하신 포인트와 쿠폰은 관리자 승인 즉시 복구됩니다.',
          [
            { label: '주문 내역 및 환불 신청하기', action: () => (window.location.href = '/orders') },
          ]
        );
      } else if (lower.includes('포인트') || lower.includes('적립') || lower.includes('마일리지') || lower.includes('쿠폰')) {
        addBotMessage(
          '전주이씨 가문 회원을 위한 특별 혜택을 안내해 드립니다:\n1. 신규 가입 시 웰컴 5,000P + 10% 할인 쿠폰 즉시 지급\n2. 결제 완료 시 실 결제금액의 1% 자동 적립\n3. 상품 포토/텍스트 후기 작성 시 건당 1,000P 즉시 지급\n\n적립된 포인트는 1P=1원으로 결제 시 전액 사용 가능합니다.'
        );
      } else if (lower.includes('코트') || lower.includes('사이즈') || lower.includes('소재') || lower.includes('세탁')) {
        addBotMessage(
          '전주이씨의 대표작인 [울 캐시미어 릴렉스드 도포 코트]는 호주산 메리노 울 90%와 몽골리안 캐시미어 10%의 깊이 있는 원단감을 지니고 있습니다. 유려한 드레이프를 유지하기 위해 전문 드라이클리닝을 권장합니다. 신장 175~182cm 기준 L 사이즈, 183cm 이상은 XL 사이즈를 권장드립니다.',
          [
            { label: '도포 코트 컬렉션 보기', action: () => (window.location.href = '/shop?category=OUTER') },
          ]
        );
      } else if (lower.includes('세금') || lower.includes('계산서') || lower.includes('명세서') || lower.includes('영수증')) {
        addBotMessage(
          '법인 및 개인사업자 고객님을 위해 전자세금계산서 청구/영수 즉시 발행을 지원합니다. 결제 페이지에서 [전자세금계산서 신청]을 체크하시거나, 고객센터 1:1 문의를 통해 사업자등록증을 남겨주시면 당일 발급해 드립니다.'
        );
      } else {
        addBotMessage(
          `문의해 주신 내용("${content}")에 대해 신속히 확인해 드리겠습니다. 더 구체적인 상담이 필요하신 경우 아래 버튼을 누르시거나 1:1 고객문의를 남겨주시면 담당 컨시어지가 정성껏 회신해 드리겠습니다.`,
          [
            { label: '고객센터 1:1 문의 남기기', action: () => (window.location.href = '/community') },
            { label: '배송/환불 규정 확인', action: () => (window.location.href = '/shipping-returns') },
          ]
        );
      }
    }, 400);
  };

  return (
    <>
      {/* 플로팅 챗봇 트리거 버튼 */}
      <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="relative group p-3.5 rounded-full bg-ink-900 hover:bg-lacquer text-paper-100 shadow-xl transition-all hover:scale-105 duration-200 border border-paper-400"
          aria-label="전주이씨 AI 컨시어지 챗봇"
        >
          <Bot className="w-6 h-6 text-paper-100" />
          <span className="absolute -top-1 -right-1 w-3 h-3 bg-lacquer rounded-full animate-ping" />
          <span className="absolute -top-1 -right-1 w-3 h-3 bg-lacquer rounded-full border-2 border-paper-100" />
        </button>
      </div>

      {/* 챗봇 대화창 모달 */}
      {isOpen && (
        <div className="fixed bottom-20 right-4 sm:right-6 w-[92vw] sm:w-[380px] h-[550px] max-h-[80vh] bg-paper-100 border border-paper-300 shadow-2xl z-50 flex flex-col overflow-hidden animate-fade-in font-serif-kr">
          {/* 헤더 */}
          <div className="bg-ink-900 text-paper-100 p-4 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full border border-paper-400/40 bg-lacquer/30 flex items-center justify-center font-serif text-sm">
                李
              </div>
              <div>
                <h3 className="text-xs font-semibold tracking-wide">
                  전주이씨 AI 컨시어지
                </h3>
                <p className="text-[10px] text-paper-300 font-sans">
                  TRADITION, REDEFINED. 24/7 Concierge
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-paper-300 hover:text-white p-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* 빠른 질문 추천 칩 */}
          <div className="bg-paper-200 px-3 py-2 border-b border-paper-300 flex items-center gap-1.5 overflow-x-auto text-[11px] whitespace-nowrap">
            <button
              onClick={() => handleSend('실시간 배송 조회')}
              className="px-2.5 py-1 bg-paper-100 border border-paper-300 hover:border-ink-900 transition-colors"
            >
              📦 배송 조회
            </button>
            <button
              onClick={() => handleSend('교환 및 환불 규정')}
              className="px-2.5 py-1 bg-paper-100 border border-paper-300 hover:border-ink-900 transition-colors"
            >
              🔄 반품/환불
            </button>
            <button
              onClick={() => handleSend('포인트 및 쿠폰 혜택')}
              className="px-2.5 py-1 bg-paper-100 border border-paper-300 hover:border-ink-900 transition-colors"
            >
              🪙 포인트 정책
            </button>
            <button
              onClick={() => handleSend('소재 및 코트 사이즈')}
              className="px-2.5 py-1 bg-paper-100 border border-paper-300 hover:border-ink-900 transition-colors"
            >
              🧵 소재/사이즈
            </button>
          </div>

          {/* 메시지 리스트 */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3.5 text-xs">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex flex-col ${m.sender === 'user' ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-[85%] p-3 rounded-none leading-relaxed whitespace-pre-line ${
                    m.sender === 'user'
                      ? 'bg-ink-900 text-paper-100 font-sans'
                      : 'bg-paper-50 text-ink-900 border border-paper-300 shadow-sm'
                  }`}
                >
                  {m.text}

                  {m.quickReplies && (
                    <div className="mt-2.5 pt-2 border-t border-paper-300/80 space-y-1">
                      {m.quickReplies.map((r, i) => (
                        <button
                          key={i}
                          onClick={r.action}
                          className="w-full text-left py-1 text-[11px] font-semibold text-lacquer hover:underline flex items-center justify-between"
                        >
                          <span>{r.label}</span>
                          <ChevronRight className="w-3 h-3" />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                <span className="text-[10px] text-ink-400 mt-1 font-sans px-1">{m.time}</span>
              </div>
            ))}
          </div>

          {/* 입력창 */}
          <div className="p-3 bg-paper-100 border-t border-paper-300 flex items-center gap-2">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="궁금하신 점을 입력해 주세요..."
              className="flex-1 bg-paper-50 border border-paper-300 px-3 py-2 text-xs text-ink-900 focus:outline-none focus:border-ink-900 font-sans"
            />
            <button
              onClick={() => handleSend()}
              className="p-2 bg-ink-900 hover:bg-lacquer text-paper-100 transition-colors"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </>
  );
};
