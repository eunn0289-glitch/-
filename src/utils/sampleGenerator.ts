/**
 * Generates cute fallback sample photos in case camera permission is denied,
 * camera is missing, or testing without webcam.
 */

const SAMPLE_PALETTES = [
  { bg: '#FEF3C7', character: '🐥', title: '병아리 꽃받침 포즈', sub: '예쁜 짓~ 찰칵!' },
  { bg: '#FCE7F3', character: '🐰', title: '토끼 볼하트 브이', sub: '치즈~ 브이!' },
  { bg: '#E0F2FE', character: '🐻', title: '곰돌이 으쓱 포즈', sub: '최고예요!' },
  { bg: '#DCFCE7', character: '🐱', title: '고양이 손인사', sub: '안녕 친구들!' },
  { bg: '#F3E8FF', character: '🐶', title: '강아지 윙크', sub: '스마일~' },
];

export function generateSamplePhotoDataUrl(index: number): string {
  const canvas = document.createElement('canvas');
  canvas.width = 640;
  canvas.height = 480;
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';

  const sample = SAMPLE_PALETTES[index % SAMPLE_PALETTES.length];

  // Cheerful gradient background
  const grad = ctx.createLinearGradient(0, 0, 640, 480);
  grad.addColorStop(0, sample.bg);
  grad.addColorStop(1, '#FFFFFF');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 640, 480);

  // Soft pattern dots
  ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
  for (let x = 30; x < 640; x += 50) {
    for (let y = 30; y < 480; y += 50) {
      ctx.beginPath();
      ctx.arc(x, y, 6, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // Cute Character Avatar
  ctx.save();
  ctx.font = '120px "Apple Color Emoji", "Segoe UI Emoji", sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.shadowColor = 'rgba(0,0,0,0.1)';
  ctx.shadowBlur = 15;
  ctx.fillText(sample.character, 320, 200);
  ctx.restore();

  // Cute decorative sparkles
  ctx.font = '40px sans-serif';
  ctx.fillText('✨', 180, 150);
  ctx.fillText('💖', 460, 160);
  ctx.fillText('⭐', 200, 300);
  ctx.fillText('🎈', 450, 290);

  // Label banner
  ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
  ctx.beginPath();
  ctx.roundRect ? ctx.roundRect(140, 340, 360, 80, 20) : ctx.rect(140, 340, 360, 80);
  ctx.fill();

  ctx.lineWidth = 3;
  ctx.strokeStyle = '#F59E0B';
  ctx.stroke();

  ctx.font = 'bold 30px "OngleipParkDahyeon", "Jua", sans-serif';
  ctx.fillStyle = '#78350F';
  ctx.textAlign = 'center';
  ctx.fillText(sample.title, 320, 375);

  ctx.font = '22px "OngleipParkDahyeon", "Gaegu", cursive, sans-serif';
  ctx.fillStyle = '#B45309';
  ctx.fillText(sample.sub, 320, 405);

  return canvas.toDataURL('image/jpeg', 0.92);
}
