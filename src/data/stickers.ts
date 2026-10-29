export interface StickerDef {
  id: string;
  name: string;
  category: 'props' | 'stamps' | 'doodles' | 'animals';
  content: string; // Emoji or stamp text
  type: 'emoji' | 'stamp' | 'badge';
  bgColor?: string;
  textColor?: string;
  borderColor?: string;
}

export const STICKER_ITEMS: StickerDef[] = [
  // Stamps
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
    name: '스마일 칭찬',
    category: 'stamps',
    content: '😊 활짝 웃어요!',
    type: 'stamp',
    bgColor: '#10B981',
    textColor: '#FFFFFF',
    borderColor: '#047857',
  },
  {
    id: 'stamp-sparkle',
    name: '반짝반짝',
    category: 'stamps',
    content: '✨ 반짝반짝 빛나',
    type: 'stamp',
    bgColor: '#8B5CF6',
    textColor: '#FFFFFF',
    borderColor: '#6D28D9',
  },

  // Props (Hats, Ears, Glasses)
  { id: 'prop-party-hat', name: '고깔모자', category: 'props', content: '🥳', type: 'emoji' },
  { id: 'prop-party-cone', name: '생일 고깔', category: 'props', content: '🎉', type: 'emoji' },
  { id: 'prop-crown', name: '왕관', category: 'props', content: '👑', type: 'emoji' },
  { id: 'prop-sunglasses', name: '선글라스', category: 'props', content: '🕶️', type: 'emoji' },
  { id: 'prop-glasses', name: '안경', category: 'props', content: '👓', type: 'emoji' },
  { id: 'prop-ribbon', name: '분홍 리본', category: 'props', content: '🎀', type: 'emoji' },
  { id: 'prop-camera', name: '카메라', category: 'props', content: '📸', type: 'emoji' },
  { id: 'prop-flower-pin', name: '꽃핀', category: 'props', content: '🌸', type: 'emoji' },

  // Animals
  { id: 'animal-chick', name: '병아리', category: 'animals', content: '🐥', type: 'emoji' },
  { id: 'animal-bunny', name: '토끼', category: 'animals', content: '🐰', type: 'emoji' },
  { id: 'animal-bear', name: '곰돌이', category: 'animals', content: '🧸', type: 'emoji' },
  { id: 'animal-puppy', name: '강아지', category: 'animals', content: '🐶', type: 'emoji' },
  { id: 'animal-cat', name: '고양이', category: 'animals', content: '🐱', type: 'emoji' },
  { id: 'animal-frog', name: '개구리', category: 'animals', content: '🐸', type: 'emoji' },
  { id: 'animal-panda', name: '판다', category: 'animals', content: '🐼', type: 'emoji' },

  // Doodles
  { id: 'doodle-heart', name: '하트 뿅뿅', category: 'doodles', content: '💖', type: 'emoji' },
  { id: 'doodle-star', name: '노란 별', category: 'doodles', content: '⭐', type: 'emoji' },
  { id: 'doodle-sparkles', name: '반짝이', category: 'doodles', content: '✨', type: 'emoji' },
  { id: 'doodle-rainbow', name: '무지개', category: 'doodles', content: '🌈', type: 'emoji' },
  { id: 'doodle-sun', name: '햇님', category: 'doodles', content: '☀️', type: 'emoji' },
  { id: 'doodle-clover', name: '네잎클로버', category: 'doodles', content: '🍀', type: 'emoji' },
  { id: 'doodle-lollipop', name: '막대사탕', category: 'doodles', content: '🍭', type: 'emoji' },
  { id: 'doodle-balloon', name: '풍선', category: 'doodles', content: '🎈', type: 'emoji' },
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
