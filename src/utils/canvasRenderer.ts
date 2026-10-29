import { CapturedPhoto, FrameTheme, PhotoboothConfig, PlacedSticker } from '../types';
import { PHOTO_FILTERS } from '../data/stickers';

// Helper to load an image asynchronously
function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = (e) => reject(e);
    img.src = src;
  });
}

// Preload the requested OngleipParkDahyeon font
async function ensureFontLoaded(): Promise<void> {
  if (typeof document !== 'undefined' && document.fonts) {
    try {
      await document.fonts.load('28px OngleipParkDahyeon');
    } catch {
      // Font load fallback
    }
  }
}

// Rounded rectangle helper
function drawRoundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number
) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
}

// Helper to draw cute decorative elements by theme
function drawThemeDecorations(
  ctx: CanvasRenderingContext2D,
  theme: FrameTheme,
  width: number,
  height: number
) {
  ctx.save();
  const icon = theme.icon || '⭐';

  // Corner doodles / icons
  ctx.font = '36px "Apple Color Emoji", "Segoe UI Emoji", sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  // Top header cute accents
  ctx.fillText(icon, 50, 48);
  ctx.fillText(icon, width - 50, 48);

  if (theme.cornerDecoration === 'chick') {
    ctx.fillText('🐥', width / 2 - 120, 48);
    ctx.fillText('🌱', width / 2 + 120, 48);
  } else if (theme.cornerDecoration === 'rainbow') {
    ctx.fillText('☁️', width / 2 - 130, 48);
    ctx.fillText('🌈', width / 2 + 130, 48);
  } else if (theme.cornerDecoration === 'bear') {
    ctx.fillText('🌰', width / 2 - 120, 48);
    ctx.fillText('🧸', width / 2 + 120, 48);
  } else if (theme.cornerDecoration === 'heart') {
    ctx.fillText('💖', width / 2 - 120, 48);
    ctx.fillText('🎀', width / 2 + 120, 48);
  } else if (theme.cornerDecoration === 'flower') {
    ctx.fillText('🌸', width / 2 - 120, 48);
    ctx.fillText('🍀', width / 2 + 120, 48);
  } else {
    ctx.fillText('✨', width / 2 - 120, 48);
    ctx.fillText('⭐', width / 2 + 120, 48);
  }

  ctx.restore();
}

/**
 * Draws a single 4-cut column on the canvas
 */
async function drawSingleStripColumn(
  ctx: CanvasRenderingContext2D,
  photos: CapturedPhoto[],
  theme: FrameTheme,
  config: PhotoboothConfig,
  colX: number,
  colY: number,
  colWidth: number,
  colHeight: number,
  images: HTMLImageElement[]
) {
  ctx.save();
  ctx.translate(colX, colY);

  // Background
  ctx.fillStyle = theme.bgColor;
  ctx.fillRect(0, 0, colWidth, colHeight);

  // Outer border
  ctx.lineWidth = 14;
  ctx.strokeStyle = theme.borderColor;
  ctx.strokeRect(7, 7, colWidth - 14, colHeight - 14);

  // Inner subtle border
  ctx.lineWidth = 2;
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
  ctx.strokeRect(18, 18, colWidth - 36, colHeight - 36);

  // Top header decorations
  drawThemeDecorations(ctx, theme, colWidth, colHeight);

  // Header Title
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = theme.textColor;
  ctx.font = 'bold 34px "OngleipParkDahyeon", "Jua", "Noto Sans KR", sans-serif';
  ctx.fillText(config.className || '우리반 네컷', colWidth / 2, 48);

  // Dimensions for the 4 photos
  const paddingX = 40;
  const startY = 85;
  const photoW = colWidth - paddingX * 2;
  const photoH = Math.round(photoW * 0.72); // 4:3 ~ 3:2 landscape ratio
  const gap = 24;

  const filterDef = PHOTO_FILTERS.find((f) => f.id === config.filter);
  const activeCanvasFilter = filterDef?.canvasFilter || 'none';

  for (let i = 0; i < 4; i++) {
    const curY = startY + i * (photoH + gap);
    const img = images[i];

    // White photo card backing with subtle shadow
    ctx.save();
    ctx.shadowColor = 'rgba(0, 0, 0, 0.12)';
    ctx.shadowBlur = 12;
    ctx.shadowOffsetY = 4;
    ctx.fillStyle = theme.photoBorderColor || '#FFFFFF';
    drawRoundRect(ctx, paddingX - 6, curY - 6, photoW + 12, photoH + 12, 16);
    ctx.fill();
    ctx.restore();

    // Photo drawing with rounded corners & filter
    if (img) {
      ctx.save();
      drawRoundRect(ctx, paddingX, curY, photoW, photoH, 12);
      ctx.clip();

      if (activeCanvasFilter !== 'none') {
        ctx.filter = activeCanvasFilter;
      }

      // Draw image object-fit: cover
      const imgAspect = img.width / img.height;
      const targetAspect = photoW / photoH;
      let sx = 0, sy = 0, sw = img.width, sh = img.height;

      if (imgAspect > targetAspect) {
        sw = img.height * targetAspect;
        sx = (img.width - sw) / 2;
      } else {
        sh = img.width / targetAspect;
        sy = (img.height - sh) / 2;
      }

      ctx.drawImage(img, sx, sy, sw, sh, paddingX, curY, photoW, photoH);
      ctx.restore();
    }

    // Cute shot numbering badge on top left corner of each photo
    ctx.save();
    ctx.fillStyle = theme.badgeBg || '#FFFFFF';
    ctx.beginPath();
    ctx.arc(paddingX + 22, curY + 22, 16, 0, Math.PI * 2);
    ctx.fill();
    ctx.lineWidth = 2;
    ctx.strokeStyle = theme.borderColor;
    ctx.stroke();

    ctx.fillStyle = theme.badgeText || theme.textColor;
    ctx.font = 'bold 16px "OngleipParkDahyeon", "Jua", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(`${i + 1}`, paddingX + 22, curY + 23);
    ctx.restore();
  }

  // Footer section
  const footerY = startY + 4 * (photoH + gap) + 10;

  // Custom message
  if (config.customMessage) {
    ctx.fillStyle = theme.subtextColor;
    ctx.font = '26px "OngleipParkDahyeon", "Gaegu", cursive, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(config.customMessage, colWidth / 2, footerY + 20);
  }

  // Date
  if (config.showDate) {
    ctx.fillStyle = theme.textColor;
    ctx.font = 'bold 20px "OngleipParkDahyeon", "Jua", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(config.dateStr || new Date().toLocaleDateString('ko-KR'), colWidth / 2, footerY + 54);
  }

  // Life4cut style bottom decorative elements: Barcode + Heart logo
  if (config.showBarcode) {
    const bcY = footerY + 80;
    // Draw stylized cute barcode
    ctx.fillStyle = theme.textColor;
    const barWidths = [3, 1, 4, 2, 1, 3, 2, 4, 1, 2, 3, 1, 4, 2, 3, 1, 2, 4, 1, 3];
    const totalBcW = barWidths.reduce((a, b) => a + b + 2, 0);
    let curBx = (colWidth - totalBcW) / 2;
    for (const bw of barWidths) {
      ctx.fillRect(curBx, bcY, bw, 24);
      curBx += bw + 2;
    }

    // Little photobooth logo text under barcode
    ctx.font = '14px "OngleipParkDahyeon", sans-serif';
    ctx.fillStyle = theme.subtextColor;
    ctx.textAlign = 'center';
    ctx.fillText('KINDERGARTEN PHOTO 4-CUT ★ MEMORIES', colWidth / 2, bcY + 38);
  }

  ctx.restore();
}

/**
 * Draws a 2x2 grid layout (postcard / magnet format)
 */
async function draw2x2GridLayout(
  ctx: CanvasRenderingContext2D,
  photos: CapturedPhoto[],
  theme: FrameTheme,
  config: PhotoboothConfig,
  width: number,
  height: number,
  images: HTMLImageElement[]
) {
  // Background
  ctx.fillStyle = theme.bgColor;
  ctx.fillRect(0, 0, width, height);

  // Outer border
  ctx.lineWidth = 16;
  ctx.strokeStyle = theme.borderColor;
  ctx.strokeRect(8, 8, width - 16, height - 16);

  // Inner subtle border
  ctx.lineWidth = 2;
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)';
  ctx.strokeRect(22, 22, width - 44, height - 44);

  // Header
  ctx.font = '36px "Apple Color Emoji", "Segoe UI Emoji", sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(theme.icon || '🌸', 60, 56);
  ctx.fillText(theme.icon || '🌸', width - 60, 56);

  ctx.fillStyle = theme.textColor;
  ctx.font = 'bold 40px "OngleipParkDahyeon", "Jua", "Noto Sans KR", sans-serif';
  ctx.fillText(config.className || '우리반 네컷', width / 2, 56);

  // Grid Dimensions: 2 columns, 2 rows
  const padX = 50;
  const startY = 105;
  const gap = 20;
  const cellW = (width - padX * 2 - gap) / 2;
  const cellH = Math.round(cellW * 0.75);

  const filterDef = PHOTO_FILTERS.find((f) => f.id === config.filter);
  const activeCanvasFilter = filterDef?.canvasFilter || 'none';

  const positions = [
    { x: padX, y: startY },
    { x: padX + cellW + gap, y: startY },
    { x: padX, y: startY + cellH + gap },
    { x: padX + cellW + gap, y: startY + cellH + gap },
  ];

  for (let i = 0; i < 4; i++) {
    const pos = positions[i];
    const img = images[i];

    // Card background
    ctx.save();
    ctx.shadowColor = 'rgba(0, 0, 0, 0.1)';
    ctx.shadowBlur = 10;
    ctx.shadowOffsetY = 3;
    ctx.fillStyle = theme.photoBorderColor || '#FFFFFF';
    drawRoundRect(ctx, pos.x - 5, pos.y - 5, cellW + 10, cellH + 10, 16);
    ctx.fill();
    ctx.restore();

    if (img) {
      ctx.save();
      drawRoundRect(ctx, pos.x, pos.y, cellW, cellH, 12);
      ctx.clip();

      if (activeCanvasFilter !== 'none') {
        ctx.filter = activeCanvasFilter;
      }

      const imgAspect = img.width / img.height;
      const targetAspect = cellW / cellH;
      let sx = 0, sy = 0, sw = img.width, sh = img.height;

      if (imgAspect > targetAspect) {
        sw = img.height * targetAspect;
        sx = (img.width - sw) / 2;
      } else {
        sh = img.width / targetAspect;
        sy = (img.height - sh) / 2;
      }

      ctx.drawImage(img, sx, sy, sw, sh, pos.x, pos.y, cellW, cellH);
      ctx.restore();
    }

    // Badge
    ctx.save();
    ctx.fillStyle = theme.badgeBg || '#FFFFFF';
    ctx.beginPath();
    ctx.arc(pos.x + 22, pos.y + 22, 16, 0, Math.PI * 2);
    ctx.fill();
    ctx.lineWidth = 2;
    ctx.strokeStyle = theme.borderColor;
    ctx.stroke();

    ctx.fillStyle = theme.badgeText || theme.textColor;
    ctx.font = 'bold 16px "OngleipParkDahyeon", "Jua", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(`${i + 1}`, pos.x + 22, pos.y + 23);
    ctx.restore();
  }

  // Footer
  const footerY = startY + (cellH * 2) + gap + 30;

  if (config.customMessage) {
    ctx.fillStyle = theme.subtextColor;
    ctx.font = '28px "OngleipParkDahyeon", "Gaegu", cursive, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(config.customMessage, width / 2, footerY);
  }

  if (config.showDate) {
    ctx.fillStyle = theme.textColor;
    ctx.font = 'bold 22px "OngleipParkDahyeon", "Jua", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(config.dateStr || new Date().toLocaleDateString('ko-KR'), width / 2, footerY + 36);
  }

  if (config.showBarcode) {
    const bcY = footerY + 60;
    ctx.fillStyle = theme.textColor;
    const barWidths = [3, 2, 4, 1, 3, 2, 1, 4, 2, 3, 1, 2, 4, 3, 1, 2, 4, 1, 3, 2];
    const totalBcW = barWidths.reduce((a, b) => a + b + 2, 0);
    let curBx = (width - totalBcW) / 2;
    for (const bw of barWidths) {
      ctx.fillRect(curBx, bcY, bw, 22);
      curBx += bw + 2;
    }
    ctx.font = '14px "OngleipParkDahyeon", sans-serif';
    ctx.fillStyle = theme.subtextColor;
    ctx.textAlign = 'center';
    ctx.fillText('우리들의 소중한 유치원 추억 ★', width / 2, bcY + 36);
  }
}

/**
 * Main function to render the full photobooth strip/grid to an HTML Canvas
 */
export async function renderPhotoboothToCanvas(
  canvas: HTMLCanvasElement,
  selectedPhotos: CapturedPhoto[],
  theme: FrameTheme,
  config: PhotoboothConfig,
  stickers: PlacedSticker[] = []
): Promise<void> {
  await ensureFontLoaded();
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas 2D context not available');

  // Load all images in parallel
  const images: HTMLImageElement[] = [];
  for (let i = 0; i < 4; i++) {
    const photo = selectedPhotos[i];
    if (photo && photo.dataUrl) {
      try {
        const img = await loadImage(photo.dataUrl);
        images.push(img);
      } catch (err) {
        console.error('Failed to load image', err);
      }
    }
  }

  // Set resolution based on layout
  if (config.layout === 'strip-1') {
    // Single 1x4 vertical strip (Life4cut style)
    const W = 640;
    const H = 1920;
    canvas.width = W;
    canvas.height = H;
    await drawSingleStripColumn(ctx, selectedPhotos, theme, config, 0, 0, W, H, images);
  } else if (config.layout === 'strip-2') {
    // 1+1 Twin vertical strips side-by-side (Classic print standard: 1280 x 1920)
    const colW = 600;
    const totalW = colW * 2 + 40; // with center cut line
    const totalH = 1920;
    canvas.width = totalW;
    canvas.height = totalH;

    // Outer background
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, totalW, totalH);

    // Left strip
    await drawSingleStripColumn(ctx, selectedPhotos, theme, config, 0, 0, colW, totalH, images);

    // Right strip
    await drawSingleStripColumn(ctx, selectedPhotos, theme, config, colW + 40, 0, colW, totalH, images);

    // Cute dotted cut-line in the middle
    ctx.save();
    ctx.strokeStyle = '#94A3B8';
    ctx.lineWidth = 2;
    ctx.setLineDash([10, 10]);
    ctx.beginPath();
    ctx.moveTo(colW + 20, 20);
    ctx.lineTo(colW + 20, totalH - 20);
    ctx.stroke();

    // Little scissor icon in center
    ctx.font = '24px sans-serif';
    ctx.fillStyle = '#64748B';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('✂️', colW + 20, totalH / 2);
    ctx.fillText('✂️', colW + 20, 80);
    ctx.fillText('✂️', colW + 20, totalH - 80);
    ctx.restore();
  } else {
    // 2x2 Grid Layout
    const W = 1000;
    const H = 1060;
    canvas.width = W;
    canvas.height = H;
    await draw2x2GridLayout(ctx, selectedPhotos, theme, config, W, H, images);
  }

  // Draw user placed stickers on top of the canvas
  if (stickers.length > 0) {
    ctx.save();
    for (const s of stickers) {
      const px = (s.x / 100) * canvas.width;
      const py = (s.y / 100) * canvas.height;
      const baseSize = s.size || 48;
      const scaledSize = Math.round(baseSize * (canvas.width / 600));

      ctx.save();
      ctx.translate(px, py);
      ctx.rotate((s.rotation * Math.PI) / 180);

      if (s.type === 'stamp') {
        // Draw cute stamp badge
        ctx.fillStyle = '#DC2626';
        ctx.shadowColor = 'rgba(0,0,0,0.2)';
        ctx.shadowBlur = 6;
        drawRoundRect(ctx, -scaledSize * 1.4, -scaledSize * 0.45, scaledSize * 2.8, scaledSize * 0.9, 14);
        ctx.fill();

        ctx.lineWidth = 3;
        ctx.strokeStyle = '#FFFFFF';
        drawRoundRect(ctx, -scaledSize * 1.35, -scaledSize * 0.4, scaledSize * 2.7, scaledSize * 0.8, 12);
        ctx.stroke();

        ctx.fillStyle = '#FFFFFF';
        ctx.font = `bold ${Math.round(scaledSize * 0.44)}px "OngleipParkDahyeon", "Jua", sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(s.content, 0, 2);
      } else {
        // Emoji sticker
        ctx.font = `${scaledSize}px "Apple Color Emoji", "Segoe UI Emoji", sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.shadowColor = 'rgba(0,0,0,0.18)';
        ctx.shadowBlur = 8;
        ctx.fillText(s.content, 0, 0);
      }
      ctx.restore();
    }
    ctx.restore();
  }
}
