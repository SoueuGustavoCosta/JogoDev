import { describe, expect, it } from 'vitest';
import type { Progress } from '@/domain/progress';
import type { Workshop } from '@/domain/workshop';
import type { AnalyticsPort, CodeRunnerPort, LeaderboardPort, ProgressRepository } from '../ports';
import { getMyWeeklyXp } from './league';
import { getProfileSummary } from './presence';
import { listWorkshops, loadMural, publishToMural, runWorkshopTests, solveWorkshop, toggleStar, workshopsForTrail } from './workshop';

class Memory implements ProgressRepository {
  data: Progress | null = { version: 1, trails: {} };
  load() {
    return this.data;
  }
  save(p: Progress) {
    this.data = p;
  }
  clear() {
    this.data = null;
  }
}

class Recording implements AnalyticsPort {
  events: { event: string; props?: Record<string, unknown> }[] = [];
  track(event: string, props?: Record<string, unknown>) {
    this.events.push({ event, props });
  }
}

const workshop: Workshop = {
  id: 'dobro',
  title: 'Dobro',
  story: 's',
  prompt: 'p',
  level: 'Base',
  languages: ['js'],
  inputs: [{ name: 'n', description: 'n' }],
  tests: [
    { inputs: { n: 1 }, expected: '2' },
    { inputs: { n: 5 }, expected: '10' },
  ],
  hiddenTests: [{ inputs: { n: -3 }, expected: '-6' }],
  extra: { prompt: 'e', tests: [{ inputs: { n: 0.5 }, expected: '1' }] },
  solutions: { js: [{ title: 't', code: 'console.log(n * 2)' }] },
  hints: ['a', 'b', 'c'],
  after: { trailId: 'logica', moduleId: 'operadores' },
};

/** "Motor" de mentira: entende só `console.log(n * K)` e `console.log(n + K)`. */
const runner: CodeRunnerPort = {
  supports: () => true,
  prepare: async () => undefined,
  run: async (_lang, code, inputs) => {
    const n = Number(inputs.n);
    const mul = /n \* (\d+)/.exec(code);
    const add = /n \+ (\d+)/.exec(code);
    if (code.includes('while (true)')) return { output: '', error: null, timedOut: true, timeMs: 2000 };
    if (mul) return { output: String(n * Number(mul[1])), error: null, timedOut: false, timeMs: 1 };
    if (add) return { output: String(n + Number(add[1])), error: null, timedOut: false, timeMs: 1 };
    return { output: '', error: 'ReferenceError: x is not defined', timedOut: false, timeMs: 1 };
  },
};

const leaderboard = { syncWeeklyXp: async () => undefined } as unknown as LeaderboardPort;

describe('Oficina (casos de uso)', () => {
  it('roda visíveis e surpresa e diz o primeiro que falhou', async () => {
    const analytics = new Recording();
    const ok = await runWorkshopTests({ runner, analytics }, { workshop, lang: 'js', code: 'console.log(n * 2)' });
    expect(ok).toMatchObject({ passed: 3, total: 3, firstFailure: null });
    const bad = await runWorkshopTests({ runner, analytics }, { workshop, lang: 'js', code: 'console.log(n + 1)' });
    expect(bad.passed).toBe(1);
    expect(bad.firstFailure?.test.inputs).toEqual({ n: 5 });
    const loop = await runWorkshopTests({ runner, analytics }, { workshop, lang: 'js', code: 'while (true) {}' });
    expect(loop.firstFailure?.timedOut).toBe(true);
    expect(loop.results).toHaveLength(1);
    expect(loop.total).toBe(3);
    expect(analytics.events.map((e) => e.props)).toContainEqual({ workshop: 'dobro', passed: 3, total: 3 });
  });

  it('com o extra, roda os testes do extra também', async () => {
    const r = await runWorkshopTests({ runner, analytics: new Recording() }, { workshop, lang: 'js', code: 'console.log(n * 2)', withExtra: true });
    expect(r.total).toBe(4);
    expect(r.passed).toBe(4);
  });

  it('resolver dá XP (menos as dicas), conta na Liga e no total; de novo não tira nada', () => {
    const repository = new Memory();
    const analytics = new Recording();
    const deps = { repository, analytics, leaderboard };
    expect(solveWorkshop(deps, { workshop, lang: 'js', hintsUsed: 2, extra: false })).toEqual({ xpGained: 30, totalXp: 30 });
    expect(solveWorkshop(deps, { workshop, lang: 'js', hintsUsed: 3, extra: false })).toEqual({ xpGained: 0, totalXp: 30 });
    expect(solveWorkshop(deps, { workshop, lang: 'js', hintsUsed: 3, extra: true })).toEqual({ xpGained: 25, totalXp: 55 });
    expect(getProfileSummary({ repository }, { trails: [], badgeCatalog: [] }).xp).toBe(55);
    expect(getMyWeeklyXp({ repository })).toBe(55);
    expect(analytics.events.filter((e) => e.event === 'workshop_solved')).toEqual([
      { event: 'workshop_solved', props: { workshop: 'dobro', lang: 'js', hints: 2 } },
    ]);
    expect(listWorkshops({ repository }, { catalog: [workshop] })[0].solved?.extra).toBe(true);
  });

  it('oficinas da ilha', () => {
    expect(workshopsForTrail([workshop], 'logica')).toHaveLength(1);
    expect(workshopsForTrail([workshop], 'php')).toHaveLength(0);
  });
});

describe('Mural da turma (casos de uso)', () => {
  const row = { id: '7', uuid: 'outra', nome: 'Ana', fotoUrl: null, lang: 'js', code: 'x', createdAt: '', stars: 2, starredByMe: false };
  function setup(solved: boolean) {
    const repository = new Memory();
    repository.data = {
      version: 1,
      trails: {},
      travelerUuid: 'eu',
      ...(solved ? { workshops: { dobro: { solvedAt: 'x', langs: ['js'], hintsUsed: 0, xp: 50 } } } : {}),
    };
    const calls: unknown[][] = [];
    const leaderboard = {
      publishSolution: async (...a: unknown[]) => {
        calls.push(['publish', ...a]);
        return true;
      },
      listMural: async () => [row],
      setStar: async (...a: unknown[]) => {
        calls.push(['star', ...a]);
        return true;
      },
    } as unknown as LeaderboardPort;
    return { repository, leaderboard, analytics: new Recording(), calls };
  }

  it('mural só abre depois de resolver', async () => {
    expect(await loadMural(setup(false), { workshop })).toEqual({ status: 'locked' });
    expect(await loadMural(setup(true), { workshop })).toEqual({ status: 'ok', entries: [row], myUuid: 'eu' });
    const off = { ...setup(true), leaderboard: { listMural: async () => null } as unknown as LeaderboardPort };
    expect(await loadMural(off, { workshop })).toEqual({ status: 'offline' });
  });

  it('publicar: só resolvida, sem palavrão, dentro do limite', async () => {
    const notSolved = setup(false);
    expect(await publishToMural(notSolved, { workshop, lang: 'js', code: 'console.log(n * 2)' })).toEqual({ ok: false, reason: 'not-solved' });
    const deps = setup(true);
    expect(await publishToMural(deps, { workshop, lang: 'js', code: 'console.log("porra")' })).toEqual({ ok: false, reason: 'profanity' });
    expect(await publishToMural(deps, { workshop, lang: 'js', code: '  console.log(n * 2)\n' })).toEqual({ ok: true });
    expect(deps.calls).toEqual([['publish', 'eu', 'dobro', 'js', 'console.log(n * 2)']]);
  });

  it('estrela: nunca na própria solução', async () => {
    const deps = setup(true);
    expect(await toggleStar(deps, { entry: row, on: true })).toBe(true);
    expect(await toggleStar(deps, { entry: { ...row, uuid: 'eu' }, on: true })).toBe(false);
    expect(deps.calls).toEqual([['star', 'eu', '7', true]]);
  });
});
