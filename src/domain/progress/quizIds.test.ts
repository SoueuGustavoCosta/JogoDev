import { describe, expect, it } from 'vitest';
import type { Module, Trail } from '../trail/types';
import { mergeProgress } from './merge';
import { buildQuizIdIndex, isLegacyQuizKey, migrateQuizResultKeys } from './quizIds';
import type { Progress } from './types';

const item = (id: string) => ({ id, q: id, options: ['a', 'b'], answer: 0, explain: '' });
const mod = (id: string, ids: string[]): Module => ({
  id,
  short: id,
  title: id,
  lead: '',
  level: 'Base',
  blocks: [{ t: 'p', x: 'x' }],
  quiz: ids.map(item),
});
const trail = { id: 't', modules: [mod('a', ['q1', 'q2', 'q3']), mod('b', ['q1'])] } as unknown as Trail;
const index = buildQuizIdIndex([trail]);

const ok1 = { correct: true, triesUsed: 1 };
const ok2 = { correct: true, triesUsed: 2 };
const wrong = { correct: false, triesUsed: 3 };

function withModule(quizResults: Record<string, unknown>, extra: Record<string, unknown> = {}): Progress {
  return {
    version: 1,
    travelerName: 'Ana',
    trails: {
      t: {
        trailId: 't',
        trophyAwarded: false,
        missionsCompleted: { m1: true },
        modules: { a: { moduleId: 'a', completed: true, screen: 4, quizResults, ...extra } as never },
      },
    },
  };
}

describe('buildQuizIdIndex', () => {
  it('lista os ids de cada módulo na ordem do conteúdo', () => {
    expect(index).toEqual({ t: { a: ['q1', 'q2', 'q3'], b: ['q1'] } });
  });
});

describe('isLegacyQuizKey', () => {
  it('só dígitos é posição; id nunca é', () => {
    expect(isLegacyQuizKey('0')).toBe(true);
    expect(isLegacyQuizKey('12')).toBe(true);
    expect(isLegacyQuizKey('q1')).toBe(false);
    expect(isLegacyQuizKey('')).toBe(false);
  });
});

describe('migrateQuizResultKeys', () => {
  it('converte cada posição no id da pergunta que está nela, sem mexer no resto', () => {
    const migrated = migrateQuizResultKeys(withModule({ 0: ok1, 1: ok2, 2: wrong }), index);
    const a = migrated.trails.t.modules.a;
    expect(a.quizResults).toEqual({ q1: ok1, q2: ok2, q3: wrong });
    expect(a.completed).toBe(true);
    expect(a.screen).toBe(4);
    expect(a.unmappedQuizResults).toBeUndefined();
    expect(migrated.travelerName).toBe('Ana');
    expect(migrated.trails.t.missionsCompleted).toEqual({ m1: true });
  });

  it('é idempotente: rodar de novo não muda nada (e devolve o mesmo objeto)', () => {
    const once = migrateQuizResultKeys(withModule({ 0: ok1, 7: ok2 }), index);
    const twice = migrateQuizResultKeys(once, index);
    expect(twice).toBe(once);
    expect(twice).toEqual(once);
  });

  it('progresso já por id volta intacto, sem cópia', () => {
    const current = withModule({ q1: ok1 });
    expect(migrateQuizResultKeys(current, index)).toBe(current);
  });

  it('não altera o objeto recebido', () => {
    const old = withModule({ 0: ok1 });
    const snapshot = JSON.stringify(old);
    migrateQuizResultKeys(old, index);
    expect(JSON.stringify(old)).toBe(snapshot);
  });

  it('posição sem pergunta no conteúdo atual fica guardada à parte, nunca descartada', () => {
    const migrated = migrateQuizResultKeys(withModule({ 0: ok1, 9: ok2 }), index);
    const a = migrated.trails.t.modules.a;
    expect(a.quizResults).toEqual({ q1: ok1 });
    expect(a.unmappedQuizResults).toEqual({ 9: ok2 });
  });

  it('módulo ou trilha que não existe no conteúdo: tudo guardado à parte', () => {
    const old: Progress = {
      version: 1,
      trails: {
        sumiu: { trailId: 'sumiu', trophyAwarded: false, missionsCompleted: {}, modules: { x: { moduleId: 'x', completed: true, quizResults: { 0: ok1 } } } },
      },
    };
    const x = migrateQuizResultKeys(old, index).trails.sumiu.modules.x;
    expect(x.quizResults).toEqual({});
    expect(x.unmappedQuizResults).toEqual({ 0: ok1 });
    expect(x.completed).toBe(true);
  });

  it('cópias misturadas (posição e id da mesma pergunta): fica a melhor tentativa', () => {
    expect(migrateQuizResultKeys(withModule({ 0: ok2, q1: ok1 }), index).trails.t.modules.a.quizResults).toEqual({ q1: ok1 });
    expect(migrateQuizResultKeys(withModule({ 0: ok1, q1: wrong }), index).trails.t.modules.a.quizResults).toEqual({ q1: ok1 });
  });

  it('junta com o que já estava guardado à parte', () => {
    const migrated = migrateQuizResultKeys(withModule({ 9: ok1 }, { unmappedQuizResults: { 9: wrong, 8: ok2 } }), index);
    expect(migrated.trails.t.modules.a.unmappedQuizResults).toEqual({ 9: ok1, 8: ok2 });
  });

  it('aguenta progresso sem trilhas ou com módulo sem quizResults', () => {
    const noTrails = { version: 1 } as unknown as Progress;
    expect(migrateQuizResultKeys(noTrails, index)).toBe(noTrails);
    const noResults = withModule(undefined as never);
    expect(migrateQuizResultKeys(noResults, index)).toBe(noResults);
  });
});

describe('merge entre progresso antigo (posição) e novo (id)', () => {
  const old = withModule({ 0: ok2, 1: ok1, 2: wrong });
  const current = withModule({ q1: ok1, q3: ok2 });
  const expected = { q1: ok1, q2: ok1, q3: ok2 };

  it('juntar e depois migrar dá o mesmo que migrar e depois juntar, nas duas ordens', () => {
    const migrateThenMerge = mergeProgress(migrateQuizResultKeys(old, index), current);
    const mergeThenMigrate = migrateQuizResultKeys(mergeProgress(old, current), index);
    const otherOrder = migrateQuizResultKeys(mergeProgress(current, old), index);
    for (const p of [migrateThenMerge, mergeThenMigrate, otherOrder]) {
      expect(p.trails.t.modules.a.quizResults).toEqual(expected);
      expect(p.trails.t.modules.a.completed).toBe(true);
    }
  });

  it('o merge soma também os resultados guardados à parte', () => {
    const a = withModule({}, { unmappedQuizResults: { 9: wrong } });
    const b = withModule({}, { unmappedQuizResults: { 9: ok2, 8: ok1 } });
    expect(mergeProgress(a, b).trails.t.modules.a.unmappedQuizResults).toEqual({ 9: ok2, 8: ok1 });
  });
});
