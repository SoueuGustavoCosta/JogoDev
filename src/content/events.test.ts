import { describe, expect, it } from 'vitest';
import { checkSingleShot } from '@/domain/bossFight';
import { eventCalendarSchema } from '@/domain/events';
import { cosmetics } from './cosmetics';
import { eventCalendar } from './events/calendar';
import { ecoSoltoRounds } from './events/ecoSolto';
import { workshops } from './workshops';

describe('calendário de eventos (content/events/calendar.ts)', () => {
  it('formato válido: tipos, datas, ids únicos', () => {
    const r = eventCalendarSchema.safeParse(eventCalendar);
    expect(r.success, r.success ? '' : r.error.message).toBe(true);
  });

  it('oficina indicada no Eco Solto existe', () => {
    for (const e of eventCalendar) {
      if (e.kind === 'eco-solto' && e.workshopId) expect(workshops.some((w) => w.id === e.workshopId), e.id).toBe(true);
    }
  });

  it('prêmios existem no catálogo, são só de evento e do evento certo', () => {
    for (const e of eventCalendar) {
      if (e.kind === 'surto') continue;
      const item = cosmetics.find((c) => c.id === e.rewardItemId);
      expect(item, `${e.id}: prêmio ${e.rewardItemId}`).toBeDefined();
      expect(item?.price, e.id).toBeNull();
      expect(item?.event, e.id).toBe(e.kind);
    }
  });
});

describe('rodadas do Eco Solto', () => {
  it('tem rodadas para 3 por sexta sem repetir sempre as mesmas', () => {
    expect(ecoSoltoRounds.length).toBeGreaterThanOrEqual(6);
  });

  for (const round of ecoSoltoRounds) {
    it(`${round.title}: o bloco certo passa e os errados não`, () => {
      expect(round.choices).toBeDefined();
      expect(checkSingleShot(round, round.choices!.correct)).toBe(true);
      for (const w of round.choices!.wrong) expect(checkSingleShot(round, w), w).toBe(false);
    });
  }
});
