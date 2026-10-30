import React, { useRef, useEffect, useState, useCallback } from 'react';
import {
  Palette,
  Sliders,
  Type,
  Stamp,
  ChevronLeft,
  ChevronRight,
  Trash2,
  Plus,
  Minus,
  RotateCw,
  Move,
  Sparkles,
} from 'lucide-react';
import { CapturedPhoto, FrameTheme, LayoutMode, PhotoboothConfig, PlacedSticker, FilterType } from '../types';
import { FRAME_THEMES } from '../data/frames';
import {
  PHOTO_FILTERS,
  DEFAULT_STAMPS,
  WEARABLE_PROPS,
  ANIMAL_STICKERS,
  DOODLE_STICKERS,
  StickerDef,
} from '../data/stickers';
import { renderPhotoboothToCanvas } from '../utils/canvasRenderer';
import { playPopSound } from '../utils/sound';

interface FrameCustomizerProps {
  selectedPhotos: CapturedPhoto[];
  onBackToSelect: () => void;
  onFinish: (canvas: HTMLCanvasElement, config: PhotoboothConfig, stickers: PlacedSticker[]) => void;
}

const CLASS_PRESETS = [
  '다산새봄유치원 푸름반 🌱',
  '다산새봄유치원 푸름반',
  '초록초록 새싹반 🌱',
  '행복가득 풀잎반 🍀',
  '알록달록 무지개반 🌈',
  '달콤 사랑반 💖',
  '튼튼 열매반 🍎',
];

const MESSAGE_PRESETS = [
  '너희들의 빛나는 하루를 응원해! ✨',
  '선생님과 함께 만든 소중한 추억 📸',
  '우리는 천하무적 단짝 친구! 👭',
  '매일매일 행복하게 쑥쑥 자라자 🌱',
];

const STAMP_COLORS = [
  { name: '빨강', bg: '#EF4444', text: '#FFFFFF', border: '#B91C1C' },
  { name: '황금', bg: '#F59E0B', text: '#FFFFFF', border: '#D97706' },
  { name: '분홍', bg: '#EC4899', text: '#FFFFFF', border: '#BE185D' },
  { name: '초록', bg: '#10B981', text: '#FFFFFF', border: '#047857' },
  { name: '파랑', bg: '#3B82F6', text: '#FFFFFF', border: '#1D4ED8' },
  { name: '보라', bg: '#8B5CF6', text: '#FFFFFF', border: '#6D28D9' },
];

export const FrameCustomizer: React.FC<FrameCustomizerProps> = ({
  selectedPhotos,
  onBackToSelect,
  onFinish,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const previewWrapperRef = useRef<HTMLDivElement>(null);

  // Configuration state
  const [config, setConfig] = useState<PhotoboothConfig>({
    className: '다산새봄유치원 푸름반',
    dateStr: new Date().toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }),
    customMessage: '너희들의 빛나는 하루를 응원해! ✨',
    themeId: 'chick-yellow',
    layout: 'strip-2', // Default to popular 1+1 Life4cut strip
    filter: 'normal',
    showDate: true,
    showBarcode: true,
    showClassBadge: true,
  });

  // Placed stickers (Clean default without sparkles)
  const [stickers, setStickers] = useState<PlacedSticker[]>([
    {
      id: 'default-stamp',
      content: '참 잘했어요! 💮',
      type: 'stamp',
      x: 50,
      y: 92,
      size: 42,
      rotation: -4,
    },
  ]);

  // Customizable stamps library
  const [stampsLibrary, setStampsLibrary] = useState<StickerDef[]>(DEFAULT_STAMPS);
  const [newStampText, setNewStampText] = useState('');
  const [selectedStampColor, setSelectedStampColor] = useState(STAMP_COLORS[0]);

  // Tab & selection states
  const [activeTab, setActiveTab] = useState<'frame' | 'filter' | 'text' | 'stickers'>('frame');
  const [activeStickerCat, setActiveStickerCat] = useState<'props' | 'stamps' | 'animals' | 'doodles'>('props');
  const [selectedStickerId, setSelectedStickerId] = useState<string | null>(null);

  // Dragging state for visible movement
  const [draggingStickerId, setDraggingStickerId] = useState<string | null>(null);

  const currentTheme = FRAME_THEMES.find((t) => t.id === config.themeId) || FRAME_THEMES[0];

  // Re-render canvas whenever dependencies change
  const redrawCanvas = useCallback(async () => {
    if (!canvasRef.current) return;
    try {
      await renderPhotoboothToCanvas(
        canvasRef.current,
        selectedPhotos,
        currentTheme,
        config,
        stickers
      );
    } catch (e) {
      console.error('Error rendering photobooth:', e);
    }
  }, [selectedPhotos, currentTheme, config, stickers]);

  useEffect(() => {
    redrawCanvas();
  }, [redrawCanvas]);

  // Add custom praise stamp to library and immediately place on photo
  const handleCreateCustomStamp = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const text = newStampText.trim();
    if (!text) return;
    playPopSound();

    const newDef: StickerDef = {
      id: `custom-stamp-${Date.now()}`,
      name: text,
      category: 'stamps',
      content: text,
      type: 'stamp',
      bgColor: selectedStampColor.bg,
      textColor: selectedStampColor.text,
      borderColor: selectedStampColor.border,
      isCustom: true,
    };

    setStampsLibrary((prev) => [newDef, ...prev]);
    handleAddSticker(newDef);
    setNewStampText('');
  };

  // Delete stamp from stamp library
  const handleDeleteFromLibrary = (e: React.MouseEvent, stampId: string) => {
    e.stopPropagation();
    playPopSound();
    setStampsLibrary((prev) => prev.filter((s) => s.id !== stampId));
  };

  // Add sticker onto the frame
  const handleAddSticker = (item: StickerDef) => {
    playPopSound();
    const newSticker: PlacedSticker = {
      id: `sticker-${Date.now()}`,
      content: item.content,
      type: item.type,
      x: 50 + (Math.random() * 16 - 8),
      y: 50 + (Math.random() * 16 - 8),
      size: item.type === 'stamp' ? 44 : 50,
      rotation: Math.round(Math.random() * 14 - 7),
    };
    setStickers((prev) => [...prev, newSticker]);
    setSelectedStickerId(newSticker.id);
  };

  // Remove sticker from frame
  const handleRemoveSticker = (id: string) => {
    playPopSound();
    setStickers((prev) => prev.filter((s) => s.id !== id));
    if (selectedStickerId === id) setSelectedStickerId(null);
  };

  // Adjust sticker size
  const handleAdjustSize = (id: string, delta: number) => {
    playPopSound();
    setStickers((prev) =>
      prev.map((s) =>
        s.id === id ? { ...s, size: Math.max(24, Math.min(120, s.size + delta)) } : s
      )
    );
  };

  // Rotate sticker
  const handleRotateSticker = (id: string, deltaDeg: number) => {
    playPopSound();
    setStickers((prev) =>
      prev.map((s) => (s.id === id ? { ...s, rotation: (s.rotation + deltaDeg) % 360 } : s))
    );
  };

  // Live pointer drag handlers for smooth visible movement
  const handlePointerDown = (id: string, e: React.PointerEvent) => {
    e.stopPropagation();
    setSelectedStickerId(id);
    setDraggingStickerId(id);
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!draggingStickerId || !previewWrapperRef.current) return;
    const rect = previewWrapperRef.current.getBoundingClientRect();
    const px = Math.max(4, Math.min(96, ((e.clientX - rect.left) / rect.width) * 100));
    const py = Math.max(4, Math.min(96, ((e.clientY - rect.top) / rect.height) * 100));

    setStickers((prev) =>
      prev.map((s) =>
        s.id === draggingStickerId ? { ...s, x: Math.round(px), y: Math.round(py) } : s
      )
    );
  };

  const handlePointerUp = () => {
    setDraggingStickerId(null);
  };

  // Clicking on empty area on preview moves the selected sticker
  const handleContainerClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!previewWrapperRef.current || !selectedStickerId) return;
    const rect = previewWrapperRef.current.getBoundingClientRect();
    const px = Math.max(4, Math.min(96, ((e.clientX - rect.left) / rect.width) * 100));
    const py = Math.max(4, Math.min(96, ((e.clientY - rect.top) / rect.height) * 100));

    playPopSound();
    setStickers((prev) =>
      prev.map((s) =>
        s.id === selectedStickerId ? { ...s, x: Math.round(px), y: Math.round(py) } : s
      )
    );
  };

  const handleFinish = () => {
    if (!canvasRef.current) return;
    onFinish(canvasRef.current, config, stickers);
  };

  const activeSticker = stickers.find((s) => s.id === selectedStickerId);

  return (
    <div className="w-full max-w-6xl mx-auto flex flex-col items-center">
      {/* Header */}
      <div className="w-full bg-white rounded-3xl p-4 md:p-6 shadow-md border-4 border-amber-200 mb-6 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-amber-100 text-amber-900 font-jua text-base mb-2">
          <Palette className="w-4 h-4 text-amber-600" />
          <span>프레임과 착용 소품, 칭찬 도장으로 귀엽게 꾸며보세요!</span>
        </div>
        <h2 className="text-2xl md:text-3xl font-jua text-stone-800">
          우리반 맞춤 네컷 프레임 스튜디오
        </h2>
        <p className="text-stone-600 font-gaegu text-xl mt-1">
          머리띠, 왕관, 페이스페인팅을 씌워보고 직접 쓴 칭찬 도장도 콕콕 붙여봐요 ✨
        </p>
      </div>

      {/* Main 2-Column Studio: Left Preview, Right Controls */}
      <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Canvas Live Preview (5 columns on desktop) */}
        <div className="lg:col-span-5 flex flex-col items-center w-full">
          <div className="w-full bg-amber-100/60 p-4 rounded-3xl border-2 border-amber-200 flex flex-col items-center">
            <div className="w-full flex items-center justify-between mb-3 px-2">
              <span className="font-jua text-amber-900 text-base flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-amber-500" /> 실시간 네컷 미리보기
              </span>
              <span className="text-xs font-jua text-amber-700 bg-white px-2.5 py-1 rounded-full shadow-xs">
                {config.layout === 'strip-2' ? '1+1 나눔형' : config.layout === 'strip-1' ? '1컷 단독형' : '2x2 네모형'}
              </span>
            </div>

            {/* Canvas Container with Interactive Draggable Sticker Overlay */}
            <div
              ref={previewWrapperRef}
              onClick={handleContainerClick}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              className="relative w-full max-w-full max-h-[640px] overflow-hidden rounded-2xl shadow-xl border-4 border-white cursor-crosshair bg-stone-100 flex items-center justify-center p-2 transition-all select-none"
            >
              {/* Canvas output */}
              <canvas
                ref={canvasRef}
                className="max-h-[580px] max-w-full w-auto h-auto object-contain block rounded-lg shadow-sm pointer-events-none"
              />

              {/* Interactive Placed Stickers Overlay */}
              <div className="absolute inset-0 pointer-events-none overflow-hidden m-2">
                {stickers.map((s) => {
                  const isSelected = selectedStickerId === s.id;
                  const isDragging = draggingStickerId === s.id;

                  return (
                    <div
                      key={s.id}
                      onPointerDown={(e) => handlePointerDown(s.id, e)}
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedStickerId(s.id);
                      }}
                      style={{
                        left: `${s.x}%`,
                        top: `${s.y}%`,
                        transform: `translate(-50%, -50%) rotate(${s.rotation}deg)`,
                      }}
                      className={`absolute pointer-events-auto cursor-grab active:cursor-grabbing transition-transform select-none ${
                        isDragging ? 'scale-110 z-30 opacity-90' : isSelected ? 'z-20' : 'z-10'
                      }`}
                    >
                      {/* Selection Bounding Box & Toolbar */}
                      {isSelected && (
                        <div className="absolute -inset-2.5 border-2 border-dashed border-amber-500 rounded-2xl bg-amber-400/10 pointer-events-none animate-pulse" />
                      )}

                      {/* Moving Indicator Bubble */}
                      {isDragging && (
                        <div className="absolute -top-7 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-full bg-amber-600 text-white font-jua text-[11px] shadow whitespace-nowrap pointer-events-none flex items-center gap-1">
                          <Move className="w-3 h-3 animate-spin" />
                          <span>이동 중!</span>
                        </div>
                      )}

                      {/* Sticker Visual Content */}
                      {s.type === 'stamp' ? (
                        <div
                          style={{
                            backgroundColor: '#DC2626',
                            color: '#FFFFFF',
                            borderColor: '#FFFFFF',
                          }}
                          className="px-3 py-1 rounded-xl border-2 font-jua text-sm sm:text-base font-bold shadow-lg whitespace-nowrap flex items-center gap-1"
                        >
                          {s.content}
                        </div>
                      ) : (
                        <span
                          style={{ fontSize: `${s.size}px`, lineHeight: 1 }}
                          className="block filter drop-shadow-md select-none transform transition-transform"
                        >
                          {s.content}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Quick Controls for currently selected sticker */}
            {activeSticker ? (
              <div className="mt-3 w-full bg-white p-2.5 rounded-2xl border border-amber-300 shadow-sm flex items-center justify-between text-xs font-jua text-stone-700">
                <span className="flex items-center gap-1 text-amber-800">
                  <Move className="w-3.5 h-3.5 text-amber-500" />
                  <span>스티커 드래그로 이동!</span>
                </span>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => handleAdjustSize(activeSticker.id, -6)}
                    title="크기 축소"
                    className="p-1.5 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-700 transition"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleAdjustSize(activeSticker.id, 6)}
                    title="크기 확대"
                    className="p-1.5 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-700 transition"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleRotateSticker(activeSticker.id, 15)}
                    title="회전하기"
                    className="p-1.5 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-700 transition"
                  >
                    <RotateCw className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleRemoveSticker(activeSticker.id)}
                    title="스티커 삭제"
                    className="p-1.5 rounded-lg bg-red-100 hover:bg-red-200 text-red-600 transition"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ) : (
              <p className="text-xs font-gaegu text-amber-800 mt-2 text-center">
                💡 붙인 스티커를 마우스나 손가락으로 드래그하면 원하는 위치로 쏙 이동해요!
              </p>
            )}
          </div>
        </div>

        {/* Right: Customization Controls (7 columns on desktop) */}
        <div className="lg:col-span-7 bg-white rounded-3xl p-5 md:p-6 shadow-md border-4 border-amber-200">
          {/* Navigation Tabs */}
          <div className="grid grid-cols-4 gap-1.5 sm:gap-2 p-1.5 bg-amber-50 rounded-2xl mb-6">
            <button
              type="button"
              onClick={() => setActiveTab('frame')}
              className={`py-2 sm:py-2.5 px-1 sm:px-2 rounded-xl font-jua text-xs sm:text-sm md:text-base flex items-center justify-center gap-1 sm:gap-1.5 transition cursor-pointer min-w-0 ${
                activeTab === 'frame'
                  ? 'bg-amber-400 text-amber-950 shadow-md font-bold'
                  : 'text-stone-600 hover:bg-amber-100/60'
              }`}
            >
              <Palette className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
              <span className="truncate whitespace-nowrap">프레임 테마</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('filter')}
              className={`py-2 sm:py-2.5 px-1 sm:px-2 rounded-xl font-jua text-xs sm:text-sm md:text-base flex items-center justify-center gap-1 sm:gap-1.5 transition cursor-pointer min-w-0 ${
                activeTab === 'filter'
                  ? 'bg-amber-400 text-amber-950 shadow-md font-bold'
                  : 'text-stone-600 hover:bg-amber-100/60'
              }`}
            >
              <Sliders className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
              <span className="truncate whitespace-nowrap">사진 필터</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('text')}
              className={`py-2 sm:py-2.5 px-1 sm:px-2 rounded-xl font-jua text-xs sm:text-sm md:text-base flex items-center justify-center gap-1 sm:gap-1.5 transition cursor-pointer min-w-0 ${
                activeTab === 'text'
                  ? 'bg-amber-400 text-amber-950 shadow-md font-bold'
                  : 'text-stone-600 hover:bg-amber-100/60'
              }`}
            >
              <Type className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
              <span className="truncate whitespace-nowrap tracking-tight">반이름·문구</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('stickers')}
              className={`py-2 sm:py-2.5 px-1 sm:px-2 rounded-xl font-jua text-xs sm:text-sm md:text-base flex items-center justify-center gap-1 sm:gap-1.5 transition cursor-pointer min-w-0 ${
                activeTab === 'stickers'
                  ? 'bg-amber-400 text-amber-950 shadow-md font-bold'
                  : 'text-stone-600 hover:bg-amber-100/60'
              }`}
            >
              <Stamp className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
              <span className="truncate whitespace-nowrap tracking-tight">소품·스탬프</span>
            </button>
          </div>

          {/* TAB 1: FRAME THEMES & LAYOUT */}
          {activeTab === 'frame' && (
            <div className="space-y-6">
              {/* Layout Picker */}
              <div>
                <label className="block font-jua text-stone-700 text-base mb-2">
                  사진 레이아웃 선택
                </label>
                <div className="grid grid-cols-3 gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      playPopSound();
                      setConfig((c) => ({ ...c, layout: 'strip-2' }));
                    }}
                    className={`p-3 rounded-2xl border-2 text-center transition cursor-pointer ${
                      config.layout === 'strip-2'
                        ? 'border-amber-500 bg-amber-50 text-amber-900 shadow-sm ring-2 ring-amber-300'
                        : 'border-stone-200 hover:bg-stone-50 text-stone-600'
                    }`}
                  >
                    <div className="text-xl mb-1">👯 1+1 트윈컷</div>
                    <div className="font-jua text-sm">친구와 한 장씩! (기본)</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      playPopSound();
                      setConfig((c) => ({ ...c, layout: 'strip-1' }));
                    }}
                    className={`p-3 rounded-2xl border-2 text-center transition cursor-pointer ${
                      config.layout === 'strip-1'
                        ? 'border-amber-500 bg-amber-50 text-amber-900 shadow-sm ring-2 ring-amber-300'
                        : 'border-stone-200 hover:bg-stone-50 text-stone-600'
                    }`}
                  >
                    <div className="text-xl mb-1">🎞️ 세로 1줄</div>
                    <div className="font-jua text-sm">클래식 4컷 스트립</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      playPopSound();
                      setConfig((c) => ({ ...c, layout: 'grid-2x2' }));
                    }}
                    className={`p-3 rounded-2xl border-2 text-center transition cursor-pointer ${
                      config.layout === 'grid-2x2'
                        ? 'border-amber-500 bg-amber-50 text-amber-900 shadow-sm ring-2 ring-amber-300'
                        : 'border-stone-200 hover:bg-stone-50 text-stone-600'
                    }`}
                  >
                    <div className="text-xl mb-1">🖼️ 2x2 네모컷</div>
                    <div className="font-jua text-sm">엽서 & 액자 스타일</div>
                  </button>
                </div>
              </div>

              {/* Theme Color Cards */}
              <div>
                <label className="block font-jua text-stone-700 text-base mb-2">
                  유치원 프레임 디자인 선택 (8가지)
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {FRAME_THEMES.map((theme) => {
                    const isSelected = config.themeId === theme.id;
                    return (
                      <button
                        key={theme.id}
                        type="button"
                        onClick={() => {
                          playPopSound();
                          setConfig((c) => ({ ...c, themeId: theme.id }));
                        }}
                        style={{ backgroundColor: theme.bgColor }}
                        className={`p-3 rounded-2xl border-3 flex flex-col items-center justify-center text-center transition transform hover:scale-105 active:scale-95 shadow-sm cursor-pointer ${
                          isSelected
                            ? 'border-amber-600 ring-4 ring-amber-300 scale-102 font-bold'
                            : 'border-white hover:border-amber-300'
                        }`}
                      >
                        <span className="text-3xl mb-1">{theme.icon}</span>
                        <span
                          className="font-jua text-sm"
                          style={{ color: theme.textColor }}
                        >
                          {theme.name}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: PHOTO FILTERS */}
          {activeTab === 'filter' && (
            <div className="space-y-4">
              <label className="block font-jua text-stone-700 text-base mb-1">
                사진 색감 및 분위기 필터
              </label>
              <p className="text-sm text-stone-500 font-sans mb-3">
                선택한 필터가 네컷 사진 전체에 부드럽게 적용됩니다.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {PHOTO_FILTERS.map((f) => {
                  const isSelected = config.filter === f.id;
                  return (
                    <button
                      key={f.id}
                      type="button"
                      onClick={() => {
                        playPopSound();
                        setConfig((c) => ({ ...c, filter: f.id as FilterType }));
                      }}
                      className={`p-4 rounded-2xl border-2 text-left flex items-center justify-between transition cursor-pointer ${
                        isSelected
                          ? 'border-amber-500 bg-amber-50 ring-2 ring-amber-300 shadow-sm'
                          : 'border-stone-200 hover:bg-stone-50'
                      }`}
                    >
                      <div>
                        <div className="font-jua text-stone-800 text-base">{f.name}</div>
                        <div className="text-xs text-stone-500 font-sans mt-0.5">
                          {f.subtitle}
                        </div>
                      </div>
                      <div className="w-12 h-12 rounded-xl overflow-hidden border border-stone-200 shrink-0">
                        <img
                          src={selectedPhotos[0]?.dataUrl}
                          alt="필터 미리보기"
                          style={{ filter: f.css }}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 3: TEXT & BADGE CUSTOMIZATION */}
          {activeTab === 'text' && (
            <div className="space-y-5">
              {/* Class Name */}
              <div>
                <label className="block font-jua text-stone-700 text-base mb-1">
                  유치원 / 어린이집 및 우리반 이름
                </label>
                <input
                  type="text"
                  value={config.className}
                  maxLength={25}
                  onChange={(e) => setConfig((c) => ({ ...c, className: e.target.value }))}
                  placeholder="예: 다산새봄유치원 푸름반"
                  className="w-full px-4 py-2.5 rounded-xl border-2 border-amber-200 focus:border-amber-500 focus:outline-none font-jua text-stone-800 text-lg"
                />
                {/* Preset Chips */}
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {CLASS_PRESETS.map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setConfig((c) => ({ ...c, className: preset }))}
                      className="px-2.5 py-1 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-900 font-jua text-xs border border-amber-200 transition cursor-pointer"
                    >
                      {preset}
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom Message */}
              <div>
                <label className="block font-jua text-stone-700 text-base mb-1">
                  소중한 문구 (하단 응원 메시지)
                </label>
                <input
                  type="text"
                  value={config.customMessage}
                  maxLength={35}
                  onChange={(e) => setConfig((c) => ({ ...c, customMessage: e.target.value }))}
                  placeholder="예: 너희들의 빛나는 하루를 응원해! ✨"
                  className="w-full px-4 py-2.5 rounded-xl border-2 border-amber-200 focus:border-amber-500 focus:outline-none font-gaegu text-stone-800 text-xl"
                />
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {MESSAGE_PRESETS.map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setConfig((c) => ({ ...c, customMessage: preset }))}
                      className="px-2.5 py-1 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-900 font-gaegu text-sm border border-amber-200 transition cursor-pointer"
                    >
                      {preset}
                    </button>
                  ))}
                </div>
              </div>

              {/* Date & Barcode Toggles */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div className="p-3 bg-stone-50 rounded-2xl border border-stone-200 flex items-center justify-between">
                  <span className="font-jua text-sm text-stone-700">날짜 표시하기</span>
                  <input
                    type="checkbox"
                    checked={config.showDate}
                    onChange={(e) => setConfig((c) => ({ ...c, showDate: e.target.checked }))}
                    className="w-5 h-5 accent-amber-500 rounded cursor-pointer"
                  />
                </div>

                <div className="p-3 bg-stone-50 rounded-2xl border border-stone-200 flex items-center justify-between">
                  <span className="font-jua text-sm text-stone-700">네컷 바코드 감성 표시</span>
                  <input
                    type="checkbox"
                    checked={config.showBarcode}
                    onChange={(e) => setConfig((c) => ({ ...c, showBarcode: e.target.checked }))}
                    className="w-5 h-5 accent-amber-500 rounded cursor-pointer"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: WEARABLE PROPS & CUSTOM STAMPS */}
          {activeTab === 'stickers' && (
            <div className="space-y-4">
              {/* Category sub-tabs */}
              <div className="flex flex-wrap gap-2 border-b border-stone-200 pb-2">
                <button
                  type="button"
                  onClick={() => setActiveStickerCat('props')}
                  className={`px-3 py-1.5 rounded-xl font-jua text-xs md:text-sm transition cursor-pointer ${
                    activeStickerCat === 'props'
                      ? 'bg-amber-500 text-white shadow-xs font-bold'
                      : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                  }`}
                >
                  👑 착용 파티소품 (머리띠/왕관/얼굴)
                </button>
                <button
                  type="button"
                  onClick={() => setActiveStickerCat('stamps')}
                  className={`px-3 py-1.5 rounded-xl font-jua text-xs md:text-sm transition cursor-pointer ${
                    activeStickerCat === 'stamps'
                      ? 'bg-amber-500 text-white shadow-xs font-bold'
                      : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                  }`}
                >
                  💮 칭찬 스탬프 (직접 쓰기 & 추가)
                </button>
                <button
                  type="button"
                  onClick={() => setActiveStickerCat('animals')}
                  className={`px-3 py-1.5 rounded-xl font-jua text-xs md:text-sm transition cursor-pointer ${
                    activeStickerCat === 'animals'
                      ? 'bg-amber-500 text-white shadow-xs font-bold'
                      : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                  }`}
                >
                  🐥 동물 친구들
                </button>
                <button
                  type="button"
                  onClick={() => setActiveStickerCat('doodles')}
                  className={`px-3 py-1.5 rounded-xl font-jua text-xs md:text-sm transition cursor-pointer ${
                    activeStickerCat === 'doodles'
                      ? 'bg-amber-500 text-white shadow-xs font-bold'
                      : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                  }`}
                >
                  💖 아기자기 데코
                </button>
              </div>

              {/* Sub-view: CUSTOM STAMPS CREATOR (When 'stamps' is active) */}
              {activeStickerCat === 'stamps' && (
                <div className="p-3 bg-amber-50 rounded-2xl border-2 border-amber-200 space-y-2.5">
                  <span className="font-jua text-sm text-amber-900 block font-bold">
                    ✨ 나만의 칭찬 스탬프 직접 적어서 만들기
                  </span>
                  <form onSubmit={handleCreateCustomStamp} className="flex flex-col sm:flex-row gap-2">
                    <input
                      type="text"
                      value={newStampText}
                      maxLength={16}
                      onChange={(e) => setNewStampText(e.target.value)}
                      placeholder="예: 발표왕!, 양치도 잘해요, 사랑둥이"
                      className="flex-1 px-3 py-2 rounded-xl border border-amber-300 font-jua text-sm focus:outline-none focus:border-amber-500 bg-white"
                    />
                    <div className="flex items-center gap-1.5 justify-between sm:justify-start">
                      {STAMP_COLORS.map((c) => (
                        <button
                          key={c.name}
                          type="button"
                          onClick={() => setSelectedStampColor(c)}
                          style={{ backgroundColor: c.bg }}
                          title={c.name}
                          className={`w-7 h-7 rounded-full border-2 transition cursor-pointer ${
                            selectedStampColor.name === c.name
                              ? 'border-black scale-110 shadow-sm ring-2 ring-white'
                              : 'border-white hover:scale-105'
                          }`}
                        />
                      ))}
                      <button
                        type="submit"
                        className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-jua text-xs sm:text-sm shadow transition cursor-pointer whitespace-nowrap"
                      >
                        + 추가하기
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* Items Grid */}
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2.5 max-h-64 overflow-y-auto p-1">
                {activeStickerCat === 'stamps' &&
                  stampsLibrary.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => handleAddSticker(item)}
                      style={{ backgroundColor: item.bgColor || '#EF4444' }}
                      className="group relative p-2.5 rounded-xl border border-white text-white shadow-sm flex flex-col items-center justify-center text-center transition transform hover:scale-105 active:scale-95 cursor-pointer"
                    >
                      <span className="font-jua text-xs line-clamp-1">{item.content}</span>
                      {/* Delete stamp from library */}
                      <button
                        type="button"
                        onClick={(e) => handleDeleteFromLibrary(e, item.id)}
                        title="도장 삭제"
                        className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-stone-900 text-white flex items-center justify-center text-[10px] opacity-0 group-hover:opacity-100 hover:bg-red-600 transition"
                      >
                        ✕
                      </button>
                    </div>
                  ))}

                {activeStickerCat === 'props' &&
                  WEARABLE_PROPS.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => handleAddSticker(item)}
                      className="p-2.5 rounded-xl border border-amber-200 hover:border-amber-400 bg-amber-50/50 hover:bg-amber-100/80 flex flex-col items-center justify-center transition transform hover:scale-110 active:scale-95 cursor-pointer"
                    >
                      <span className="text-3xl mb-1">{item.content}</span>
                      <span className="text-[11px] font-gaegu text-stone-700 line-clamp-1">
                        {item.name}
                      </span>
                    </button>
                  ))}

                {activeStickerCat === 'animals' &&
                  ANIMAL_STICKERS.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => handleAddSticker(item)}
                      className="p-2.5 rounded-xl border border-amber-200 hover:border-amber-400 bg-amber-50/50 hover:bg-amber-100/80 flex flex-col items-center justify-center transition transform hover:scale-110 active:scale-95 cursor-pointer"
                    >
                      <span className="text-3xl mb-1">{item.content}</span>
                      <span className="text-[11px] font-gaegu text-stone-700 line-clamp-1">
                        {item.name}
                      </span>
                    </button>
                  ))}

                {activeStickerCat === 'doodles' &&
                  DOODLE_STICKERS.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => handleAddSticker(item)}
                      className="p-2.5 rounded-xl border border-amber-200 hover:border-amber-400 bg-amber-50/50 hover:bg-amber-100/80 flex flex-col items-center justify-center transition transform hover:scale-110 active:scale-95 cursor-pointer"
                    >
                      <span className="text-3xl mb-1">{item.content}</span>
                      <span className="text-[11px] font-gaegu text-stone-700 line-clamp-1">
                        {item.name}
                      </span>
                    </button>
                  ))}
              </div>

              {/* Active Placed Stickers Controls */}
              {stickers.length > 0 && (
                <div className="mt-4 pt-3 border-t border-stone-200">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-jua text-sm text-stone-700">
                      붙인 스티커 목록 ({stickers.length}개)
                    </span>
                    <button
                      type="button"
                      onClick={() => setStickers([])}
                      className="text-xs font-jua text-red-500 hover:text-red-700 cursor-pointer"
                    >
                      모두 지우기
                    </button>
                  </div>

                  <div className="flex flex-wrap gap-2 max-h-28 overflow-y-auto">
                    {stickers.map((s) => (
                      <div
                        key={s.id}
                        onClick={() => setSelectedStickerId(s.id)}
                        className={`px-3 py-1.5 rounded-xl border flex items-center gap-2 cursor-pointer transition ${
                          selectedStickerId === s.id
                            ? 'bg-amber-100 border-amber-500 ring-2 ring-amber-300'
                            : 'bg-stone-50 border-stone-200'
                        }`}
                      >
                        <span className="text-sm font-jua">{s.content}</span>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRemoveSticker(s.id);
                          }}
                          className="text-stone-400 hover:text-red-500"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Bottom Action Footer with Clear Prev / Next Buttons */}
          <div className="mt-8 pt-4 border-t border-stone-200 flex flex-wrap items-center justify-between gap-3">
            <button
              type="button"
              onClick={onBackToSelect}
              className="px-5 py-3 rounded-2xl bg-stone-100 hover:bg-stone-200 text-stone-700 font-jua text-base transition flex items-center gap-1.5 cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>3단계: 사진 다시 고르기</span>
            </button>

            <button
              type="button"
              onClick={handleFinish}
              className="px-8 py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 via-orange-400 to-amber-500 hover:from-amber-600 hover:to-orange-500 text-white font-jua text-xl shadow-xl hover:scale-105 active:scale-95 transition-all flex items-center gap-2 border-2 border-amber-300 cursor-pointer"
            >
              <span>5단계: 완성 및 인쇄하기</span>
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
