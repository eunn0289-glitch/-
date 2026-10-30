import React from 'react';
import { Camera, Volume2, VolumeX, Home, ChevronLeft, ChevronRight } from 'lucide-react';
import { playPopSound } from '../utils/sound';

export type StepType = 'ready' | 'capturing' | 'selecting' | 'customizing' | 'result';

interface NavbarProps {
  currentStep: StepType;
  onNavigateHome: () => void;
  onStepSelect: (step: StepType) => void;
  onPrevStep: () => void;
  onNextStep: () => void;
  canPrev: boolean;
  canNext: boolean;
  soundState: boolean;
  onToggleSound: () => void;
}

const STEPS: { key: StepType; label: string; num: string }[] = [
  { key: 'ready', label: '준비', num: '1' },
  { key: 'capturing', label: '5장 촬영', num: '2' },
  { key: 'selecting', label: '4장 선택', num: '3' },
  { key: 'customizing', label: '꾸미기', num: '4' },
  { key: 'result', label: '완성/인쇄', num: '5' },
];

export const Navbar: React.FC<NavbarProps> = ({
  currentStep,
  onNavigateHome,
  onStepSelect,
  onPrevStep,
  onNextStep,
  canPrev,
  canNext,
  soundState,
  onToggleSound,
}) => {
  return (
    <header className="w-full bg-white/95 backdrop-blur-md border-b-4 border-amber-200 sticky top-0 z-40 shadow-xs">
      <div className="max-w-6xl mx-auto px-3 sm:px-4 py-2.5 flex flex-wrap items-center justify-between gap-2">
        {/* Brand / Logo + Home Button */}
        <div className="flex items-center gap-2">
          <div
            onClick={onNavigateHome}
            title="홈 화면으로 돌아가기"
            className="flex items-center gap-2 cursor-pointer group select-none"
          >
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-400 to-orange-400 flex items-center justify-center text-white shadow-md transform group-hover:rotate-6 transition">
              <Camera className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-jua text-xl sm:text-2xl text-stone-900 tracking-tight">
                  우리반 네컷
                </span>
                <span className="text-[11px] font-jua px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
                  다산새봄유치원
                </span>
              </div>
            </div>
          </div>

          {/* Quick Home button */}
          <button
            type="button"
            onClick={() => {
              playPopSound();
              onNavigateHome();
            }}
            title="처음 화면(홈)으로 이동"
            className={`px-3 py-1.5 rounded-xl font-jua text-xs sm:text-sm flex items-center gap-1 transition cursor-pointer border ${
              currentStep === 'ready'
                ? 'bg-amber-100 border-amber-300 text-amber-900 font-bold'
                : 'bg-stone-100 hover:bg-stone-200 border-stone-200 text-stone-700'
            }`}
          >
            <Home className="w-3.5 h-3.5" />
            <span>홈으로</span>
          </button>
        </div>

        {/* Step Navigation & Prev / Next Controls */}
        <div className="flex items-center gap-1 sm:gap-2">
          {/* 이전 단계 버튼 */}
          <button
            type="button"
            disabled={!canPrev}
            onClick={() => {
              playPopSound();
              onPrevStep();
            }}
            title="이전 단계로 이동"
            className={`px-2.5 sm:px-3 py-1.5 rounded-xl font-jua text-xs sm:text-sm flex items-center gap-1 transition ${
              canPrev
                ? 'bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 cursor-pointer shadow-xs active:scale-95'
                : 'bg-stone-100 text-stone-300 border border-stone-200 cursor-not-allowed opacity-50'
            }`}
          >
            <ChevronLeft className="w-4 h-4" />
            <span>이전 단계</span>
          </button>

          {/* Clickable 1~5 Step Pills */}
          <div className="flex items-center gap-1 bg-amber-50 p-1 rounded-2xl border border-amber-200">
            {STEPS.map((step) => {
              const isActive = currentStep === step.key;
              return (
                <button
                  key={step.key}
                  type="button"
                  onClick={() => {
                    playPopSound();
                    onStepSelect(step.key);
                  }}
                  className={`text-xs font-jua px-2 sm:px-2.5 py-1 rounded-xl transition cursor-pointer flex items-center gap-1 ${
                    isActive
                      ? 'bg-amber-500 text-white shadow-xs font-bold scale-102 ring-2 ring-amber-300'
                      : 'text-stone-600 hover:bg-amber-100/70'
                  }`}
                >
                  <span className="w-4 h-4 rounded-full bg-black/10 flex items-center justify-center text-[10px]">
                    {step.num}
                  </span>
                  <span className="hidden md:inline">{step.label}</span>
                </button>
              );
            })}
          </div>

          {/* 다음 단계 버튼 */}
          <button
            type="button"
            disabled={!canNext}
            onClick={() => {
              playPopSound();
              onNextStep();
            }}
            title="다음 단계로 이동"
            className={`px-2.5 sm:px-3 py-1.5 rounded-xl font-jua text-xs sm:text-sm flex items-center gap-1 transition ${
              canNext
                ? 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shadow-sm cursor-pointer active:scale-95'
                : 'bg-stone-100 text-stone-300 border border-stone-200 cursor-not-allowed opacity-50'
            }`}
          >
            <span>다음 단계</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Right Controls: Sound Toggle */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              playPopSound();
              onToggleSound();
            }}
            title={soundState ? '효과음 끄기' : '효과음 켜기'}
            className="p-2 sm:px-3 sm:py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 transition flex items-center gap-1 text-xs font-jua cursor-pointer"
          >
            {soundState ? (
              <>
                <Volume2 className="w-4 h-4 text-amber-600" />
                <span className="hidden sm:inline">소리 켬</span>
              </>
            ) : (
              <>
                <VolumeX className="w-4 h-4 text-stone-400" />
                <span className="hidden sm:inline text-stone-500">소리 끔</span>
              </>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
