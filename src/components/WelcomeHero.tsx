import React from 'react';
import { Camera, Sparkles, Heart, CheckCircle, Palette, Printer, ArrowRight, Images } from 'lucide-react';
import { playPopSound } from '../utils/sound';

interface WelcomeHeroProps {
  onStart: () => void;
  onSampleStart: () => void;
}

export const WelcomeHero: React.FC<WelcomeHeroProps> = ({ onStart, onSampleStart }) => {
  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col items-center">
      {/* Hero Mascot Banner */}
      <div className="relative w-full bg-gradient-to-b from-amber-200 via-amber-100 to-white rounded-3xl p-8 sm:p-12 md:py-14 border-4 border-amber-300 shadow-xl text-center overflow-hidden mb-8">
        {/* Floating background decorative emojis */}
        <div className="absolute top-4 left-6 text-4xl sm:text-5xl opacity-30 select-none animate-bounce-subtle">
          🐥
        </div>
        <div className="absolute top-5 right-8 text-4xl sm:text-5xl opacity-30 select-none animate-bounce-subtle">
          🧸
        </div>
        <div className="absolute bottom-6 left-10 text-3xl sm:text-4xl opacity-25 select-none">🌈</div>
        <div className="absolute bottom-6 right-10 text-4xl sm:text-5xl opacity-30 select-none">🌸</div>

        {/* Main Title */}
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-jua text-stone-900 tracking-tight leading-snug mb-4 sm:mb-5">
          우리들의 행복한 순간, <br />
          <span className="text-amber-600 underline decoration-wavy decoration-amber-400">
            우리반 네컷 사진관
          </span> 📸
        </h1>

        <p className="text-xl sm:text-2xl md:text-3xl font-gaegu text-stone-700 max-w-2xl mx-auto mb-8 sm:mb-10 leading-relaxed">
          3, 2, 1 카운트다운과 함께 신나게 5장의 사진을 찍고, <br className="hidden sm:inline" />
          가장 마음에 드는 4장을 골라 귀여운 프레임과 스티커로 꾸며보세요!
        </p>

        {/* Start Button */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            type="button"
            onClick={() => {
              playPopSound();
              onStart();
            }}
            className="w-full sm:w-auto px-10 py-5 rounded-3xl bg-gradient-to-r from-amber-500 via-orange-400 to-amber-500 hover:from-amber-600 hover:to-orange-500 text-white font-jua text-2xl sm:text-3xl shadow-xl hover:shadow-2xl hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-3 border-4 border-amber-200 cursor-pointer"
          >
            <Camera className="w-8 h-8" />
            <span>사진 찍으러 들어가기! 🚀</span>
          </button>

          <button
            type="button"
            onClick={() => {
              playPopSound();
              onSampleStart();
            }}
            className="w-full sm:w-auto px-7 py-4.5 rounded-2xl bg-white hover:bg-stone-50 text-stone-700 font-jua text-lg sm:text-xl border-2 border-amber-300 shadow-md transition flex items-center justify-center gap-2 hover:scale-102 cursor-pointer"
          >
            <Sparkles className="w-5 h-5 text-amber-500" />
            <span>샘플 사진으로 미리 체험</span>
          </button>
        </div>
      </div>

      {/* 4 Simple Steps Card */}
      <div className="w-full bg-white rounded-3xl p-6 md:p-8 border-4 border-amber-200 shadow-md mb-8">
        <h3 className="font-jua text-2xl text-stone-800 text-center mb-6">
          🌟 우리반 네컷은 이렇게 찍어요!
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 rounded-2xl bg-amber-50 border-2 border-amber-200 flex flex-col items-center text-center">
            <div className="w-12 h-12 rounded-2xl bg-amber-400 text-white flex items-center justify-center text-2xl shadow-sm mb-3">
              <Camera className="w-6 h-6" />
            </div>
            <h4 className="font-jua text-lg text-amber-900 mb-1">카운트다운 찰칵!</h4>
            <p className="font-gaegu text-base text-stone-600">
              3초 카운트다운 후 총 5장의 예쁜 포즈를 촬영해요.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-emerald-50 border-2 border-emerald-200 flex flex-col items-center text-center">
            <div className="w-12 h-12 rounded-2xl bg-emerald-400 text-white flex items-center justify-center text-2xl shadow-sm mb-3">
              <Images className="w-6 h-6" />
            </div>
            <h4 className="font-jua text-lg text-emerald-900 mb-1">베스트 4장 선택</h4>
            <p className="font-gaegu text-base text-stone-600">
              5장 중 가장 활짝 웃은 4장을 콕콕 골라요.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-pink-50 border-2 border-pink-200 flex flex-col items-center text-center">
            <div className="w-12 h-12 rounded-2xl bg-pink-400 text-white flex items-center justify-center text-2xl shadow-sm mb-3">
              <Palette className="w-6 h-6" />
            </div>
            <h4 className="font-jua text-lg text-pink-900 mb-1">프레임 & 스티커</h4>
            <p className="font-gaegu text-base text-stone-600">
              병아리, 곰돌이, 무지개 테마와 칭찬 스탬프를 콩콩!
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-blue-50 border-2 border-blue-200 flex flex-col items-center text-center">
            <div className="w-12 h-12 rounded-2xl bg-blue-400 text-white flex items-center justify-center text-2xl shadow-sm mb-3">
              <Printer className="w-6 h-6" />
            </div>
            <h4 className="font-jua text-lg text-blue-900 mb-1">저장 & 인쇄</h4>
            <p className="font-gaegu text-base text-stone-600">
              1+1 트윈컷으로 인쇄해서 친구와 사이좋게 나눠요!
            </p>
          </div>
        </div>
      </div>

      {/* Feature Badges for Teachers */}
      <div className="w-full flex flex-wrap items-center justify-center gap-4 text-stone-600 font-jua text-sm">
        <span className="flex items-center gap-1.5 bg-amber-100/70 px-4 py-2 rounded-full">
          <CheckCircle className="w-4 h-4 text-emerald-600" /> WebRTC 웹캠 즉시 촬영
        </span>
        <span className="flex items-center gap-1.5 bg-amber-100/70 px-4 py-2 rounded-full">
          <CheckCircle className="w-4 h-4 text-emerald-600" /> 귀여운 8종 테마 프레임
        </span>
        <span className="flex items-center gap-1.5 bg-amber-100/70 px-4 py-2 rounded-full">
          <CheckCircle className="w-4 h-4 text-emerald-600" /> 참 잘했어요! 유치원 도장
        </span>
        <span className="flex items-center gap-1.5 bg-amber-100/70 px-4 py-2 rounded-full">
          <CheckCircle className="w-4 h-4 text-emerald-600" /> 고화질 300DPI 인쇄 지원
        </span>
      </div>
    </div>
  );
};
