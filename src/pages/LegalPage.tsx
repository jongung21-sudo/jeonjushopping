import React from 'react';

interface LegalPageProps {
  type: 'privacy' | 'terms' | 'shipping-returns';
  navigate: (path: string) => void;
}

export const LegalPage: React.FC<LegalPageProps> = ({ type, navigate }) => {
  const content = {
    privacy: {
      title: '개인정보처리방침 (PRIVACY POLICY)',
      updatedAt: '2026년 1월 1일 시행',
      text: `주식회사 전주이씨(이하 '회사'라 함)는 이용자의 개인정보를 매우 소중하게 생각하며, 「개인정보 보호법」 및 「정보통신망 이용촉진 및 정보보호 등에 관한 법률」을 준수하고 있습니다.

1. 수집하는 개인정보 항목
- 회원가입 시: 이름, 이메일 주소, 비밀번호, 휴대전화번호
- 주문 및 결제 시: 수령인 이름, 배송지 주소, 수령인 연락처, 결제 수단 승인 정보
- 서비스 이용 과정에서 자동 생성되는 정보: 접속 IP, 쿠키, 방문 일시, 불량 이용 기록

2. 개인정보의 수집 및 이용 목적
- 가문 회원 식별 및 본인 확인
- 상품 배송 및 주문 확인, 대금 결제 및 정산
- 고객 불만 처리 및 원활한 의사소통 경로 확보
- 신상품 출시, 프로모션 안내 (선택 동의자에 한함)

3. 개인정보의 보유 및 이용 기간
- 계약 또는 청약철회 등에 관한 기록: 5년 (전자상거래 등에서의 소비자보호에 관한 법률)
- 대금결제 및 재화 등의 공급에 관한 기록: 5년
- 소비자의 불만 또는 분쟁처리에 관한 기록: 3년

4. 개인정보의 파기절차 및 방법
- 전자적 파일 형태의 정보는 기록을 재생할 수 없는 기술적 방법을 사용하여 삭제합니다.
- 종이에 출력된 개인정보는 분쇄기로 분쇄하거나 소각하여 파기합니다.

5. 개인정보 보호책임자
- 성명: 이방원
- 직책: 개인정보보호최고책임자(CPO)
- 문의: privacy@jeonjulee.kr / 02-1588-1392`,
    },
    terms: {
      title: '이용약관 (TERMS OF SERVICE)',
      updatedAt: '2026년 1월 1일 시행',
      text: `제1조(목적)
본 약관은 주식회사 전주이씨(전자상거래 사업자)가 운영하는 전주이씨 공식 온라인 스토어(이하 "몰"이라 한다)에서 제공하는 인터넷 관련 서비스(이하 "서비스"라 한다)를 이용함에 있어 사이버 몰과 이용자의 권리·의무 및 책임사항을 규정함을 목적으로 합니다.

제2조(정의)
① "몰"이란 회사가 재화 또는 용역을 이용자에게 제공하기 위하여 컴퓨터 등 정보통신설비를 이용하여 재화 등을 거래할 수 있도록 설정한 가상의 영업장을 말합니다.
② "이용자"란 "몰"에 접속하여 본 약관에 따라 "몰"이 제공하는 서비스를 받는 회원 및 비회원을 말합니다.

제3조(약관 등의 명시와 설명 및 개정)
① "몰"은 본 약관의 내용과 상호 및 대표자 성명, 영업소 소재지 주소, 사업자등록번호, 통신판매업 신고번호 등을 이용자가 쉽게 알 수 있도록 사이트의 초기 서비스화면(하단)에 게시합니다.

제4조(구매신청 및 계약의 성립)
① 이용자는 "몰"상에서 재화의 선택, 주문자 및 수령인 정보의 입력, 결제 방법의 선택을 통해 구매를 신청하며, 회사가 이를 승낙함으로써 매매계약이 체결됩니다.`,
    },
    'shipping-returns': {
      title: '배송 및 교환/반품 안내 (SHIPPING & RETURNS)',
      updatedAt: '2026년 1월 1일 시행',
      text: `[ 배송 안내 ]
- 택배사: CJ대한통운 프리미엄 안심택배
- 배송비: 3,000원 (실 결제금액 100,000원 이상 구매 시 무료 배송)
- 출고 기준: 평일 오후 2시 이전 결제 완료 건은 당일 출고되며, 일반적으로 출고 후 1~2영업일 이내에 수령하실 수 있습니다.
- 모든 상품은 전주이씨 전용 친환경 한지 패키지와 하드케이스로 정성껏 포장되어 배송됩니다.

[ 교환 및 반품 규정 ]
- 교환/반품 가능 기간: 상품 수령 후 7일 이내
- 1회 무료 사이즈 교환: 전주이씨 공식 스토어에서 첫 구매 시 동일 상품에 한하여 사이즈 교환 왕복 배송비를 1회 전액 지원합니다.
- 단순 변심에 의한 교환/반품 배송비: 왕복 6,000원 (고객 부담)
- 제품 불량 또는 오배송으로 인한 교환/반품: 배송비 전액 회사 부담

[ 교환/반품이 불가능한 경우 ]
- 고객님의 책임 있는 사유로 상품 등이 멸실 또는 훼손된 경우
- 고객님의 사용 또는 일부 소비에 의하여 상품의 가치가 현저히 감소한 경우
- 제품의 텍(Tag) 제거, 정품 라벨 분실 또는 훼손된 경우
- 시간의 경과에 의하여 재판매가 곤란할 정도로 상품 등의 가치가 하락한 경우`,
    },
  }[type];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 animate-fade-in">
      <div className="pb-6 border-b border-paper-300">
        <span className="text-[11px] font-sans tracking-[0.25em] text-bronze uppercase">
          LEGAL NOTICE
        </span>
        <h1 className="text-2xl sm:text-3xl font-serif-kr font-medium text-ink-900 mt-1">
          {content.title}
        </h1>
        <p className="text-xs text-ink-500 font-sans mt-1">{content.updatedAt}</p>
      </div>

      <div className="flex gap-4 border-b border-paper-300 py-4 text-xs">
        <button
          onClick={() => navigate('/privacy')}
          className={`pb-1 ${
            type === 'privacy'
              ? 'border-b-2 border-ink-900 font-bold text-ink-900'
              : 'text-ink-500 hover:text-ink-900'
          }`}
        >
          개인정보처리방침
        </button>
        <button
          onClick={() => navigate('/terms')}
          className={`pb-1 ${
            type === 'terms'
              ? 'border-b-2 border-ink-900 font-bold text-ink-900'
              : 'text-ink-500 hover:text-ink-900'
          }`}
        >
          이용약관
        </button>
        <button
          onClick={() => navigate('/shipping-returns')}
          className={`pb-1 ${
            type === 'shipping-returns'
              ? 'border-b-2 border-ink-900 font-bold text-ink-900'
              : 'text-ink-500 hover:text-ink-900'
          }`}
        >
          배송 및 교환/반품
        </button>
      </div>

      <div className="mt-8 bg-paper-100 border border-paper-300 p-6 sm:p-8 text-xs font-sans text-ink-700 leading-relaxed whitespace-pre-line">
        {content.text}
      </div>
    </div>
  );
};
