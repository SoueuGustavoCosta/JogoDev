import type { HallOfTravelersEntry, LeaderboardPort, OnlinePlayer, PlayerProfile, SavePhoneResult } from '@/application/ports';

/** Usado em testes e em desenvolvimento: não envia nada a lugar nenhum. */
export class NoopLeaderboard implements LeaderboardPort {
  async upsertPlayer(_uuid: string, _nome: string): Promise<void> {
    // Intencionalmente vazio.
  }

  async syncProgress(_uuid: string, _era: string, _fase: string): Promise<void> {
    // Intencionalmente vazio.
  }

  async syncBadge(_uuid: string, _nomeInsignia: string): Promise<void> {
    // Intencionalmente vazio.
  }

  async listHallOfTravelers(): Promise<HallOfTravelersEntry[]> {
    return [];
  }

  async getPlayer(_uuid: string): Promise<PlayerProfile | null> {
    return null;
  }

  async checkIn(
    _uuid: string,
    _params: { nome: string; sequenciaAtual: number; sequenciaRecorde: number; ultimoDiaAtivo: string },
  ): Promise<void> {
    // Intencionalmente vazio.
  }

  async heartbeat(_uuid: string): Promise<void> {
    // Intencionalmente vazio.
  }

  async uploadAvatar(_uuid: string, _blob: Blob): Promise<string | null> {
    return null;
  }

  async listOnlinePlayers(_sinceMinutes?: number): Promise<OnlinePlayer[]> {
    return [];
  }

  async backupProgress(_uuid: string, _progress: unknown): Promise<void> {
    // Intencionalmente vazio.
  }

  async setRecoveryCode(_uuid: string, _codigo: string): Promise<void> {
    // Intencionalmente vazio.
  }

  async restoreProgress(_nome: string, _codigo: string): Promise<{ uuid: string; progress: unknown } | null> {
    return null;
  }

  async saveBio(_uuid: string, _bio: string): Promise<void> {
    // Intencionalmente vazio.
  }

  async ensureSignedIn(): Promise<string | null> {
    return null;
  }

  async saveProgressWithPhone(_phone: string, _password: string): Promise<SavePhoneResult> {
    return { ok: false, reason: 'Indisponível em desenvolvimento.' };
  }
}
