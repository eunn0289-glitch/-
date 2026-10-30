import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Camera, RefreshCw, Sparkles, AlertCircle, Upload, CheckCircle2, Pause, Play, RotateCcw, ZoomIn } from 'lucide-react';
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

// Helper to find the standard 1x native camera device
const findBestCameraDeviceId = (devices: MediaDeviceInfo[], targetFacing: 'user' | 'environment'): string | undefined => {
  const videoInputs = devices.filter((d) => d.kind === 'videoinput');
  if (videoInputs.length === 0) return undefined;

  if (targetFacing === 'user') {
    const front = videoInputs.find((d) => {
      const lbl = d.label.toLowerCase();
      return lbl.includes('front') || lbl.includes('user') || lbl.includes('전면') || lbl.includes('내면');
    });
    return front?.deviceId || videoInputs[0]?.deviceId;
  }

  // Environment (Rear / Back) camera:
  // Identify the standard 1x main camera:
  // Avoid ultra-wide (0.5x, 'ultra'), telephoto (3x/5x, 'telephoto', 'zoom'), macro, virtual/depth
  const backDevices = videoInputs.filter((d) => {
    const lbl = d.label.toLowerCase();
    return !lbl.includes('front') && !lbl.includes('user') && !lbl.includes('전면');
  });

  if (backDevices.length === 0) {
    return videoInputs[0]?.deviceId;
  }

  // Priority scoring for back cameras to lock onto the 1.0x native standard lens
  const scored = backDevices.map((d) => {
    const lbl = d.label.toLowerCase();
    let score = 50;
    // Strong penalties for non-standard lenses:
    if (lbl.includes('ultra') || lbl.includes('0.5') || lbl.includes('super wide')) score -= 100;
    if (lbl.includes('tele') || lbl.includes('zoom') || lbl.includes('telephoto')) score -= 80;
    if (lbl.includes('macro') || lbl.includes('depth') || lbl.includes('virtual')) score -= 90;
    // Bonuses for standard main camera:
    if (lbl.includes('main') || lbl.includes('primary') || lbl.includes('standard')) score += 40;
    if (lbl.includes('camera 0') || lbl.includes('camera2 0') || lbl.includes('back 0') || lbl.includes('rear 0')) score += 30;
    if (lbl.includes('wide') && !lbl.includes('ultra')) score += 15;
    return { deviceId: d.deviceId, score, label: d.label };
  });

  scored.sort((a, b) => b.score - a.score);
  return scored[0]?.deviceId;
};

export const CameraView: React.FC<CameraViewProps> = ({ onAllPhotosCaptured, onCancel }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user');
  const [isMirrored, setIsMirrored] = useState(true);

  // Multi-camera & standard 1x zoom states
  const [availableDevices, setAvailableDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState<string>('');
  const [currentZoom, setCurrentZoom] = useState<number>(1.0);
  const [zoomCapabilities, setZoomCapabilities] = useState<{ min: number; max: number; step: number } | null>(null);

  // Shooting state
  const [isShooting, setIsShooting] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [currentShotIndex, setCurrentShotIndex] = useState(0); // 0 to 4
  const [countdown, setCountdown] = useState<number | null>(null); // 3, 2, 1, or null
  const [isFlashing, setIsFlashing] = useState(false);
  const [betweenDelay, setBetweenDelay] = useState(false);
  const [capturedPhotos, setCapturedPhotos] = useState<CapturedPhoto[]>([]);

  // Timer refs to prevent background timer leaks
  const countdownIntervalRef = useRef<number | null>(null);
  const transitionTimeoutRef = useRef<number | null>(null);
  const flashTimeoutRef = useRef<number | null>(null);
  const finishTimeoutRef = useRef<number | null>(null);
  const isCancelledRef = useRef<boolean>(false);

  // Start webcam with standard 1x native ratio (4:3) and primary lens selection
  const startCamera = useCallback(
    async (targetFacing: 'user' | 'environment' = facingMode, targetDevId?: string) => {
      try {
        if (streamRef.current) {
          streamRef.current.getTracks().forEach((track) => track.stop());
        }
        setErrorMessage('');

        let devId = targetDevId !== undefined ? targetDevId : selectedDeviceId;

        // Query available devices
        if (navigator.mediaDevices?.enumerateDevices) {
          try {
            const devs = await navigator.mediaDevices.enumerateDevices();
            const vDevs = devs.filter((d) => d.kind === 'videoinput');
            setAvailableDevices(vDevs);

            // If no specific device is chosen or device is not in list, find the standard 1x camera
            if (!devId || !vDevs.some((d) => d.deviceId === devId)) {
              const bestId = findBestCameraDeviceId(vDevs, targetFacing);
              if (bestId) {
                devId = bestId;
                setSelectedDeviceId(bestId);
              }
            }
          } catch (e) {
            console.warn('enumerateDevices error:', e);
          }
        }

        // Native Camera Standard: 4:3 aspect ratio (same as smartphone native camera app)
        // Eliminates artificial cropping zoom caused by 16:9 widescreen streams
        const videoConstraints: MediaTrackConstraints = {
          aspectRatio: { ideal: 4 / 3 },
          width: { ideal: 1920, min: 640 },
          height: { ideal: 1440, min: 480 },
        };

        if (devId) {
          videoConstraints.deviceId = { exact: devId };
        } else {
          videoConstraints.facingMode = { ideal: targetFacing };
        }

        let stream: MediaStream;
        try {
          stream = await navigator.mediaDevices.getUserMedia({
            video: videoConstraints,
            audio: false,
          });
        } catch (initialErr) {
          console.warn('Retrying camera with facingMode fallback:', initialErr);
          // Fallback if specific deviceId constraint is rejected
          stream = await navigator.mediaDevices.getUserMedia({
            video: {
              facingMode: { ideal: targetFacing },
              aspectRatio: { ideal: 4 / 3 },
              width: { ideal: 1280, min: 640 },
              height: { ideal: 960, min: 480 },
            },
            audio: false,
          });
        }

        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play().catch(() => {});
        }

        // Calibrate hardware zoom to 1.0x (standard native camera scale)
        const track = stream.getVideoTracks()[0];
        if (track) {
          const caps = track.getCapabilities ? (track.getCapabilities() as any) : {};
          if (caps && typeof caps.zoom === 'object') {
            const minZ = caps.zoom.min ?? 1.0;
            const maxZ = caps.zoom.max ?? 1.0;
            const stepZ = caps.zoom.step ?? 0.1;
            setZoomCapabilities({ min: minZ, max: maxZ, step: stepZ });

            // Apply standard 1.0x native zoom
            const base1x = Math.max(minZ, Math.min(1.0, maxZ));
            setCurrentZoom(base1x);
            try {
              await (track as any).applyConstraints({
                advanced: [{ zoom: base1x }],
              });
            } catch (zErr) {
              console.warn('Zoom constraint error:', zErr);
            }
          } else {
            setZoomCapabilities(null);
            setCurrentZoom(1.0);
          }
        }

        // Re-enumerate to get full device labels after permission is active
        if (navigator.mediaDevices?.enumerateDevices) {
          navigator.mediaDevices.enumerateDevices().then((devs) => {
            setAvailableDevices(devs.filter((d) => d.kind === 'videoinput'));
          }).catch(() => {});
        }

        setHasPermission(true);
      } catch (err) {
        console.warn('Camera access denied or failed:', err);
        setHasPermission(false);
        setErrorMessage('카메라 접근 권한을 허용해주세요. 또는 아래 샘플 모드로 진행할 수 있습니다.');
      }
    },
    [facingMode, selectedDeviceId]
  );

  useEffect(() => {
    startCamera(facingMode);
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, [facingMode]);

  // Flip camera between front (user) and back (environment)
  const toggleFacingMode = () => {
    const nextFacing = facingMode === 'user' ? 'environment' : 'user';
    setFacingMode(nextFacing);
    // Standard convention: front camera is mirrored, back camera is not mirrored
    setIsMirrored(nextFacing === 'user');
    setSelectedDeviceId('');
    startCamera(nextFacing, '');
  };

  // Toggle/reset zoom to 1.0x standard native camera scale
  const handleToggleZoom = async () => {
    if (!streamRef.current) return;
    const track = streamRef.current.getVideoTracks()[0];
    if (!track) return;

    if (zoomCapabilities) {
      // Toggle between 1.0x standard and 1.5x, returning cleanly to 1.0x
      const nextZoom = currentZoom <= 1.05 && zoomCapabilities.max >= 1.5 ? 1.5 : 1.0;
      try {
        await (track as any).applyConstraints({
          advanced: [{ zoom: nextZoom }],
        });
        setCurrentZoom(nextZoom);
      } catch (e) {
        console.warn('Failed to set zoom:', e);
      }
    } else {
      setCurrentZoom(1.0);
    }
  };

  // Cycle through cameras if multiple exist for current facing mode
  const handleCycleCamera = () => {
    const relevant = availableDevices.filter((d) => {
      const lbl = d.label.toLowerCase();
      if (facingMode === 'user') {
        return lbl.includes('front') || lbl.includes('user') || lbl.includes('전면');
      } else {
        return !lbl.includes('front') && !lbl.includes('user') && !lbl.includes('전면');
      }
    });

    if (relevant.length > 1) {
      const currentIdx = relevant.findIndex((d) => d.deviceId === selectedDeviceId);
      const nextIdx = (currentIdx + 1) % relevant.length;
      const nextDev = relevant[nextIdx];
      setSelectedDeviceId(nextDev.deviceId);
      startCamera(facingMode, nextDev.deviceId);
    } else {
      toggleFacingMode();
    }
  };

  // Capture a single frame from video element with exact 4:3 native ratio matching the viewfinder
  const captureCurrentFrame = (): string => {
    if (!videoRef.current) return '';
    const video = videoRef.current;
    const canvas = document.createElement('canvas');

    const vw = video.videoWidth || 640;
    const vh = video.videoHeight || 480;
    const targetRatio = 4 / 3;
    const currentRatio = vw / vh;

    let sx = 0;
    let sy = 0;
    let sw = vw;
    let sh = vh;

    // Exact matching crop to 4:3 viewfinder so what you see is what you get
    if (currentRatio > targetRatio + 0.01) {
      sw = vh * targetRatio;
      sx = (vw - sw) / 2;
    } else if (currentRatio < targetRatio - 0.01) {
      sh = vw / targetRatio;
      sy = (vh - sh) / 2;
    }

    canvas.width = Math.round(sw);
    canvas.height = Math.round(sh);
    const ctx = canvas.getContext('2d');
    if (!ctx) return '';

    if (isMirrored && facingMode === 'user') {
      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);
    }

    ctx.drawImage(video, sx, sy, sw, sh, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL('image/jpeg', 0.95);
  };

  // Stop all active intervals/timeouts immediately
  const stopAllTimers = useCallback(() => {
    isCancelledRef.current = true;
    if (countdownIntervalRef.current !== null) {
      clearInterval(countdownIntervalRef.current);
      countdownIntervalRef.current = null;
    }
    if (transitionTimeoutRef.current !== null) {
      clearTimeout(transitionTimeoutRef.current);
      transitionTimeoutRef.current = null;
    }
    if (flashTimeoutRef.current !== null) {
      clearTimeout(flashTimeoutRef.current);
      flashTimeoutRef.current = null;
    }
    if (finishTimeoutRef.current !== null) {
      clearTimeout(finishTimeoutRef.current);
      finishTimeoutRef.current = null;
    }
    setCountdown(null);
    setBetweenDelay(false);
    setIsFlashing(false);
  }, []);

  // Cleanup timers on unmount
  useEffect(() => {
    return () => {
      stopAllTimers();
    };
  }, [stopAllTimers]);

  // Pause photoshoot keeping captured photos intact
  const handlePauseShooting = () => {
    stopAllTimers();
    setIsShooting(false);
    setIsPaused(true);
  };

  // Resume photoshoot from the next photo slot
  const handleResumeShooting = () => {
    const nextIdx = capturedPhotos.length;
    if (nextIdx >= 5) {
      onAllPhotosCaptured(capturedPhotos);
      return;
    }
    isCancelledRef.current = false;
    setIsPaused(false);
    setIsShooting(true);
    triggerShotCountdown(nextIdx);
  };

  // Reset photoshoot completely
  const handleResetShoot = () => {
    stopAllTimers();
    setCapturedPhotos([]);
    setCurrentShotIndex(0);
    setIsShooting(false);
    setIsPaused(false);
  };

  // Start the 5-photo automated photoshoot sequence
  const startPhotoshootSequence = () => {
    stopAllTimers();
    isCancelledRef.current = false;
    setCapturedPhotos([]);
    setCurrentShotIndex(0);
    setIsPaused(false);
    setIsShooting(true);
    triggerShotCountdown(0);
  };

  // Trigger countdown for shot 'shotIdx'
  const triggerShotCountdown = (shotIdx: number) => {
    stopAllTimers();
    isCancelledRef.current = false;
    setCurrentShotIndex(shotIdx);
    setBetweenDelay(false);
    setCountdown(3);
    playCountdownBeep(3);

    let currentCount = 3;
    countdownIntervalRef.current = window.setInterval(() => {
      if (isCancelledRef.current) {
        if (countdownIntervalRef.current !== null) {
          clearInterval(countdownIntervalRef.current);
          countdownIntervalRef.current = null;
        }
        return;
      }

      currentCount -= 1;
      if (currentCount > 0) {
        setCountdown(currentCount);
        playCountdownBeep(currentCount);
      } else {
        if (countdownIntervalRef.current !== null) {
          clearInterval(countdownIntervalRef.current);
          countdownIntervalRef.current = null;
        }
        if (!isCancelledRef.current) {
          setCountdown(0); // Shutter!
          executeShutter(shotIdx);
        }
      }
    }, 1000);
  };

  // Execute snapshot
  const executeShutter = (shotIdx: number) => {
    if (isCancelledRef.current) return;

    // Shutter sound & flash
    playShutterSound();
    setIsFlashing(true);
    flashTimeoutRef.current = window.setTimeout(() => setIsFlashing(false), 350);

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
      if (isCancelledRef.current) return prev;
      const updated = [...prev, newPhoto];
      const nextIdx = updated.length;

      if (nextIdx < 5) {
        // Prepare next shot with friendly pause
        setBetweenDelay(true);
        transitionTimeoutRef.current = window.setTimeout(() => {
          if (!isCancelledRef.current) {
            triggerShotCountdown(nextIdx);
          }
        }, 1800);
      } else {
        // All 5 shots done!
        finishTimeoutRef.current = window.setTimeout(() => {
          if (!isCancelledRef.current) {
            setIsShooting(false);
            playVictoryChime();
            onAllPhotosCaptured(updated);
          }
        }, 800);
      }

      return updated;
    });
  };

  // Fallback demo shoot using sample photos
  const runSampleShoot = () => {
    stopAllTimers();
    isCancelledRef.current = false;
    setHasPermission(true);
    setCapturedPhotos([]);
    setCurrentShotIndex(0);
    setIsPaused(false);
    setIsShooting(true);

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
    <div className="w-full max-w-4xl mx-auto flex flex-col items-center px-1 sm:px-2">
      {/* Top Banner / Guidance */}
      <div className="w-full bg-white rounded-2xl sm:rounded-3xl p-3.5 sm:p-5 md:p-6 shadow-md border-3 sm:border-4 border-amber-200 mb-3 sm:mb-4 text-center">
        <div className="inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1 rounded-full bg-amber-100 text-amber-900 font-jua text-xs sm:text-sm md:text-base mb-1.5 sm:mb-2">
          <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-500 animate-spin" />
          <span>총 5장의 사진을 연속으로 찰칵! 찍어요</span>
        </div>
        <h2 className="text-xl sm:text-2xl md:text-3xl font-jua text-stone-800 break-keep">
          {isShooting ? (
            <span className="text-amber-600">
              [{currentShotIndex + 1} / 5번째 사진] {POSE_HINTS[currentShotIndex]?.pose}
            </span>
          ) : isPaused ? (
            <span className="text-amber-700">
              ⏸️ 촬영이 잠시 멈췄어요 ({capturedPhotos.length}장 촬영 완료)
            </span>
          ) : (
            '카메라를 보며 신나는 포즈를 준비해주세요!'
          )}
        </h2>
        <p className="text-stone-600 font-gaegu text-lg sm:text-xl mt-1 break-keep">
          {isShooting
            ? POSE_HINTS[currentShotIndex]?.tip
            : isPaused
            ? '준비가 되면 아래 [이어서 촬영하기]를 눌러주세요! 찍어둔 사진은 안전하게 저장되어 있어요 😊'
            : '3, 2, 1 카운트다운에 맞춰 5가지 예쁜 포즈를 보여주세요 ✨'}
        </p>
      </div>

      {/* Main Camera Viewfinder Card */}
      <div className="relative w-full max-w-2xl aspect-[4/3] bg-stone-900 rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl border-4 sm:border-8 border-amber-300 flex items-center justify-center">
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
          <div className="absolute inset-0 bg-stone-900/90 text-white flex flex-col items-center justify-center p-4 sm:p-6 text-center z-20">
            <AlertCircle className="w-12 h-12 sm:w-16 sm:h-16 text-amber-400 mb-2 sm:mb-3" />
            <h3 className="text-xl sm:text-2xl font-jua mb-1 sm:mb-2">카메라를 불러올 수 없어요</h3>
            <p className="text-stone-300 font-sans text-xs sm:text-sm max-w-md mb-4 sm:mb-6">{errorMessage}</p>

            <div className="flex flex-wrap gap-2.5 sm:gap-3 justify-center">
              <button
                type="button"
                onClick={() => startCamera()}
                className="px-4 sm:px-5 py-2 sm:py-2.5 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white font-jua text-xs sm:text-sm flex items-center gap-2 transition"
              >
                <RefreshCw className="w-4 h-4" /> 다시 시도
              </button>
              <button
                type="button"
                onClick={runSampleShoot}
                className="px-4 sm:px-5 py-2 sm:py-2.5 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white font-jua text-xs sm:text-sm flex items-center gap-2 transition shadow-lg"
              >
                <Sparkles className="w-4 h-4" /> 귀여운 샘플로 촬영하기
              </button>
              <label className="px-4 sm:px-5 py-2 sm:py-2.5 rounded-2xl bg-blue-500 hover:bg-blue-600 text-white font-jua text-xs sm:text-sm flex items-center gap-2 transition cursor-pointer shadow-lg">
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

        {/* Cute Face Guide Overlay */}
        {!isShooting && hasPermission && (
          <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center border-2 sm:border-4 border-dashed border-white/40 m-4 sm:m-8 rounded-2xl sm:rounded-3xl">
            <div className="w-36 h-44 sm:w-48 sm:h-56 rounded-full border-3 sm:border-4 border-amber-300/60 flex items-center justify-center bg-amber-400/10">
              <span className="font-jua text-white/90 text-sm sm:text-base md:text-lg bg-black/40 px-2.5 sm:px-3 py-1 rounded-full backdrop-blur-sm">
                여기에 쏙 들어가요 😊
              </span>
            </div>
          </div>
        )}

        {/* Huge Animated 3-2-1 Countdown Overlay */}
        {isShooting && countdown !== null && countdown > 0 && (
          <div className="absolute inset-0 bg-black/25 flex flex-col items-center justify-center z-30 p-2">
            <div className="relative flex items-center justify-center">
              <div className="w-28 h-28 sm:w-36 sm:h-36 md:w-44 md:h-44 rounded-full bg-gradient-to-tr from-amber-400 to-yellow-300 flex items-center justify-center shadow-2xl border-4 border-white animate-pulse-ring">
                <span className="font-jua text-white text-6xl sm:text-7xl md:text-8xl drop-shadow-lg scale-110 transform transition-transform">
                  {countdown}
                </span>
              </div>
            </div>
            <div className="mt-4 sm:mt-6 px-4 sm:px-6 py-1.5 sm:py-2 rounded-full bg-white/95 text-stone-800 font-jua text-base sm:text-xl md:text-2xl shadow-xl flex items-center gap-2 max-w-[90%] text-center">
              <span className="truncate">{POSE_HINTS[currentShotIndex]?.pose}</span>
            </div>
          </div>
        )}

        {/* Between Shots Message */}
        {betweenDelay && (
          <div className="absolute inset-0 bg-amber-500/85 backdrop-blur-xs flex flex-col items-center justify-center text-white z-30 p-4 text-center">
            <div className="text-3xl sm:text-5xl mb-2 sm:mb-3 animate-bounce">✨ 찰칵 완료! ✨</div>
            <div className="text-xl sm:text-2xl font-jua">
              다음은 <span className="underline decoration-white decoration-wavy font-bold">[{currentShotIndex + 2}번째]</span> 사진이에요!
            </div>
            <p className="font-gaegu text-lg sm:text-xl mt-1.5 text-amber-100">
              {POSE_HINTS[currentShotIndex + 1]?.pose} 준비해주세요~!
            </p>
          </div>
        )}

        {/* Paused Overlay */}
        {isPaused && (
          <div className="absolute inset-0 bg-stone-900/85 backdrop-blur-xs flex flex-col items-center justify-center p-4 sm:p-6 text-center z-30">
            <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-amber-400/20 border-2 border-amber-400 flex items-center justify-center text-amber-300 text-2xl sm:text-3xl mb-2 sm:mb-3">
              ⏸️
            </div>
            <h3 className="text-xl sm:text-2xl font-jua text-white mb-1">
              촬영이 잠시 멈췄어요
            </h3>
            <p className="text-stone-300 font-sans text-xs sm:text-sm mb-4">
              지금까지 <span className="text-amber-400 font-bold font-jua">{capturedPhotos.length}장</span>의 사진이 안전하게 저장되어 있어요!
            </p>
            <div className="flex flex-col sm:flex-row flex-wrap gap-2 sm:gap-3 justify-center w-full max-w-sm sm:max-w-none">
              <button
                type="button"
                onClick={handleResumeShooting}
                className="w-full sm:w-auto px-5 sm:px-6 py-2.5 sm:py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-jua text-base sm:text-lg shadow-lg flex items-center justify-center gap-2 transition hover:scale-105 active:scale-95 cursor-pointer"
              >
                <Play className="w-4 h-4 sm:w-5 sm:h-5 fill-white" />
                <span>이어서 {capturedPhotos.length + 1}번째 컷 찍기</span>
              </button>
              <button
                type="button"
                onClick={handleResetShoot}
                className="w-full sm:w-auto px-4 sm:px-5 py-2.5 sm:py-3 rounded-2xl bg-white/10 hover:bg-white/20 text-stone-200 font-jua text-xs sm:text-sm flex items-center justify-center gap-2 transition cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" />
                <span>처음부터 다시 찍기</span>
              </button>
              {capturedPhotos.length >= 4 && (
                <button
                  type="button"
                  onClick={() => onAllPhotosCaptured(capturedPhotos)}
                  className="w-full sm:w-auto px-4 sm:px-5 py-2.5 sm:py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white font-jua text-xs sm:text-sm flex items-center justify-center gap-2 transition shadow-md cursor-pointer"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>지금 사진들로 바로 4장 고르기</span>
                </button>
              )}
            </div>
          </div>
        )}

        {/* Camera Control Overlays (Top Right & Left) */}
        {!isShooting && hasPermission && (
          <>
            <div className="absolute top-2.5 sm:top-4 right-2.5 sm:right-4 flex flex-wrap items-center justify-end gap-1.5 sm:gap-2 z-10 max-w-[85%]">
              {/* Native 1.0x standard zoom control button */}
              <button
                type="button"
                onClick={handleToggleZoom}
                title="모바일 기본 1.0x 배율 맞춤"
                className={`px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-full backdrop-blur-md transition flex items-center gap-1 cursor-pointer shadow-lg active:scale-95 ${
                  currentZoom <= 1.05
                    ? 'bg-amber-500 text-white font-bold ring-2 ring-white/60'
                    : 'bg-black/60 text-white hover:bg-black/80'
                }`}
              >
                <ZoomIn className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" />
                <span className="font-jua text-xs sm:text-sm whitespace-nowrap">
                  {currentZoom.toFixed(1)}x 기본
                </span>
              </button>

              {/* Camera Switch (Front <-> Back / Other lenses) */}
              <button
                type="button"
                onClick={handleCycleCamera}
                title={facingMode === 'user' ? '후면 카메라로 전환' : '정면 카메라로 전환'}
                className="px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-full bg-black/60 hover:bg-black/80 text-white backdrop-blur-md transition flex items-center gap-1.5 min-h-[34px] sm:min-h-[38px] cursor-pointer shadow-lg active:scale-95"
              >
                <RefreshCw className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span className="font-jua text-xs sm:text-sm whitespace-nowrap">
                  {facingMode === 'user' ? '후면 카메라' : '정면 카메라'}
                </span>
              </button>

              {/* Mirror toggle (for selfie / front camera) */}
              {facingMode === 'user' && (
                <button
                  type="button"
                  onClick={() => setIsMirrored((prev) => !prev)}
                  title="좌우 반전"
                  className={`px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-full backdrop-blur-md transition flex items-center justify-center cursor-pointer shadow-lg active:scale-95 ${
                    isMirrored ? 'bg-amber-500 text-white font-bold' : 'bg-black/60 text-white hover:bg-black/80'
                  }`}
                >
                  <span className="font-jua text-[11px] sm:text-xs whitespace-nowrap">좌우반전</span>
                </button>
              )}
            </div>

            {/* Top Left Status Badge */}
            <div className="absolute top-2.5 sm:top-4 left-2.5 sm:left-4 z-10 flex flex-col items-start gap-1">
              <div className="bg-amber-400/95 backdrop-blur-xs text-amber-950 font-jua text-xs sm:text-sm px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full flex items-center gap-1.5 shadow-md border border-white/50">
                <span className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-red-500 animate-ping" />
                <span>{facingMode === 'user' ? '정면 1x 기본 배율' : '후면 1x 기본 배율'}</span>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Mini Progress Dots of 5 Shots */}
      <div className="w-full max-w-2xl mt-3 sm:mt-4 bg-white p-2.5 sm:p-3 rounded-2xl shadow-sm border-2 border-amber-100 flex flex-wrap items-center justify-between gap-2">
        <span className="text-xs sm:text-sm font-jua text-stone-600">촬영 진행도:</span>
        <div className="flex items-center gap-1.5 sm:gap-2">
          {[0, 1, 2, 3, 4].map((idx) => {
            const isDone = capturedPhotos.length > idx;
            const isCurrent = isShooting && currentShotIndex === idx;

            return (
              <div
                key={idx}
                className={`w-7 h-7 sm:w-9 sm:h-9 md:w-10 md:h-10 rounded-xl flex items-center justify-center font-jua text-xs sm:text-sm transition-all ${
                  isDone
                    ? 'bg-emerald-500 text-white shadow-sm'
                    : isCurrent
                    ? 'bg-amber-500 text-white ring-3 ring-amber-200 animate-pulse'
                    : 'bg-stone-100 text-stone-400 border border-stone-200'
                }`}
              >
                {isDone ? <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5" /> : idx + 1}
              </div>
            );
          })}
        </div>
        <span className="text-[11px] sm:text-xs font-jua text-amber-700 bg-amber-50 px-2 sm:px-2.5 py-1 rounded-lg">
          {capturedPhotos.length} / 5장 완료
        </span>
      </div>

      {/* Bottom Main Action Button */}
      <div className="mt-4 sm:mt-6 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 w-full">
        {isShooting ? (
          <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-3 w-full">
            <div className="px-4 py-2.5 rounded-2xl bg-amber-50 border border-amber-300 text-amber-900 font-jua text-sm sm:text-base flex items-center gap-2 text-center">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-ping" />
              <span>촬영 진행 중 ({currentShotIndex + 1}/5번째 컷)</span>
            </div>
            <button
              type="button"
              onClick={handlePauseShooting}
              className="w-full sm:w-auto px-5 py-2.5 sm:py-3 rounded-2xl bg-amber-500 hover:bg-amber-600 active:scale-95 text-white font-jua text-sm sm:text-base shadow-md transition flex items-center justify-center gap-2 cursor-pointer"
            >
              <Pause className="w-4 h-4" />
              <span>촬영 멈추기 (잠시 멈춤)</span>
            </button>
          </div>
        ) : isPaused ? (
          <div className="flex flex-col sm:flex-row flex-wrap items-center justify-center gap-2 sm:gap-3 w-full">
            <button
              type="button"
              onClick={handleResumeShooting}
              className="w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 rounded-3xl bg-gradient-to-r from-amber-500 via-orange-400 to-amber-500 hover:from-amber-600 hover:to-orange-600 text-white font-jua text-lg sm:text-xl md:text-2xl shadow-xl hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2 sm:gap-3 border-3 sm:border-4 border-amber-200 cursor-pointer"
            >
              <Play className="w-5 h-5 sm:w-6 sm:h-6 fill-white" />
              <span>이어서 촬영하기 ({capturedPhotos.length + 1} / 5번째 컷)</span>
            </button>
            <button
              type="button"
              onClick={handleResetShoot}
              className="w-full sm:w-auto px-4 sm:px-5 py-2.5 sm:py-3.5 rounded-2xl bg-stone-200 hover:bg-stone-300 text-stone-700 font-jua text-sm sm:text-base transition flex items-center justify-center gap-2 cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              <span>처음부터 다시 찍기</span>
            </button>
            {capturedPhotos.length >= 4 && (
              <button
                type="button"
                onClick={() => onAllPhotosCaptured(capturedPhotos)}
                className="w-full sm:w-auto px-4 sm:px-5 py-2.5 sm:py-3.5 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white font-jua text-sm sm:text-base shadow-md transition flex items-center justify-center gap-2 hover:scale-105 cursor-pointer"
              >
                <Sparkles className="w-4 h-4" />
                <span>선택하러 가기 (4장 완료)</span>
              </button>
            )}
          </div>
        ) : (
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 w-full">
            <button
              type="button"
              onClick={startPhotoshootSequence}
              className="w-full sm:w-auto px-6 sm:px-8 py-3.5 sm:py-4 rounded-3xl bg-gradient-to-r from-amber-400 via-orange-400 to-amber-500 hover:from-amber-500 hover:to-orange-500 text-white font-jua text-xl sm:text-2xl md:text-3xl shadow-xl hover:shadow-2xl hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2 sm:gap-3 border-3 sm:border-4 border-amber-200 cursor-pointer"
            >
              <Camera className="w-6 h-6 sm:w-8 sm:h-8" />
              <span>사진 촬영 시작하기! (총 5장)</span>
            </button>

            <button
              type="button"
              onClick={runSampleShoot}
              className="w-full sm:w-auto px-4 sm:px-5 py-2.5 sm:py-3 rounded-2xl bg-amber-100 hover:bg-amber-200 text-amber-900 font-jua text-xs sm:text-sm md:text-base transition flex items-center justify-center gap-2 cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-amber-600" />
              <span>샘플 사진으로 테스트</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
