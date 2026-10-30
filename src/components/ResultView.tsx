import React, { useEffect, useState } from 'react';
import { Download, Printer, Copy, RotateCcw, Sparkles, Heart, Check, Share2 } from 'lucide-react';
import confetti from 'canvas-confetti';
import { PhotoboothConfig } from '../types';
import { playVictoryChime, playPopSound } from '../utils/sound';

interface ResultViewProps {
  canvas: HTMLCanvasElement;
  config: PhotoboothConfig;
  onRestart: () => void;
}

export const ResultView: React.FC<ResultViewProps> = ({ canvas, config, onRestart }) => {
  const [dataUrl, setDataUrl] = useState<string>('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    try {
      const url = canvas.toDataURL('image/png', 1.0);
      setDataUrl(url);

      // Trigger celebratory confetti!
      playVictoryChime();
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#F59E0B', '#10B981', '#EC4899', '#3B82F6', '#8B5CF6'],
      });
    } catch (e) {
      console.error('Failed to export canvas data url', e);
    }
  }, [canvas]);

  // Download high-resolution PNG
  const handleDownload = () => {
    playPopSound();
    const link = document.createElement('a');
    const safeName = (config.className || '우리반_네컷').replace(/\s+/g, '_');
    link.download = `${safeName}_${Date.now()}.png`;
    link.href = dataUrl;
    link.click();
  };

  // Print formatted photo strip
  const handlePrint = () => {
    playPopSound();
    window.print();
  };

  // Copy image to clipboard
  const handleCopy = async () => {
    playPopSound();
    try {
      canvas.toBlob(async (blob) => {
        if (!blob) return;
        try {
          await navigator.clipboard.write([
            new ClipboardItem({ 'image/png': blob }),
          ]);
          setCopied(true);
          setTimeout(() => setCopied(false), 2500);
        } catch (err) {
          console.warn('Clipboard write failed:', err);
        }
      });
    } catch {
      // Fallback
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col items-center">
      {/* Top Celebration Card */}
      <div className="w-full bg-white rounded-3xl p-6 shadow-md border-4 border-amber-200 mb-6 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-100 text-amber-900 font-jua text-sm mb-2">
          <Sparkles className="w-4 h-4 text-amber-500 animate-spin" />
          <span>와아! 세상에 단 하나뿐인 우리반 네컷 완성! 🎉</span>
        </div>
        <h2 className="text-3xl md:text-4xl font-jua text-stone-800">
          소중하고 예쁜 추억이 완성되었어요 💖
        </h2>
        <p className="text-stone-600 font-gaegu text-xl mt-1">
          컴퓨터나 스마트폰에 사진으로 저장하고, 프린터로 바로 인쇄할 수 있어요!
        </p>
      </div>

      {/* Main Result Card */}
      <div className="w-full bg-amber-100/50 rounded-3xl p-6 border-2 border-amber-200 flex flex-col items-center mb-8 shadow-sm">
        {/* Printable Section */}
        <div className={`relative ${config.layout === 'grid-2x2' ? 'max-w-md sm:max-w-lg' : 'max-w-sm sm:max-w-md'} my-4 p-3 bg-white rounded-3xl shadow-2xl border-4 border-amber-300`}>
          <img
            id="printable-photo-strip"
            src={dataUrl}
            alt="완성된 우리반 네컷"
            className="w-full h-auto object-contain rounded-2xl block"
          />
        </div>

        {/* Kindergarten Teacher Tips */}
        <div className="max-w-lg w-full bg-white/90 p-4 rounded-2xl border border-amber-200 text-stone-700 text-sm font-sans mb-4 shadow-xs">
          <div className="flex items-center gap-2 font-jua text-amber-800 mb-1">
            <Heart className="w-4 h-4 text-rose-500 fill-rose-500" />
            <span>선생님 & 학부모님을 위한 활용 팁</span>
          </div>
          <p className="font-gaegu text-lg text-stone-600">
            • <b>1+1 트윈컷</b>은 가운데 점선을 가위로 오려 친구와 한 장씩 나눠 가지면 좋아요!<br />
            • 유치원 알림장, 졸업 앨범, 냉장고 자석 액자에 쏙 넣기 좋은 크기입니다 ✨
          </p>
        </div>

        {/* Buttons Row */}
        <div className="flex flex-wrap items-center justify-center gap-3 w-full">
          <button
            type="button"
            onClick={handleDownload}
            className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-jua text-lg shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 transition-all flex items-center gap-2 border-2 border-amber-200 cursor-pointer"
          >
            <Download className="w-5 h-5" />
            <span>고화질 사진 저장하기 (PNG)</span>
          </button>

          <button
            type="button"
            onClick={handlePrint}
            className="px-6 py-3.5 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white font-jua text-lg shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 transition-all flex items-center gap-2 border-2 border-emerald-300 cursor-pointer"
          >
            <Printer className="w-5 h-5" />
            <span>바로 인쇄하기 🖨️</span>
          </button>

          <button
            type="button"
            onClick={handleCopy}
            className="px-5 py-3.5 rounded-2xl bg-stone-100 hover:bg-stone-200 text-stone-800 font-jua text-base transition flex items-center gap-2 border border-stone-300"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-emerald-600" />
                <span className="text-emerald-700">복사 완료!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                <span>클립보드 복사</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Start Over Action */}
      <button
        type="button"
        onClick={onRestart}
        className="px-8 py-4 rounded-3xl bg-stone-200 hover:bg-stone-300 text-stone-800 font-jua text-xl transition flex items-center gap-2 hover:scale-102"
      >
        <RotateCcw className="w-5 h-5" />
        <span>다른 친구도 사진 찍기 (처음으로)</span>
      </button>
    </div>
  );
};
