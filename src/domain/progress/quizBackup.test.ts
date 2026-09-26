import { describe, expect, it } from 'vitest';
import { legacyMergeProgress } from './__fixtures__/mergeBeforeQuizIds';
import { mergeProgress } from './merge';
import { mergeQuizBackups, restoreFromQuizBackup, withQuizBackup } from './quizBackup';
import type { Progress } from './types';

const ok1 = { correct: true, triesUsed: 1 };
const ok2 = { correct: true, triesUsed: 2 };
const wrong = { correct: false, triesUsed: 2 };

const progress = (modules: Record<string, Record<string, unknown>>, extra: Partial<Progress> = {}): Progress => ({
  version: 1,
  ...extra,
  trails: {
    t: {
      trailId: 't',
      trophyAwarded: false,
      missionsCompleted: {},
      modules: Object.fromEntries(
        Object.entries(modules).map(([id, quizResults]) => [id, { moduleId: id, completed: true, quizResults } as never]),
      ),
    },
  },
});

describe('withQuizBackup', () => {
  it('copia para a raiz os resultados por id de todos os módulos', () => {
    const p = withQuizBackup(progress({ a: { q1: ok1, q2: wrong }, b: {} }));
    expect(p.quizBackup).toEqual({ t: { a: { q1: ok1, q2: wrong } } });
    expect(p.trails.t.modules.a.quizResults).toEqual({ q1: ok1, q2: wrong });
  });

  it('não copia chaves antigas (posição) e sem resultados não cria a cópia', () => {
    expect(withQuizBackup(progress({ a: { 0: ok1 } })).quizBackup).toBeUndefined();
    expect('quizBackup' in withQuizBackup(progress({ a: {} }, { quizBackup: { t: { a: { q1: ok1 } } } }))).toBe(false);
  });
});

describe('restoreFromQuizBackup', () => {
  it('devolve aos módulos o que só existe na cópia, sem mexer no resto', () => {
    const p = progress({ a: { q1: ok2 } }, { quizBackup: { t: { a: { q1: ok1, q2: wrong } } } });
    const restored = restoreFromQuizBackup(p);
    expect(restored.trails.t.modules.a.quizResults).toEqual({ q1: ok1, q2: wrong });
    expect(restored.trails.t.modules.a.completed).toBe(true);
  });

  it('não piora o que já está no módulo', () => {
    const p = progress({ a: { q1: ok1 } }, { quizBackup: { t: { a: { q1: ok2 } } } });
    expect(restoreFromQuizBackup(p)).toBe(p);
  });

  it('recria módulo e trilha que tenham sumido', () => {
    const p: Progress = { version: 1, trails: {}, quizBackup: { t: { a: { q1: ok1 } } } };
    const m = restoreFromQuizBackup(p).trails.t.modules.a;
    expect(m).toEqual({ moduleId: 'a', completed: false, quizResults: { q1: ok1 } });
  });

  it('sem cópia, devolve o mesmo objeto', () => {
    const p = progress({ a: { q1: ok1 } });
    expect(restoreFromQuizBackup(p)).toBe(p);
  });
});

describe('mergeProgress junta as cópias', () => {
  it('união com a melhor tentativa', () => {
    expect(mergeQuizBackups({ t: { a: { q1: ok2 } } }, { t: { a: { q1: ok1, q2: wrong }, b: { q1: ok1 } } })).toEqual({
      t: { a: { q1: ok1, q2: wrong }, b: { q1: ok1 } },
    });
    const merged = mergeProgress(progress({}, { quizBackup: { t: { a: { q1: ok1 } } } }), progress({}, { quizBackup: { t: { a: { q2: ok2 } } } }));
    expect(merged.quizBackup).toEqual({ t: { a: { q1: ok1, q2: ok2 } } });
    expect('quizBackup' in mergeProgress(progress({}), progress({}))).toBe(false);
  });
});

describe('merge do app antigo (antes da Etapa 3.5)', () => {
  it('descarta os resultados por id dos módulos, mas preserva a cópia da raiz (por isso ela existe)', () => {
    const local = withQuizBackup(progress({ a: { q1: ok1, q2: ok2 } }));
    const cloud = withQuizBackup(progress({ a: { q3: ok1 } }));
    const byOldApp = JSON.parse(JSON.stringify(legacyMergeProgress(local, cloud))) as Progress;
    expect(byOldApp.trails.t.modules.a.quizResults).toEqual({});
    expect(byOldApp.trails.t.modules.a.completed).toBe(true);
    // O merge antigo fica com a cópia de um dos lados; a do outro lado continua no aparelho dele.
    expect(byOldApp.quizBackup).toEqual(local.quizBackup);
    expect(restoreFromQuizBackup(byOldApp).trails.t.modules.a.quizResults).toEqual({ q1: ok1, q2: ok2 });
  });
});
