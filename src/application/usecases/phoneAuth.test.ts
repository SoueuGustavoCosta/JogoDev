import { describe, expect, it } from 'vitest';
import type { Progress } from '@/domain/progress';
import type {
  HallOfTravelersEntry,
  LeaderboardPort,
  OnlinePlayer,
  PlayerProfile,
  ProgressRepository,
  SignInIdentifier,
  SignInResult,
  SignUpResult,
} from '../ports';
import {
  hasPhoneLinked,
  requestPasswordReset,
  signInWithPhone,
  signUpWithPhone,
  updatePassword,
} from './phoneAuth';

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

function trailWith(trailId: string, moduleId: string) {
  return {
    trailId,
    trophyAwarded: false,
    missionsCompleted: {},
    modules: {
      [moduleId]: {
        moduleId,
        completed: true,
        quizResults: { 0: { correct: true, triesUsed: 1 } },
      },
    },
  };
}

class StubLeaderboard implements LeaderboardPort {
  nextSignUp: SignUpResult = { ok: false, reason: 'não configurado' };
  signUpCalls: { phone: string; password: string; email?: string }[] = [];
  nextSignIn: SignInResult = { ok: false, reason: 'não configurado' };
  signInCalls: { identifier: SignInIdentifier; password: string }[] = [];
  nextSimpleResult: { ok: true } | { ok: false; reason: string } = {
    ok: false,
    reason: 'não configurado',
  };
  resetRequests: string[] = [];
  passwordUpdates: string[] = [];

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
  async saveCosmetics(): Promise<void> {}
  async listCosmetics(): Promise<Record<string, unknown>> {
    return {};
  }
  async ensureSignedIn(): Promise<string | null> {
    return 'uuid-anonimo';
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
  async signUpWithPhone(phone: string, password: string, email?: string): Promise<SignUpResult> {
    this.signUpCalls.push(email === undefined ? { phone, password } : { phone, password, email });
    return this.nextSignUp;
  }
  async signInWithPassword(identifier: SignInIdentifier, password: string): Promise<SignInResult> {
    this.signInCalls.push({ identifier, password });
    return this.nextSignIn;
  }
  async requestPasswordReset(email: string): Promise<{ ok: true } | { ok: false; reason: string }> {
    this.resetRequests.push(email);
    return this.nextSimpleResult;
  }
  async updatePassword(newPassword: string): Promise<{ ok: true } | { ok: false; reason: string }> {
    this.passwordUpdates.push(newPassword);
    return this.nextSimpleResult;
  }
  async signOut(): Promise<void> {}
}

describe('signUpWithPhone (Criar conta)', () => {
  it('recusa telefone inválido sem chamar a porta', async () => {
    const repository = new Memory();
    const leaderboard = new StubLeaderboard();
    const result = await signUpWithPhone(
      { repository, leaderboard },
      { phone: '123', password: '123456' },
    );
    expect(result).toEqual({ ok: false, reason: 'Digite um telefone válido, com DDD.' });
    expect(leaderboard.signUpCalls).toHaveLength(0);
  });

  it('recusa senha curta sem chamar a porta', async () => {
    const repository = new Memory();
    const leaderboard = new StubLeaderboard();
    const result = await signUpWithPhone(
      { repository, leaderboard },
      { phone: '31999999999', password: '123' },
    );
    expect(result.ok).toBe(false);
    expect(leaderboard.signUpCalls).toHaveLength(0);
  });

  it('recusa e-mail com formato inválido sem chamar a porta', async () => {
    const repository = new Memory();
    const leaderboard = new StubLeaderboard();
    const result = await signUpWithPhone(
      { repository, leaderboard },
      { phone: '31999999999', password: 'senha123', email: 'não-é-email' },
    );
    expect(result).toEqual({ ok: false, reason: 'Digite um e-mail válido, ou deixe em branco.' });
    expect(leaderboard.signUpCalls).toHaveLength(0);
  });

  it('repassa o e-mail pra porta quando informado', async () => {
    const repository = new Memory();
    const leaderboard = new StubLeaderboard();
    leaderboard.nextSignUp = { ok: true, uid: 'uuid-anonimo' };
    await signUpWithPhone(
      { repository, leaderboard },
      { phone: '31999999999', password: 'senha123', email: 'ana@example.com' },
    );
    expect(leaderboard.signUpCalls).toEqual([
      { phone: '31999999999', password: 'senha123', email: 'ana@example.com' },
    ]);
  });

  it('quem jogava anônimo continua com o mesmo progresso, agora vinculado, com backup na hora', async () => {
    const repository = new Memory();
    repository.save({
      version: 1,
      trails: { a: trailWith('a', 'm1') },
      travelerName: 'Ana',
      travelerUuid: 'uuid-anonimo',
    });
    const leaderboard = new StubLeaderboard();
    leaderboard.nextSignUp = { ok: true, uid: 'uuid-anonimo' };

    const result = await signUpWithPhone(
      { repository, leaderboard },
      { phone: '(31) 99999-9999', password: 'senha123' },
    );

    expect(result).toEqual({ ok: true });
    expect(leaderboard.signUpCalls).toEqual([{ phone: '31999999999', password: 'senha123' }]);
    const saved = repository.load()!;
    expect(saved).toMatchObject({
      travelerName: 'Ana',
      travelerUuid: 'uuid-anonimo',
      phoneLinked: true,
    });
    expect(saved.trails.a.modules.m1.completed).toBe(true);
    expect(leaderboard.backupCalls).toEqual([
      { uuid: 'uuid-anonimo', nome: 'Ana', progress: saved },
    ]);
  });

  it('telefone que já tem conta: só avisa, não entra nela nem mexe no progresso local', async () => {
    const repository = new Memory();
    repository.save({ version: 1, trails: {}, travelerName: 'Ana', travelerUuid: 'uuid-anonimo' });
    const before = repository.load();
    const leaderboard = new StubLeaderboard();
    leaderboard.nextSignUp = {
      ok: false,
      exists: true,
      reason: 'Esse telefone já tem conta. Use "Entrar".',
    };

    const result = await signUpWithPhone(
      { repository, leaderboard },
      { phone: '31999999999', password: 'senha123' },
    );

    expect(result).toEqual({
      ok: false,
      exists: true,
      reason: 'Esse telefone já tem conta. Use "Entrar".',
    });
    expect(leaderboard.signInCalls).toHaveLength(0);
    expect(leaderboard.backupCalls).toHaveLength(0);
    expect(repository.load()).toEqual(before);
  });

  it('regressão: aparelho já numa conta não cria outra por cima (trocaria o telefone da conta)', async () => {
    const repository = new Memory();
    repository.save({ version: 1, trails: {}, travelerUuid: 'uuid-conta', phoneLinked: true });
    const leaderboard = new StubLeaderboard();
    leaderboard.nextSignUp = { ok: true, uid: 'uuid-conta' };

    const result = await signUpWithPhone(
      { repository, leaderboard },
      { phone: '31988888888', password: 'senha123' },
    );

    expect(result.ok).toBe(false);
    expect(leaderboard.signUpCalls).toHaveLength(0);
  });
});

describe('signInWithPhone (Entrar)', () => {
  it('aceita telefone ou e-mail como identificação', async () => {
    const leaderboard = new StubLeaderboard();
    await signInWithPhone(
      { repository: new Memory(), leaderboard },
      { login: '(31) 99999-9999', password: 'x' },
    );
    await signInWithPhone(
      { repository: new Memory(), leaderboard },
      { login: ' ana@example.com ', password: 'x' },
    );
    expect(leaderboard.signInCalls.map((c) => c.identifier)).toEqual([
      { phone: '31999999999' },
      { email: 'ana@example.com' },
    ]);
  });

  it('recusa identificação inválida e senha vazia sem chamar a porta', async () => {
    const leaderboard = new StubLeaderboard();
    const repository = new Memory();
    expect(
      (await signInWithPhone({ repository, leaderboard }, { login: '123', password: 'x' })).ok,
    ).toBe(false);
    expect(
      (await signInWithPhone({ repository, leaderboard }, { login: '31999999999', password: '' }))
        .ok,
    ).toBe(false);
    expect(leaderboard.signInCalls).toHaveLength(0);
  });

  it('junta o progresso anônimo do aparelho com o da conta (perfil da conta) e sobe a união', async () => {
    const repository = new Memory();
    repository.save({
      version: 1,
      trails: { a: trailWith('a', 'm1') },
      travelerName: 'Local',
      travelerUuid: 'uuid-anonimo',
    });
    const leaderboard = new StubLeaderboard();
    const cloud: Progress = {
      version: 1,
      trails: { b: trailWith('b', 'm2') },
      travelerName: 'Remoto',
      phoneLinked: true,
    };
    leaderboard.nextSignIn = { ok: true, uid: 'uuid-conta', progress: cloud };
    leaderboard.cloud = cloud;

    const result = await signInWithPhone(
      { repository, leaderboard },
      { login: '31999999999', password: 'senha123' },
    );

    expect(result).toEqual({ ok: true });
    const saved = repository.load()!;
    expect(Object.keys(saved.trails).sort()).toEqual(['a', 'b']);
    expect(saved).toMatchObject({
      travelerName: 'Remoto',
      travelerUuid: 'uuid-conta',
      phoneLinked: true,
    });
    expect(leaderboard.backupCalls).toEqual([
      { uuid: 'uuid-conta', nome: 'Remoto', progress: saved },
    ]);
  });

  it('regressão: conta com cópia vazia na nuvem NÃO apaga o progresso do aparelho', async () => {
    const repository = new Memory();
    repository.save({
      version: 1,
      trails: { 'banco-de-dados': trailWith('banco-de-dados', 'porque') },
      travelerName: 'Gustavo',
      badgesEarned: { sql: '2026-09-20T10:00:00Z' },
      streakBest: 6,
    });
    const leaderboard = new StubLeaderboard();
    leaderboard.nextSignIn = {
      ok: true,
      uid: 'uuid-conta',
      progress: { version: 1, trails: {}, phoneLinked: true },
    };

    await signInWithPhone(
      { repository, leaderboard },
      { login: '31999999999', password: 'senha123' },
    );

    const saved = repository.load()!;
    expect(saved.trails['banco-de-dados'].modules.porque.completed).toBe(true);
    expect(saved.badgesEarned).toEqual({ sql: '2026-09-20T10:00:00Z' });
    expect(saved.streakBest).toBe(6);
    expect(saved.travelerName).toBe('Gustavo');
  });

  it('regressão: progresso de OUTRA conta (sessão perdida) não se mistura na conta que entrou', async () => {
    const repository = new Memory();
    repository.save({
      version: 1,
      trails: { a: trailWith('a', 'm1') },
      travelerName: 'Outra',
      travelerUuid: 'uuid-outra',
      needsSignIn: true,
    });
    const leaderboard = new StubLeaderboard();
    const cloud: Progress = {
      version: 1,
      trails: { b: trailWith('b', 'm2') },
      travelerName: 'Minha',
      phoneLinked: true,
    };
    leaderboard.nextSignIn = { ok: true, uid: 'uuid-minha', progress: cloud };
    leaderboard.cloud = cloud;

    await signInWithPhone(
      { repository, leaderboard },
      { login: '31999999999', password: 'senha123' },
    );

    const saved = repository.load()!;
    expect(Object.keys(saved.trails)).toEqual(['b']);
    expect(saved).toMatchObject({
      travelerName: 'Minha',
      travelerUuid: 'uuid-minha',
      phoneLinked: true,
    });
    expect(saved.needsSignIn).toBeUndefined();
  });

  it('entrar de novo na mesma conta depois da sessão perdida mantém o que foi feito no aparelho', async () => {
    const repository = new Memory();
    repository.save({
      version: 1,
      trails: { a: trailWith('a', 'm1') },
      travelerName: 'Minha',
      travelerUuid: 'uuid-minha',
      needsSignIn: true,
    });
    const leaderboard = new StubLeaderboard();
    leaderboard.nextSignIn = {
      ok: true,
      uid: 'uuid-minha',
      progress: { version: 1, trails: {}, travelerName: 'Minha' },
    };

    await signInWithPhone(
      { repository, leaderboard },
      { login: '31999999999', password: 'senha123' },
    );

    const saved = repository.load()!;
    expect(saved.trails.a.modules.m1.completed).toBe(true);
    expect(saved.needsSignIn).toBeUndefined();
    expect(saved.phoneLinked).toBe(true);
  });

  it('senha errada: devolve o motivo sem mexer no progresso local', async () => {
    const repository = new Memory();
    repository.save({ version: 1, trails: {}, travelerName: 'Ana' });
    const leaderboard = new StubLeaderboard();
    leaderboard.nextSignIn = { ok: false, reason: 'Telefone ou senha não conferem.' };

    const result = await signInWithPhone(
      { repository, leaderboard },
      { login: '31999999999', password: 'senha123' },
    );

    expect(result).toEqual({ ok: false, reason: 'Telefone ou senha não conferem.' });
    expect(repository.load()).toEqual({ version: 1, trails: {}, travelerName: 'Ana' });
  });
});

describe('hasPhoneLinked', () => {
  it('devolve false quando ainda não vinculou', () => {
    expect(hasPhoneLinked({ repository: new Memory() })).toBe(false);
  });

  it('devolve true depois de vinculado', () => {
    const repository = new Memory();
    repository.save({ version: 1, trails: {}, phoneLinked: true });
    expect(hasPhoneLinked({ repository })).toBe(true);
  });
});

describe('requestPasswordReset', () => {
  it('recusa e-mail inválido sem chamar a porta', async () => {
    const leaderboard = new StubLeaderboard();
    const result = await requestPasswordReset({ leaderboard }, { email: 'invalido' });
    expect(result).toEqual({ ok: false, reason: 'Digite um e-mail válido.' });
    expect(leaderboard.resetRequests).toHaveLength(0);
  });

  it('repassa o e-mail válido pra porta', async () => {
    const leaderboard = new StubLeaderboard();
    leaderboard.nextSimpleResult = { ok: true };
    const result = await requestPasswordReset({ leaderboard }, { email: 'ana@example.com' });
    expect(result).toEqual({ ok: true });
    expect(leaderboard.resetRequests).toEqual(['ana@example.com']);
  });
});

describe('updatePassword', () => {
  it('recusa senha curta sem chamar a porta', async () => {
    const leaderboard = new StubLeaderboard();
    const result = await updatePassword({ leaderboard }, { password: '123' });
    expect(result.ok).toBe(false);
    expect(leaderboard.passwordUpdates).toHaveLength(0);
  });

  it('repassa a senha válida pra porta', async () => {
    const leaderboard = new StubLeaderboard();
    leaderboard.nextSimpleResult = { ok: true };
    const result = await updatePassword({ leaderboard }, { password: 'senha123' });
    expect(result).toEqual({ ok: true });
    expect(leaderboard.passwordUpdates).toEqual(['senha123']);
  });
});
