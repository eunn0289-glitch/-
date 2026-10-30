export interface StickerDef {
  id: string;
  name: string;
  category: 'props' | 'stamps' | 'facepaint' | 'animals' | 'doodles';
  content: string; // Emoji, text, or badge
  type: 'emoji' | 'stamp' | 'badge';
  bgColor?: string;
  textColor?: string;
  borderColor?: string;
  isCustom?: boolean;
}

export const DEFAULT_STAMPS: StickerDef[] = [
  {
    id: 'stamp-great',
    name: '참 잘했어요',
    category: 'stamps',
    content: '참 잘했어요! 💮',
    type: 'stamp',
    bgColor: '#EF4444',
    textColor: '#FFFFFF',
    borderColor: '#B91C1C',
  },
  {
    id: 'stamp-best',
    name: '우리반 최고',
    category: 'stamps',
    content: '👑 우리반 최고!',
    type: 'stamp',
    bgColor: '#F59E0B',
    textColor: '#FFFFFF',
    borderColor: '#D97706',
  },
  {
    id: 'stamp-love',
    name: '사랑해요',
    category: 'stamps',
    content: '💖 사랑해요',
    type: 'stamp',
    bgColor: '#EC4899',
    textColor: '#FFFFFF',
    borderColor: '#BE185D',
  },
  {
    id: 'stamp-smile',
    name: '활짝 스마일',
    category: 'stamps',
    content: '😊 활짝 웃어요!',
    type: 'stamp',
    bgColor: '#10B981',
    textColor: '#FFFFFF',
    borderColor: '#047857',
  },
  {
    id: 'stamp-tidy',
    name: '정리정돈왕',
    category: 'stamps',
    content: '🧹 정리정돈 최고!',
    type: 'stamp',
    bgColor: '#06B6D4',
    textColor: '#FFFFFF',
    borderColor: '#0891B2',
  },
  {
    id: 'stamp-kind',
    name: '착한 마음 배려왕',
    category: 'stamps',
    content: '🍀 다정한 배려왕',
    type: 'stamp',
    bgColor: '#84CC16',
    textColor: '#FFFFFF',
    borderColor: '#65A30D',
  },
  {
    id: 'stamp-eat',
    name: '골고루 냠냠',
    category: 'stamps',
    content: '🍚 밥도 냠냠 잘먹어요',
    type: 'stamp',
    bgColor: '#F97316',
    textColor: '#FFFFFF',
    borderColor: '#C2410C',
  },
  {
    id: 'stamp-strong',
    name: '씩씩 튼튼이',
    category: 'stamps',
    content: '💪 씩씩하고 튼튼해요',
    type: 'stamp',
    bgColor: '#3B82F6',
    textColor: '#FFFFFF',
    borderColor: '#1D4ED8',
  },
  {
    id: 'stamp-book',
    name: '독서 척척박사',
    category: 'stamps',
    content: '📖 책읽기 척척박사',
    type: 'stamp',
    bgColor: '#8B5CF6',
    textColor: '#FFFFFF',
    borderColor: '#6D28D9',
  },
  {
    id: 'stamp-flower',
    name: '꽃길만 걷자',
    category: 'stamps',
    content: '🌸 꽃길만 걷자!',
    type: 'stamp',
    bgColor: '#F43F5E',
    textColor: '#FFFFFF',
    borderColor: '#BE123C',
  },
  {
    id: 'stamp-friend',
    name: '우리는 단짝',
    category: 'stamps',
    content: '🤝 영원한 단짝친구',
    type: 'stamp',
    bgColor: '#EAB308',
    textColor: '#FFFFFF',
    borderColor: '#A16207',
  },
  {
    id: 'stamp-cheer',
    name: '언제나 응원해',
    category: 'stamps',
    content: '🎉 넌 정말 특별해!',
    type: 'stamp',
    bgColor: '#6366F1',
    textColor: '#FFFFFF',
    borderColor: '#4338CA',
  },
];

export const WEARABLE_PROPS: StickerDef[] = [
  // 1. 머리띠 & 씌우는 소품 (Headbands & Props)
  { id: 'prop-bunny-ears', name: '토끼 귀 머리띠', category: 'props', content: '🐰', type: 'emoji' },
  { id: 'prop-cat-ears', name: '고양이 귀 머리띠', category: 'props', content: '🐱', type: 'emoji' },
  { id: 'prop-bear-ears', name: '곰돌이 귀 머리띠', category: 'props', content: '🐻', type: 'emoji' },
  { id: 'prop-puppy-ears', name: '강아지 귀 머리띠', category: 'props', content: '🐶', type: 'emoji' },
  { id: 'prop-frog-band', name: '개구리 왕눈이 머리띠', category: 'props', content: '🐸', type: 'emoji' },
  { id: 'prop-sprout-band', name: '새싹 머리띠', category: 'props', content: '🌱', type: 'emoji' },
  { id: 'prop-angel-halo', name: '천사 링 머리띠', category: 'props', content: '😇', type: 'emoji' },
  { id: 'prop-unicorn-horn', name: '유니콘 뿔 머리띠', category: 'props', content: '🦄', type: 'emoji' },
  { id: 'prop-rainbow-band', name: '무지개 머리띠', category: 'props', content: '🌈', type: 'emoji' },
  { id: 'prop-big-ribbon', name: '분홍 왕리본 머리띠', category: 'props', content: '🎀', type: 'emoji' },
  { id: 'prop-flower-crown', name: '샤랄라 꽃화관', category: 'props', content: '💐', type: 'emoji' },

  // 2. 왕관 & 모자 (Crowns & Hats)
  { id: 'prop-gold-crown', name: '황금 왕관', category: 'props', content: '👑', type: 'emoji' },
  { id: 'prop-tiara', name: '공주 보석 티아라', category: 'props', content: '👸', type: 'emoji' },
  { id: 'prop-party-cone', name: '생일 고깔모자', category: 'props', content: '🥳', type: 'emoji' },
  { id: 'prop-grad-cap', name: '유치원 졸업 학사모', category: 'props', content: '🎓', type: 'emoji' },
  { id: 'prop-wizard-hat', name: '마법사 꼬깔모자', category: 'props', content: '🧙', type: 'emoji' },
  { id: 'prop-chef-hat', name: '꼬마 요리사 모자', category: 'props', content: '👨‍🍳', type: 'emoji' },
  { id: 'prop-detective', name: '탐정 베레모', category: 'props', content: '🕵️', type: 'emoji' },

  // 3. 안경, 선글라스 & 귀걸이 (Glasses & Earrings)
  { id: 'prop-heart-glasses', name: '하트 선글라스', category: 'props', content: '🕶️', type: 'emoji' },
  { id: 'prop-round-glasses', name: '똘똘이 동글안경', category: 'props', content: '👓', type: 'emoji' },
  { id: 'prop-mustache-glasses', name: '익살 콧수염 안경', category: 'props', content: '🥸', type: 'emoji' },
  { id: 'prop-drop-earrings', name: '반짝 보석 귀걸이', category: 'props', content: '💎', type: 'emoji' },
  { id: 'prop-strawberry-earrings', name: '딸기 드롭 귀걸이', category: 'props', content: '🍓', type: 'emoji' },
  { id: 'prop-cherry-earrings', name: '체리 귀걸이', category: 'props', content: '🍒', type: 'emoji' },
  { id: 'prop-heart-earrings', name: '하트 귀걸이', category: 'props', content: '💖', type: 'emoji' },

  // 4. 페이스 페인팅 & 얼굴 스티커 (Face Painting)
  { id: 'prop-pink-blush', name: '뽀송 분홍 볼터치', category: 'props', content: '🌸', type: 'emoji' },
  { id: 'prop-heart-blush', name: '볼하트 페인팅', category: 'props', content: '💕', type: 'emoji' },
  { id: 'prop-star-blush', name: '볼 별빛 페인팅', category: 'props', content: '⭐', type: 'emoji' },
  { id: 'prop-cat-whiskers', name: '고양이 코 & 수염', category: 'props', content: '😽', type: 'emoji' },
  { id: 'prop-butterfly-face', name: '나비 페이스 페인팅', category: 'props', content: '🦋', type: 'emoji' },
  { id: 'prop-bandage-nose', name: '귀여운 볼 반창고', category: 'props', content: '🩹', type: 'emoji' },
  { id: 'prop-rose-cheek', name: '장미 페인팅', category: 'props', content: '🌹', type: 'emoji' },
];

export const ANIMAL_STICKERS: StickerDef[] = [
  { id: 'animal-chick', name: '병아리', category: 'animals', content: '🐥', type: 'emoji' },
  { id: 'animal-bunny', name: '토끼', category: 'animals', content: '🐰', type: 'emoji' },
  { id: 'animal-bear', name: '곰돌이', category: 'animals', content: '🧸', type: 'emoji' },
  { id: 'animal-puppy', name: '강아지', category: 'animals', content: '🐶', type: 'emoji' },
  { id: 'animal-cat', name: '고양이', category: 'animals', content: '🐱', type: 'emoji' },
  { id: 'animal-hamster', name: '햄스터', category: 'animals', content: '🐹', type: 'emoji' },
  { id: 'animal-panda', name: '판다', category: 'animals', content: '🐼', type: 'emoji' },
  { id: 'animal-frog', name: '개구리', category: 'animals', content: '🐸', type: 'emoji' },
  { id: 'animal-squirrel', name: '다람쥐', category: 'animals', content: '🐿️', type: 'emoji' },
  { id: 'animal-fox', name: '아기여우', category: 'animals', content: '🦊', type: 'emoji' },
  { id: 'animal-lion', name: '아기사자', category: 'animals', content: '🦁', type: 'emoji' },
  { id: 'animal-penguin', name: '펭귄', category: 'animals', content: '🐧', type: 'emoji' },
  { id: 'animal-koala', name: '코알라', category: 'animals', content: '🐨', type: 'emoji' },
];

export const DOODLE_STICKERS: StickerDef[] = [
  { id: 'doodle-heart', name: '하트 뿅뿅', category: 'doodles', content: '💖', type: 'emoji' },
  { id: 'doodle-sun', name: '방긋 햇님', category: 'doodles', content: '☀️', type: 'emoji' },
  { id: 'doodle-rainbow', name: '무지개', category: 'doodles', content: '🌈', type: 'emoji' },
  { id: 'doodle-balloon', name: '알록달록 풍선', category: 'doodles', content: '🎈', type: 'emoji' },
  { id: 'doodle-lollipop', name: '막대사탕', category: 'doodles', content: '🍭', type: 'emoji' },
  { id: 'doodle-cupcake', name: '딸기 컵케이크', category: 'doodles', content: '🧁', type: 'emoji' },
  { id: 'doodle-icecream', name: '아이스크림', category: 'doodles', content: '🍦', type: 'emoji' },
  { id: 'doodle-gift', name: '선물상자', category: 'doodles', content: '🎁', type: 'emoji' },
  { id: 'doodle-music', name: '신나는 음표', category: 'doodles', content: '🎵', type: 'emoji' },
  { id: 'doodle-clover', name: '행운 클로버', category: 'doodles', content: '🍀', type: 'emoji' },
  { id: 'doodle-tulip', name: '예쁜 튤립', category: 'doodles', content: '🌷', type: 'emoji' },
  { id: 'doodle-sunflower', name: '해바라기', category: 'doodles', content: '🌻', type: 'emoji' },
];

export const STICKER_ITEMS: StickerDef[] = [
  ...DEFAULT_STAMPS,
  ...WEARABLE_PROPS,
  ...ANIMAL_STICKERS,
  ...DOODLE_STICKERS,
];

export const PHOTO_FILTERS = [
  {
    id: 'normal',
    name: '기본 (원본)',
    subtitle: '있는 그대로 생생하게',
    css: 'none',
    canvasFilter: 'none',
  },
  {
    id: 'bright',
    name: '뽀샤시 화사하게',
    subtitle: '피부가 환하고 맑게',
    css: 'brightness(1.1) contrast(1.05) saturate(1.15)',
    canvasFilter: 'brightness(1.1) contrast(1.05) saturate(1.15)',
  },
  {
    id: 'warm',
    name: '따스한 햇살',
    subtitle: '포근하고 따뜻한 색감',
    css: 'sepia(0.15) brightness(1.05) saturate(1.2) hue-rotate(-5deg)',
    canvasFilter: 'sepia(0.15) brightness(1.05) saturate(1.2) hue-rotate(-5deg)',
  },
  {
    id: 'pop',
    name: '생생 톡톡 비비드',
    subtitle: '선명하고 또렷한 색감',
    css: 'contrast(1.15) saturate(1.35) brightness(1.02)',
    canvasFilter: 'contrast(1.15) saturate(1.35) brightness(1.02)',
  },
  {
    id: 'grayscale',
    name: '흑백 클래식',
    subtitle: '분위기 있는 흑백 필름',
    css: 'grayscale(1) contrast(1.1)',
    canvasFilter: 'grayscale(1) contrast(1.1)',
  },
] as const;
