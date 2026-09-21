import type { BossFightConfig, BossFightState, BossRound, BossSequence } from './types';

/**
 * Rodada de "um bloco só" (ex.: SQL do boss fight da Era dos Dados): todo padrão de
 * `round.check` precisa casar em algum lugar do texto (mesma tolerância do resto do jogo:
 * não exige sintaxe perfeita, exige os elementos que provam o conceito).
 */
export function checkSingleShot(round: BossRound, input: string): boolean {
  const value = input.toLowerCase();
  return round.check.every((pattern) => new RegExp(pattern).test(value));
}

/**
 * Passo de uma rodada "passo a passo" (ex.: comandos git do boss fight de Git e GitHub):
 * só o padrão do passo atual é testado, um comando de cada vez, em ordem.
 */
export function checkSequenceStep(sequence: BossSequence, stepIndex: number, input: string): boolean {
  const pattern = sequence.steps[stepIndex];
  if (!pattern) return false;
  return new RegExp(pattern).test(input.trim().toLowerCase());
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
