import React from 'react';
import { Camera, Volume2, VolumeX, Sparkles, Home } from 'lucide-react';
import { isSoundEnabled, setSoundEnabled, playPopSound } from '../utils/sound';

export type StepType = 'ready' | 'capturing' | 'selecting' | 'customizing' | 'result';

interface NavbarProps {
  currentStep: StepType;
  onNavigateHome: () => void;
  soundState: boolean;
  onToggleSound: () => void;
}

const STEPS = [
  { key: 'ready', label: '1. 준비' },
  { key: 'capturing', label: '2. 5장 촬영 (3-2-1)' },
  { key: 'selecting', label: '3. 4장 선택' },
  { key: 'customizing', label: '4. 프레임 꾸미기' },
  { key: 'result', label: '5. 완성/인쇄' },
];

export const Navbar: React.FC<NavbarProps> = ({
  currentStep,
  onNavigateHome,
  soundState,
  onToggleSound,
}) => {
  return (
    <header className="w-full bg-white/90 backdrop-blur-md border-b-4 border-amber-200 sticky top-0 z-40 shadow-xs">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        {/* Brand / Logo */}
        <div
          onClick={onNavigateHome}
          className="flex items-center gap-2.5 cursor-pointer group select-none"
        >
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-400 to-orange-400 flex items-center justify-center text-white shadow-md transform group-hover:rotate-6 transition">
            <Camera className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-jua text-2xl text-stone-900 tracking-tight">우리반 네컷</span>
              <span className="text-xs font-jua px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
                유치원 사진관
              </span>
            </div>
            <p className="text-[11px] font-gaegu text-stone-500 leading-none">
              3-2-1 찰칵! 5장 찍고 예쁜 4장 고르기
            </p>
          </div>
        </div>

        {/* Step Indicator on Tablet / Desktop */}
        <div className="hidden md:flex items-center gap-1 bg-amber-50 px-3 py-1.5 rounded-full border border-amber-200">
          {STEPS.map((step, idx) => {
            const isActive = currentStep === step.key;
            return (
              <React.Fragment key={step.key}>
                <span
                  className={`text-xs font-jua px-2.5 py-1 rounded-full transition ${
                    isActive
                      ? 'bg-amber-500 text-white shadow-xs font-bold'
                      : 'text-stone-500'
                  }`}
                >
                  {step.label}
                </span>
                {idx < STEPS.length - 1 && (
                  <span className="text-stone-300 text-xs">›</span>
                )}
              </React.Fragment>
            );
          })}
        </div>

        {/* Right Controls: Sound Toggle & Home */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              playPopSound();
              onToggleSound();
            }}
            title={soundState ? '효과음 끄기' : '효과음 켜기'}
            className="p-2.5 rounded-2xl bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 transition flex items-center gap-1 text-xs font-jua"
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

          {currentStep !== 'ready' && (
            <button
              type="button"
              onClick={onNavigateHome}
              title="처음으로"
              className="p-2.5 rounded-2xl bg-stone-100 hover:bg-stone-200 text-stone-700 transition"
            >
              <Home className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
