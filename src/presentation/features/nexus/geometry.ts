/** Geometria fixa da cena do Nexus (viewBox 400×560), calculada uma vez: nada é recalculado por quadro. */

export const VIEW = { w: 400, h: 560 };
export const ISLAND = { x: 200, y: 430, r: 58 };
export const BRANCH_POS: [number, number][] = [
  [82, 190],
  [200, 150],
  [318, 190],
];
export const BRANCH_R = 26;
/** Portais são ovais (mais altos que largos), como no protótipo. */
export const SX = 0.8;
export const SY = 1.18;

type Pt = [number, number];

function cubic(b: [Pt, Pt, Pt, Pt], s: number): Pt {
  const a = 1 - s;
  const f = (i: 0 | 1) => a * a * a * b[0][i] + 3 * a * a * s * b[1][i] + 3 * a * s * s * b[2][i] + s * s * s * b[3][i];
  return [f(0), f(1)];
}

/** Curva do fio que sai do topo do portal da lua até a base do portal `i`. */
function threadCurve(i: number): [Pt, Pt, Pt, Pt] {
  const [nx, ny] = BRANCH_POS[i]!;
  const top = ISLAND.y - ISLAND.r * SY;
  const base = ny + BRANCH_R * SY;
  return [
    [ISLAND.x + (nx - ISLAND.x) * 0.15, top],
    [ISLAND.x + (nx - ISLAND.x) * 0.2, top - 60],
    [nx, base + 60],
    [nx, base],
  ];
}

/** Um fio ondulado ao redor da curva; `phase` = π dá o fio trançado do outro lado. */
export function threadPath(i: number, phase: number, amp = 6): string {
  const b = threadCurve(i);
  const n = 60;
  let d = '';
  for (let k = 0; k <= n; k++) {
    const s = k / n;
    const [x, y] = cubic(b, s);
    const [x2, y2] = cubic(b, Math.min(1, s + 0.01));
    const dx = x2 - x;
    const dy = y2 - y;
    const len = Math.hypot(dx, dy) || 1;
    const off = Math.sin(s * Math.PI * 5 + phase + i * 2.1) * amp * Math.sin(Math.PI * s);
    d += `${k ? 'L' : 'M'}${(x + (-dy / len) * off).toFixed(1)} ${(y + (dx / len) * off).toFixed(1)}`;
  }
  return d;
}

/** Vórtice: espiral de dois braços dentro do portal. */
export function spiralPath(r: number): string {
  let d = '';
  for (let arm = 0; arm < 2; arm++) {
    for (let k = 0; k <= 48; k++) {
      const s = k / 48;
      const rr = r * (1 - s) * 0.95;
      const a = arm * Math.PI + s * Math.PI * 5;
      d += `${k ? 'L' : 'M'}${(Math.cos(a) * rr).toFixed(1)} ${(Math.sin(a) * rr).toFixed(1)}`;
    }
  }
  return d;
}
