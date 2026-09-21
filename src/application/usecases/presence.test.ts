import { describe, expect, it } from 'vitest';
import type { Progress } from '@/domain/progress';
import type { LeaderboardPort, OnlinePlayer, PlayerProfile, HallOfTravelersEntry } from '../ports';
import type { ProgressRepository } from '../ports';
import { backupProgress, restoreProgressByName } from './presence';

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

class StubLeaderboard implements LeaderboardPort {
  backedUp: { uuid: string; progress: unknown }[] = [];
  byName: Record<string, { uuid: string; progress: unknown }> = {};
  failFetch = false;

  async upsertPlayer(): Promise<void> {}
  async syncProgress(): Promise<void> {}
  async syncBadge(): Promise<void> {}
  async listHallOfTravelers(): Promise<HallOfTravelersEntry[]> {
    return [];
  }
  async getPlayer(): Promise<PlayerProfile | null> {
    return null;
  }
  async checkIn(): Promise<void> {}
  async heartbeat(): Promise<void> {}
  async uploadAvatar(): Promise<string | null> {
    return null;
  }
  async listOnlinePlayers(): Promise<OnlinePlayer[]> {
    return [];
  }
  async backupProgress(uuid: string, progress: unknown): Promise<void> {
    this.backedUp.push({ uuid, progress });
  }
  async fetchProgressByName(nome: string): Promise<{ uuid: string; progress: unknown } | null> {
    if (this.failFetch) throw new Error('rede fora do ar');
    return this.byName[nome.toLowerCase()] ?? null;
  }
}

describe('backupProgress', () => {
  it('não faz nada quando ainda não há progresso local', () => {
    const repository = new Memory();
    const leaderboard = new StubLeaderboard();
    backupProgress({ repository, leaderboard });
    expect(leaderboard.backedUp).toHaveLength(0);
  });

  it('sobe o Progress inteiro sob o uuid do viajante, gerando um se preciso', () => {
    const repository = new Memory();
    repository.save({ version: 1, trails: {}, travelerName: 'Ana' });
    const leaderboard = new StubLeaderboard();

    backupProgress({ repository, leaderboard });

    expect(leaderboard.backedUp).toHaveLength(1);
    expect(leaderboard.backedUp[0].progress).toMatchObject({ travelerName: 'Ana' });
    expect(typeof leaderboard.backedUp[0].uuid).toBe('string');
    // o uuid gerado também foi persistido localmente, para as próximas sincronizações
    expect(repository.load()?.travelerUuid).toBe(leaderboard.backedUp[0].uuid);
  });
});

describe('restoreProgressByName', () => {
  it('recusa nome vazio', async () => {
    const repository = new Memory();
    const leaderboard = new StubLeaderboard();
    const result = await restoreProgressByName({ repository, leaderboard }, { nome: '   ' });
    expect(result).toEqual({ ok: false, reason: 'Digite o nome do viajante.' });
  });

  it('avisa quando nenhum progresso foi encontrado com esse nome', async () => {
    const repository = new Memory();
    const leaderboard = new StubLeaderboard();
    const result = await restoreProgressByName({ repository, leaderboard }, { nome: 'Fulano' });
    expect(result).toEqual({ ok: false, reason: 'Nenhum progresso salvo foi encontrado com esse nome.' });
  });

  it('avisa com segurança quando a busca falha (rede fora do ar)', async () => {
    const repository = new Memory();
    const leaderboard = new StubLeaderboard();
    leaderboard.failFetch = true;
    const result = await restoreProgressByName({ repository, leaderboard }, { nome: 'Ana' });
    expect(result).toEqual({ ok: false, reason: 'Não foi possível buscar agora. Tente novamente em instantes.' });
  });

  it('restaura o progresso encontrado e adota o uuid restaurado (não o local)', async () => {
    const repository = new Memory();
    repository.save({ version: 1, trails: {}, travelerUuid: 'uuid-local', travelerName: 'Antigo' });
    const leaderboard = new StubLeaderboard();
    const remoteProgress: Progress = { version: 1, trails: { x: { trailId: 'x', modules: {}, missionsCompleted: {}, trophyAwarded: false } }, travelerName: 'Ana' };
    leaderboard.byName['ana'] = { uuid: 'uuid-remoto', progress: remoteProgress };

    const result = await restoreProgressByName({ repository, leaderboard }, { nome: 'ANA' });

    expect(result).toEqual({ ok: true });
    expect(repository.load()).toEqual({ ...remoteProgress, travelerUuid: 'uuid-remoto' });
  });
});
