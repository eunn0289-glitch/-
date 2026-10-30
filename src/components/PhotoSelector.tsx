import React, { useState } from 'react';
import { Check, ZoomIn, ArrowRight, RotateCcw, Sparkles, Heart } from 'lucide-react';
import { CapturedPhoto } from '../types';
import { playPopSound } from '../utils/sound';

interface PhotoSelectorProps {
  capturedPhotos: CapturedPhoto[];
  onPhotosSelected: (selected: CapturedPhoto[]) => void;
  onRetake: () => void;
}

export const PhotoSelector: React.FC<PhotoSelectorProps> = ({
  capturedPhotos,
  onPhotosSelected,
  onRetake,
}) => {
  // Store the IDs of the 4 selected photos in order
  const [selectedIds, setSelectedIds] = useState<string[]>(() => {
    // By default, pre-select the first 4 photos
    return capturedPhotos.slice(0, 4).map((p) => p.id);
  });

  const [previewPhoto, setPreviewPhoto] = useState<CapturedPhoto | null>(null);

  // Toggle selection
  const handleToggleSelect = (photoId: string) => {
    playPopSound();
    setSelectedIds((prev) => {
      if (prev.includes(photoId)) {
        // Deselect
        return prev.filter((id) => id !== photoId);
      } else {
        if (prev.length >= 4) {
          // If already 4, replace the last one or prompt
          return [...prev.slice(0, 3), photoId];
        }
        return [...prev, photoId];
      }
    });
  };

  // Re-order selected items (move earlier/later)
  const handleMoveOrder = (index: number, direction: 'up' | 'down') => {
    playPopSound();
    setSelectedIds((prev) => {
      const targetIndex = direction === 'up' ? index - 1 : index + 1;
      if (targetIndex < 0 || targetIndex >= prev.length) return prev;
      const copy = [...prev];
      const temp = copy[index];
      copy[index] = copy[targetIndex];
      copy[targetIndex] = temp;
      return copy;
    });
  };

  const isComplete = selectedIds.length === 4;

  const handleConfirm = () => {
    if (!isComplete) return;
    const selectedPhotos = selectedIds
      .map((id) => capturedPhotos.find((p) => p.id === id))
      .filter((p): p is CapturedPhoto => Boolean(p));
    onPhotosSelected(selectedPhotos);
  };

  return (
    <div className="w-full max-w-5xl mx-auto flex flex-col items-center">
      {/* Header Guidance */}
      <div className="w-full bg-white rounded-3xl p-5 md:p-6 shadow-md border-4 border-amber-200 mb-6 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-amber-100 text-amber-900 font-jua text-sm mb-2">
          <Heart className="w-4 h-4 text-rose-500 fill-rose-500" />
          <span>5장 중 가장 예쁘고 신난 사진 4장을 골라주세요!</span>
        </div>
        <h2 className="text-2xl md:text-3xl font-jua text-stone-800">
          우리반 베스트 4컷 사진 고르기 ({selectedIds.length} / 4장 선택됨)
        </h2>
        <p className="text-stone-600 font-gaegu text-xl mt-1">
          사진을 클릭하면 선택되거나 해제돼요. 번호 순서대로 네컷에 쏙 들어가요! ✨
        </p>
      </div>

      {/* 5 Photos Gallery Grid */}
      <div className="w-full grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 md:gap-5 mb-8">
        {capturedPhotos.map((photo, index) => {
          const selectionIndex = selectedIds.indexOf(photo.id);
          const isSelected = selectionIndex !== -1;

          return (
            <div
              key={photo.id}
              onClick={() => handleToggleSelect(photo.id)}
              className={`group relative rounded-2xl overflow-hidden cursor-pointer transition-all duration-200 transform ${
                isSelected
                  ? 'ring-6 ring-amber-400 shadow-xl scale-[1.02] bg-amber-50'
                  : 'opacity-70 hover:opacity-100 hover:scale-[1.01] bg-stone-100 shadow'
              }`}
            >
              {/* Aspect box */}
              <div className="relative aspect-[4/3] w-full overflow-hidden bg-stone-800">
                <img
                  src={photo.dataUrl}
                  alt={`촬영 사진 ${index + 1}`}
                  className="w-full h-full object-cover"
                />

                {/* Shot tag */}
                <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded-md bg-black/60 text-white font-jua text-xs">
                  {index + 1}번 컷
                </div>

                {/* Zoom button */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setPreviewPhoto(photo);
                  }}
                  title="크게 보기"
                  className="absolute top-2 right-2 p-1.5 rounded-full bg-black/50 hover:bg-black/70 text-white backdrop-blur-xs transition"
                >
                  <ZoomIn className="w-4 h-4" />
                </button>
              </div>

              {/* Selection Badge Header */}
              <div className="p-3 bg-white flex items-center justify-between">
                {isSelected ? (
                  <div className="flex items-center gap-1.5">
                    <div className="w-7 h-7 rounded-full bg-amber-500 text-white font-jua flex items-center justify-center text-sm shadow">
                      {selectionIndex + 1}
                    </div>
                    <span className="font-jua text-amber-800 text-sm">
                      {selectionIndex + 1}번째 컷
                    </span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5 text-stone-400">
                    <div className="w-7 h-7 rounded-full border-2 border-stone-300 flex items-center justify-center text-sm">
                      +
                    </div>
                    <span className="font-jua text-xs">선택하기</span>
                  </div>
                )}

                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center border-2 transition ${
                    isSelected
                      ? 'bg-emerald-500 border-emerald-500 text-white'
                      : 'border-stone-300'
                  }`}
                >
                  {isSelected && <Check className="w-4 h-4" />}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Selected Order Strip Preview */}
      <div className="w-full bg-white rounded-3xl p-5 border-2 border-amber-200 shadow-sm mb-8">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-500" />
            <h3 className="font-jua text-lg text-stone-800">
              네컷에 들어갈 사진 순서 (위에서부터 아래로)
            </h3>
          </div>
          <span className="text-sm font-jua text-amber-700 bg-amber-100 px-3 py-1 rounded-full">
            {selectedIds.length === 4 ? '4장 선택 완료! 🎉' : `${4 - selectedIds.length}장 더 골라주세요`}
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[0, 1, 2, 3].map((slotIdx) => {
            const photoId = selectedIds[slotIdx];
            const photo = capturedPhotos.find((p) => p.id === photoId);

            return (
              <div
                key={slotIdx}
                className="relative rounded-2xl border-2 border-dashed border-amber-300 p-2 flex flex-col items-center bg-amber-50/50 min-h-[140px] justify-center"
              >
                {photo ? (
                  <div className="w-full flex flex-col items-center">
                    <div className="relative w-full aspect-[4/3] rounded-xl overflow-hidden shadow-sm mb-2">
                      <img
                        src={photo.dataUrl}
                        alt={`선택된 컷 ${slotIdx + 1}`}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-1 left-1 w-6 h-6 rounded-full bg-amber-500 text-white font-jua text-xs flex items-center justify-center shadow">
                        {slotIdx + 1}
                      </div>
                    </div>
                    {/* Order adjustment buttons */}
                    <div className="flex gap-1 w-full justify-center">
                      <button
                        type="button"
                        disabled={slotIdx === 0}
                        onClick={() => handleMoveOrder(slotIdx, 'up')}
                        className="text-xs px-2 py-0.5 rounded bg-white hover:bg-stone-100 disabled:opacity-30 font-jua border border-stone-200"
                      >
                        ◀ 앞으로
                      </button>
                      <button
                        type="button"
                        disabled={slotIdx === selectedIds.length - 1}
                        onClick={() => handleMoveOrder(slotIdx, 'down')}
                        className="text-xs px-2 py-0.5 rounded bg-white hover:bg-stone-100 disabled:opacity-30 font-jua border border-stone-200"
                      >
                        뒤로 ▶
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center text-stone-400 p-4">
                    <div className="w-8 h-8 rounded-full border-2 border-dashed border-stone-300 mx-auto flex items-center justify-center font-jua mb-1">
                      {slotIdx + 1}
                    </div>
                    <span className="font-jua text-xs">사진을 골라주세요</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap items-center justify-between w-full gap-4">
        <button
          type="button"
          onClick={onRetake}
          className="px-6 py-3.5 rounded-2xl bg-stone-200 hover:bg-stone-300 text-stone-700 font-jua text-lg transition flex items-center gap-2 cursor-pointer"
        >
          <RotateCcw className="w-5 h-5" />
          <span>이전 단계 (다시 촬영하기)</span>
        </button>

        <button
          type="button"
          disabled={!isComplete}
          onClick={handleConfirm}
          className={`px-8 py-4 rounded-3xl font-jua text-xl md:text-2xl shadow-xl transition-all flex items-center gap-3 border-4 ${
            isComplete
              ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white border-amber-300 hover:scale-105 active:scale-95 cursor-pointer'
              : 'bg-stone-300 text-stone-500 border-stone-200 cursor-not-allowed'
          }`}
        >
          <span>다음 단계 (프레임 꾸미기) 🎨</span>
          <ArrowRight className="w-6 h-6" />
        </button>
      </div>

      {/* Enlarged Photo Modal */}
      {previewPhoto && (
        <div
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 backdrop-blur-xs"
          onClick={() => setPreviewPhoto(null)}
        >
          <div
            className="relative max-w-3xl w-full bg-white rounded-3xl p-4 overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={previewPhoto.dataUrl}
              alt="크게 보기"
              className="w-full rounded-2xl aspect-[4/3] object-cover"
            />
            <div className="mt-4 flex items-center justify-between">
              <span className="font-jua text-lg text-stone-700">
                {previewPhoto.order}번째 촬영 사진
              </span>
              <button
                type="button"
                onClick={() => setPreviewPhoto(null)}
                className="px-5 py-2 rounded-xl bg-amber-500 text-white font-jua hover:bg-amber-600 transition"
              >
                닫기
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
