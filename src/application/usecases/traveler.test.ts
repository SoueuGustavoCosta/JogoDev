import { describe, expect, it } from 'vitest';
import type { Progress } from '@/domain/progress';
import type { HallOfTravelersEntry, LeaderboardPort, OnlinePlayer, PlayerProfile, ProgressRepository, SavePhoneResult } from '../ports';
import { bootstrapTravelerIdentity, completePrologue, getOrCreateTravelerUuid, getTraveler, markPrologueSkipped } from './traveler';

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
  signedInUid: string | null = null;
  ensureSignedInError = false;

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
  async backupProgress(): Promise<void> {}
  async setRecoveryCode(): Promise<void> {}
  async restoreProgress(): Promise<{ uuid: string; progress: unknown } | null> {
    return null;
  }
  async saveBio(): Promise<void> {}
  async ensureSignedIn(): Promise<string | null> {
    if (this.ensureSignedInError) throw new Error('rede fora do ar');
    return this.signedInUid;
  }
  async saveProgressWithPhone(): Promise<SavePhoneResult> {
    return { ok: false, reason: 'não usado neste teste' };
  }
  async requestPasswordReset(): Promise<{ ok: true } | { ok: false; reason: string }> {
    return { ok: false, reason: 'não usado neste teste' };
  }
  async updatePassword(): Promise<{ ok: true } | { ok: false; reason: string }> {
    return { ok: false, reason: 'não usado neste teste' };
  }
}

describe('traveler', () => {
  it('defaults to "Viajante" with the prologue unseen', () => {
    expect(getTraveler({ repository: new Memory() })).toEqual({ name: 'Viajante', prologueSeen: false });
  });

  it('saves a trimmed name capped at 20 characters and marks the prologue seen', () => {
    const repository = new Memory();
    const name = completePrologue({ repository }, { name: '  Gustavo Costa Gomes Junior  ' });
    expect(name).toHaveLength(20);
    expect(getTraveler({ repository })).toEqual({ name, prologueSeen: true });
  });

  it('turns an empty name into "Viajante"', () => {
    const repository = new Memory();
    expect(completePrologue({ repository }, { name: '   ' })).toBe('Viajante');
  });

  it('skipping keeps the default name but marks the prologue seen', () => {
    const repository = new Memory();
    markPrologueSkipped({ repository });
    expect(getTraveler({ repository })).toEqual({ name: 'Viajante', prologueSeen: true });
  });
});

describe('bootstrapTravelerIdentity', () => {
  it('grava o auth.uid() real em Progress.travelerUuid quando o login anônimo resolve', async () => {
    const repository = new Memory();
    const leaderboard = new StubLeaderboard();
    leaderboard.signedInUid = 'auth-uid-123';

    await bootstrapTravelerIdentity({ repository, leaderboard });

    expect(repository.load()?.travelerUuid).toBe('auth-uid-123');
    expect(getOrCreateTravelerUuid({ repository })).toBe('auth-uid-123');
  });

  it('sobrescreve um uuid local antigo pelo auth.uid() real assim que ele resolve', async () => {
    const repository = new Memory();
    repository.save({ version: 1, trails: {}, travelerUuid: 'uuid-local-temporario' });
    const leaderboard = new StubLeaderboard();
    leaderboard.signedInUid = 'auth-uid-real';

    await bootstrapTravelerIdentity({ repository, leaderboard });

    expect(repository.load()?.travelerUuid).toBe('auth-uid-real');
  });

  it('não mexe no progresso local quando o login anônimo falha (ensureSignedIn devolve null)', async () => {
    const repository = new Memory();
    repository.save({ version: 1, trails: {}, travelerUuid: 'uuid-local' });
    const leaderboard = new StubLeaderboard();
    leaderboard.signedInUid = null;

    await bootstrapTravelerIdentity({ repository, leaderboard });

    expect(repository.load()?.travelerUuid).toBe('uuid-local');
  });

  it('nunca lança, mesmo se ensureSignedIn rejeitar (rede fora do ar)', async () => {
    const repository = new Memory();
    const leaderboard = new StubLeaderboard();
    leaderboard.ensureSignedInError = true;

    await expect(bootstrapTravelerIdentity({ repository, leaderboard })).resolves.toBeUndefined();
    expect(repository.load()).toBeNull();
  });
});
