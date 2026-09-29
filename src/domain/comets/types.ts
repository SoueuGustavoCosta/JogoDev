/**
 * Cometas de tecnologia (expansão Nexus): eventos temporários com trilha própria. Cada um
 * atravessa o céu do mapa por um período, depois vai para o Arquivo da AVT.
 */
export type Comet = {
  id: string;
  /** Trilha do cometa (content/trails/<id>). */
  trailId: string;
  /** Nome curto mostrado no céu e no card (ex.: "Docker"). */
  name: string;
  /** Início e fim (ISO 8601 com fuso, ex.: 2026-10-12T00:00:00-03:00). `to` não incluído. */
  from: string;
  to: string;
  /** Insígnia de quem vence o chefe enquanto o cometa está no céu. */
  rareBadgeId: string;
  /** Insígnia de quem vence o chefe pelo Arquivo da AVT, depois que o cometa passou. */
  commonBadgeId: string;
};

export type SkyState =
  | {
      kind: 'comet';
      comet: Comet;
      /** 0 = acabou de entrar (direita), 1 = saindo (esquerda). */
      progress: number;
      remainingMs: number;
      /** Últimas 24 horas: o cometa fica rosa e treme. */
      urgent: boolean;
    }
  /** Céu limpo entre dois cometas. */
  | { kind: 'gap'; next: Comet; untilMs: number }
  /** Acabou o calendário: "Novos cometas em breve". */
  | { kind: 'soon' };
