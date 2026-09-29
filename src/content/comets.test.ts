import { describe, expect, it } from 'vitest';
import { cometSchema } from '@/domain/comets';
import { badgeCatalog } from './badges/catalog';
import { cometCalendar } from './comets/calendar';
import { trailRegistry } from './registry';

const DAY = 24 * 60 * 60 * 1000;

describe('calendário dos Cometas (content/comets/calendar.ts)', () => {
  it('cada cometa tem formato válido, trilha com chefe e as duas insígnias no catálogo', () => {
    for (const c of cometCalendar) {
      expect(() => cometSchema.parse(c), c.id).not.toThrow();
      const trail = trailRegistry.find((t) => t.id === c.trailId);
      expect(trail?.bossFight, c.id).toBeDefined();
      // O chefe concede a comum; a rara troca no lugar dela durante o cometa.
      expect(trail?.bossFight?.badgeId, c.id).toBe(c.commonBadgeId);
      expect(badgeCatalog.find((b) => b.id === c.rareBadgeId)?.rare, c.rareBadgeId).toBe(true);
      expect(badgeCatalog.some((b) => b.id === c.commonBadgeId), c.commonBadgeId).toBe(true);
    }
  });

  it('ids únicos, 14 dias no céu e pelo menos 1 dia de céu limpo entre dois cometas', () => {
    expect(new Set(cometCalendar.map((c) => c.id)).size).toBe(cometCalendar.length);
    const sorted = [...cometCalendar].sort((a, b) => Date.parse(a.from) - Date.parse(b.from));
    sorted.forEach((c, i) => {
      expect(Date.parse(c.to) - Date.parse(c.from), c.id).toBe(14 * DAY);
      const next = sorted[i + 1];
      if (next) expect(Date.parse(next.from) - Date.parse(c.to), `${c.id} → ${next.id}`).toBeGreaterThanOrEqual(DAY);
    });
  });
});
