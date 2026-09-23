import { describe, expect, it } from 'vitest';
import type { Progress } from '@/domain/progress';
import type {
  HallOfTravelersEntry,
  LeaderboardPort,
  OnlinePlayer,
  PlayerProfile,
  ProgressRepository,
  SavePhoneResult,
} from '../ports';
import { hasPhoneLinked, requestPasswordReset, saveProgressWithPhone, updatePassword } from './phoneAuth';

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
    modules: { [moduleId]: { moduleId, completed: true, quizResults: { 0: { correct: true, triesUsed: 1 } } } },
  };
}

class StubLeaderboard implements LeaderboardPort {
  nextResult: SavePhoneResult = { ok: false, reason: 'não configurado' };
  savedPhoneCalls: { phone: string; password: string; email?: string }[] = [];
  nextSimpleResult: { ok: true } | { ok: false; reason: string } = { ok: false, reason: 'não configurado' };
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
  async saveProgressWithPhone(phone: string, password: string, email?: string): Promise<SavePhoneResult> {
    this.savedPhoneCalls.push({ phone, password, email });
    return this.nextResult;
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

describe('saveProgressWithPhone', () => {
  it('recusa telefone inválido sem chamar a porta', async () => {
    const repository = new Memory();
    const leaderboard = new StubLeaderboard();
    const result = await saveProgressWithPhone({ repository, leaderboard }, { phone: '123', password: '123456' });
    expect(result).toEqual({ ok: false, reason: 'Digite um telefone válido, com DDD.' });
    expect(leaderboard.savedPhoneCalls).toHaveLength(0);
  });

  it('recusa senha curta sem chamar a porta', async () => {
    const repository = new Memory();
    const leaderboard = new StubLeaderboard();
    const result = await saveProgressWithPhone({ repository, leaderboard }, { phone: '31999999999', password: '123' });
    expect(result.ok).toBe(false);
    expect(leaderboard.savedPhoneCalls).toHaveLength(0);
  });

  it('cadastro novo: mantém o progresso local e marca phoneLinked', async () => {
    const repository = new Memory();
    repository.save({ version: 1, trails: {}, travelerName: 'Ana', travelerUuid: 'uuid-local' });
    const leaderboard = new StubLeaderboard();
    leaderboard.nextResult = { ok: true, uid: 'uuid-novo', isLogin: false, restoredProgress: null };

    const result = await saveProgressWithPhone(
      { repository, leaderboard },
      { phone: '(31) 99999-9999', password: 'senha123' },
    );

    expect(result).toEqual({ ok: true });
    expect(leaderboard.savedPhoneCalls).toEqual([{ phone: '31999999999', password: 'senha123' }]);
    expect(repository.load()).toMatchObject({ travelerName: 'Ana', travelerUuid: 'uuid-novo', phoneLinked: true });
  });

  it('cadastro novo: faz o backup na hora, sem esperar o batimento periódico', async () => {
    const repository = new Memory();
    repository.save({ version: 1, trails: {}, travelerName: 'Ana', travelerUuid: 'uuid-local' });
    const leaderboard = new StubLeaderboard();
    leaderboard.nextResult = { ok: true, uid: 'uuid-novo', isLogin: false, restoredProgress: null };

    await saveProgressWithPhone({ repository, leaderboard }, { phone: '31999999999', password: 'senha123' });

    expect(leaderboard.backupCalls).toEqual([{ uuid: 'uuid-novo', nome: 'Ana', progress: repository.load() }]);
  });

  it('conta já existente: junta a cópia da nuvem com o aparelho (perfil da conta) e sobe a união', async () => {
    const repository = new Memory();
    repository.save({ version: 1, trails: { a: trailWith('a', 'm1') }, travelerName: 'Local' });
    const leaderboard = new StubLeaderboard();
    const remoteProgress: Progress = { version: 1, trails: { b: trailWith('b', 'm2') }, travelerName: 'Remoto' };
    leaderboard.nextResult = { ok: true, uid: 'uuid-remoto', isLogin: true, restoredProgress: remoteProgress };

    const result = await saveProgressWithPhone({ repository, leaderboard }, { phone: '31999999999', password: 'senha123' });

    expect(result).toEqual({ ok: true });
    const saved = repository.load()!;
    expect(Object.keys(saved.trails).sort()).toEqual(['a', 'b']);
    expect(saved).toMatchObject({ travelerName: 'Remoto', travelerUuid: 'uuid-remoto', phoneLinked: true });
    expect(leaderboard.backupCalls).toEqual([{ uuid: 'uuid-remoto', nome: 'Remoto', progress: saved }]);
  });

  it('regressão: login numa conta com cópia vazia NÃO apaga o progresso do aparelho', async () => {
    // Foi o que apagou progresso de verdade: a nuvem da conta estava vazia e o login
    // trocou dias de jogo deste aparelho por ela.
    const repository = new Memory();
    repository.save({
      version: 1,
      trails: { 'banco-de-dados': trailWith('banco-de-dados', 'porque') },
      travelerName: 'Gustavo',
      badgesEarned: { sql: '2026-09-20T10:00:00Z' },
      streakBest: 6,
    });
    const leaderboard = new StubLeaderboard();
    const emptyCloud: Progress = { version: 1, trails: {}, phoneLinked: true };
    leaderboard.nextResult = { ok: true, uid: 'uuid-conta', isLogin: true, restoredProgress: emptyCloud };

    await saveProgressWithPhone({ repository, leaderboard }, { phone: '31999999999', password: 'senha123' });

    const saved = repository.load()!;
    expect(saved.trails['banco-de-dados'].modules.porque.completed).toBe(true);
    expect(saved.badgesEarned).toEqual({ sql: '2026-09-20T10:00:00Z' });
    expect(saved.streakBest).toBe(6);
    expect(saved.travelerName).toBe('Gustavo');
    expect(leaderboard.backupCalls[0].progress).toEqual(saved);
  });

  it('conta já existente sem nada salvo (restoredProgress nulo): preserva o progresso local em vez de zerar a tela', async () => {
    // Regressão: perder progresso é pior que uma sincronização imperfeita. Se o login
    // deu certo (senha bateu) mas não veio nada salvo pra essa conta — pode ser uma
    // conta de verdade ainda vazia, ou uma falha silenciosa ao buscar — nunca se deve
    // arriscar apagar o progresso que está na tela agora. Em vez disso, adota esse
    // progresso local como o da conta a partir daqui (com backup imediato).
    const repository = new Memory();
    repository.save({ version: 1, trails: {}, travelerName: 'Gustavo Costa', travelerUuid: 'uuid-local' });
    const leaderboard = new StubLeaderboard();
    leaderboard.nextResult = { ok: true, uid: 'uuid-remoto', isLogin: true, restoredProgress: null };

    const result = await saveProgressWithPhone({ repository, leaderboard }, { phone: '31999999999', password: 'senha123' });

    expect(result).toEqual({ ok: true });
    expect(repository.load()).toMatchObject({ travelerName: 'Gustavo Costa', travelerUuid: 'uuid-remoto', phoneLinked: true });
    expect(leaderboard.backupCalls).toEqual([
      { uuid: 'uuid-remoto', nome: 'Gustavo Costa', progress: repository.load() },
    ]);
  });

  it('devolve o motivo de erro da porta sem mexer no progresso local', async () => {
    const repository = new Memory();
    repository.save({ version: 1, trails: {}, travelerName: 'Ana' });
    const leaderboard = new StubLeaderboard();
    leaderboard.nextResult = { ok: false, reason: 'Telefone já cadastrado, mas a senha não confere.' };

    const result = await saveProgressWithPhone({ repository, leaderboard }, { phone: '31999999999', password: 'senha123' });

    expect(result).toEqual({ ok: false, reason: 'Telefone já cadastrado, mas a senha não confere.' });
    expect(repository.load()).toMatchObject({ travelerName: 'Ana' });
  });
});

describe('hasPhoneLinked', () => {
  it('devolve false quando ainda não vinculou', () => {
    const repository = new Memory();
    expect(hasPhoneLinked({ repository })).toBe(false);
  });

  it('devolve true depois de vinculado', () => {
    const repository = new Memory();
    repository.save({ version: 1, trails: {}, phoneLinked: true });
    expect(hasPhoneLinked({ repository })).toBe(true);
  });
});

describe('saveProgressWithPhone com e-mail opcional', () => {
  it('recusa e-mail com formato inválido sem chamar a porta', async () => {
    const repository = new Memory();
    const leaderboard = new StubLeaderboard();
    const result = await saveProgressWithPhone(
      { repository, leaderboard },
      { phone: '31999999999', password: 'senha123', email: 'não-é-email' },
    );
    expect(result).toEqual({ ok: false, reason: 'Digite um e-mail válido, ou deixe em branco.' });
    expect(leaderboard.savedPhoneCalls).toHaveLength(0);
  });

  it('repassa o e-mail pra porta quando informado', async () => {
    const repository = new Memory();
    const leaderboard = new StubLeaderboard();
    leaderboard.nextResult = { ok: true, uid: 'uuid-novo', isLogin: false, restoredProgress: null };

    await saveProgressWithPhone(
      { repository, leaderboard },
      { phone: '31999999999', password: 'senha123', email: 'ana@example.com' },
    );

    expect(leaderboard.savedPhoneCalls).toEqual([{ phone: '31999999999', password: 'senha123', email: 'ana@example.com' }]);
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
