/**
 * Redimensiona uma foto de avatar no próprio navegador (canvas), antes de enviar
 * ao Storage: nunca sobe o arquivo original. Recorta para um quadrado centralizado
 * (evita distorção), reduz para ~128x128px e comprime em WEBP, baixando a qualidade
 * até caber em ~50KB ou bater no piso de qualidade — o que vier primeiro.
 *
 * Infraestrutura pura de navegador (`Image`, `canvas`, `FileReader`): por isso vive
 * aqui, fora de `domain/`/`application/`, que não podem tocar nada do DOM.
 */

const TARGET_SIZE = 128;
const MAX_BYTES = 50 * 1024;
const QUALITY_START = 0.85;
const QUALITY_STEP = 0.1;
const QUALITY_FLOOR = 0.35;

function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Não foi possível ler a imagem.'));
    };
    img.src = url;
  });
}

function toBlob(canvas: HTMLCanvasElement, quality: number): Promise<Blob | null> {
  return new Promise((resolve) => canvas.toBlob((b) => resolve(b), 'image/webp', quality));
}

export async function resizeAvatarImage(file: File): Promise<Blob> {
  const img = await loadImage(file);

  const side = Math.min(img.naturalWidth, img.naturalHeight);
  const sx = (img.naturalWidth - side) / 2;
  const sy = (img.naturalHeight - side) / 2;

  const canvas = document.createElement('canvas');
  canvas.width = TARGET_SIZE;
  canvas.height = TARGET_SIZE;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas indisponível neste navegador.');
  ctx.drawImage(img, sx, sy, side, side, 0, 0, TARGET_SIZE, TARGET_SIZE);

  let quality = QUALITY_START;
  let blob = await toBlob(canvas, quality);
  while (blob && blob.size > MAX_BYTES && quality > QUALITY_FLOOR) {
    quality -= QUALITY_STEP;
    blob = await toBlob(canvas, quality);
  }
  if (!blob) throw new Error('Não foi possível gerar a imagem redimensionada.');
  return blob;
}
