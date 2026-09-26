import { describe, expect, it } from 'vitest';
import { buildQuizIdIndex, type Progress } from '@/domain/progress';
import type { Trail } from '@/domain/trail';
import type { LeaderboardPort, ProgressRepository } from '../ports';
import { importProgress } from './importProgress';
import { adoptAccountProgress, syncProgressSafely } from './progressSync';
import { withQuizIdMigration } from './quizIdMigration';

class Memory implements ProgressRepository {
  data: Progress | null = null;
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

const item = (id: string) => ({ id, q: id, options: ['a', 'b'], answer: 0, explain: '' });
const trail = {
  id: 'logica',
  modules: [{ id: 'origem', short: '', title: '', lead: '', level: 'Base', blocks: [], quiz: ['q1', 'q2'].map(item) }],
} as unknown as Trail;
const index = buildQuizIdIndex([trail]);

const ok1 = { correct: true, triesUsed: 1 };
const ok2 = { correct: true, triesUsed: 2 };

const withResults = (quizResults: Record<string, unknown>, extra: Partial<Progress> = {}): Progress => ({
  version: 1,
  ...extra,
  trails: {
    logica: {
      trailId: 'logica',
      trophyAwarded: false,
      missionsCompleted: {},
      modules: { origem: { moduleId: 'origem', completed: true, quizResults } as never },
    },
  },
});

const resultsOf = (p: Progress | null) => p?.trails.logica.modules.origem.quizResults;

/** Código de exportação como o app antigo gerava (JSON em base64). */
const exportCode = (p: Progress) => Buffer.from(JSON.stringify(p), 'utf8').toString('base64');

function setup(initial?: Progress) {
  const inner = new Memory();
  if (initial) inner.save(initial);
  return { inner, repository: withQuizIdMigration(inner, index) };
}

describe('withQuizIdMigration', () => {
  it('lê o progresso antigo do aparelho já convertido para id', () => {
    const { repository } = setup(withResults({ 0: ok1, 1: ok2 }));
    expect(resultsOf(repository.load())).toEqual({ q1: ok1, q2: ok2 });
  });

  it('nunca grava o formato antigo', () => {
    const { inner, repository } = setup();
    repository.save(withResults({ 1: ok2 }));
    expect(resultsOf(inner.load())).toEqual({ q2: ok2 });
  });

  it('sem progresso salvo continua sem progresso', () => {
    expect(setup().repository.load()).toBeNull();
  });

  it('importar um código antigo (por posição) junta pelo id', () => {
    const { inner, repository } = setup(withResults({ q1: ok2 }));
    const code = exportCode(withResults({ 0: ok1, 1: ok2 }));
    expect(importProgress({ repository }, { data: code })).toEqual({ ok: true });
    expect(resultsOf(inner.load())).toEqual({ q1: ok1, q2: ok2 });
  });

  it('entrar numa conta cuja cópia da nuvem é antiga: junta pelo id', () => {
    const { inner, repository } = setup(withResults({ q2: ok1 }));
    adoptAccountProgress({ repository }, { uuid: 'conta', cloud: withResults({ 0: ok1, 1: ok2 }) });
    expect(resultsOf(inner.load())).toEqual({ q1: ok1, q2: ok1 });
    expect(inner.load()?.travelerUuid).toBe('conta');
  });

  it('backup com a nuvem antiga: grava e sobe só o formato por id', async () => {
    const { inner, repository } = setup(withResults({ q1: ok2 }, { travelerUuid: 'u1', travelerName: 'Ana' }));
    const uploads: unknown[] = [];
    const leaderboard = {
      getMyProgress: async () => withResults({ 0: ok1, 1: ok2 }),
      backupProgress: async (_uuid: string, _nome: string, progress: unknown) => {
        uploads.push(progress);
      },
    } as unknown as LeaderboardPort;

    expect(await syncProgressSafely({ repository, leaderboard })).toBe(true);
    expect(resultsOf(inner.load())).toEqual({ q1: ok1, q2: ok2 });
    expect(resultsOf(uploads[0] as Progress)).toEqual({ q1: ok1, q2: ok2 });
  });
});
