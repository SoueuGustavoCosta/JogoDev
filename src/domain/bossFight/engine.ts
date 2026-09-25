import type { BossFightConfig, BossFightState, BossRound, BossSequence } from './types';

/**
 * Rodada de "um bloco só" (ex.: SQL do boss fight da Era dos Dados): todo padrão de
 * `round.check` precisa casar em algum lugar do texto (mesma tolerância do resto do jogo:
 * não exige sintaxe perfeita, exige os elementos que provam o conceito).
 */
export function checkSingleShot(round: BossRound, input: string): boolean {
  const value = normalizeAnswer(input);
  // Cada padrão pode casar no texto como foi digitado (padrões que exigem espaço, como
  // SQL) ou sem nenhum espaço (padrões ancorados como `^livres\(\)==0$`, que antes davam
  // erro em quem escrevia `livres() == 0` ou deixava um espaço no fim pelo teclado).
  const compact = value.replace(/\s+/g, '');
  return round.check.every((pattern) => {
    const re = new RegExp(pattern);
    return re.test(value) || re.test(compact);
  });
}

/** Minúsculas, sem espaços nas pontas e com as aspas curvas do teclado do celular retas. */
function normalizeAnswer(input: string): string {
  return input
    .trim()
    .toLowerCase()
    .replace(/[\u2018\u2019\u201A\u2032]/g, "'")
    .replace(/[\u201C\u201D\u201E\u2033]/g, '"');
}

/**
 * Passo de uma rodada "passo a passo" (ex.: comandos git do boss fight de Git e GitHub):
 * só o padrão do passo atual é testado, um comando de cada vez, em ordem.
 */
export function checkSequenceStep(sequence: BossSequence, stepIndex: number, input: string): boolean {
  const pattern = sequence.steps[stepIndex];
  if (!pattern) return false;
  return new RegExp(pattern).test(normalizeAnswer(input));
}

export function createBossFightState(config: BossFightConfig): BossFightState {
  return {
    roundIndex: 0,
    stepIndex: 0,
    score: 0,
    lives: config.initialLives,
    attempts: 0,
    status: 'playing',
  };
}

/**
 * Aplica o resultado de uma tentativa (acerto ou erro) ao estado do combate.
 * `stepsInRound` é 1 em rodadas de um bloco só e o número de passos em rodadas de sequência.
 * Não muta `state`; um combate já terminado (`won`/`lost`) ignora novas tentativas.
 */
export function applyBossAttempt(
  state: BossFightState,
  config: BossFightConfig,
  params: { correct: boolean; stepsInRound: number },
): BossFightState {
  if (state.status !== 'playing') return state;

  if (params.correct) {
    const score = state.score + config.pointsPerStep;
    const stepIndex = state.stepIndex + 1;
    if (stepIndex >= params.stepsInRound) {
      const roundIndex = state.roundIndex + 1;
      const status = roundIndex >= config.roundCount ? 'won' : 'playing';
      return { ...state, score, stepIndex: 0, roundIndex, attempts: 0, status };
    }
    return { ...state, score, stepIndex, attempts: 0, status: 'playing' };
  }

  const attempts = state.attempts + 1;
  if (attempts >= config.maxAttempts) {
    const lives = state.lives - 1;
    const status = lives <= 0 ? 'lost' : 'playing';
    return { ...state, attempts: 0, lives, status };
  }
  return { ...state, attempts, status: 'playing' };
}

/** Pedir uma dica custa pontos, mas nunca deixa o placar negativo. */
export function applyBossHint(state: BossFightState, config: BossFightConfig): BossFightState {
  return { ...state, score: Math.max(0, state.score - config.hintPenalty) };
}

/** Reinicia o combate (usado em "Reiniciar" e depois de uma derrota), mantendo a config. */
export function resetBossFight(config: BossFightConfig): BossFightState {
  return createBossFightState(config);
}
