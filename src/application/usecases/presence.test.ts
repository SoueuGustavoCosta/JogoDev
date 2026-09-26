import { describe, expect, it } from 'vitest';
import type { Progress } from '@/domain/progress';
import type { LeaderboardPort, OnlinePlayer, PlayerProfile, HallOfTravelersEntry, SignInResult, SignUpResult } from '../ports';
import type { ProgressRepository } from '../ports';
import { backupProgress, BIO_MAX_LENGTH, generateAndSaveRecoveryCode, getCachedBio, restoreProgress, saveBio } from './presence';

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
  backedUp: { uuid: string; nome: string; progress: unknown }[] = [];
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
  async backupProgress(uuid: string, nome: string, progress: unknown): Promise<void> {
    this.backedUp.push({ uuid, nome, progress });
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
  savedBios: { uuid: string; bio: string }[] = [];
  async saveBio(uuid: string, bio: string): Promise<void> {
    this.savedBios.push({ uuid, bio });
  }
  async ensureSignedIn(): Promise<string | null> {
    return null;
  }
  cloud: unknown | null = null;
  cloudFails = false;
  onCloudRead?: () => void;
  async getMyProgress(): Promise<unknown | null> {
    if (this.cloudFails) throw new Error('rede fora do ar');
    this.onCloudRead?.();
    return this.cloud;
  }
  async hasRealSession(): Promise<boolean> {
    return false;
  }
  async signUpWithPhone(): Promise<SignUpResult> {
    return { ok: false, reason: 'não usado neste teste' };
  }
  async signInWithPassword(): Promise<SignInResult> {
    return { ok: false, reason: 'não usado neste teste' };
  }
  async requestPasswordReset(): Promise<{ ok: true } | { ok: false; reason: string }> {
    return { ok: false, reason: 'não usado neste teste' };
  }
  async updatePassword(): Promise<{ ok: true } | { ok: false; reason: string }> {
    return { ok: false, reason: 'não usado neste teste' };
  }
  async signOut(): Promise<void> {}
  async recordAnomalySolved(): Promise<void> {}
  async countAnomalySolved(): Promise<number | null> {
    return null;
  }
  async saveCosmetics(): Promise<void> {}
  async listCosmetics(): Promise<Record<string, unknown>> {
    return {};
  }
  async syncWeeklyXp(): Promise<void> {}
  async getLeague(): Promise<null> {
    return null;
  }
  async countAnomaliesBetween(): Promise<null> {
    return null;
  }
  async recordWorkshopSolved(): Promise<void> {}
  async countWorkshopsBetween(): Promise<null> {
    return null;
  }
  async publishSolution(): Promise<boolean> {
    return false;
  }
  async listMural(): Promise<null> {
    return null;
  }
  async setStar(): Promise<boolean> {
    return false;
  }
}

const moduleDone = (trailId: string, moduleId: string) => ({
  trailId,
  trophyAwarded: false,
  missionsCompleted: {},
  modules: { [moduleId]: { moduleId, completed: true, quizResults: {} } },
});

describe('backupProgress', () => {
  it('não faz nada quando ainda não há progresso local', async () => {
    const repository = new Memory();
    const leaderboard = new StubLeaderboard();
    expect(await backupProgress({ repository, leaderboard })).toBe(false);
    expect(leaderboard.backedUp).toHaveLength(0);
  });

  it('sobe o Progress inteiro sob o uuid do viajante, gerando um se preciso', async () => {
    const repository = new Memory();
    repository.save({ version: 1, trails: {}, travelerName: 'Ana' });
    const leaderboard = new StubLeaderboard();

    await backupProgress({ repository, leaderboard });

    expect(leaderboard.backedUp).toHaveLength(1);
    expect(leaderboard.backedUp[0].progress).toMatchObject({ travelerName: 'Ana' });
    expect(repository.load()?.travelerUuid).toBe(leaderboard.backedUp[0].uuid);
  });

  it('com a sessão da conta perdida (needsSignIn), não sobe nada: iria para a conta errada', async () => {
    const repository = new Memory();
    repository.save({ version: 1, trails: {}, travelerName: 'Ana', travelerUuid: 'uuid-conta', needsSignIn: true });
    const leaderboard = new StubLeaderboard();

    expect(await backupProgress({ repository, leaderboard })).toBe(false);
    expect(leaderboard.backedUp).toHaveLength(0);
  });

  it('se não conseguir ler a nuvem, não sobe nada (nunca sobrescreve às cegas)', async () => {
    const repository = new Memory();
    repository.save({ version: 1, trails: {}, travelerName: 'Ana' });
    const before = repository.load();
    const leaderboard = new StubLeaderboard();
    leaderboard.cloudFails = true;

    expect(await backupProgress({ repository, leaderboard })).toBe(false);
    expect(leaderboard.backedUp).toHaveLength(0);
    expect(repository.load()).toEqual(before);
  });

  it('aparelho com cópia velha não apaga o que outro aparelho salvou: sobe a união', async () => {
    const repository = new Memory();
    repository.save({ version: 1, trails: { logica: moduleDone('logica', 'origem') }, travelerName: 'Ana', travelerUuid: 'u1' });
    const leaderboard = new StubLeaderboard();
    leaderboard.cloud = { version: 1, trails: { 'banco-de-dados': moduleDone('banco-de-dados', 'porque') }, travelerName: 'Ana' };

    await backupProgress({ repository, leaderboard });

    const uploaded = leaderboard.backedUp[0].progress as Progress;
    expect(Object.keys(uploaded.trails).sort()).toEqual(['banco-de-dados', 'logica']);
    // e o aparelho também ganha o que veio do outro
    expect(repository.load()?.trails['banco-de-dados'].modules.porque.completed).toBe(true);
  });

  it('resposta dada enquanto a nuvem era lida não se perde', async () => {
    const repository = new Memory();
    repository.save({ version: 1, trails: {}, travelerName: 'Ana', travelerUuid: 'u1' });
    const leaderboard = new StubLeaderboard();
    leaderboard.cloud = { version: 1, trails: {} };
    leaderboard.onCloudRead = () => {
      const p = repository.load()!;
      repository.save({ ...p, trails: { logica: moduleDone('logica', 'ola') } });
    };

    await backupProgress({ repository, leaderboard });

    expect(repository.load()?.trails.logica.modules.ola.completed).toBe(true);
    expect((leaderboard.backedUp[0].progress as Progress).trails.logica.modules.ola.completed).toBe(true);
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
    expect(repository.load()).toMatchObject({ travelerName: 'Ana', travelerUuid: 'uuid-remoto' });
    expect(repository.load()?.trails.x).toBeDefined();
  });

  it('recuperar junta com o que já estava neste aparelho, sem apagar nada', async () => {
    const repository = new Memory();
    repository.save({ version: 1, trails: { logica: moduleDone('logica', 'origem') }, travelerUuid: 'uuid-local' });
    const leaderboard = new StubLeaderboard();
    leaderboard.byName['ana'] = { codigo: 'ABCD-1234', uuid: 'uuid-remoto', progress: { version: 1, trails: {}, travelerName: 'Ana' } };

    await restoreProgress({ repository, leaderboard }, { nome: 'Ana', codigo: 'ABCD-1234' });

    expect(repository.load()?.trails.logica.modules.origem.completed).toBe(true);
    expect(repository.load()?.travelerUuid).toBe('uuid-remoto');
  });
});

describe('saveBio', () => {
  it('salva a bio local e sincroniza com o Supabase sob o uuid do viajante', () => {
    const repository = new Memory();
    const leaderboard = new StubLeaderboard();

    const saved = saveBio({ repository, leaderboard }, { bio: 'Estudante de Ciência da Computação, 5º período.' });

    expect(saved).toBe('Estudante de Ciência da Computação, 5º período.');
    expect(repository.load()?.bio).toBe('Estudante de Ciência da Computação, 5º período.');
    expect(leaderboard.savedBios).toHaveLength(1);
    expect(leaderboard.savedBios[0].bio).toBe('Estudante de Ciência da Computação, 5º período.');
    expect(typeof leaderboard.savedBios[0].uuid).toBe('string');
  });

  it('corta espaços nas pontas', () => {
    const repository = new Memory();
    const leaderboard = new StubLeaderboard();
    const saved = saveBio({ repository, leaderboard }, { bio: '   olá   ' });
    expect(saved).toBe('olá');
  });

  it('trunca em BIO_MAX_LENGTH caracteres', () => {
    const repository = new Memory();
    const leaderboard = new StubLeaderboard();
    const long = 'a'.repeat(BIO_MAX_LENGTH + 40);
    const saved = saveBio({ repository, leaderboard }, { bio: long });
    expect(saved).toHaveLength(BIO_MAX_LENGTH);
  });
});

describe('getCachedBio', () => {
  it('devolve string vazia quando ainda não há bio salva', () => {
    const repository = new Memory();
    expect(getCachedBio({ repository })).toBe('');
  });

  it('devolve a bio salva', () => {
    const repository = new Memory();
    repository.save({ version: 1, trails: {}, bio: 'Oi' });
    expect(getCachedBio({ repository })).toBe('Oi');
  });
});
