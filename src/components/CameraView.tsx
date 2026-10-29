import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Camera, RefreshCw, Sparkles, AlertCircle, Upload, CheckCircle2 } from 'lucide-react';
import { CapturedPhoto } from '../types';
import { playCountdownBeep, playShutterSound, playVictoryChime } from '../utils/sound';
import { generateSamplePhotoDataUrl } from '../utils/sampleGenerator';

interface CameraViewProps {
  onAllPhotosCaptured: (photos: CapturedPhoto[]) => void;
  onCancel: () => void;
}

const POSE_HINTS = [
  { pose: '🌸 예쁜 꽃받침 포즈', tip: '턱 밑에 두 손을 모아 꽃처럼 활짝 웃어보세요!' },
  { pose: '✌️ 깜찍한 브이(V) 포즈', tip: '눈 옆에 귀엽게 손가락 브이를 만들어봐요!' },
  { pose: '💖 사랑스러운 볼하트 & 손하트', tip: '볼에 콩! 또는 머리 위로 커다란 하트!' },
  { pose: '👍 우리반 최고! 엄지 척', tip: '신나게 엄지를 번쩍 들고 환하게 미소~' },
  { pose: '😜 개구쟁이 귀여운 자유 포즈', tip: '가장 자신있는 나만의 포즈를 뽐내봐요!' },
];

export const CameraView: React.FC<CameraViewProps> = ({ onAllPhotosCaptured, onCancel }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user');
  const [isMirrored, setIsMirrored] = useState(true);

  // Shooting state
  const [isShooting, setIsShooting] = useState(false);
  const [currentShotIndex, setCurrentShotIndex] = useState(0); // 0 to 4
  const [countdown, setCountdown] = useState<number | null>(null); // 3, 2, 1, or null
  const [isFlashing, setIsFlashing] = useState(false);
  const [betweenDelay, setBetweenDelay] = useState(false);
  const [capturedPhotos, setCapturedPhotos] = useState<CapturedPhoto[]>([]);

  // Start webcam
  const startCamera = useCallback(async () => {
    try {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
      setErrorMessage('');

      const constraints: MediaStreamConstraints = {
        video: {
          facingMode: facingMode,
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play().catch(() => {});
      }
      setHasPermission(true);
    } catch (err) {
      console.warn('Camera access denied or failed:', err);
      setHasPermission(false);
      setErrorMessage('카메라 접근 권한을 허용해주세요. 또는 아래 샘플 모드로 진행할 수 있습니다.');
    }
  }, [facingMode]);

  useEffect(() => {
    startCamera();
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, [startCamera]);

  // Flip camera
  const toggleFacingMode = () => {
    setFacingMode((prev) => (prev === 'user' ? 'environment' : 'user'));
  };

  // Capture a single frame from video element
  const captureCurrentFrame = (): string => {
    if (!videoRef.current) return '';
    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    if (!ctx) return '';

    if (isMirrored && facingMode === 'user') {
      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);
    }
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL('image/jpeg', 0.95);
  };

  // Start the 5-photo automated photoshoot sequence
  const startPhotoshootSequence = () => {
    setCapturedPhotos([]);
    setCurrentShotIndex(0);
    setIsShooting(true);
    triggerShotCountdown(0);
  };

  // Trigger countdown for shot 'shotIdx'
  const triggerShotCountdown = (shotIdx: number) => {
    setCurrentShotIndex(shotIdx);
    setBetweenDelay(false);
    setCountdown(3);
    playCountdownBeep(3);

    let currentCount = 3;
    const interval = setInterval(() => {
      currentCount -= 1;
      if (currentCount > 0) {
        setCountdown(currentCount);
        playCountdownBeep(currentCount);
      } else {
        clearInterval(interval);
        setCountdown(0); // Shutter!
        executeShutter(shotIdx);
      }
    }, 1000);
  };

  // Execute snapshot
  const executeShutter = (shotIdx: number) => {
    // Shutter sound & flash
    playShutterSound();
    setIsFlashing(true);
    setTimeout(() => setIsFlashing(false), 350);

    let dataUrl = '';
    if (hasPermission && videoRef.current) {
      dataUrl = captureCurrentFrame();
    } else {
      // Fallback sample generator
      dataUrl = generateSamplePhotoDataUrl(shotIdx);
    }

    const newPhoto: CapturedPhoto = {
      id: `photo-${Date.now()}-${shotIdx}`,
      dataUrl: dataUrl,
      order: shotIdx + 1,
      timestamp: Date.now(),
    };

    setCapturedPhotos((prev) => {
      const updated = [...prev, newPhoto];
      const nextIdx = shotIdx + 1;

      if (nextIdx < 5) {
        // Prepare next shot with friendly pause
        setBetweenDelay(true);
        setTimeout(() => {
          triggerShotCountdown(nextIdx);
        }, 1800);
      } else {
        // All 5 shots done!
        setTimeout(() => {
          setIsShooting(false);
          playVictoryChime();
          onAllPhotosCaptured(updated);
        }, 800);
      }

      return updated;
    });
  };

  // Fallback demo shoot using sample photos
  const runSampleShoot = () => {
    setHasPermission(true);
    setCapturedPhotos([]);
    setCurrentShotIndex(0);
    setIsShooting(true);

    const photos: CapturedPhoto[] = [];
    for (let i = 0; i < 5; i++) {
      photos.push({
        id: `sample-${i}-${Date.now()}`,
        dataUrl: generateSamplePhotoDataUrl(i),
        order: i + 1,
        timestamp: Date.now(),
      });
    }

    triggerShotCountdown(0);
  };

  // File upload fallback
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const loaded: CapturedPhoto[] = [];
    const count = Math.min(files.length, 5);

    for (let i = 0; i < count; i++) {
      const file = files[i];
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          loaded.push({
            id: `upload-${Date.now()}-${i}`,
            dataUrl: event.target.result as string,
            order: loaded.length + 1,
            timestamp: Date.now(),
          });
          if (loaded.length === count) {
            // Fill with samples if fewer than 5
            while (loaded.length < 5) {
              loaded.push({
                id: `fill-${loaded.length}`,
                dataUrl: generateSamplePhotoDataUrl(loaded.length),
                order: loaded.length + 1,
                timestamp: Date.now(),
              });
            }
            onAllPhotosCaptured(loaded);
          }
        }
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col items-center">
      {/* Top Banner / Guidance */}
      <div className="w-full bg-white rounded-3xl p-4 md:p-6 shadow-md border-4 border-amber-200 mb-4 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-100 text-amber-900 font-jua text-sm md:text-base mb-2">
          <Sparkles className="w-4 h-4 text-amber-500 animate-spin" />
          <span>총 5장의 사진을 연속으로 찰칵! 찍어요</span>
        </div>
        <h2 className="text-2xl md:text-3xl font-jua text-stone-800">
          {isShooting ? (
            <span className="text-amber-600">
              [{currentShotIndex + 1} / 5번째 사진] {POSE_HINTS[currentShotIndex]?.pose}
            </span>
          ) : (
            '카메라를 보며 신나는 포즈를 준비해주세요!'
          )}
        </h2>
        <p className="text-stone-600 font-gaegu text-xl mt-1">
          {isShooting
            ? POSE_HINTS[currentShotIndex]?.tip
            : '3, 2, 1 카운트다운에 맞춰 5가지 예쁜 포즈를 보여주세요 ✨'}
        </p>
      </div>

      {/* Main Camera Viewfinder Card */}
      <div className="relative w-full max-w-2xl aspect-[4/3] bg-stone-900 rounded-3xl overflow-hidden shadow-2xl border-8 border-amber-300 flex items-center justify-center">
        {/* Flash overlay */}
        {isFlashing && (
          <div className="absolute inset-0 bg-white z-50 animate-flash pointer-events-none" />
        )}

        {/* Video stream */}
        <video
          ref={videoRef}
          playsInline
          muted
          autoPlay
          className={`w-full h-full object-cover ${
            isMirrored && facingMode === 'user' ? 'scale-x-[-1]' : ''
          }`}
        />

        {/* Camera permission error or disabled */}
        {hasPermission === false && (
          <div className="absolute inset-0 bg-stone-900/90 text-white flex flex-col items-center justify-center p-6 text-center z-20">
            <AlertCircle className="w-16 h-16 text-amber-400 mb-3" />
            <h3 className="text-2xl font-jua mb-2">카메라를 불러올 수 없어요</h3>
            <p className="text-stone-300 font-sans text-sm max-w-md mb-6">{errorMessage}</p>

            <div className="flex flex-wrap gap-3 justify-center">
              <button
                type="button"
                onClick={startCamera}
                className="px-5 py-2.5 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white font-jua flex items-center gap-2 transition"
              >
                <RefreshCw className="w-4 h-4" /> 다시 시도
              </button>
              <button
                type="button"
                onClick={runSampleShoot}
                className="px-5 py-2.5 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white font-jua flex items-center gap-2 transition shadow-lg"
              >
                <Sparkles className="w-4 h-4" /> 귀여운 샘플로 촬영하기
              </button>
              <label className="px-5 py-2.5 rounded-2xl bg-blue-500 hover:bg-blue-600 text-white font-jua flex items-center gap-2 transition cursor-pointer shadow-lg">
                <Upload className="w-4 h-4" /> 사진 5장 올리기
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            </div>
          </div>
        )}

        {/* Cute Face Guide Overlay (Optional visual aid for children) */}
        {!isShooting && hasPermission && (
          <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center border-4 border-dashed border-white/40 m-8 rounded-3xl">
            <div className="w-48 h-56 rounded-full border-4 border-amber-300/60 flex items-center justify-center bg-amber-400/10">
              <span className="font-jua text-white/90 text-lg bg-black/40 px-3 py-1 rounded-full backdrop-blur-sm">
                여기에 쏙 들어가요 😊
              </span>
            </div>
          </div>
        )}

        {/* Huge Animated 3-2-1 Countdown Overlay */}
        {isShooting && countdown !== null && countdown > 0 && (
          <div className="absolute inset-0 bg-black/25 flex flex-col items-center justify-center z-30">
            <div className="relative flex items-center justify-center">
              <div className="w-36 h-36 md:w-44 md:h-44 rounded-full bg-gradient-to-tr from-amber-400 to-yellow-300 flex items-center justify-center shadow-2xl border-4 border-white animate-pulse-ring">
                <span className="font-jua text-white text-7xl md:text-8xl drop-shadow-lg scale-110 transform transition-transform">
                  {countdown}
                </span>
              </div>
            </div>
            <div className="mt-6 px-6 py-2 rounded-full bg-white/95 text-stone-800 font-jua text-xl md:text-2xl shadow-xl flex items-center gap-2">
              <span>{POSE_HINTS[currentShotIndex]?.pose}</span>
            </div>
          </div>
        )}

        {/* Between Shots Message */}
        {betweenDelay && (
          <div className="absolute inset-0 bg-amber-500/80 backdrop-blur-xs flex flex-col items-center justify-center text-white z-30">
            <div className="text-5xl mb-3 animate-bounce">✨ 찰칵 완료! ✨</div>
            <div className="text-2xl font-jua">
              다음은 <span className="underline decoration-white decoration-wavy font-bold">[{currentShotIndex + 2}번째]</span> 사진이에요!
            </div>
            <p className="font-gaegu text-xl mt-2 text-amber-100">
              {POSE_HINTS[currentShotIndex + 1]?.pose} 준비해주세요~!
            </p>
          </div>
        )}

        {/* Camera Control Overlays (Top Right & Left) */}
        {!isShooting && hasPermission && (
          <>
            <div className="absolute top-4 right-4 flex gap-2 z-10">
              <button
                type="button"
                onClick={toggleFacingMode}
                title="카메라 전환"
                className="p-3 rounded-full bg-black/50 hover:bg-black/70 text-white backdrop-blur-sm transition"
              >
                <RefreshCw className="w-5 h-5" />
              </button>
              <button
                type="button"
                onClick={() => setIsMirrored((prev) => !prev)}
                title="좌우 반전"
                className={`p-3 rounded-full backdrop-blur-sm transition ${
                  isMirrored ? 'bg-amber-500 text-white' : 'bg-black/50 text-white hover:bg-black/70'
                }`}
              >
                <span className="font-jua text-xs">좌우반전</span>
              </button>
            </div>

            <div className="absolute top-4 left-4 z-10 bg-amber-400/90 text-amber-950 font-jua text-sm px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping" />
              <span>촬영 대기 중</span>
            </div>
          </>
        )}
      </div>

      {/* Mini Progress Dots of 5 Shots */}
      <div className="w-full max-w-2xl mt-4 bg-white p-3 rounded-2xl shadow-sm border-2 border-amber-100 flex items-center justify-between">
        <span className="text-sm font-jua text-stone-600">촬영 진행도:</span>
        <div className="flex items-center gap-2">
          {[0, 1, 2, 3, 4].map((idx) => {
            const isDone = capturedPhotos.length > idx;
            const isCurrent = isShooting && currentShotIndex === idx;

            return (
              <div
                key={idx}
                className={`w-10 h-10 rounded-xl flex items-center justify-center font-jua text-sm transition-all ${
                  isDone
                    ? 'bg-emerald-500 text-white shadow-sm'
                    : isCurrent
                    ? 'bg-amber-500 text-white ring-4 ring-amber-200 animate-pulse'
                    : 'bg-stone-100 text-stone-400 border border-stone-200'
                }`}
              >
                {isDone ? <CheckCircle2 className="w-5 h-5" /> : idx + 1}
              </div>
            );
          })}
        </div>
        <span className="text-xs font-jua text-amber-700 bg-amber-50 px-2.5 py-1 rounded-lg">
          {capturedPhotos.length} / 5장 완료
        </span>
      </div>

      {/* Bottom Main Action Button */}
      <div className="mt-6 flex flex-wrap items-center justify-center gap-4">
        {!isShooting ? (
          <>
            <button
              type="button"
              onClick={startPhotoshootSequence}
              className="px-8 py-4 rounded-3xl bg-gradient-to-r from-amber-400 via-orange-400 to-amber-500 hover:from-amber-500 hover:to-orange-500 text-white font-jua text-2xl md:text-3xl shadow-xl hover:shadow-2xl hover:scale-105 active:scale-95 transition-all flex items-center gap-3 border-4 border-amber-200"
            >
              <Camera className="w-8 h-8" />
              <span>사진 촬영 시작하기! (총 5장)</span>
            </button>

            <button
              type="button"
              onClick={runSampleShoot}
              className="px-5 py-3 rounded-2xl bg-amber-100 hover:bg-amber-200 text-amber-900 font-jua text-sm md:text-base transition flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4 text-amber-600" />
              <span>샘플 사진으로 테스트</span>
            </button>
          </>
        ) : (
          <div className="flex items-center gap-3">
            <div className="px-6 py-3 rounded-2xl bg-amber-50 border border-amber-300 text-amber-900 font-jua text-lg flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-amber-500 animate-ping" />
              <span>사진 촬영이 진행 중입니다... (3초 카운트다운)</span>
            </div>
            <button
              type="button"
              onClick={() => {
                setIsShooting(false);
                setCountdown(null);
                setBetweenDelay(false);
              }}
              className="px-4 py-3 rounded-2xl bg-stone-200 hover:bg-stone-300 text-stone-700 font-jua text-sm transition"
            >
              촬영 멈추기
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
