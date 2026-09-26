import { beforeEach, describe, expect, it } from 'vitest';
import { LocalStorageProgressRepository } from './LocalStorageProgressRepository';

const KEY = 'arquipelago:progress:v1';

describe('LocalStorageProgressRepository: nunca joga fora um progresso que não conseguiu ler', () => {
  beforeEach(() => window.localStorage.clear());

  it('lê e grava o progresso normal', () => {
    const repo = new LocalStorageProgressRepository();
    repo.save({ version: 1, trails: {}, travelerName: 'Ana' });
    expect(new LocalStorageProgressRepository().load()?.travelerName).toBe('Ana');
  });

  it('JSON corrompido vai pra chave de resgate antes de ser sobrescrito', () => {
    window.localStorage.setItem(KEY, '{"version":1,"trails":{"logi');
    const repo = new LocalStorageProgressRepository();
    expect(repo.load()).toBeNull();
    repo.save({ version: 1, trails: {} });
    expect(window.localStorage.getItem(`${KEY}:resgate`)).toBe('{"version":1,"trails":{"logi');
  });

  it('versão que o app não conhece também é resgatada, e o resgate não é trocado depois', () => {
    const future = JSON.stringify({ version: 99, trails: { x: {} } });
    window.localStorage.setItem(KEY, future);
    new LocalStorageProgressRepository().load();
    window.localStorage.setItem(KEY, 'lixo');
    new LocalStorageProgressRepository().load();
    expect(window.localStorage.getItem(`${KEY}:resgate`)).toBe(future);
  });
  it('progresso salvo antes das telas curtas (sem screen/lessonMode) é lido igualzinho', () => {
    const old = {
      version: 1,
      travelerName: 'Ana',
      trails: { logica: { trailId: 'logica', trophyAwarded: false, missionsCompleted: {}, modules: { variaveis: { moduleId: 'variaveis', completed: true, quizResults: { 0: { correct: true, triesUsed: 1 } } } } } },
    };
    window.localStorage.setItem(KEY, JSON.stringify(old));
    expect(new LocalStorageProgressRepository().load()).toEqual(old);
    expect(window.localStorage.getItem(`${KEY}:resgate`)).toBeNull();
  });
});
