import type {
  HallOfTravelersEntry,
  LeaderboardPort,
  LeagueRow,
  MuralRow,
  OnlinePlayer,
  PlayerProfile,
  SignInIdentifier,
  SignInResult,
  SignUpResult,
} from '@/application/ports';

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

  async backupProgress(_uuid: string, _nome: string, _progress: unknown): Promise<void> {
    // Intencionalmente vazio.
  }

  async setRecoveryCode(_uuid: string, _codigo: string): Promise<void> {
    // Intencionalmente vazio.
  }

  async restoreProgress(_nome: string, _codigo: string): Promise<{ uuid: string; progress: unknown } | null> {
    return null;
  }

  async recordAnomalySolved(_uuid: string, _anomalyId: string, _day: string): Promise<void> {
    // Intencionalmente vazio.
  }

  async countAnomalySolved(_day: string): Promise<number | null> {
    return null;
  }

  async saveBio(_uuid: string, _bio: string): Promise<void> {
    // Intencionalmente vazio.
  }

  async ensureSignedIn(): Promise<string | null> {
    return null;
  }

  async getMyProgress(): Promise<unknown | null> {
    return null;
  }

  async signUpWithPhone(_phone: string, _password: string, _email?: string): Promise<SignUpResult> {
    return { ok: false, reason: 'Indisponível em desenvolvimento.' };
  }

  async signInWithPassword(_identifier: SignInIdentifier, _password: string): Promise<SignInResult> {
    return { ok: false, reason: 'Indisponível em desenvolvimento.' };
  }

  async requestPasswordReset(_email: string): Promise<{ ok: true } | { ok: false; reason: string }> {
    return { ok: false, reason: 'Indisponível em desenvolvimento.' };
  }

  async hasRealSession(): Promise<boolean> {
    return false;
  }

  async updatePassword(_newPassword: string): Promise<{ ok: true } | { ok: false; reason: string }> {
    return { ok: false, reason: 'Indisponível em desenvolvimento.' };
  }

  async signOut(): Promise<void> {
    // Intencionalmente vazio.
  }

  async saveCosmetics(_uuid: string, _equipped: Record<string, string>): Promise<void> {
    // Intencionalmente vazio.
  }

  async listCosmetics(_uuids: string[]): Promise<Record<string, unknown>> {
    return {};
  }

  async syncWeeklyXp(_week: string, _xp: number): Promise<void> {
    // Intencionalmente vazio.
  }

  async getLeague(_week: string): Promise<LeagueRow[] | null> {
    return null;
  }

  async countAnomaliesBetween(_from: string, _to: string): Promise<number | null> {
    return null;
  }

  async recordWorkshopSolved(_uuid: string, _workshopId: string): Promise<void> {
    // Intencionalmente vazio.
  }

  async countWorkshopsBetween(_from: string, _to: string): Promise<number | null> {
    return null;
  }

  async publishSolution(_uuid: string, _workshopId: string, _lang: string, _code: string): Promise<boolean> {
    return false;
  }

  async listMural(_workshopId: string): Promise<MuralRow[] | null> {
    return null;
  }

  async setStar(_uuid: string, _solutionId: string, _on: boolean): Promise<boolean> {
    return false;
  }
}
