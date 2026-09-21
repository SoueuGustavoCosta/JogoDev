import { beforeEach, describe, expect, it } from 'vitest';
import type { Progress } from '@/domain/progress';
import { NoopLeaderboard } from '@/infrastructure/leaderboard';
import { PgliteEngine } from '@/infrastructure/sql';
import type { AnalyticsPort, ProgressRepository } from '../ports';
import { verifyMission } from './lab';

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

/**
 * Integração de verifyMission com o motor real (PGlite), usando as duas missões
 * migradas do protótipo: uma de consulta ("select") e uma de estado do banco ("state").
 */
const traveler = { uuid: 'uuid-teste', name: 'Viajante' };

describe('verifyMission (integração com PGlite)', () => {
  let repository: InMemoryProgressRepository;
  let analytics: RecordingAnalytics;
  let leaderboard: NoopLeaderboard;
  let engine: PgliteEngine;

  beforeEach(() => {
    repository = new InMemoryProgressRepository();
    analytics = new RecordingAnalytics();
    leaderboard = new NoopLeaderboard();
    engine = new PgliteEngine();
  });

  const selectMission = {
    id: 'm1',
    title: 'Só o que tem estoque',
    ds: 'loja' as const,
    kind: 'select' as const,
    ordered: true,
    brief: '',
    hint: '',
    solution: 'SELECT nome, preco FROM produtos WHERE estoque > 0 ORDER BY preco',
  };

  it('accepts a correct query and records the mission as completed', async () => {
    const result = await verifyMission(
      { engine, repository, analytics, leaderboard, trailId: 'banco-de-dados', traveler },
      selectMission,
      'SELECT nome, preco FROM produtos WHERE estoque > 0 ORDER BY preco',
    );

    expect(result).toEqual({ ok: true });
    expect(repository.load()?.trails['banco-de-dados'].missionsCompleted.m1).toBe(true);
    expect(analytics.events).toContainEqual({ event: 'mission_completed', props: { mission: 'm1' } });
  });

  it('rejects a query with the wrong number of rows', async () => {
    const result = await verifyMission(
      { engine, repository, analytics, leaderboard, trailId: 'banco-de-dados', traveler },
      selectMission,
      'SELECT nome, preco FROM produtos ORDER BY preco',
    );

    expect(result.ok).toBe(false);
  });

  it('rejects a query that errors', async () => {
    const result = await verifyMission(
      { engine, repository, analytics, leaderboard, trailId: 'banco-de-dados', traveler },
      selectMission,
      'SELECT nome, preco FROM tabela_que_nao_existe',
    );

    expect(result).toEqual({
      ok: false,
      message: 'Sua consulta deu erro. Leia a mensagem acima, corrija e verifique de novo.',
    });
  });

  const stateMission = {
    id: 'm3',
    title: 'Construa a tabela alunos',
    ds: 'vazio' as const,
    kind: 'state' as const,
    brief: '',
    hint: '',
    verify:
      "SELECT column_name, data_type, is_nullable FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'alunos' ORDER BY ordinal_position",
    expect: [
      ['id', 'integer', 'NO'],
      ['nome', 'character varying', 'NO'],
      ['xp', 'integer', 'YES'],
    ],
  };

  it('accepts the correct DDL for a "state" mission', async () => {
    const result = await verifyMission(
      { engine, repository, analytics, leaderboard, trailId: 'banco-de-dados', traveler },
      stateMission,
      'CREATE TABLE alunos (id SERIAL PRIMARY KEY, nome VARCHAR(80) NOT NULL, xp INTEGER DEFAULT 0)',
    );

    expect(result).toEqual({ ok: true });
  });

  it('rejects DDL that does not match the expected final state', async () => {
    const result = await verifyMission(
      { engine, repository, analytics, leaderboard, trailId: 'banco-de-dados', traveler },
      stateMission,
      'CREATE TABLE alunos (id SERIAL PRIMARY KEY, nome VARCHAR(80))',
    );

    expect(result.ok).toBe(false);
  });
});
