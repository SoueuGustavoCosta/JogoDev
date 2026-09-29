import { describe, expect, it } from 'vitest';
import { withQuizIdMigration } from '@/application/usecases';
import type { ProgressRepository } from '@/application/ports';
import {
  bonusXpTotal,
  buildQuizIdIndex,
  createEmptyProgress,
  mergeProgress,
  withQuizBackup,
  xpForTrail,
  type ModuleProgress,
  type Progress,
  type QuizAttemptResult,
} from '@/domain/progress';
import type { Module, Trail } from '@/domain/trail';
import { trailRegistry } from './registry';
import { moduleRelocations } from './relocations';
import { bancoDeDadosTrail } from './trails/banco-de-dados/trail';
import { modSintaxe } from './trails/banco-de-dados/modules/sintaxe';
import { modTiposdados } from './trails/banco-de-dados/modules/tiposdados';
import { modTipos } from './trails/dados-modelagem/modules/tipos';
import { modArquitetura } from './trails/dados-modelagem/modules/arquitetura';

/**
 * Etapa 14A: a Era dos Dados (22 módulos) virou ilha principal + Lua da Modelagem + Lua do
 * Guardião. Quem jogou antes abre o app com o mesmo XP, os mesmos módulos concluídos, as
 * mesmas missões, chefe e insígnias, pelo mesmo caminho do app (repositório + migração).
 */

const PROTOTYPE_ORDER = ['porque', 'tipos', 'arquitetura', 'interface', 'sintaxe', 'tiposdados', 'relacional', 'create', 'insert', 'where', 'update', 'mer', 'join', 'algebra', 'agg', 'subconsultas', 'norm', 'indices', 'transacoes', 'views', 'seguranca', 'projeto'];

/** A Era dos Dados como era antes da Etapa 14A: 22 módulos, sem fusão, numa trilha só. */
const originals: Record<string, Module> = { sintaxe: modSintaxe, tiposdados: modTiposdados, tipos: modTipos, arquitetura: modArquitetura };
const allModules = trailRegistry.flatMap((t) => t.modules);
const legacyEra: Trail = {
  ...bancoDeDadosTrail,
  modules: PROTOTYPE_ORDER.map((id) => originals[id] ?? allModules.find((m) => m.id === id)!),
};

const newEraIds = ['banco-de-dados', 'dados-modelagem', 'dados-guardiao'];
const newEra = trailRegistry.filter((t) => newEraIds.includes(t.id));

function memoryRepository(initial: Progress | null): ProgressRepository & { raw: () => Progress | null } {
  let stored = initial;
  return {
    load: () => (stored ? structuredClone(stored) : null),
    save: (p) => {
      stored = structuredClone(p);
    },
    clear: () => {
      stored = null;
    },
    raw: () => stored,
  };
}

function appRepository(initial: Progress | null) {
  const inner = memoryRepository(initial);
  const repository = withQuizIdMigration(inner, buildQuizIdIndex(trailRegistry), { modules: moduleRelocations, trails: trailRegistry });
  return { inner, repository };
}

/** Progresso salvo antes da Etapa 14A: todos os módulos da era em `banco-de-dados`. */
function beforeProgress(
  done: (moduleIndex: number) => boolean,
  answer: (moduleIndex: number, q: number) => QuizAttemptResult | undefined,
  byPosition = false,
): Progress {
  const modules: Record<string, ModuleProgress> = {};
  legacyEra.modules.forEach((module, i) => {
    const quizResults: Record<string, QuizAttemptResult> = {};
    module.quiz.forEach((item, q) => {
      const r = answer(i, q);
      if (r) quizResults[byPosition ? String(q) : item.id] = r;
    });
    if (Object.keys(quizResults).length || done(i)) modules[module.id] = { moduleId: module.id, quizResults, completed: done(i) };
  });
  const allDone = legacyEra.modules.every((_m, i) => done(i));
  return {
    ...createEmptyProgress(),
    travelerName: 'Viajante',
    badgesEarned: allDone ? { 'sql-mestre': '2026-09-20T00:00:00.000Z' } : undefined,
    trails: {
      'banco-de-dados': {
        trailId: 'banco-de-dados',
        modules,
        missionsCompleted: { m1: true, m3: true, m12: true },
        trophyAwarded: allDone,
        ...(allDone ? { bossDefeated: true } : {}),
      },
    },
    lastLesson: { trailId: 'banco-de-dados', moduleId: 'indices', at: '2026-09-25T10:00:00.000Z' },
  };
}

function totalXpBefore(p: Progress): number {
  return xpForTrail(legacyEra, p.trails['banco-de-dados']);
}

function totalXpAfter(p: Progress): number {
  return newEra.reduce((sum, t) => sum + xpForTrail(t, p.trails[t.id]), 0) + bonusXpTotal(p);
}

function completedIds(p: Progress): string[] {
  return newEraIds.flatMap((t) => Object.values(p.trails[t]?.modules ?? {}).filter((m) => m.completed).map((m) => m.moduleId)).sort();
}

const firstTry = { correct: true, triesUsed: 1 };
const secondTry = { correct: true, triesUsed: 2 };
const wrong = { correct: false, triesUsed: 1 };

describe('tabela de realocação da Etapa 14A', () => {
  it('cada módulo antigo tem um lugar novo que existe no conteúdo', () => {
    for (const r of moduleRelocations) {
      const to = trailRegistry.find((t) => t.id === r.toTrail);
      const target = to?.modules.find((m) => m.id === (r.fold?.toModule ?? r.moduleId));
      expect(target, `${r.moduleId} → ${r.toTrail}`).toBeDefined();
      // Fora do lugar antigo (senão o progresso ficaria nos dois).
      if (r.fold || r.fromTrail !== r.toTrail) {
        expect(trailRegistry.find((t) => t.id === r.fromTrail)?.modules.some((m) => m.id === r.moduleId)).toBe(false);
      }
      for (const id of r.fold?.legacyQuizOrder ?? []) expect(target!.quiz.map((q) => q.id)).toContain(r.fold!.quizIdPrefix + id);
    }
  });

  it('cobre os 22 módulos do protótipo', () => {
    for (const id of PROTOTYPE_ORDER) {
      const stays = bancoDeDadosTrail.modules.some((m) => m.id === id);
      const moves = moduleRelocations.some((r) => r.fromTrail === 'banco-de-dados' && r.moduleId === id);
      expect(stays !== moves, id).toBe(true);
    }
  });
});

describe('migração do progresso para as luas da Era dos Dados', () => {
  it('jogador novo: nada muda, nada é gravado', () => {
    const { inner, repository } = appRepository(null);
    expect(repository.load()).toBeNull();
    expect(inner.raw()).toBeNull();
    const empty = createEmptyProgress();
    expect(appRepository(empty).repository.load()).toEqual(empty);
  });

  it('jogador no meio da trilha: módulos no lugar novo, XP igual, fundido conta se um dos dois estava feito', () => {
    // Fez os 6 primeiros do protótipo (porque ... tiposdados), com erros e acertos variados.
    const before = beforeProgress(
      (i) => i < 6,
      (i, q) => (i < 6 ? [firstTry, secondTry, wrong][(i + q) % 3] : i === 6 && q === 0 ? secondTry : undefined),
    );
    const { repository } = appRepository(before);
    const after = repository.load()!;

    expect(after.trails['banco-de-dados'].modules.tipos).toBeUndefined();
    expect(after.trails['banco-de-dados'].modules.tiposdados).toBeUndefined();
    expect(completedIds(after)).toEqual(['interface', 'porque', 'sintaxe', 'tipos']);
    expect(after.trails['banco-de-dados'].modules.relacional?.quizResults).toEqual({ q1: secondTry });
    expect(after.trails['dados-modelagem'].modules.tipos.quizResults['arquitetura-q1']).toEqual(before.trails['banco-de-dados'].modules.arquitetura.quizResults.q1);
    expect(after.trails['banco-de-dados'].modules.sintaxe.quizResults['tiposdados-q3']).toEqual(before.trails['banco-de-dados'].modules.tiposdados.quizResults.q3);
    expect(totalXpAfter(after)).toBe(totalXpBefore(before));
    // Missões do laboratório ficam na ilha principal.
    expect(after.trails['banco-de-dados'].missionsCompleted).toEqual({ m1: true, m3: true, m12: true });
    expect(after.lastLesson?.trailId).toBe('dados-guardiao');
  });

  it('jogador que terminou tudo: continua tudo concluído, com troféus, chefe, insígnia e o mesmo XP', () => {
    const before = beforeProgress(() => true, (i, q) => ((i + q) % 4 === 0 ? secondTry : firstTry));
    const { repository } = appRepository(before);
    const after = repository.load()!;

    expect(completedIds(after)).toHaveLength(20);
    for (const t of newEra) expect(t.modules.every((m) => after.trails[t.id]?.modules[m.id]?.completed), t.id).toBe(true);
    for (const id of newEraIds) expect(after.trails[id].trophyAwarded, id).toBe(true);
    expect(after.trails['banco-de-dados'].bossDefeated).toBe(true);
    expect(after.badgesEarned).toEqual({ 'sql-mestre': '2026-09-20T00:00:00.000Z' });
    // Dois módulos fundidos com os dois lados concluídos: 2 × 150 de XP extra, XP total igual.
    expect(bonusXpTotal(after)).toBe(300);
    expect(totalXpAfter(after)).toBe(totalXpBefore(before));
  });

  it('progresso de antes da Etapa 3.5 (resultado pela posição) também chega inteiro', () => {
    const answer = (i: number, q: number) => ((i * 7 + q) % 3 === 0 ? secondTry : firstTry);
    const byId = beforeProgress((i) => i % 2 === 0, answer);
    const byPosition = beforeProgress((i) => i % 2 === 0, answer, true);
    const a = appRepository(byId).repository.load()!;
    const b = appRepository(byPosition).repository.load()!;
    for (const id of newEraIds) expect(b.trails[id].modules, id).toEqual(a.trails[id].modules);
    expect(totalXpAfter(b)).toBe(totalXpBefore(byId));
  });

  it('roda uma vez só: ler e gravar de novo não muda nada', () => {
    const { inner, repository } = appRepository(beforeProgress(() => true, () => firstTry));
    const once = repository.load()!;
    repository.save(once);
    const stored = inner.raw()!;
    expect(stored.trails['banco-de-dados'].modules.indices).toBeUndefined();
    repository.save(repository.load()!);
    expect(inner.raw()).toEqual(stored);
    // Igual ao da primeira leitura, fora a cópia de segurança do quiz que toda gravação refaz.
    expect({ ...repository.load()!, quizBackup: undefined }).toEqual({ ...once, quizBackup: undefined });
    expect(totalXpAfter(repository.load()!)).toBe(totalXpAfter(once));
  });

  it('cópia da nuvem ainda no formato antigo: juntar com a do aparelho não perde nem duplica nada', () => {
    const before = beforeProgress((i) => i < 12, () => firstTry);
    const local = appRepository(before).repository.load()!;
    // A nuvem tem um módulo a mais, feito em outro aparelho com o app antigo.
    const cloud = beforeProgress((i) => i < 13, () => firstTry);
    const { repository } = appRepository(null);
    repository.save(mergeProgress(local, cloud));
    const after = repository.load()!;
    expect(after.trails['banco-de-dados'].modules.join?.completed).toBe(true);
    expect(after.trails['banco-de-dados'].modules.mer).toBeUndefined();
    expect(after.trails['dados-modelagem'].modules.mer.completed).toBe(true);
    expect(bonusXpTotal(after)).toBe(300);
    expect(totalXpAfter(after)).toBe(totalXpBefore(cloud));
  });

  it('cópia de segurança do quiz (quizBackup) apontando para o lugar antigo não recria o módulo antigo', () => {
    const before = withQuizBackup(beforeProgress((i) => i < 3, () => firstTry));
    expect(before.quizBackup?.['banco-de-dados']?.tipos).toBeDefined();
    // O app antigo perdeu os resultados dos módulos, mas a cópia na raiz ficou.
    const lost: Progress = {
      ...before,
      trails: { 'banco-de-dados': { ...before.trails['banco-de-dados'], modules: {} } },
    };
    const { inner, repository } = appRepository(lost);
    const after = repository.load()!;
    expect(after.trails['banco-de-dados'].modules.tipos).toBeUndefined();
    expect(after.trails['dados-modelagem'].modules.tipos.quizResults).toMatchObject({ q1: firstTry, 'arquitetura-q1': firstTry });
    repository.save(after);
    expect(inner.raw()!.quizBackup?.['banco-de-dados']?.tipos).toBeUndefined();
    expect(inner.raw()!.quizBackup?.['dados-modelagem']?.tipos).toBeDefined();
  });
});
