import { describe, expect, it } from 'vitest';
import { leagueWeekOfDay } from '../league';
import { createEmptyProgress } from './factory';
import { mergeProgress } from './merge';
import { recordWeeklyXp, weeklyXpTotal } from './weeklyXp';

const W1 = '2026-09-21';
const W2 = '2026-09-28';

describe('XP da semana', () => {
  it('soma as fontes da semana e as anomalias dos dias dela', () => {
    let p = recordWeeklyXp(createEmptyProgress(), W2, 'quiz:logica/ola/q1', 100);
    p = recordWeeklyXp(p, W2, 'module:logica/ola', 150);
    p = recordWeeklyXp(p, W1, 'quiz:logica/ola/q2', 40);
    p = {
      ...p,
      anomalies: {
        '2026-09-27': { anomalyId: 'a', tries: 1, solvedAt: 'x', xp: 30, fragments: 10 }, // domingo: semana W1
        '2026-09-29': { anomalyId: 'b', tries: 1, solvedAt: 'x', xp: 30, fragments: 10 },
      },
    };
    expect(weeklyXpTotal(p, W2, leagueWeekOfDay)).toBe(280);
    expect(weeklyXpTotal(p, W1, leagueWeekOfDay)).toBe(70);
  });

  it('a mesma fonte não conta duas vezes; XP zero não grava nada', () => {
    const p = recordWeeklyXp(createEmptyProgress(), W2, 'quiz:x', 100);
    expect(recordWeeklyXp(p, W2, 'quiz:x', 100)).toBe(p);
    expect(recordWeeklyXp(p, W2, 'quiz:y', 0)).toBe(p);
    expect(weeklyXpTotal(p, W2, leagueWeekOfDay)).toBe(100);
  });

  it('guarda só as últimas 3 semanas', () => {
    let p = createEmptyProgress();
    for (const w of ['2026-09-07', '2026-09-14', W1, W2]) p = recordWeeklyXp(p, w, 'q', 10);
    expect(Object.keys(p.weeklyXp ?? {})).toEqual(['2026-09-14', W1, W2]);
  });

  it('merge entre aparelhos: união por fonte, sem duplicar', () => {
    const phone = recordWeeklyXp(recordWeeklyXp(createEmptyProgress(), W2, 'quiz:a', 100), W2, 'quiz:b', 40);
    const laptop = recordWeeklyXp(recordWeeklyXp(createEmptyProgress(), W2, 'quiz:a', 100), W2, 'quiz:c', 100);
    const merged = mergeProgress(phone, laptop);
    expect(weeklyXpTotal(merged, W2, leagueWeekOfDay)).toBe(240);
    expect(weeklyXpTotal(mergeProgress(merged, phone), W2, leagueWeekOfDay)).toBe(240);
  });

  it('selos: união', () => {
    const a = { ...createEmptyProgress(), leagueSeals: [W1] };
    const b = { ...createEmptyProgress(), leagueSeals: [W2, W1] };
    expect(mergeProgress(a, b).leagueSeals).toEqual([W1, W2]);
    expect('leagueSeals' in mergeProgress(createEmptyProgress(), createEmptyProgress())).toBe(false);
  });
});
