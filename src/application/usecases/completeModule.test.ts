import { beforeEach, describe, expect, it } from 'vitest';
import type { Progress } from '@/domain/progress';
import type { Module, Trail } from '@/domain/trail';
import { NoopLeaderboard } from '@/infrastructure/leaderboard';
import type { AnalyticsPort, ProgressRepository } from '../ports';
import { completeModule } from './completeModule';

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

function makeModule(id: string): Module {
  return { id, short: id, title: id, lead: '', level: 'Base', blocks: [{ t: 'p', x: 'x' }], quiz: [] };
}

const traveler = { uuid: 'uuid-teste', name: 'Viajante' };

describe('completeModule', () => {
  let repository: InMemoryProgressRepository;
  let analytics: RecordingAnalytics;
  let leaderboard: NoopLeaderboard;
  const trail: Trail = {
    id: 't1',
    title: 'Trilha',
    tagline: '',
    symbol: 's',
    accent: '#000000',
    modules: [makeModule('a'), makeModule('b')],
  };

  beforeEach(() => {
    repository = new InMemoryProgressRepository();
    analytics = new RecordingAnalytics();
    leaderboard = new NoopLeaderboard();
  });

  it('marks the module as completed and tracks module_completed', () => {
    const result = completeModule({ repository, analytics, leaderboard }, { trail, moduleId: 'a', traveler });

    expect(result).toMatchObject({ alreadyCompleted: false, trailCompleted: false });
    expect(result.recap.modulesLeft).toBe(1);
    expect(repository.load()?.trails.t1.modules.a.completed).toBe(true);
    expect(analytics.events).toContainEqual({
      event: 'module_completed',
      props: { island: 't1', module: 'a' },
    });
  });

  it('is idempotent once a module is already completed', () => {
    completeModule({ repository, analytics, leaderboard }, { trail, moduleId: 'a', traveler });
    const result = completeModule({ repository, analytics, leaderboard }, { trail, moduleId: 'a', traveler });

    expect(result.alreadyCompleted).toBe(true);
  });

  it('awards the trophy and tracks island_completed once every module is done', () => {
    completeModule({ repository, analytics, leaderboard }, { trail, moduleId: 'a', traveler });
    const result = completeModule({ repository, analytics, leaderboard }, { trail, moduleId: 'b', traveler });

    expect(result.trailCompleted).toBe(true);
    expect(repository.load()?.trails.t1.trophyAwarded).toBe(true);
    expect(analytics.events).toContainEqual({ event: 'island_completed', props: { island: 't1' } });
  });

  it('awards the trail\'s "rara" badge (completionBadgeId) only once every module is done', () => {
    const trailWithRareBadge: Trail = { ...trail, completionBadgeId: 'rara-t1' };

    completeModule({ repository, analytics, leaderboard }, { trail: trailWithRareBadge, moduleId: 'a', traveler });
    expect(repository.load()?.badgesEarned?.['rara-t1']).toBeUndefined();

    completeModule({ repository, analytics, leaderboard }, { trail: trailWithRareBadge, moduleId: 'b', traveler });
    expect(repository.load()?.badgesEarned?.['rara-t1']).toBeDefined();
  });

  it('does nothing badge-related when the trail has no completionBadgeId', () => {
    completeModule({ repository, analytics, leaderboard }, { trail, moduleId: 'a', traveler });
    completeModule({ repository, analytics, leaderboard }, { trail, moduleId: 'b', traveler });

    expect(repository.load()?.badgesEarned ?? {}).toEqual({});
  });
});
