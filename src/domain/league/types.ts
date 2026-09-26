/** Uma linha do ranking da semana. */
export type LeagueEntry = {
  uuid: string;
  name: string;
  photoUrl: string | null;
  /** Dias seguidos da Linha do Tempo. */
  lineDays: number;
  xp: number;
};

/** Quantos primeiros da semana ganham o selo (cosmético). Sem rebaixamento nem punição. */
export const LEAGUE_SEAL_TOP = 3;

/** Item do catálogo de cosméticos que é o selo da semana (content/cosmetics). */
export const LEAGUE_SEAL_ITEM_ID = 'acessorio-selo-liga';
