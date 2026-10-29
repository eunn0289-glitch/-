export interface CapturedPhoto {
  id: string;
  dataUrl: string;
  order: number; // 1 to 5
  timestamp: number;
}

export type LayoutMode = 'strip-1' | 'strip-2' | 'grid-2x2';

export interface FrameTheme {
  id: string;
  name: string;
  category: string;
  bgColor: string; // Hex or CSS background
  bgPattern?: string; // CSS pattern or class
  borderColor: string;
  photoBorderColor: string;
  textColor: string;
  subtextColor: string;
  badgeBg: string;
  badgeText: string;
  icon: string;
  cornerDecoration?: 'chick' | 'rainbow' | 'bear' | 'heart' | 'stars' | 'chalk' | 'flower' | 'ocean';
}

export type FilterType = 'normal' | 'bright' | 'warm' | 'pop' | 'grayscale';

export interface FilterOption {
  id: FilterType;
  name: string;
  subtitle: string;
  css: string;
  canvasFilter: string;
}

export interface PlacedSticker {
  id: string;
  content: string; // Emoji, SVG string or text badge
  type: 'emoji' | 'stamp' | 'badge';
  x: number; // Percentage 0-100 on frame
  y: number; // Percentage 0-100 on frame
  size: number; // In px relative to baseline
  rotation: number; // Degrees
}

export interface PhotoboothConfig {
  className: string;
  dateStr: string;
  customMessage: string;
  themeId: string;
  layout: LayoutMode;
  filter: FilterType;
  showDate: boolean;
  showBarcode: boolean;
  showClassBadge: boolean;
}
