import { beforeEach, describe, expect, it } from 'vitest';
import type { Progress } from '@/domain/progress';
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
      { trailId: 't1', moduleId: 'm1', quizIndex: 0, item, answer: { kind: 'choice', optionIndex: 0 } },
    );

    expect(result).toEqual({ correct: true, alreadyAnswered: false, xpGained: 100 });
    expect(repository.load()?.trails.t1.modules.m1.quizResults[0]).toEqual({ correct: true, triesUsed: 1 });
    expect(analytics.events).toEqual([
      { event: 'quiz_answered', props: { island: 't1', module: 'm1', correct: true, tries: 1 } },
    ]);
  });

  it('awards 0 xp and tracks the attempt for a wrong answer', () => {
    const result = answerQuiz(
      { repository, analytics },
      { trailId: 't1', moduleId: 'm1', quizIndex: 0, item, answer: { kind: 'choice', optionIndex: 1 } },
    );

    expect(result).toEqual({ correct: false, alreadyAnswered: false, xpGained: 0 });
  });

  it('awards only 40 xp when the student gets it right after a previous wrong try', () => {
    answerQuiz(
      { repository, analytics },
      { trailId: 't1', moduleId: 'm1', quizIndex: 0, item, answer: { kind: 'choice', optionIndex: 1 } },
    );
    const result = answerQuiz(
      { repository, analytics },
      { trailId: 't1', moduleId: 'm1', quizIndex: 0, item, answer: { kind: 'choice', optionIndex: 0 } },
    );

    expect(result).toEqual({ correct: true, alreadyAnswered: false, xpGained: 40 });
  });

  it('is idempotent once a question has been answered correctly', () => {
    answerQuiz(
      { repository, analytics },
      { trailId: 't1', moduleId: 'm1', quizIndex: 0, item, answer: { kind: 'choice', optionIndex: 0 } },
    );
    const result = answerQuiz(
      { repository, analytics },
      { trailId: 't1', moduleId: 'm1', quizIndex: 0, item, answer: { kind: 'choice', optionIndex: 0 } },
    );

    expect(result).toEqual({ correct: true, alreadyAnswered: true, xpGained: 0 });
  });
});
