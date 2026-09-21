/**
 * Insígnias dos chefes de fase de fim de era: um emblema minimalista de traço fino, no
 * mesmo idioma visual do resto do jogo (anéis pontilhados, brilho neon suave) — cada
 * insígnia reaproveita literalmente o mesmo desenho do símbolo da ilha (ver Icons.tsx),
 * só que maior e em destaque, então quem já reconhece a ilha reconhece a insígnia na hora.
 * SVG puro, sem imagem externa: escala de um perfil pequeno até a tela de vitória do boss fight.
 */
import type { ReactElement, ReactNode } from 'react';

function BadgeShell({
  size,
  accent,
  glow,
  label,
  children,
}: {
  size: number;
  accent: string;
  glow: string;
  label: string;
  children: ReactNode;
}) {
  return (
    <svg viewBox="0 0 140 140" width={size} height={size} xmlns="http://www.w3.org/2000/svg" role="img" aria-label={label}>
      <defs>
        <filter id="badge-glow" x="-60%" y="-60%" width="220%" height="220%">
          <feGaussianBlur stdDeviation="5" />
        </filter>
      </defs>
      <circle cx="70" cy="70" r="58" fill={glow} opacity="0.35" filter="url(#badge-glow)" />
      <circle cx="70" cy="70" r="58" fill="#151225" stroke="#2c2647" strokeWidth="6" />
      <circle cx="70" cy="70" r="58" fill="none" stroke={accent} strokeWidth="2.5" />
      <circle cx="70" cy="70" r="47" fill="none" stroke={accent} strokeWidth="1.5" strokeDasharray="3 7" opacity="0.8" />
      {children}
    </svg>
  );
}

export function DatabaseBadge({ size = 220 }: { size?: number }) {
  return (
    <BadgeShell
      size={size}
      accent="#5ee7ff"
      glow="#5ee7ff"
      label="Insígnia Guardião do Banco de Dados: anel roxo e ciano em volta de um cilindro de banco de dados"
    >
      <g transform="translate(35.6 35.6) scale(2.85)" stroke="#ece9f8" strokeWidth="1.3" fill="none" strokeLinecap="round" strokeLinejoin="round">
        <ellipse cx="12" cy="6" rx="7" ry="3" />
        <path d="M5 6v12c0 1.7 3.1 3 7 3s7-1.3 7-3V6M5 12c0 1.7 3.1 3 7 3s7-1.3 7-3" />
      </g>
      <circle cx="70" cy="70" r="58" fill="none" stroke="#9b4dff" strokeWidth="1" opacity="0.6" />
    </BadgeShell>
  );
}

export function GitBadge({ size = 220 }: { size?: number }) {
  return (
    <BadgeShell
      size={size}
      accent="#ffa36b"
      glow="#ff2ec4"
      label="Insígnia Guardião do Versionamento: anel neon em volta de um branch de Git"
    >
      <g transform="translate(35.6 35.6) scale(2.85)" stroke="#fff0fb" strokeWidth="1.3" fill="none" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="6" cy="6" r="2" fill="#fff0fb" stroke="none" />
        <circle cx="6" cy="18" r="2" fill="#fff0fb" stroke="none" />
        <circle cx="18" cy="9" r="2" fill="#fff0fb" stroke="none" />
        <path d="M6 8v8M18 11c0 4-6 3-10 6" />
      </g>
      <circle cx="70" cy="70" r="58" fill="none" stroke="#00f0ff" strokeWidth="1" opacity="0.6" />
    </BadgeShell>
  );
}

const BADGE_BY_TRAIL: Record<string, (props: { size?: number }) => ReactElement> = {
  'banco-de-dados': DatabaseBadge,
  'git-github': GitBadge,
};

/** Dispatcher por trilha, no mesmo espírito do `IslandSymbol` (símbolo por `id`). */
export function TrailBadge({ trailId, size = 220 }: { trailId: string; size?: number }) {
  const Badge = BADGE_BY_TRAIL[trailId] ?? DatabaseBadge;
  return <Badge size={size} />;
}
