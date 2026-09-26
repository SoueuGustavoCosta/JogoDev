import { describe, expect, it } from 'vitest';
import { earnedSeal, leagueWeek, leagueWeekOfDay, msUntilLeagueReset, previousLeagueWeek, rankOf, rankWithMe, type LeagueEntry } from '.';

const e = (uuid: string, xp: number): LeagueEntry => ({ uuid, name: uuid, photoUrl: null, lineDays: 1, xp });

describe('semana da Liga (segunda a domingo, São Paulo)', () => {
  it('a semana é identificada pela segunda-feira', () => {
    expect(leagueWeekOfDay('2026-09-28')).toBe('2026-09-28'); // segunda
    expect(leagueWeekOfDay('2026-10-04')).toBe('2026-09-28'); // domingo
    expect(leagueWeekOfDay('2026-10-05')).toBe('2026-10-05');
    expect(leagueWeekOfDay('2027-01-01')).toBe('2026-12-28'); // vira o ano
  });

  it('domingo 23:59 em São Paulo ainda é a semana velha; segunda 00:00 já é a nova', () => {
    // 23:59 de domingo em SP (UTC-3) = 02:59 UTC de segunda.
    expect(leagueWeek(new Date('2026-10-05T02:59:00Z'))).toBe('2026-09-28');
    expect(leagueWeek(new Date('2026-10-05T03:00:00Z'))).toBe('2026-10-05');
  });

  it('contagem regressiva até segunda 00:00 de São Paulo', () => {
    expect(msUntilLeagueReset(new Date('2026-10-05T02:59:00Z'))).toBe(60_000);
    expect(msUntilLeagueReset(new Date('2026-10-05T03:00:00Z'))).toBe(7 * 86_400_000);
    expect(msUntilLeagueReset(new Date('2026-10-01T15:00:00Z'))).toBe(3 * 86_400_000 + 12 * 3_600_000);
  });

  it('semana anterior', () => {
    expect(previousLeagueWeek('2026-10-05')).toBe('2026-09-28');
    expect(previousLeagueWeek('2027-01-04')).toBe('2026-12-28');
  });
});

describe('ranking da semana', () => {
  it('põe o viajante com o XP deste aparelho (o servidor pode estar atrasado)', () => {
    const list = rankWithMe([e('a', 800), e('me', 100), e('b', 500)], e('me', 600));
    expect(list.map((x) => `${x.uuid}:${x.xp}`)).toEqual(['a:800', 'me:600', 'b:500']);
    expect(rankOf(list, 'me')).toBe(2);
  });

  it('nunca baixa o XP que o servidor já tem', () => {
    expect(rankWithMe([e('me', 300)], e('me', 100))[0].xp).toBe(300);
  });

  it('sem XP e fora do servidor, o viajante não aparece; empate mantém a ordem do servidor', () => {
    expect(rankWithMe([e('a', 5)], e('me', 0)).map((x) => x.uuid)).toEqual(['a']);
    expect(rankWithMe([e('a', 5), e('b', 5)], e('me', 0)).map((x) => x.uuid)).toEqual(['a', 'b']);
  });

  it('selo: top 3 com algum XP', () => {
    const list = [e('a', 9), e('b', 8), e('c', 7), e('d', 6)];
    expect(earnedSeal(list, 'c')).toBe(true);
    expect(earnedSeal(list, 'd')).toBe(false);
    expect(earnedSeal([e('a', 0)], 'a')).toBe(false);
    expect(earnedSeal(list, 'x')).toBe(false);
  });
});
