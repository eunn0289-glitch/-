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

  // Helper to ensure 5 photos exist when jumping to later steps
  const ensurePhotosExist = (): CapturedPhoto[] => {
    if (capturedPhotos.length >= 5) return capturedPhotos;
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
    return samples;
  };

  // Helper to ensure 4 selected photos exist
  const ensureSelectedExist = (): CapturedPhoto[] => {
    if (selectedPhotos.length === 4) return selectedPhotos;
    const pool = ensurePhotosExist();
    const sel = pool.slice(0, 4);
    setSelectedPhotos(sel);
    return sel;
  };

  // Start real shoot
  const handleStartShoot = () => {
    setCapturedPhotos([]);
    setSelectedPhotos([]);
    setStep('capturing');
  };

  // Sample mode direct load
  const handleSampleShoot = () => {
    const samples = ensurePhotosExist();
    setSelectedPhotos(samples.slice(0, 4));
    setStep('selecting');
  };

  // When all 5 photos are taken in CameraView
  const handleAllPhotosCaptured = (photos: CapturedPhoto[]) => {
    setCapturedPhotos(photos);
    setSelectedPhotos(photos.slice(0, 4));
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

  // Home Navigation
  const handleNavigateHome = () => {
    setStep('ready');
  };

  // Step Select Handler (Direct jump to 1-5)
  const handleStepSelect = (targetStep: StepType) => {
    if (targetStep === 'ready') {
      setStep('ready');
    } else if (targetStep === 'capturing') {
      setStep('capturing');
    } else if (targetStep === 'selecting') {
      ensurePhotosExist();
      setStep('selecting');
    } else if (targetStep === 'customizing') {
      ensureSelectedExist();
      setStep('customizing');
    } else if (targetStep === 'result') {
      if (finalCanvas && finalConfig) {
        setStep('result');
      } else {
        ensureSelectedExist();
        setStep('customizing');
      }
    }
  };

  // Prev Step Handler
  const handlePrevStep = () => {
    if (step === 'result') setStep('customizing');
    else if (step === 'customizing') setStep('selecting');
    else if (step === 'selecting') setStep('capturing');
    else if (step === 'capturing') setStep('ready');
  };

  // Next Step Handler
  const handleNextStep = () => {
    if (step === 'ready') {
      setStep('capturing');
    } else if (step === 'capturing') {
      ensurePhotosExist();
      setStep('selecting');
    } else if (step === 'selecting') {
      ensureSelectedExist();
      setStep('customizing');
    } else if (step === 'customizing') {
      // If ready to see result
      if (finalCanvas && finalConfig) {
        setStep('result');
      }
    }
  };

  const canPrev = step !== 'ready';
  const canNext = step !== 'result' && (step !== 'customizing' || Boolean(finalCanvas));

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 via-orange-50/30 to-amber-100/50 flex flex-col font-sans">
      {/* Top Navigation */}
      <Navbar
        currentStep={step}
        onNavigateHome={handleNavigateHome}
        onStepSelect={handleStepSelect}
        onPrevStep={handlePrevStep}
        onNextStep={handleNextStep}
        canPrev={canPrev}
        canNext={canNext}
        soundState={soundActive}
        onToggleSound={handleToggleSound}
      />

      {/* Main Container */}
      <main className="flex-1 w-full max-w-6xl mx-auto px-2.5 sm:px-4 py-3 sm:py-6 md:py-8 flex flex-col items-center justify-center overflow-x-hidden">
        {step === 'ready' && (
          <WelcomeHero
            onStart={handleStartShoot}
            onSampleStart={handleSampleShoot}
          />
        )}

        {step === 'capturing' && (
          <CameraView
            onAllPhotosCaptured={handleAllPhotosCaptured}
            onCancel={handleNavigateHome}
          />
        )}

        {step === 'selecting' && (
          <PhotoSelector
            capturedPhotos={capturedPhotos.length >= 4 ? capturedPhotos : ensurePhotosExist()}
            onPhotosSelected={handlePhotosSelected}
            onRetake={() => setStep('capturing')}
          />
        )}

        {step === 'customizing' && (
          <FrameCustomizer
            selectedPhotos={selectedPhotos.length === 4 ? selectedPhotos : ensureSelectedExist()}
            onBackToSelect={() => setStep('selecting')}
            onFinish={handleFinishCustomization}
          />
        )}

        {step === 'result' && finalCanvas && finalConfig && (
          <ResultView
            canvas={finalCanvas}
            config={finalConfig}
            onRestart={handleNavigateHome}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="w-full border-t border-amber-200 bg-white/70 py-3 sm:py-4 px-3 text-center text-[11px] sm:text-xs font-jua text-amber-900/60 print:hidden break-keep">
        우리들의 소중한 유치원 추억 📸 우리반 네컷 사진관
      </footer>
    </div>
  );
}
