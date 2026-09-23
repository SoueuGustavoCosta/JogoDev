export type SintaxeExpression = 'happy' | 'sad' | 'neutral';

const MOUTH_PATH: Record<SintaxeExpression, string> = {
  happy: 'M-8 11q8 5 16 0',
  neutral: 'M-8 12h16',
  sad: 'M-8 16q8 -6 16 0',
};

const EYE_SIZE: Record<SintaxeExpression, { y: number; h: number }> = {
  happy: { y: -6, h: 11 },
  neutral: { y: -6, h: 11 },
  sad: { y: -4, h: 7 },
};

/**
 * A Sintaxe: mini terminal flutuante com olhos de cursor e sorriso laranja (personagem
 * original). `expression` é opcional e por padrão "happy" (o rosto de sempre, pixel a
 * pixel igual ao original) — só muda em lugares que precisam reagir a algo, como o
 * feedback de quiz (ver `SintaxeReaction`).
 */
export function SintaxeFace({
  size = 96,
  className,
  expression = 'happy',
}: {
  size?: number;
  className?: string;
  expression?: SintaxeExpression;
}) {
  const eye = EYE_SIZE[expression];
  return (
    <svg
      viewBox="-30 -26 60 52"
      width={size}
      height={(size * 52) / 60}
      className={className}
      role="img"
      aria-label="Senhorita Sintaxe, a guia da Linha do Tempo"
    >
      <rect x="-24" y="-20" width="48" height="40" rx="6" fill="#151225" stroke="#9b4dff" strokeWidth="1.6" />
      <rect x="-24" y="-20" width="48" height="8" rx="5" fill="#1b1731" />
      <circle cx="-18" cy="-16" r="1.5" fill="#ff5f57" />
      <circle cx="-13" cy="-16" r="1.5" fill="#febc2e" />
      <circle cx="-8" cy="-16" r="1.5" fill="#28c840" />
      <rect x="-14" y={eye.y} width="8" height={eye.h} rx="3" fill="#5ee7ff" />
      <rect x="6" y={eye.y} width="8" height={eye.h} rx="3" fill="#5ee7ff" />
      <path d={MOUTH_PATH[expression]} stroke="#ff6b1f" strokeWidth="2.4" fill="none" strokeLinecap="round" />
    </svg>
  );
}
