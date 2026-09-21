import { describe, expect, it } from 'vitest';
import {
  applyBossAttempt,
  applyBossHint,
  checkSequenceStep,
  checkSingleShot,
  createBossFightState,
} from './engine';
import type { BossFightConfig, BossRound, BossSequence } from './types';

const singleShotConfig: BossFightConfig = {
  roundCount: 3,
  maxAttempts: 3,
  pointsPerStep: 50,
  hintPenalty: 25,
  initialLives: 3,
};

const sequenceConfig: BossFightConfig = {
  roundCount: 4,
  maxAttempts: 3,
  pointsPerStep: 30,
  hintPenalty: 25,
  initialLives: 3,
};

describe('checkSingleShot', () => {
  const round: BossRound = {
    title: 'Rodada 1',
    description: 'desc',
    talk: 'fala',
    hint: 'dica',
    check: ['create\\s+table', 'pedidos', 'foreign\\s+key', 'references'],
  };

  it('exige todos os padrões, em qualquer ordem, case-insensitive', () => {
    const sql = 'CREATE TABLE pedidos (id int, cliente_id int, FOREIGN KEY (cliente_id) REFERENCES clientes(id));';
    expect(checkSingleShot(round, sql)).toBe(true);
  });

  it('rejeita quando falta um padrão', () => {
    expect(checkSingleShot(round, 'create table pedidos (id int);')).toBe(false);
  });
});

describe('checkSequenceStep', () => {
  const sequence: BossSequence = {
    title: 'Rodada 1',
    description: 'desc',
    talk: 'fala',
    hint: 'dica',
    steps: ['git\\s+init', 'git\\s+add', 'git\\s+commit\\s+-m'],
  };

  it('testa só o padrão do passo pedido', () => {
    expect(checkSequenceStep(sequence, 0, 'git init')).toBe(true);
    expect(checkSequenceStep(sequence, 0, 'git add .')).toBe(false);
    expect(checkSequenceStep(sequence, 2, 'git commit -m "oi"')).toBe(true);
  });

  it('devolve falso para um índice fora da sequência', () => {
    expect(checkSequenceStep(sequence, 5, 'git init')).toBe(false);
  });
});

describe('applyBossAttempt (rodadas de um bloco só)', () => {
  it('acerto avança de rodada e soma pontos', () => {
    const s0 = createBossFightState(singleShotConfig);
    const s1 = applyBossAttempt(s0, singleShotConfig, { correct: true, stepsInRound: 1 });
    expect(s1.roundIndex).toBe(1);
    expect(s1.score).toBe(50);
    expect(s1.status).toBe('playing');
  });

  it('vence ao completar a última rodada', () => {
    let s = createBossFightState(singleShotConfig);
    for (let i = 0; i < singleShotConfig.roundCount; i++) {
      s = applyBossAttempt(s, singleShotConfig, { correct: true, stepsInRound: 1 });
    }
    expect(s.status).toBe('won');
    expect(s.score).toBe(150);
  });

  it('3 erros seguidos custam uma vida e zeram as tentativas', () => {
    let s = createBossFightState(singleShotConfig);
    s = applyBossAttempt(s, singleShotConfig, { correct: false, stepsInRound: 1 });
    s = applyBossAttempt(s, singleShotConfig, { correct: false, stepsInRound: 1 });
    expect(s.lives).toBe(3);
    s = applyBossAttempt(s, singleShotConfig, { correct: false, stepsInRound: 1 });
    expect(s.lives).toBe(2);
    expect(s.attempts).toBe(0);
    expect(s.status).toBe('playing');
  });

  it('perde ao ficar sem vidas', () => {
    let s = createBossFightState({ ...singleShotConfig, initialLives: 1 });
    for (let i = 0; i < 3; i++) {
      s = applyBossAttempt(s, singleShotConfig, { correct: false, stepsInRound: 1 });
    }
    expect(s.lives).toBe(0);
    expect(s.status).toBe('lost');
  });

  it('ignora novas tentativas depois que o combate terminou', () => {
    let s = createBossFightState({ ...singleShotConfig, roundCount: 1 });
    s = applyBossAttempt(s, { ...singleShotConfig, roundCount: 1 }, { correct: true, stepsInRound: 1 });
    expect(s.status).toBe('won');
    const s2 = applyBossAttempt(s, { ...singleShotConfig, roundCount: 1 }, { correct: false, stepsInRound: 1 });
    expect(s2).toEqual(s);
  });
});

describe('applyBossAttempt (rodadas de sequência)', () => {
  it('avança passo a passo dentro da mesma rodada antes de virar a página', () => {
    let s = createBossFightState(sequenceConfig);
    s = applyBossAttempt(s, sequenceConfig, { correct: true, stepsInRound: 3 });
    expect(s.roundIndex).toBe(0);
    expect(s.stepIndex).toBe(1);
    expect(s.score).toBe(30);
    s = applyBossAttempt(s, sequenceConfig, { correct: true, stepsInRound: 3 });
    s = applyBossAttempt(s, sequenceConfig, { correct: true, stepsInRound: 3 });
    expect(s.roundIndex).toBe(1);
    expect(s.stepIndex).toBe(0);
    expect(s.score).toBe(90);
  });
});

describe('applyBossHint', () => {
  it('tira pontos sem deixar negativo', () => {
    const s0 = createBossFightState(singleShotConfig);
    const s1 = applyBossHint(s0, singleShotConfig);
    expect(s1.score).toBe(0);
    const s2 = applyBossHint({ ...s1, score: 10 }, singleShotConfig);
    expect(s2.score).toBe(0);
  });
});
