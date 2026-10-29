import React, { useRef, useEffect, useState, useCallback } from 'react';
import {
  Palette,
  Sparkles,
  Sliders,
  Type,
  Stamp,
  RotateCcw,
  ArrowRight,
  Trash2,
  Smile,
  Plus,
} from 'lucide-react';
import { CapturedPhoto, FrameTheme, LayoutMode, PhotoboothConfig, PlacedSticker, FilterType } from '../types';
import { FRAME_THEMES } from '../data/frames';
import { PHOTO_FILTERS, STICKER_ITEMS, StickerDef } from '../data/stickers';
import { renderPhotoboothToCanvas } from '../utils/canvasRenderer';
import { playPopSound } from '../utils/sound';

interface FrameCustomizerProps {
  selectedPhotos: CapturedPhoto[];
  onBackToSelect: () => void;
  onFinish: (canvas: HTMLCanvasElement, config: PhotoboothConfig, stickers: PlacedSticker[]) => void;
}

const CLASS_PRESETS = [
  '햇살유치원 햇살반 ☀️',
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

export const FrameCustomizer: React.FC<FrameCustomizerProps> = ({
  selectedPhotos,
  onBackToSelect,
  onFinish,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const previewContainerRef = useRef<HTMLDivElement>(null);

  // Configuration state
  const [config, setConfig] = useState<PhotoboothConfig>({
    className: '햇살유치원 햇살반 ☀️',
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

  // Placed stickers
  const [stickers, setStickers] = useState<PlacedSticker[]>([
    {
      id: 'default-stamp',
      content: '참 잘했어요! 💮',
      type: 'stamp',
      x: 50,
      y: 92,
      size: 42,
      rotation: -5,
    },
    {
      id: 'default-star',
      content: '✨',
      type: 'emoji',
      x: 88,
      y: 4,
      size: 38,
      rotation: 12,
    },
  ]);

  const [activeTab, setActiveTab] = useState<'frame' | 'filter' | 'text' | 'stickers'>('frame');
  const [activeStickerCat, setActiveStickerCat] = useState<'stamps' | 'props' | 'animals' | 'doodles'>('stamps');
  const [selectedStickerId, setSelectedStickerId] = useState<string | null>(null);

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

  // Add sticker
  const handleAddSticker = (item: StickerDef) => {
    playPopSound();
    const newSticker: PlacedSticker = {
      id: `sticker-${Date.now()}`,
      content: item.content,
      type: item.type,
      x: 50 + (Math.random() * 20 - 10),
      y: 50 + (Math.random() * 20 - 10),
      size: item.type === 'stamp' ? 44 : 48,
      rotation: Math.round(Math.random() * 20 - 10),
    };
    setStickers((prev) => [...prev, newSticker]);
    setSelectedStickerId(newSticker.id);
  };

  // Remove sticker
  const handleRemoveSticker = (id: string) => {
    playPopSound();
    setStickers((prev) => prev.filter((s) => s.id !== id));
    if (selectedStickerId === id) setSelectedStickerId(null);
  };

  // Dragging sticker on preview
  const handlePreviewClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!previewContainerRef.current) return;
    const rect = previewContainerRef.current.getBoundingClientRect();
    const clickX = ((e.clientX - rect.left) / rect.width) * 100;
    const clickY = ((e.clientY - rect.top) / rect.height) * 100;

    // Find clicked sticker or move selected
    if (selectedStickerId) {
      setStickers((prev) =>
        prev.map((s) =>
          s.id === selectedStickerId ? { ...s, x: Math.round(clickX), y: Math.round(clickY) } : s
        )
      );
    }
  };

  const handleFinish = () => {
    if (!canvasRef.current) return;
    onFinish(canvasRef.current, config, stickers);
  };

  return (
    <div className="w-full max-w-6xl mx-auto flex flex-col items-center">
      {/* Header */}
      <div className="w-full bg-white rounded-3xl p-4 md:p-6 shadow-md border-4 border-amber-200 mb-6 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-amber-100 text-amber-900 font-jua text-sm mb-2">
          <Palette className="w-4 h-4 text-amber-600" />
          <span>프레임과 스티커로 귀엽게 꾸며보세요!</span>
        </div>
        <h2 className="text-2xl md:text-3xl font-jua text-stone-800">
          우리반 맞춤 네컷 프레임 스튜디오
        </h2>
        <p className="text-stone-600 font-gaegu text-xl mt-1">
          좋아하는 프레임 테마, 반 이름, 예쁜 칭찬 스탬프를 콕콕 붙여봐요 ✨
        </p>
      </div>

      {/* Main 2-Column Studio: Left Preview, Right Controls */}
      <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Canvas Live Preview (5 columns on desktop) */}
        <div className="lg:col-span-5 flex flex-col items-center">
          <div className="w-full bg-amber-100/60 p-4 rounded-3xl border-2 border-amber-200 flex flex-col items-center">
            <div className="w-full flex items-center justify-between mb-3 px-2">
              <span className="font-jua text-amber-900 text-sm flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-amber-500" /> 실시간 네컷 미리보기
              </span>
              <span className="text-xs font-jua text-amber-700 bg-white px-2.5 py-1 rounded-full shadow-xs">
                {config.layout === 'strip-2' ? '1+1 나눔형' : config.layout === 'strip-1' ? '1컷 단독형' : '2x2 네모형'}
              </span>
            </div>

            {/* Canvas Container */}
            <div
              ref={previewContainerRef}
              onClick={handlePreviewClick}
              className="relative max-h-[640px] overflow-hidden rounded-2xl shadow-xl border-4 border-white cursor-crosshair bg-stone-100 flex items-center justify-center transition-all"
            >
              <canvas
                ref={canvasRef}
                className="max-h-[620px] w-auto object-contain block"
              />
            </div>

            <p className="text-xs font-gaegu text-amber-700 mt-2 text-center">
              💡 스티커를 선택한 뒤 미리보기를 클릭하면 원하는 위치로 쏙 이동해요!
            </p>
          </div>
        </div>

        {/* Right: Customization Controls (7 columns on desktop) */}
        <div className="lg:col-span-7 bg-white rounded-3xl p-5 md:p-6 shadow-md border-4 border-amber-200">
          {/* Navigation Tabs */}
          <div className="grid grid-cols-4 gap-2 p-1.5 bg-amber-50 rounded-2xl mb-6">
            <button
              type="button"
              onClick={() => setActiveTab('frame')}
              className={`py-2.5 px-2 rounded-xl font-jua text-sm md:text-base flex items-center justify-center gap-1.5 transition ${
                activeTab === 'frame'
                  ? 'bg-amber-400 text-amber-950 shadow-md font-bold'
                  : 'text-stone-600 hover:bg-amber-100/60'
              }`}
            >
              <Palette className="w-4 h-4" />
              <span>프레임 테마</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('filter')}
              className={`py-2.5 px-2 rounded-xl font-jua text-sm md:text-base flex items-center justify-center gap-1.5 transition ${
                activeTab === 'filter'
                  ? 'bg-amber-400 text-amber-950 shadow-md font-bold'
                  : 'text-stone-600 hover:bg-amber-100/60'
              }`}
            >
              <Sliders className="w-4 h-4" />
              <span>사진 필터</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('text')}
              className={`py-2.5 px-2 rounded-xl font-jua text-sm md:text-base flex items-center justify-center gap-1.5 transition ${
                activeTab === 'text'
                  ? 'bg-amber-400 text-amber-950 shadow-md font-bold'
                  : 'text-stone-600 hover:bg-amber-100/60'
              }`}
            >
              <Type className="w-4 h-4" />
              <span>문구 & 날짜</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('stickers')}
              className={`py-2.5 px-2 rounded-xl font-jua text-sm md:text-base flex items-center justify-center gap-1.5 transition ${
                activeTab === 'stickers'
                  ? 'bg-amber-400 text-amber-950 shadow-md font-bold'
                  : 'text-stone-600 hover:bg-amber-100/60'
              }`}
            >
              <Stamp className="w-4 h-4" />
              <span>스티커/도장</span>
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
                    className={`p-3 rounded-2xl border-2 text-center transition ${
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
                    className={`p-3 rounded-2xl border-2 text-center transition ${
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
                    className={`p-3 rounded-2xl border-2 text-center transition ${
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
                  유치원 귀여운 테마 선택 (8가지)
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
                        className={`p-3 rounded-2xl border-3 flex flex-col items-center justify-center text-center transition transform hover:scale-105 active:scale-95 shadow-sm ${
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
                      className={`p-4 rounded-2xl border-2 text-left flex items-center justify-between transition ${
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
                <label className="block font-jua text-stone-700 text-sm mb-1">
                  유치원 / 어린이집 및 우리반 이름
                </label>
                <input
                  type="text"
                  value={config.className}
                  maxLength={25}
                  onChange={(e) => setConfig((c) => ({ ...c, className: e.target.value }))}
                  placeholder="예: 햇살유치원 햇살반 ☀️"
                  className="w-full px-4 py-2.5 rounded-xl border-2 border-amber-200 focus:border-amber-500 focus:outline-none font-jua text-stone-800 text-lg"
                />
                {/* Preset Chips */}
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {CLASS_PRESETS.map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setConfig((c) => ({ ...c, className: preset }))}
                      className="px-2.5 py-1 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-900 font-jua text-xs border border-amber-200 transition"
                    >
                      {preset}
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom Message */}
              <div>
                <label className="block font-jua text-stone-700 text-sm mb-1">
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
                      className="px-2.5 py-1 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-900 font-gaegu text-sm border border-amber-200 transition"
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

          {/* TAB 4: STICKERS & STAMPS */}
          {activeTab === 'stickers' && (
            <div className="space-y-4">
              {/* Category selector */}
              <div className="flex gap-2 border-b border-stone-200 pb-2">
                {(['stamps', 'props', 'animals', 'doodles'] as const).map((cat) => {
                  const labels = {
                    stamps: '💮 칭찬 스탬프',
                    props: '🥳 파티 소품',
                    animals: '🐥 동물 친구들',
                    doodles: '💖 귀여운 스티커',
                  };
                  return (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setActiveStickerCat(cat)}
                      className={`px-3 py-1.5 rounded-xl font-jua text-xs md:text-sm transition ${
                        activeStickerCat === cat
                          ? 'bg-amber-500 text-white shadow-xs'
                          : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                      }`}
                    >
                      {labels[cat]}
                    </button>
                  );
                })}
              </div>

              {/* Sticker Grid Items to Add */}
              <div className="grid grid-cols-4 sm:grid-cols-6 gap-2.5 max-h-56 overflow-y-auto p-1">
                {STICKER_ITEMS.filter((s) => s.category === activeStickerCat).map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleAddSticker(item)}
                    className="p-2.5 rounded-xl border border-amber-200 hover:border-amber-400 bg-amber-50/50 hover:bg-amber-100/80 flex flex-col items-center justify-center transition transform hover:scale-110 active:scale-95"
                  >
                    {item.type === 'stamp' ? (
                      <span className="text-xs font-jua text-rose-600 bg-rose-50 px-2 py-1 rounded-md border border-rose-300 line-clamp-1">
                        {item.content}
                      </span>
                    ) : (
                      <span className="text-3xl">{item.content}</span>
                    )}
                    <span className="text-[11px] font-gaegu text-stone-600 mt-1 line-clamp-1">
                      {item.name}
                    </span>
                  </button>
                ))}
              </div>

              {/* Active Placed Stickers Controls */}
              {stickers.length > 0 && (
                <div className="mt-4 pt-4 border-t border-stone-200">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-jua text-sm text-stone-700">
                      붙인 스티커 목록 ({stickers.length}개)
                    </span>
                    <button
                      type="button"
                      onClick={() => setStickers([])}
                      className="text-xs font-jua text-red-500 hover:text-red-700"
                    >
                      모두 지우기
                    </button>
                  </div>

                  <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
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
                        <span className="text-base">{s.content}</span>
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

          {/* Bottom Action Footer */}
          <div className="mt-8 pt-4 border-t border-stone-200 flex flex-wrap items-center justify-between gap-4">
            <button
              type="button"
              onClick={onBackToSelect}
              className="px-5 py-3 rounded-2xl bg-stone-100 hover:bg-stone-200 text-stone-700 font-jua text-base transition flex items-center gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              <span>사진 다시 고르기</span>
            </button>

            <button
              type="button"
              onClick={handleFinish}
              className="px-8 py-4 rounded-3xl bg-gradient-to-r from-amber-500 via-orange-400 to-amber-500 hover:from-amber-600 hover:to-orange-500 text-white font-jua text-xl md:text-2xl shadow-xl hover:shadow-2xl hover:scale-105 active:scale-95 transition-all flex items-center gap-3 border-4 border-amber-300 cursor-pointer"
            >
              <span>완성하고 인쇄 / 저장하기! ✨</span>
              <ArrowRight className="w-6 h-6" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
