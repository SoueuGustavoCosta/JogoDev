/** A Sintaxe: mini terminal flutuante com olhos de cursor e sorriso laranja (personagem original). */
export function SintaxeFace({ size = 96, className }: { size?: number; className?: string }) {
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
      <rect x="-14" y="-6" width="8" height="11" rx="3" fill="#5ee7ff" />
      <rect x="6" y="-6" width="8" height="11" rx="3" fill="#5ee7ff" />
      <path d="M-8 11q8 5 16 0" stroke="#ff6b1f" strokeWidth="2.4" fill="none" strokeLinecap="round" />
    </svg>
  );
}
