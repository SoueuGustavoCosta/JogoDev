import { describe, expect, it } from 'vitest';
import { trailSchema } from '@/domain/trail';
import { gitGithubTrail } from './trail';
import { gitGithubModules } from './modules';

/**
 * Teste de não regressão do conteúdo migrado de ilha_git_github.html: os 7 módulos,
 * na mesma ordem, com quiz preservado, além da validação Zod exigida pela seção 11
 * do CLAUDE.md (um erro de conteúdo quebra o CI, não a tela do aluno).
 */
describe('conteúdo da Era "Código Compartilhado" (git-github)', () => {
  it('preserva os 7 módulos do protótipo, na mesma ordem', () => {
    expect(gitGithubModules).toHaveLength(7);
    expect(gitGithubModules.map((m) => m.id)).toEqual([
      'origem',
      'conceitos',
      'ciclo',
      'branches',
      'desfazer',
      'github',
      'boaspraticas',
    ]);
  });

  it('cada módulo tem pelo menos um bloco e um item de quiz', () => {
    for (const mod of gitGithubModules) {
      expect(mod.blocks.length, `módulo ${mod.id} sem blocos`).toBeGreaterThan(0);
      expect(mod.quiz.length, `módulo ${mod.id} sem quiz`).toBeGreaterThan(0);
    }
  });

  it('preserva os 21 itens de quiz do protótipo (18 múltipla escolha + 3 completar)', () => {
    const allQuiz = gitGithubModules.flatMap((m) => m.quiz);
    expect(allQuiz).toHaveLength(21);
    const fillCount = allQuiz.filter((q) => 'fill' in q).length;
    expect(fillCount).toBe(3);
    expect(allQuiz.length - fillCount).toBe(18);
  });

  it('valida a trilha inteira contra o esquema Zod de conteúdo', () => {
    expect(() => trailSchema.parse(gitGithubTrail)).not.toThrow();
  });

  it('a trilha usa o laboratório git e o símbolo próprio "git"', () => {
    expect(gitGithubTrail.lab).toBe('git');
    expect(gitGithubTrail.symbol).toBe('git');
  });

  it('a conversa de chegada com a Senhorita Sintaxe é uma sequência de falas curtas', () => {
    expect(Array.isArray(gitGithubTrail.intro)).toBe(true);
    expect(gitGithubTrail.intro!.length).toBeGreaterThanOrEqual(2);
    expect(gitGithubTrail.intro!.length).toBeLessThanOrEqual(4);
    for (const line of gitGithubTrail.intro!) {
      expect(line.length).toBeGreaterThan(0);
    }
  });
});
