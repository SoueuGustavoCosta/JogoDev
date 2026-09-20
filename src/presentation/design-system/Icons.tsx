import type { ReactNode } from 'react';

function Svg({ children, size = 22, stroke = 'currentColor' }: { children: ReactNode; size?: number; stroke?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      stroke={stroke}
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {children}
    </svg>
  );
}

export const HomeIcon = () => (
  <Svg>
    <path d="M3 11l9-8 9 8v9a1 1 0 01-1 1h-5v-6H9v6H4a1 1 0 01-1-1z" />
  </Svg>
);
export const IslandIcon = () => (
  <Svg>
    <path d="M4 19c4-2 12-2 16 0M8 15c0-4 3-8 4-11 1 3 4 7 4 11" />
  </Svg>
);
export const LabIcon = () => (
  <Svg>
    <path d="M4 5h16v14H4zM8 10l3 2-3 2M13 15h4" />
  </Svg>
);
export const MoreIcon = () => (
  <Svg>
    <circle cx="5" cy="12" r="1.5" />
    <circle cx="12" cy="12" r="1.5" />
    <circle cx="19" cy="12" r="1.5" />
  </Svg>
);

const SYMBOLS: Record<string, (stroke: string) => ReactNode> = {
  'database-cylinder': () => (
    <>
      <ellipse cx="12" cy="6" rx="7" ry="3" />
      <path d="M5 6v12c0 1.7 3.1 3 7 3s7-1.3 7-3V6M5 12c0 1.7 3.1 3 7 3s7-1.3 7-3" />
    </>
  ),
  'logic-diamond': () => (
    <>
      <path d="M12 3l6 6-6 6-6-6z" />
      <path d="M12 15v3M9 21h6M6 9H3M21 9h-3" />
    </>
  ),
  java: () => (
    <>
      <path d="M8 4c3 3-3 4 0 8M13 3c3 3-3 5 0 9" />
      <path d="M5 15h12a3 3 0 010 6H8a3 3 0 01-3-3z" />
    </>
  ),
  python: () => (
    <>
      <path d="M8 8V6a3 3 0 013-3h2a3 3 0 013 3v4a2 2 0 01-2 2H9a2 2 0 00-2 2v3a3 3 0 003 3h2" />
      <path d="M16 12v6" />
    </>
  ),
  git: () => (
    <>
      <circle cx="6" cy="6" r="2" />
      <circle cx="6" cy="18" r="2" />
      <circle cx="18" cy="9" r="2" />
      <path d="M6 8v8M18 11c0 4-6 3-10 6" />
    </>
  ),
};

/** Símbolo próprio de cada ilha (SVG original, sem logotipos oficiais). */
export function IslandSymbol({ id, color = 'currentColor', size = 30 }: { id: string; color?: string; size?: number }) {
  const draw = SYMBOLS[id] ?? SYMBOLS['logic-diamond'];
  return (
    <Svg size={size} stroke={color}>
      {draw(color)}
    </Svg>
  );
}

export function Rocket() {
  return (
    <svg viewBox="0 0 60 110" width="54" aria-hidden="true">
      <path d="M30 2c10 12 14 30 14 48H16C16 32 20 14 30 2z" fill="#ece9f8" />
      <circle cx="30" cy="34" r="6" fill="#9b4dff" />
      <path d="M16 50L4 68l12-4zM44 50l12 18-12-4z" fill="#ff6b1f" />
      <path className="flame" style={{ transformOrigin: '30px 52px' }} d="M22 52h16l-8 34z" fill="#ffa36b" />
    </svg>
  );
}
