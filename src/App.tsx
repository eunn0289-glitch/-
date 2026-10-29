import React, { useState } from 'react';
import { Navbar, StepType } from './components/Navbar';
import { WelcomeHero } from './components/WelcomeHero';
import { CameraView } from './components/CameraView';
import { PhotoSelector } from './components/PhotoSelector';
import { FrameCustomizer } from './components/FrameCustomizer';
import { ResultView } from './components/ResultView';
import { CapturedPhoto, PhotoboothConfig, PlacedSticker } from './types';
import { isSoundEnabled, setSoundEnabled } from './utils/sound';
import { generateSamplePhotoDataUrl } from './utils/sampleGenerator';

export default function App() {
  const [step, setStep] = useState<StepType>('ready');
  const [soundActive, setSoundActive] = useState<boolean>(true);

  // Photoshoot data
  const [capturedPhotos, setCapturedPhotos] = useState<CapturedPhoto[]>([]);
  const [selectedPhotos, setSelectedPhotos] = useState<CapturedPhoto[]>([]);
  const [finalCanvas, setFinalCanvas] = useState<HTMLCanvasElement | null>(null);
  const [finalConfig, setFinalConfig] = useState<PhotoboothConfig | null>(null);

  // Toggle sound
  const handleToggleSound = () => {
    const newState = !soundActive;
    setSoundActive(newState);
    setSoundEnabled(newState);
  };

  // Start real shoot
  const handleStartShoot = () => {
    setCapturedPhotos([]);
    setSelectedPhotos([]);
    setStep('capturing');
  };

  // Sample mode direct load
  const handleSampleShoot = () => {
    const samples: CapturedPhoto[] = [];
    for (let i = 0; i < 5; i++) {
      samples.push({
        id: `sample-${i}-${Date.now()}`,
        dataUrl: generateSamplePhotoDataUrl(i),
        order: i + 1,
        timestamp: Date.now(),
      });
    }
    setCapturedPhotos(samples);
    setStep('selecting');
  };

  // When all 5 photos are taken in CameraView
  const handleAllPhotosCaptured = (photos: CapturedPhoto[]) => {
    setCapturedPhotos(photos);
    setStep('selecting');
  };

  // When 4 photos are chosen in PhotoSelector
  const handlePhotosSelected = (selected: CapturedPhoto[]) => {
    setSelectedPhotos(selected);
    setStep('customizing');
  };

  // When customization is finalized
  const handleFinishCustomization = (
    canvas: HTMLCanvasElement,
    config: PhotoboothConfig,
    _stickers: PlacedSticker[]
  ) => {
    setFinalCanvas(canvas);
    setFinalConfig(config);
    setStep('result');
  };

  // Restart
  const handleRestart = () => {
    if (step !== 'ready' && step !== 'result') {
      const confirmLeave = window.confirm('처음 화면으로 돌아갈까요? 촬영 중인 사진이 초기화됩니다.');
      if (!confirmLeave) return;
    }
    setCapturedPhotos([]);
    setSelectedPhotos([]);
    setFinalCanvas(null);
    setStep('ready');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 via-orange-50/30 to-amber-100/50 flex flex-col font-sans">
      {/* Top Navigation */}
      <Navbar
        currentStep={step}
        onNavigateHome={handleRestart}
        soundState={soundActive}
        onToggleSound={handleToggleSound}
      />

      {/* Main Container */}
      <main className="flex-1 w-full max-w-6xl mx-auto px-4 py-6 md:py-8 flex flex-col items-center justify-center">
        {step === 'ready' && (
          <WelcomeHero
            onStart={handleStartShoot}
            onSampleStart={handleSampleShoot}
          />
        )}

        {step === 'capturing' && (
          <CameraView
            onAllPhotosCaptured={handleAllPhotosCaptured}
            onCancel={handleRestart}
          />
        )}

        {step === 'selecting' && (
          <PhotoSelector
            capturedPhotos={capturedPhotos}
            onPhotosSelected={handlePhotosSelected}
            onRetake={() => setStep('capturing')}
          />
        )}

        {step === 'customizing' && (
          <FrameCustomizer
            selectedPhotos={selectedPhotos}
            onBackToSelect={() => setStep('selecting')}
            onFinish={handleFinishCustomization}
          />
        )}

        {step === 'result' && finalCanvas && finalConfig && (
          <ResultView
            canvas={finalCanvas}
            config={finalConfig}
            onRestart={() => setStep('ready')}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="w-full border-t border-amber-200 bg-white/70 py-4 text-center text-xs font-jua text-amber-900/60 print:hidden">
        우리들의 소중한 유치원 추억 📸 우리반 네컷 사진관 • 햇살반 새싹반 어린이 모두 함께해요!
      </footer>
    </div>
  );
}
