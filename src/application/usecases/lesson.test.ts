import { beforeEach, describe, expect, it } from 'vitest';
import { xpForModule, type Progress } from '@/domain/progress';
import type { Module } from '@/domain/trail';
import type { ProgressRepository } from '../ports';
import { getLessonMode, getLessonPosition, saveLessonPosition, setLessonMode } from './lesson';

class InMemoryProgressRepository implements ProgressRepository {
  constructor(private data: Progress | null = null) {}
  load() {
    return this.data;
  }
  save(progress: Progress) {
    this.data = progress;
  }
  clear() {
    this.data = null;
  }
}

/** Progresso exatamente como era salvo antes da Etapa 3 (sem `screen` nem `lessonMode`). */
const OLD_SAVED = JSON.stringify({
  version: 1,
  travelerName: 'Ana',
  prologueSeen: true,
  streakCurrent: 3,
  badgesEarned: { 'logica-variaveis': '2026-09-20T10:00:00.000Z' },
  trails: {
    logica: {
      trailId: 'logica',
      trophyAwarded: false,
      missionsCompleted: {},
      modules: {
        variaveis: { moduleId: 'variaveis', completed: true, quizResults: { 0: { correct: true, triesUsed: 1 } } },
        decisoes: { moduleId: 'decisoes', completed: false, quizResults: { 0: { correct: true, triesUsed: 2 } } },
      },
    },
  },
});

const decisoes: Module = {
  id: 'decisoes',
  short: 'Decisões',
  title: 'Decisões',
  lead: '',
  level: 'Base',
  blocks: [{ t: 'p', x: 'x' }],
  quiz: [
    { id: 'q1', q: 'a', options: ['1', '2'], answer: 0, explain: '' },
    { id: 'q2', q: 'b', options: ['1', '2'], answer: 0, explain: '' },
  ],
};

describe('lição em telas curtas: posição e modo', () => {
  let repository: InMemoryProgressRepository;

  beforeEach(() => {
    repository = new InMemoryProgressRepository(JSON.parse(OLD_SAVED) as Progress);
  });

  it('progresso antigo (sem os campos novos) abre na primeira tela e no modo padrão', () => {
    expect(getLessonPosition({ repository }, { trailId: 'logica', moduleId: 'decisoes', screenCount: 10 })).toBe(0);
    expect(getLessonMode({ repository }, { fallback: 'telas' })).toBe('telas');
  });

  it('guarda a tela e volta nela depois', () => {
    saveLessonPosition({ repository }, { trailId: 'logica', moduleId: 'decisoes', screen: 6 });
    expect(getLessonPosition({ repository }, { trailId: 'logica', moduleId: 'decisoes', screenCount: 10 })).toBe(6);
  });

  it('guardar a tela não mexe em XP, respostas, conclusão nem em nada fora do módulo', () => {
    const before = JSON.parse(OLD_SAVED) as Progress;
    saveLessonPosition({ repository }, { trailId: 'logica', moduleId: 'decisoes', screen: 3 });
    const after = repository.load()!;
    const { screen, ...rest } = after.trails.logica.modules.decisoes;
    expect(screen).toBe(3);
    expect(rest).toEqual(before.trails.logica.modules.decisoes);
    expect(xpForModule(decisoes, after.trails.logica.modules.decisoes)).toBe(
      xpForModule(decisoes, before.trails.logica.modules.decisoes),
    );
    expect({ ...after, trails: {} }).toEqual({ ...before, trails: {} });
    expect(after.trails.logica.modules.variaveis).toEqual(before.trails.logica.modules.variaveis);
  });

  it('módulo concluído abre do começo e não guarda posição (é revisão)', () => {
    saveLessonPosition({ repository }, { trailId: 'logica', moduleId: 'variaveis', screen: 4 });
    expect(repository.load()!.trails.logica.modules.variaveis.screen).toBeUndefined();
    expect(getLessonPosition({ repository }, { trailId: 'logica', moduleId: 'variaveis', screenCount: 10 })).toBe(0);
  });

  it('posição guardada maior que o número atual de telas (conteúdo mudou) vai para a última', () => {
    saveLessonPosition({ repository }, { trailId: 'logica', moduleId: 'decisoes', screen: 20 });
    expect(getLessonPosition({ repository }, { trailId: 'logica', moduleId: 'decisoes', screenCount: 8 })).toBe(7);
  });

  it('ignora posições inválidas', () => {
    saveLessonPosition({ repository }, { trailId: 'logica', moduleId: 'decisoes', screen: -1 });
    saveLessonPosition({ repository }, { trailId: 'logica', moduleId: 'decisoes', screen: 1.5 });
    expect(repository.load()!.trails.logica.modules.decisoes.screen).toBeUndefined();
  });

  it('funciona para quem nunca abriu nada (sem progresso salvo)', () => {
    const fresh = new InMemoryProgressRepository();
    saveLessonPosition({ repository: fresh }, { trailId: 'logica', moduleId: 'decisoes', screen: 2 });
    expect(getLessonPosition({ repository: fresh }, { trailId: 'logica', moduleId: 'decisoes', screenCount: 5 })).toBe(2);
  });

  it('Modo leitura: a escolha do viajante vale mais que o padrão do app', () => {
    setLessonMode({ repository }, { mode: 'rolagem' });
    expect(getLessonMode({ repository }, { fallback: 'telas' })).toBe('rolagem');
    setLessonMode({ repository }, { mode: 'telas' });
    expect(getLessonMode({ repository }, { fallback: 'rolagem' })).toBe('telas');
  });
});
