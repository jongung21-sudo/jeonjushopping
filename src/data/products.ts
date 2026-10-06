import { Product } from '../types';

export const PRODUCTS: Product[] = [
  {
    id: 'jl-out-01',
    name: '울 캐시미어 릴렉스드 도포 코트',
    engName: 'Wool Cashmere Relaxed Duru Coat',
    price: 468000,
    originalPrice: 520000,
    category: 'OUTER',
    isNew: true,
    isBest: true,
    colors: [
      { name: '먹색 (Ink Black)', code: '#121212' },
      { name: '오트밀 베이지 (Oatmeal)', code: '#D9D3C7' },
      { name: '석청 네이비 (Slate Navy)', code: '#1B2430' }
    ],
    sizes: ['M (95-100)', 'L (100-105)', 'XL (105-110)'],
    images: [
      'https://images.unsplash.com/photo-1544441893-675973e31985?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1490114538077-0a7f8cb49891?auto=format&fit=crop&w=1200&q=80'
    ],
    shortDesc: '전통 도포의 유려한 자락 곡선과 모던 미니멀 테일러링을 접목한 시그니처 롱 코트.',
    detailDesc: '전주이씨의 독자적인 숄더 라인과 절제된 히든 버튼 플래킷 구조로 완성되었습니다. 걸을 때마다 드러나는 유려한 밑단 드레이프가 우아하면서도 강인한 실루엣을 자아냅니다. 프리미엄 호주산 메리노 울 90%와 몽골리안 캐시미어 10%의 깊이 있는 원단감을 경험해보세요.',
    fabric: 'Wool 90%, Cashmere 10% (호주산 메리노 울 & 몽골리안 캐시미어 블렌드)',
    fit: '자연스럽게 떨어지는 릴렉스드 오버핏',
    care: ['드라이클리닝 전용', '스팀 다림질 시 저온 사용', '직사광선을 피해 통풍이 잘되는 그늘에 보관'],
    modelInfo: 'Model: 186cm / 70kg (L 사이즈 착용)',
    sizeGuide: {
      chest: '64cm',
      shoulder: '55cm',
      length: '118cm',
      sleeve: '63cm'
    },
    rating: 4.9,
    reviewCount: 42,
    salesCount: 380,
    createdAt: '2026-02-15'
  },
  {
    id: 'jl-top-01',
    name: '스탠드 칼라 한지 옥스포드 셔츠',
    engName: 'Stand Collar Hanji Oxford Shirt',
    price: 158000,
    category: 'TOP',
    isNew: true,
    isBest: true,
    colors: [
      { name: '한지 아이보리 (Hanji Ivory)', code: '#F4F1EA' },
      { name: '차콜 먹 (Charcoal Ink)', code: '#2B2B2B' },
      { name: '연청록 (Muted Celadon)', code: '#5F7161' }
    ],
    sizes: ['M (95-100)', 'L (100-105)', 'XL (105-110)'],
    images: [
      'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1598033129183-c4f50c736f10?auto=format&fit=crop&w=1200&q=80'
    ],
    shortDesc: '조선의 곧은 깃(동정) 선을 현대적인 밴드 칼라로 단정하게 풀어낸 오가닉 코튼 셔츠.',
    detailDesc: '전통 한지의 은은하고 자연스러운 결을 80수 고밀도 오가닉 콤마드 코튼에 표현했습니다. 목선을 우아하게 감싸는 단아한 스탠드 깃과 자개 단추의 미세한 광택이 정제된 고급스러움을 자아냅니다.',
    fabric: 'Organic Cotton 100% (80수 2합 고밀도 포플린 워싱)',
    fit: '단정하면서도 편안한 레귤러 컴포트 핏',
    care: ['30도 이하 중성세제 손세탁 또는 단독 세탁망 세탁', '표백제 사용 금지', '자연 건조'],
    modelInfo: 'Model: 184cm / 68kg (L 사이즈 착용)',
    sizeGuide: {
      chest: '58cm',
      shoulder: '51cm',
      length: '78cm',
      sleeve: '64cm'
    },
    rating: 4.8,
    reviewCount: 68,
    salesCount: 520,
    createdAt: '2026-02-10'
  },
  {
    id: 'jl-bot-01',
    name: '투턱 와이드 테이퍼드 하카마 슬랙스',
    engName: 'Two-Tuck Wide Tapered Slacks',
    price: 189000,
    category: 'BOTTOM',
    isNew: false,
    isBest: true,
    colors: [
      { name: '딥 블랙 (Deep Black)', code: '#111111' },
      { name: '어스 토프 (Earth Taupe)', code: '#6D655F' },
      { name: '애쉬 그레이 (Ash Grey)', code: '#9E9C98' }
    ],
    sizes: ['S (28-29)', 'M (30-31)', 'L (32-33)', 'XL (34-35)'],
    images: [
      'https://images.unsplash.com/photo-1506630448388-4e683c67ddb0?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1517445312882-bc9910d016b7?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1479064555552-3ef4979f8908?auto=format&fit=crop&w=1200&q=80'
    ],
    shortDesc: '전통 바지의 넉넉한 여유와 현대 테일러링의 정교한 턱 디테일이 조화된 와이드 팬츠.',
    detailDesc: '허리 양옆의 깊은 투 턱 주름이 자연스러운 입체감을 형성하며 밑단으로 갈수록 유려하게 모아지는 와이드 테이퍼드 실루엣입니다. 사계절 착용 가능한 고급 쿨울 혼방 원단으로 구김이 적고 쾌적합니다.',
    fabric: 'Wool 60%, Polyester 38%, Polyurethane 2%',
    fit: '풍성한 볼륨감의 와이드 테이퍼드 실루엣',
    care: ['드라이클리닝 권장', '단독 찬물 손세탁 가능'],
    modelInfo: 'Model: 183cm / 67kg (M 사이즈 착용)',
    sizeGuide: {
      waist: '39cm',
      thigh: '35cm',
      length: '106cm'
    },
    rating: 4.9,
    reviewCount: 94,
    salesCount: 810,
    createdAt: '2026-01-20'
  },
  {
    id: 'jl-out-02',
    name: '히든 플래킷 미니멀 셋업 블레이저',
    engName: 'Hidden Placket Minimal Setup Blazer',
    price: 345000,
    originalPrice: 385000,
    category: 'OUTER',
    isNew: true,
    isBest: false,
    colors: [
      { name: '먹빛 블랙 (Ink Black)', code: '#121212' },
      { name: '다크 카키 브라운 (Dark Khaki)', code: '#3D3B30' }
    ],
    sizes: ['M (95-100)', 'L (100-105)', 'XL (105-110)'],
    images: [
      'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&w=1200&q=80'
    ],
    shortDesc: '단추를 가린 히든 여밈과 둥근 깃 라인이 기품 있는 미니멀 셋업 자켓.',
    detailDesc: '불필요한 디테일을 극도로 절제하고 여백의 미를 극대화한 싱글 블레이저입니다. 안감에는 전주이씨의 낙관 심볼을 은은한 자카드 직조로 새겨 넣어 보이지 않는 곳까지 장인정신을 담았습니다.',
    fabric: 'Fine Wool 70%, Rayon 28%, Spandex 2%',
    fit: '어깨 라인이 정돈된 세미 오버핏',
    care: ['전문 드라이클리닝'],
    modelInfo: 'Model: 185cm / 72kg (L 사이즈 착용)',
    sizeGuide: {
      chest: '59cm',
      shoulder: '52cm',
      length: '77cm',
      sleeve: '65cm'
    },
    rating: 4.7,
    reviewCount: 19,
    salesCount: 150,
    createdAt: '2026-02-28'
  },
  {
    id: 'jl-top-02',
    name: '훈민정음 절제 자수 헤비웨이트 크루넥',
    engName: 'Heritage Calligraphy Heavyweight Crewneck',
    price: 118000,
    category: 'TOP',
    isNew: false,
    isBest: true,
    colors: [
      { name: '백자 화이트 (Porcelain White)', code: '#FAF9F6' },
      { name: '멜란지 그레이 (Melange Grey)', code: '#BEBCB6' },
      { name: '딥 숯색 (Deep Charcoal)', code: '#222222' }
    ],
    sizes: ['M', 'L', 'XL'],
    images: [
      'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?auto=format&fit=crop&w=1200&q=80'
    ],
    shortDesc: '소매 끝에 전주이씨 음각 자수가 조용하게 새겨진 750g 최고급 프렌치 테리 맨투맨.',
    detailDesc: '전통 붓글씨의 절제된 획에서 영감을 얻은 미니멀 레터링을 소매와 뒷목 라인에 배치했습니다. 텀블 워싱과 텐타 가공을 거쳐 세탁 후에도 뒤틀림이나 수축이 거의 없습니다.',
    fabric: 'Heavy Cotton 100% (750g/yd 고중량 3단 프렌치 테리)',
    fit: '자연스러운 어깨 드롭 오버핏',
    care: ['세탁기 미온수 단독 세탁', '건조기 사용 금지'],
    modelInfo: 'Model: 182cm / 69kg (L 사이즈 착용)',
    sizeGuide: {
      chest: '63cm',
      shoulder: '58cm',
      length: '72cm',
      sleeve: '61cm'
    },
    rating: 5.0,
    reviewCount: 112,
    salesCount: 1240,
    createdAt: '2026-01-10'
  },
  {
    id: 'jl-top-03',
    name: '파인 메리노울 니트 카라 가디건',
    engName: 'Fine Merino Wool Knit Polo Cardigan',
    price: 198000,
    category: 'TOP',
    isNew: true,
    isBest: false,
    colors: [
      { name: '모래 베이지 (Sand Beige)', code: '#D7CFBE' },
      { name: '올리브 카키 (Olive Khaki)', code: '#5C6351' },
      { name: '딥 블랙 (Deep Black)', code: '#121212' }
    ],
    sizes: ['M (95-100)', 'L (100-105)', 'XL (105-110)'],
    images: [
      'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1614975058789-41316d0e2e9c?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1576566588028-4147f3842f27?auto=format&fit=crop&w=1200&q=80'
    ],
    shortDesc: '단정한 카라 실루엣과 부드러운 14게이지 메리노울 편직이 돋보이는 프리미엄 가디건.',
    detailDesc: '전통 매듭단추를 현대적인 혼 버튼으로 승화시켜 단정하고 정갈한 인상을 줍니다. 피부에 닿는 촉감이 극도로 부드러워 단독 착용뿐 아니라 아우터 속 이너로도 탁월합니다.',
    fabric: 'Extrafine Merino Wool 100% (14 Gauge Full Milano Stitch)',
    fit: '군더더기 없는 슬림 컴포트 핏',
    care: ['울 전용 드라이클리닝', '뉘어서 그늘 건조'],
    modelInfo: 'Model: 184cm / 70kg (L 사이즈 착용)',
    sizeGuide: {
      chest: '56cm',
      shoulder: '48cm',
      length: '69cm',
      sleeve: '63cm'
    },
    rating: 4.9,
    reviewCount: 31,
    salesCount: 290,
    createdAt: '2026-02-18'
  },
  {
    id: 'jl-bot-02',
    name: '스트링 밴딩 릴렉스드 테일러드 팬츠',
    engName: 'String Banding Relaxed Tailored Pants',
    price: 172000,
    category: 'BOTTOM',
    isNew: false,
    isBest: false,
    colors: [
      { name: '차콜 먹 (Charcoal Ink)', code: '#282828' },
      { name: '딥 네이비 (Deep Navy)', code: '#1A2238' }
    ],
    sizes: ['S (28-29)', 'M (30-31)', 'L (32-33)', 'XL (34-35)'],
    images: [
      'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1552374196-1ab2a1c593e8?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1506630448388-4e683c67ddb0?auto=format&fit=crop&w=1200&q=80'
    ],
    shortDesc: '전통 대님 끈 구조에서 착안한 내부 조임 스트링과 클래식 팬츠의 우아한 결합.',
    detailDesc: '허리 안쪽에 내장된 스트링으로 벨트 없이도 완벽한 핏 조절이 가능합니다. 주름에 강하고 구김 복원력이 뛰어난 특수 가공 원사를 사용해 활동성과 기품을 모두 챙겼습니다.',
    fabric: 'Polyester 68%, Rayon 29%, Spandex 3%',
    fit: '릴렉스드 스트레이트 핏',
    care: ['세탁망에 넣어 찬물 울코스 세탁'],
    modelInfo: 'Model: 181cm / 68kg (M 사이즈 착용)',
    sizeGuide: {
      waist: '38-44cm (밴딩)',
      thigh: '33cm',
      length: '104cm'
    },
    rating: 4.8,
    reviewCount: 45,
    salesCount: 410,
    createdAt: '2026-01-28'
  },
  {
    id: 'jl-acc-01',
    name: '황동 노리개 모티브 레더 키링',
    engName: 'Brass & Leather Norigae Charm Keyring',
    price: 68000,
    category: 'ACCESSORIES',
    isNew: true,
    isBest: true,
    colors: [
      { name: '에이지드 브론즈 (Aged Bronze)', code: '#9E8160' },
      { name: '매트 실버 (Matte Silver)', code: '#A6A6A6' }
    ],
    sizes: ['FREE'],
    images: [
      'https://images.unsplash.com/photo-1627123424574-724758594e93?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=1200&q=80'
    ],
    shortDesc: '조선 왕실 장신구의 선을 현대 산업 금속 가공과 이탈리안 가죽으로 재해석한 키링.',
    detailDesc: '시간이 흐를수록 깊어지는 황동의 에이징을 즐길 수 있습니다. 벨트 루프나 가방에 간결하게 걸 수 있도록 카라비너 형태로 설계되었습니다.',
    fabric: 'Solid Brass (황동 100%), Italian Buttero Cowhide',
    fit: 'One Size (길이 14.5cm)',
    care: ['물기 접촉 시 부드러운 마른 천으로 닦아주세요.'],
    rating: 5.0,
    reviewCount: 78,
    salesCount: 950,
    createdAt: '2026-02-05'
  },
  {
    id: 'jl-acc-02',
    name: '절제된 선의 미학 이탈리안 레더 벨트',
    engName: 'Minimal Edge Leather Belt',
    price: 115000,
    category: 'ACCESSORIES',
    isNew: false,
    isBest: false,
    colors: [
      { name: '먹색 블랙 (Ink Black)', code: '#121212' },
      { name: '옻칠 다크브라운 (Lacquer Brown)', code: '#422419' }
    ],
    sizes: ['M (28-32 inch)', 'L (32-36 inch)'],
    images: [
      'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1624222247344-550fb60583dc?auto=format&fit=crop&w=1200&q=80'
    ],
    shortDesc: '곡선 없이 정직하게 떨어지는 30mm 폭의 최고급 베지터블 레더 벨트.',
    detailDesc: '자연스러운 가죽 본연의 질감을 살린 프랑스 원피에 이탈리아 식물성 무두질을 거친 가죽입니다. 매트 브러시드 버클과 후면의 전주이씨 불도장 로고가 정갈함을 완성합니다.',
    fabric: 'Vegetable Tanned Full Grain Cowhide, Solid Zinc Buckle',
    fit: '폭 30mm / M (105cm), L (115cm)',
    care: ['가죽 전용 에센스로 주기적인 관리 권장'],
    rating: 4.8,
    reviewCount: 33,
    salesCount: 340,
    createdAt: '2026-01-15'
  },
  {
    id: 'jl-life-01',
    name: '침향과 소나무의 잔향 오브제 인센스',
    engName: 'Pine & Agarwood Ceramic Incense Set',
    price: 52000,
    category: 'LIFESTYLE',
    isNew: true,
    isBest: true,
    colors: [
      { name: '백자 화이트 (Ceramic White)', code: '#F8F6F0' },
      { name: '분청 그레이 (Buncheong Grey)', code: '#8C8982' }
    ],
    sizes: ['SET (Holder + Incense 40 sticks)'],
    images: [
      'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1507652313519-d4e9174996dd?auto=format&fit=crop&w=1200&q=80'
    ],
    shortDesc: '전통 한옥의 고즈넉한 솔바람과 선비의 서재를 연상시키는 전주이씨 시그니처 프래그런스.',
    detailDesc: '도예 장인이 수작업으로 빚어낸 미니멀 세라믹 홀더와 100% 천연 향목 가루로 빚은 인센스 스틱 세트입니다. 공간에 깊은 평온과 고요한 품격을 선사합니다.',
    fabric: 'Ceramic Holder (수제 도자기), Natural Wood Incense (소나무/침향/백단)',
    fit: '스틱 길이 13.5cm (연소 시간 약 25분)',
    care: ['화기 주의', '환기가 잘되는 공간에서 사용하세요.'],
    rating: 4.9,
    reviewCount: 52,
    salesCount: 620,
    createdAt: '2026-02-01'
  },
  {
    id: 'jl-out-03',
    name: '미니멀 나일론 경량 누빔 두루마기 패딩',
    engName: 'Quilted Lightweight Nylon Outer',
    price: 289000,
    originalPrice: 320000,
    category: 'OUTER',
    isNew: false,
    isBest: false,
    isSoldOut: false,
    colors: [
      { name: '딥 카키 (Deep Khaki)', code: '#3E443B' },
      { name: '차콜 블랙 (Charcoal Black)', code: '#1C1C1D' }
    ],
    sizes: ['M (95-100)', 'L (100-105)', 'XL (105-110)'],
    images: [
      'https://images.unsplash.com/photo-1548883354-7622d03aca27?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1516257984-b1b4d707412e?auto=format&fit=crop&w=1200&q=80'
    ],
    shortDesc: '전통 누비옷의 촘촘한 결을 초경량 기능성 나일론과 친환경 씬슐레이트로 재탄생시킨 아우터.',
    detailDesc: '가볍지만 강력한 보온성을 지닌 3M 씬슐레이트 충전재를 균일하게 충전했습니다. 환절기에는 단독 아우터로, 한겨울에는 코트 안 이너 패딩으로 완벽하게 호환됩니다.',
    fabric: 'Nylon 100% (High Density Matte Shell), 3M Thinsulate Fill',
    fit: '여유로운 세미 오버핏',
    care: ['찬물 중성세제 단독 울코스 세탁'],
    modelInfo: 'Model: 186cm / 71kg (L 사이즈 착용)',
    sizeGuide: {
      chest: '61cm',
      shoulder: '53cm',
      length: '75cm',
      sleeve: '64cm'
    },
    rating: 4.7,
    reviewCount: 28,
    salesCount: 270,
    createdAt: '2026-01-05'
  },
  {
    id: 'jl-life-02',
    name: '백자 달항아리 실루엣 세라믹 오브제 화병',
    engName: 'Moon Jar Minimal Ceramic Vase',
    price: 94000,
    category: 'LIFESTYLE',
    isNew: true,
    isBest: false,
    colors: [
      { name: '백자 무광 (Matte White)', code: '#F6F5F0' },
      { name: '흑토 매트 (Black Earth)', code: '#2D2D2D' }
    ],
    sizes: ['ONE SIZE (H 22cm x W 18cm)'],
    images: [
      'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1612196808214-b8e1d6145a8c?auto=format&fit=crop&w=1200&q=80'
    ],
    shortDesc: '달항아리의 너그러운 양감과 현대 건축적 비례를 결합한 도자기 화병.',
    detailDesc: '완벽한 정원이 아닌 자연스러운 비대칭의 곡선미를 지녔습니다. 꽃을 꽂지 않고 오브제 그 자체로 두어도 서재나 거실의 중심을 단단히 잡아줍니다.',
    fabric: 'Korean White Porcelain Clay, Matte Finish',
    fit: '높이 22cm x 지름 18cm',
    care: ['부드러운 스펀지로 세척'],
    rating: 4.9,
    reviewCount: 39,
    salesCount: 310,
    createdAt: '2026-02-22'
  }
];

export const CATEGORIES_CONFIG = [
  { slug: 'ALL', name: '전체 (ALL)', desc: '전주이씨의 모든 컬렉션' },
  { slug: 'NEW', name: '신상품 (NEW)', desc: '2026 S/S 시즌 최신 발매 제품' },
  { slug: 'BEST', name: '베스트 (BEST)', desc: '가장 많은 사랑을 받는 시그니처' },
  { slug: 'OUTER', name: '아우터 (OUTER)', desc: '코트, 자켓, 블레이저' },
  { slug: 'TOP', name: '상의 (TOP)', desc: '셔츠, 니트, 크루넥' },
  { slug: 'BOTTOM', name: '하의 (BOTTOM)', desc: '와이드 슬랙스, 밴딩 팬츠' },
  { slug: 'ACCESSORIES', name: '악세서리 (ACC)', desc: '키링, 벨트, 헤드웨어' },
  { slug: 'LIFESTYLE', name: '라이프스타일 (LIFESTYLE)', desc: '인센스, 세라믹 오브제' },
];
