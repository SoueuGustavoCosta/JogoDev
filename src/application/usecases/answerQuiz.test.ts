import { beforeEach, describe, expect, it } from 'vitest';
import type { Progress, QuizAnswer } from '@/domain/progress';
import type { QuizItem } from '@/domain/trail';
import type { AnalyticsPort, ProgressRepository } from '../ports';
import { answerQuiz } from './answerQuiz';

class InMemoryProgressRepository implements ProgressRepository {
  private data: Progress | null = null;
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

class RecordingAnalytics implements AnalyticsPort {
  events: { event: string; props?: Record<string, unknown> }[] = [];
  track(event: string, props?: Record<string, unknown>) {
    this.events.push({ event, props });
  }
}

const item: QuizItem = { id: 'q1', q: 'q', options: ['a', 'b'], answer: 0, explain: '' };

describe('answerQuiz', () => {
  let repository: InMemoryProgressRepository;
  let analytics: RecordingAnalytics;

  beforeEach(() => {
    repository = new InMemoryProgressRepository();
    analytics = new RecordingAnalytics();
  });

  it('awards 100 xp for a correct first attempt and persists it', () => {
    const result = answerQuiz(
      { repository, analytics },
      { trailId: 't1', moduleId: 'm1', item, answer: { kind: 'choice', optionIndex: 0 } },
    );

    expect(result).toEqual({ correct: true, alreadyAnswered: false, xpGained: 100 });
    expect(repository.load()?.trails.t1.modules.m1.quizResults.q1).toEqual({ correct: true, triesUsed: 1 });
    expect(analytics.events).toEqual([
      { event: 'quiz_answered', props: { island: 't1', module: 'm1', correct: true, tries: 1 } },
    ]);
  });

  it('awards 0 xp and tracks the attempt for a wrong answer', () => {
    const result = answerQuiz(
      { repository, analytics },
      { trailId: 't1', moduleId: 'm1', item, answer: { kind: 'choice', optionIndex: 1 } },
    );

    expect(result).toEqual({ correct: false, alreadyAnswered: false, xpGained: 0 });
  });

  it('awards only 40 xp when the student gets it right after a previous wrong try', () => {
    answerQuiz(
      { repository, analytics },
      { trailId: 't1', moduleId: 'm1', item, answer: { kind: 'choice', optionIndex: 1 } },
    );
    const result = answerQuiz(
      { repository, analytics },
      { trailId: 't1', moduleId: 'm1', item, answer: { kind: 'choice', optionIndex: 0 } },
    );

    expect(result).toEqual({ correct: true, alreadyAnswered: false, xpGained: 40 });
  });

  it('is idempotent once a question has been answered correctly', () => {
    answerQuiz(
      { repository, analytics },
      { trailId: 't1', moduleId: 'm1', item, answer: { kind: 'choice', optionIndex: 0 } },
    );
    const result = answerQuiz(
      { repository, analytics },
      { trailId: 't1', moduleId: 'm1', item, answer: { kind: 'choice', optionIndex: 0 } },
    );

    expect(result).toEqual({ correct: true, alreadyAnswered: true, xpGained: 0 });
  });
});

describe('answerQuiz: formatos novos (Etapa 4) seguem as mesmas regras de tentativas e XP', () => {
  const cases: { name: string; item: QuizItem; right: QuizAnswer; wrong: QuizAnswer }[] = [
    {
      name: 'montar a linha',
      item: { id: 'o1', kind: 'order', q: 'q', pieces: ['echo', '1', ';'], distractors: ['print'], explain: 'e' },
      right: { kind: 'order', pieces: ['echo', '1', ';'] },
      wrong: { kind: 'order', pieces: ['print', '1', ';'] },
    },
    {
      name: 'o que aparece na tela',
      item: { id: 'o2', kind: 'output', q: 'q', code: 'echo 1;', lang: 'php', options: ['1', '2'], answer: 0, explain: 'e' },
      right: { kind: 'choice', optionIndex: 0 },
      wrong: { kind: 'choice', optionIndex: 1 },
    },
    {
      name: 'encontre o bug',
      item: { id: 'o3', kind: 'bug', q: 'q', lines: ['a', 'b', 'c'], bugLine: 3, explain: 'e' },
      right: { kind: 'line', line: 3 },
      wrong: { kind: 'line', line: 1 },
    },
  ];

  for (const c of cases) {
    it(`${c.name}: 100 de primeira, 40 depois de errar, nada ao repetir`, () => {
      const deps = { repository: new InMemoryProgressRepository(), analytics: new RecordingAnalytics() };
      const params = { trailId: 't1', moduleId: 'm1', item: c.item };
      expect(answerQuiz(deps, { ...params, answer: c.right }).xpGained).toBe(100);

      const deps2 = { repository: new InMemoryProgressRepository(), analytics: new RecordingAnalytics() };
      expect(answerQuiz(deps2, { ...params, answer: c.wrong })).toEqual({ correct: false, alreadyAnswered: false, xpGained: 0 });
      expect(answerQuiz(deps2, { ...params, answer: c.wrong }).correct).toBe(false);
      expect(answerQuiz(deps2, { ...params, answer: c.right }).xpGained).toBe(40);
      expect(deps2.repository.load()?.trails.t1.modules.m1.quizResults[c.item.id]).toEqual({ correct: true, triesUsed: 3 });
      expect(answerQuiz(deps2, { ...params, answer: c.right })).toEqual({ correct: true, alreadyAnswered: true, xpGained: 0 });
    });
  }
});
