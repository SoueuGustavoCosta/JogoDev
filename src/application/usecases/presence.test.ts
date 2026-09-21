import { describe, expect, it } from 'vitest';
import type { Progress } from '@/domain/progress';
import type { LeaderboardPort, OnlinePlayer, PlayerProfile, HallOfTravelersEntry } from '../ports';
import type { ProgressRepository } from '../ports';
import { backupProgress, generateAndSaveRecoveryCode, restoreProgress } from './presence';

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
  byName: Record<string, { codigo: string; uuid: string; progress: unknown }> = {};
  recoveryCodes: { uuid: string; codigo: string }[] = [];
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
  async setRecoveryCode(uuid: string, codigo: string): Promise<void> {
    this.recoveryCodes.push({ uuid, codigo });
  }
  async restoreProgress(nome: string, codigo: string): Promise<{ uuid: string; progress: unknown } | null> {
    if (this.failFetch) throw new Error('rede fora do ar');
    const entry = this.byName[nome.toLowerCase()];
    if (!entry || entry.codigo !== codigo) return null;
    return { uuid: entry.uuid, progress: entry.progress };
  }
  async saveBio(): Promise<void> {}
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

describe('generateAndSaveRecoveryCode', () => {
  it('salva o hash do código sob o uuid do viajante e devolve o código em texto puro', async () => {
    const repository = new Memory();
    const leaderboard = new StubLeaderboard();

    const code = await generateAndSaveRecoveryCode({ repository, leaderboard }, { code: 'ABCD-1234' });

    expect(code).toBe('ABCD-1234');
    expect(leaderboard.recoveryCodes).toHaveLength(1);
    expect(leaderboard.recoveryCodes[0].codigo).toBe('ABCD-1234');
    expect(typeof leaderboard.recoveryCodes[0].uuid).toBe('string');
    expect(repository.load()?.travelerUuid).toBe(leaderboard.recoveryCodes[0].uuid);
  });
});

describe('restoreProgress', () => {
  it('recusa nome vazio', async () => {
    const repository = new Memory();
    const leaderboard = new StubLeaderboard();
    const result = await restoreProgress({ repository, leaderboard }, { nome: '   ', codigo: 'ABCD-1234' });
    expect(result).toEqual({ ok: false, reason: 'Digite o nome do viajante.' });
  });

  it('recusa código vazio', async () => {
    const repository = new Memory();
    const leaderboard = new StubLeaderboard();
    const result = await restoreProgress({ repository, leaderboard }, { nome: 'Ana', codigo: '   ' });
    expect(result).toEqual({ ok: false, reason: 'Digite o código de recuperação.' });
  });

  it('avisa quando nome ou código não conferem, sem dizer qual dos dois', async () => {
    const repository = new Memory();
    const leaderboard = new StubLeaderboard();
    const result = await restoreProgress({ repository, leaderboard }, { nome: 'Fulano', codigo: 'ABCD-1234' });
    expect(result).toEqual({ ok: false, reason: 'Nome ou código incorretos.' });
  });

  it('avisa quando o nome existe mas o código está errado', async () => {
    const repository = new Memory();
    const leaderboard = new StubLeaderboard();
    leaderboard.byName['ana'] = { codigo: 'CERTO-1234', uuid: 'uuid-remoto', progress: { version: 1, trails: {} } };
    const result = await restoreProgress({ repository, leaderboard }, { nome: 'Ana', codigo: 'ERRADO-999' });
    expect(result).toEqual({ ok: false, reason: 'Nome ou código incorretos.' });
  });

  it('avisa com segurança quando a busca falha (rede fora do ar)', async () => {
    const repository = new Memory();
    const leaderboard = new StubLeaderboard();
    leaderboard.failFetch = true;
    const result = await restoreProgress({ repository, leaderboard }, { nome: 'Ana', codigo: 'ABCD-1234' });
    expect(result).toEqual({ ok: false, reason: 'Não foi possível buscar agora. Tente novamente em instantes.' });
  });

  it('restaura o progresso encontrado e adota o uuid restaurado (não o local)', async () => {
    const repository = new Memory();
    repository.save({ version: 1, trails: {}, travelerUuid: 'uuid-local', travelerName: 'Antigo' });
    const leaderboard = new StubLeaderboard();
    const remoteProgress: Progress = { version: 1, trails: { x: { trailId: 'x', modules: {}, missionsCompleted: {}, trophyAwarded: false } }, travelerName: 'Ana' };
    leaderboard.byName['ana'] = { codigo: 'ABCD-1234', uuid: 'uuid-remoto', progress: remoteProgress };

    const result = await restoreProgress({ repository, leaderboard }, { nome: 'ANA', codigo: 'ABCD-1234' });

    expect(result).toEqual({ ok: true });
    expect(repository.load()).toEqual({ ...remoteProgress, travelerUuid: 'uuid-remoto' });
  });
});
