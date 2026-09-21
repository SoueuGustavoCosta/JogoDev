import type { HallOfTravelersEntry, LeaderboardPort } from '@/application/ports';

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
}
