import { Notice, FAQItem, Coupon, Review } from '../types';

export const NOTICES: Notice[] = [
  {
    id: 'not-01',
    title: '[공지] 2026 S/S 컬렉션 「시간의 결 (Texture of Time)」 공식 런칭',
    category: 'NOTICE',
    date: '2026-03-01',
    isPinned: true,
    content: `안녕하세요, 전주이씨(JEONJU LEE)입니다.

오랜 시간 준비해 온 2026 봄/여름 컬렉션 「시간의 결」을 공개합니다.
이번 시즌은 조선 왕실의 기품 있는 복식 구조에서 불필요한 장식을 덜어내고,
가장 순수한 실루엣과 천연 소재의 질감만을 현대적으로 정제하여 담아냈습니다.

전통 한지에서 영감을 얻은 고밀도 옥스포드 셔츠,
도포의 유려한 자락을 깃들인 캐시미어 블렌드 코트,
그리고 단정한 황동 오브제까지 지금 공식 온라인 스토어에서 만나보실 수 있습니다.

회원 가입 시 제공되는 가문 환영 10% 혜택도 함께 누려보시기 바랍니다.`
  },
  {
    id: 'not-02',
    title: '[배송] CJ대한통운 프리미엄 안심 택배 및 당일 출고 기준 안내',
    category: 'DELIVERY',
    date: '2026-02-20',
    isPinned: true,
    content: `전주이씨의 모든 제품은 전용 브랜드 박스와 습자지 한지 패키징으로 정성껏 포장되어 발송됩니다.

- 평일 오후 2시 이전 결제 완료 건: 당일 출고 (익일 수령 가능)
- 100,000원 이상 구매 시 무료 배송 혜택
- 도서산간 및 제주 지역도 동일하게 안심 특송으로 배송됩니다.`
  },
  {
    id: 'not-03',
    title: '[이벤트] 가문 회원 전용 3월 구매 사은품 (황동 책갈피 증정)',
    category: 'EVENT',
    date: '2026-02-15',
    isPinned: false,
    content: `3월 한 달간 20만 원 이상 구매하시는 모든 회원분들께 전주이씨의 시그니처 각인이 새겨진 황동 수제 책갈피(비매품)를 한정 수량 증정합니다.`
  },
  {
    id: 'not-04',
    title: '[보도] 보그 코리아 3월호 에디터스 픽 선정 안내',
    category: 'PRESS',
    date: '2026-02-10',
    isPinned: false,
    content: `보그 코리아 3월호 패션 피처 '한국적 미학의 컨템포러리한 부활' 편에 전주이씨의 스탠드 칼라 한지 옥스포드 셔츠가 선정되었습니다.`
  }
];

export const FAQS: FAQItem[] = [
  {
    id: 'faq-01',
    category: '배송',
    question: '배송 기간은 얼마나 걸리나요?',
    answer: '평일 오후 2시 이전 주문 건은 당일 출고되며, 출고 후 1~2 영업일 이내에 수령하실 수 있습니다. 택배사는 CJ대한통운 프리미엄 택배를 이용합니다.'
  },
  {
    id: 'faq-02',
    category: '배송',
    question: '무료 배송 기준은 어떻게 되나요?',
    answer: '실 결제 금액 100,000원 이상 구매 시 기본 무료 배송 혜택이 적용됩니다. 100,000원 미만 시 3,000원의 배송비가 부과됩니다.'
  },
  {
    id: 'faq-03',
    category: '교환/환불',
    question: '교환 및 반품 절차는 어떻게 되나요?',
    answer: '제품 수령일로부터 7일 이내에 마이페이지 [주문내역] 또는 고객센터를 통해 신청하실 수 있습니다. 제품의 택(Tag) 분실, 착용 흔적, 오염 등이 없을 경우 1회 무료 사이즈 교환을 지원합니다.'
  },
  {
    id: 'faq-04',
    category: '주문/결제',
    question: '어떤 결제 수단을 지원하나요?',
    answer: '국내 모든 신용카드 및 체크카드, 카카오페이, 네이버페이, 토스페이, 그리고 무통장 가상계좌 입금을 지원합니다.'
  },
  {
    id: 'faq-05',
    category: '회원/혜택',
    question: '회원 등급 혜택은 무엇인가요?',
    answer: '신규 가입 시 10% 웰컴 쿠폰과 3,000원의 적립금이 지급되며, 구매 금액의 3%가 적립금으로 누적됩니다. 연간 누적 금액에 따라 로열 블랙, 헤리티지 프레스티지 등급으로 승급되며 특별 프라이빗 세일 초대가 제공됩니다.'
  },
  {
    id: 'faq-06',
    category: '상품문의',
    question: '전주이씨의 원단과 세탁 관리는 어떻게 하나요?',
    answer: '전주이씨의 제품은 최고급 천연 섬유(울, 캐시미어, 수피마/오가닉 코튼)를 사용합니다. 각 상품 상세 페이지의 [CARE] 탭 및 제품 라벨의 세탁 기호를 반드시 확인해 주시기 바라며, 울 및 아우터 제품은 전문 드라이클리닝을 권장합니다.'
  }
];

export const INITIAL_COUPONS: Coupon[] = [
  {
    id: 'coup-welcome',
    code: 'WELCOME10',
    title: '가문 첫 만남 10% 웰컴 쿠폰',
    discountType: 'PERCENT',
    discountValue: 10,
    minOrderPrice: 50000,
    expiresAt: '2026-12-31'
  },
  {
    id: 'coup-spring',
    code: 'ROYALSPRING',
    title: '2026 봄맞이 기품 20,000원 할인권',
    discountType: 'FIXED',
    discountValue: 20000,
    minOrderPrice: 150000,
    expiresAt: '2026-04-30'
  }
];

export const REVIEWS_POOL: Review[] = [
  {
    id: 'rev-01',
    productId: 'jl-out-01',
    author: '이*현',
    rating: 5,
    date: '2026-02-28',
    content: '코트의 드레이프감이 정말 압도적입니다. 보통 한복 모티브라고 하면 자칫 촌스러울 수 있는데, 전주이씨 코트는 완전 하이엔드 디자이너 브랜드 느낌이에요. 미니멀하면서도 깃과 어깨 선에서 느껴지는 묵직한 품격이 대단합니다.',
    selectedOption: '먹색 (Ink Black) / L',
    heightWeight: '182cm / 72kg',
    helpfulCount: 24
  },
  {
    id: 'rev-02',
    productId: 'jl-top-01',
    author: '김*우',
    rating: 5,
    date: '2026-02-25',
    content: '원단이 만져보면 압니다. 한지 텍스처라고 해서 거칠 줄 알았는데 너무 매끄럽고 구김이 멋스럽게 가요. 스탠드 칼라 각도가 과하지 않아서 정장에도 입고 캐주얼 슬랙스에도 최고입니다.',
    selectedOption: '한지 아이보리 (Hanji Ivory) / L',
    heightWeight: '179cm / 68kg',
    helpfulCount: 18
  },
  {
    id: 'rev-03',
    productId: 'jl-bot-01',
    author: '박*진',
    rating: 5,
    date: '2026-02-20',
    content: '인생 와이드 팬츠입니다. 턱 주름이 깊게 잡혀있어서 걸을 때 핏이 예술이네요. 밑단 좁아지는 테이퍼드 각도가 신발에 완벽하게 얹힙니다.',
    selectedOption: '딥 블랙 (Deep Black) / M',
    heightWeight: '177cm / 65kg',
    helpfulCount: 15
  }
];

export const INSTAGRAM_POSTS = [
  {
    id: 'insta-1',
    image: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=800&q=80',
    tag: '@jeonjulee_official',
    caption: '2026 S/S Editorial: The Quiet Grandeur'
  },
  {
    id: 'insta-2',
    image: 'https://images.unsplash.com/photo-1490114538077-0a7f8cb49891?auto=format&fit=crop&w=800&q=80',
    tag: '@jeonjulee_official',
    caption: '도포 실루엣 롱 코트. 일상 속에 스며든 고요한 선.'
  },
  {
    id: 'insta-3',
    image: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=800&q=80',
    tag: '@jeonjulee_official',
    caption: '먹빛 블랙의 깊이. 정제된 미니멀 블레이저.'
  },
  {
    id: 'insta-4',
    image: 'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?auto=format&fit=crop&w=800&q=80',
    tag: '@jeonjulee_official',
    caption: '소나무와 침향. 공간의 품격을 깨우는 향기.'
  },
  {
    id: 'insta-5',
    image: 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&w=800&q=80',
    tag: '@jeonjulee_official',
    caption: '한지 아이보리 옥스포드 셔츠의 단정한 목선.'
  },
  {
    id: 'insta-6',
    image: 'https://images.unsplash.com/photo-1544441893-675973e31985?auto=format&fit=crop&w=800&q=80',
    tag: '@jeonjulee_official',
    caption: '전통의 획과 현대의 재단. 전주이씨 시그니처.'
  }
];
