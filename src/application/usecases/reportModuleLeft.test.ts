import { describe, expect, it } from 'vitest';
import { createEmptyProgress, type Progress } from '@/domain/progress';
import type { AnalyticsPort, ProgressRepository } from '../ports';
import { reportModuleLeft } from './reportModuleLeft';

class InMemoryProgressRepository implements ProgressRepository {
  constructor(private data: Progress | null) {}
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

function progressWith(completed: boolean): Progress {
  return {
    ...createEmptyProgress(),
    trails: {
      logica: {
        trailId: 'logica',
        modules: { variaveis: { moduleId: 'variaveis', quizResults: {}, completed } },
        missionsCompleted: {},
        trophyAwarded: false,
      },
    },
  };
}

const params = { trailId: 'logica', moduleId: 'variaveis', percent: 40 };

describe('reportModuleLeft', () => {
  it('envia module_left com ilha, módulo e percentual quando o módulo não foi concluído', () => {
    const analytics = new RecordingAnalytics();
    const sent = reportModuleLeft({ repository: new InMemoryProgressRepository(progressWith(false)), analytics }, params);
    expect(sent).toBe(true);
    expect(analytics.events).toEqual([
      { event: 'module_left', props: { island: 'logica', module: 'variaveis', percent: 40 } },
    ]);
  });

  it('envia também para quem nunca abriu nada (sem progresso salvo)', () => {
    const analytics = new RecordingAnalytics();
    expect(reportModuleLeft({ repository: new InMemoryProgressRepository(null), analytics }, params)).toBe(true);
    expect(analytics.events).toHaveLength(1);
  });

  it('não envia nada ao sair de um módulo já concluído (revisão não é desistência)', () => {
    const analytics = new RecordingAnalytics();
    const sent = reportModuleLeft({ repository: new InMemoryProgressRepository(progressWith(true)), analytics }, params);
    expect(sent).toBe(false);
    expect(analytics.events).toEqual([]);
  });

  it('não altera o progresso salvo', () => {
    const repository = new InMemoryProgressRepository(progressWith(false));
    const before = JSON.stringify(repository.load());
    reportModuleLeft({ repository, analytics: new RecordingAnalytics() }, params);
    expect(JSON.stringify(repository.load())).toBe(before);
  });

  it('na lição em telas, informa também a tela em que saiu', () => {
    const analytics = new RecordingAnalytics();
    reportModuleLeft({ repository: new InMemoryProgressRepository(null), analytics }, { ...params, percent: 20, screen: 3 });
    expect(analytics.events[0].props).toEqual({ island: 'logica', module: 'variaveis', percent: 20, screen: 3 });
  });
});
