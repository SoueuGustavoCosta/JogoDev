import { describe, expect, it } from 'vitest';
import type { Progress } from '@/domain/progress';
import type { HallOfTravelersEntry, LeaderboardPort, OnlinePlayer, PlayerProfile, ProgressRepository, SignInResult, SignUpResult } from '../ports';
import { bootstrapTravelerIdentity, completePrologue, getOrCreateTravelerUuid, getTraveler, markPrologueSkipped, signOutTraveler } from './traveler';

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
  myProgress: unknown | null = null;

  myProgressFails = false;
  async getMyProgress(): Promise<unknown | null> {
    if (this.myProgressFails) throw new Error('rede fora do ar');
    return this.myProgress;
  }
  async hasRealSession(): Promise<boolean> {
    return false;
  }

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
  backupCalls: { uuid: string; nome: string; progress: unknown }[] = [];
  signOutCalls = 0;

  async backupProgress(uuid: string, nome: string, progress: unknown): Promise<void> {
    this.backupCalls.push({ uuid, nome, progress });
  }
  async setRecoveryCode(): Promise<void> {}
  async restoreProgress(): Promise<{ uuid: string; progress: unknown } | null> {
    return null;
  }
  async saveBio(): Promise<void> {}
  async recordAnomalySolved(): Promise<void> {}
  async countAnomalySolved(): Promise<number | null> {
    return null;
  }
  async ensureSignedIn(): Promise<string | null> {
    if (this.ensureSignedInError) throw new Error('rede fora do ar');
    return this.signedInUid;
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
  async signOut(): Promise<void> {
    this.signOutCalls += 1;
  }
}

describe('traveler', () => {
  // Regressão: "Viajante" sozinho, igual pra todo mundo que não escolhe nome, colide
  // direto com `jogadores.nome` (único no banco) assim que dois viajantes sem nome
  // tentam sincronizar — descoberto rodando o app de verdade contra o banco (409, chave
  // duplicada), fazendo o backup falhar em silêncio pro segundo em diante. O padrão
  // agora inclui um sufixo derivado do próprio uuid (já único), sempre "Viajante XXXX".
  const DEFAULT_NAME_PATTERN = /^Viajante [0-9A-F]{6}$/;

  it('defaults to "Viajante <sufixo>" (único por aparelho) with the prologue unseen', () => {
    const traveler = getTraveler({ repository: new Memory() });
    expect(traveler.name).toMatch(DEFAULT_NAME_PATTERN);
    expect(traveler.prologueSeen).toBe(false);
  });

  it('saves a trimmed name capped at 20 characters and marks the prologue seen', () => {
    const repository = new Memory();
    const name = completePrologue({ repository }, { name: '  Gustavo Costa Gomes Junior  ' });
    expect(name).toHaveLength(20);
    expect(getTraveler({ repository })).toEqual({ name, prologueSeen: true });
  });

  it('turns an empty name into the default "Viajante <sufixo>"', () => {
    const repository = new Memory();
    expect(completePrologue({ repository }, { name: '   ' })).toMatch(DEFAULT_NAME_PATTERN);
  });

  it('skipping keeps the default name but marks the prologue seen', () => {
    const repository = new Memory();
    markPrologueSkipped({ repository });
    const traveler = getTraveler({ repository });
    expect(traveler.name).toMatch(DEFAULT_NAME_PATTERN);
    expect(traveler.prologueSeen).toBe(true);
  });

  it('o sufixo do nome padrão é estável: mesmo uuid, mesmo nome sempre', () => {
    const repository = new Memory();
    const first = getTraveler({ repository }).name;
    const second = getTraveler({ repository }).name;
    expect(first).toBe(second);
  });
});

describe('bootstrapTravelerIdentity: nunca perde progresso ao trocar de sessão', () => {
  const done = { trailId: 'logica', trophyAwarded: false, missionsCompleted: {}, modules: { origem: { moduleId: 'origem', completed: true, quizResults: {} } } };

  it('sessão nova com cópia vazia na nuvem: o progresso do aparelho continua', async () => {
    const repository = new Memory();
    repository.save({ version: 1, trails: { logica: done }, travelerUuid: 'uuid-local', travelerName: 'Gustavo' });
    const leaderboard = new StubLeaderboard();
    leaderboard.signedInUid = 'uuid-conta';
    leaderboard.myProgress = { version: 1, trails: {} };

    await bootstrapTravelerIdentity({ repository, leaderboard });

    expect(repository.load()?.trails.logica.modules.origem.completed).toBe(true);
    expect(repository.load()?.travelerUuid).toBe('uuid-conta');
  });

  it('se a leitura da nuvem falhar, não troca nada agora', async () => {
    const repository = new Memory();
    repository.save({ version: 1, trails: { logica: done }, travelerUuid: 'uuid-local' });
    const before = repository.load();
    const leaderboard = new StubLeaderboard();
    leaderboard.signedInUid = 'uuid-conta';
    leaderboard.myProgressFails = true;

    await bootstrapTravelerIdentity({ repository, leaderboard });

    expect(repository.load()).toEqual(before);
  });
});

describe('bootstrapTravelerIdentity: sessão da conta perdida', () => {
  const done = { trailId: 'logica', trophyAwarded: false, missionsCompleted: {}, modules: { origem: { moduleId: 'origem', completed: true, quizResults: {} } } };

  it('regressão: progresso de conta com sessão anônima nova NÃO é re-rotulado; pede para entrar de novo', async () => {
    // Era assim que o progresso "sumia": sair em um aparelho derrubava a sessão da conta
    // nos outros, e cada um passava o progresso da conta para um uid anônimo novo.
    const repository = new Memory();
    repository.save({ version: 1, trails: { logica: done }, travelerUuid: 'uuid-conta', travelerName: 'Gustavo', phoneLinked: true });
    const leaderboard = new StubLeaderboard();
    leaderboard.signedInUid = 'uuid-anonimo-novo';
    leaderboard.myProgress = { version: 1, trails: {} };

    await bootstrapTravelerIdentity({ repository, leaderboard });

    expect(repository.load()).toMatchObject({ travelerUuid: 'uuid-conta', travelerName: 'Gustavo', phoneLinked: false, needsSignIn: true });
    expect(repository.load()?.trails.logica.modules.origem.completed).toBe(true);
  });

  it('quando a sessão da própria conta volta, libera a sincronização de novo', async () => {
    const repository = new Memory();
    repository.save({ version: 1, trails: {}, travelerUuid: 'uuid-conta', needsSignIn: true, phoneLinked: false });
    const leaderboard = new StubLeaderboard();
    leaderboard.signedInUid = 'uuid-conta';

    await bootstrapTravelerIdentity({ repository, leaderboard });

    expect(repository.load()).toMatchObject({ travelerUuid: 'uuid-conta', phoneLinked: true });
    expect(repository.load()?.needsSignIn).toBeUndefined();
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

  it('busca o progresso salvo na conta antes de trocar o uid, se este aparelho já tinha um progresso local diferente', async () => {
    // Regressão: isso cobre uma sessão de recuperação de senha assumindo sozinha (fora
    // do fluxo controlado de signInWithPhone) — sem essa checagem, o progresso
    // local (podia ser de outra sessão) virava o rótulo da conta de verdade e sobrescrevia
    // o progresso dela no próximo backup silencioso.
    const repository = new Memory();
    repository.save({ version: 1, trails: {}, travelerName: 'Local', travelerUuid: 'uuid-local-antigo' });
    const leaderboard = new StubLeaderboard();
    leaderboard.signedInUid = 'auth-uid-conta-real';
    leaderboard.myProgress = { version: 1, trails: {}, travelerName: 'Conta Real', prologueSeen: true };

    await bootstrapTravelerIdentity({ repository, leaderboard });

    expect(repository.load()).toMatchObject({ travelerName: 'Conta Real', travelerUuid: 'auth-uid-conta-real' });
  });

  it('preserva o progresso local (não zera) quando a conta trocou de uid mas não tem nada salvo', async () => {
    const repository = new Memory();
    repository.save({ version: 1, trails: {}, travelerName: 'Local', travelerUuid: 'uuid-local-antigo' });
    const leaderboard = new StubLeaderboard();
    leaderboard.signedInUid = 'auth-uid-conta-vazia';
    leaderboard.myProgress = null;

    await bootstrapTravelerIdentity({ repository, leaderboard });

    expect(repository.load()).toMatchObject({ travelerName: 'Local', travelerUuid: 'auth-uid-conta-vazia' });
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

describe('signOutTraveler', () => {
  it('faz um backup final do progresso antes de sair e limpar o aparelho', async () => {
    const repository = new Memory();
    repository.save({ version: 1, trails: {}, travelerUuid: 'uuid-do-viajante', travelerName: 'Gustavo' });
    const leaderboard = new StubLeaderboard();

    await signOutTraveler({ repository, leaderboard });

    expect(leaderboard.backupCalls).toEqual([
      {
        uuid: 'uuid-do-viajante',
        nome: 'Gustavo',
        progress: repository.data ?? { version: 1, trails: {}, travelerUuid: 'uuid-do-viajante', travelerName: 'Gustavo' },
      },
    ]);
    expect(leaderboard.signOutCalls).toBe(1);
    expect(repository.load()).toBeNull();
  });

  it('não tenta fazer backup quando não há progresso local', async () => {
    const repository = new Memory();
    const leaderboard = new StubLeaderboard();

    await signOutTraveler({ repository, leaderboard });

    expect(leaderboard.backupCalls).toHaveLength(0);
    expect(leaderboard.signOutCalls).toBe(1);
  });

  it('limpa o progresso local mesmo se o backup ou o signOut falharem', async () => {
    const repository = new Memory();
    repository.save({ version: 1, trails: {}, travelerUuid: 'uuid-do-viajante' });
    const leaderboard = new StubLeaderboard();
    leaderboard.signOut = async () => {
      throw new Error('rede fora do ar');
    };

    await expect(signOutTraveler({ repository, leaderboard })).rejects.toThrow('rede fora do ar');
    expect(repository.load()).toBeNull();
  });
});
