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

  // Decisão do autor (Etapa 4): a contagem exata (18 múltipla escolha + 3 completar) virou
  // "nenhuma pergunta sumiu e o total não diminui". Uma pergunta pode mudar de formato (ex.:
  // múltipla escolha -> montar a linha) levando o id junto, e perguntas novas podem entrar.
  it('não perde nenhuma das 21 perguntas do protótipo (total ≥ 21; formatos podem mudar)', () => {
    const allQuiz = gitGithubModules.flatMap((m) => m.quiz);
    expect(allQuiz.length).toBeGreaterThanOrEqual(21);
    // Ids das perguntas do protótipo em cada módulo (q1..qN, Etapa 3.5): todos continuam existindo.
    const original: Record<string, number> = { origem: 3, conceitos: 3, ciclo: 3, branches: 3, desfazer: 3, github: 3, boaspraticas: 3 };
    for (const mod of gitGithubModules) {
      const ids = mod.quiz.map((q) => q.id);
      for (let n = 1; n <= (original[mod.id] ?? 0); n++) expect(ids, `${mod.id} perdeu a pergunta q${n}`).toContain(`q${n}`);
    }
    expect(Object.values(original).reduce((a, b) => a + b, 0)).toBe(21);
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

describe('boss fight da Era da Bifurcação (O Bifurcador)', () => {
  it('tem o formato sequence com as 4 rodadas do protótipo', () => {
    const bossFight = gitGithubTrail.bossFight;
    expect(bossFight).toBeDefined();
    expect(bossFight?.bossName).toBe('O Bifurcador');
    expect(bossFight?.mode).toBe('sequence');
    expect(bossFight?.rounds).toHaveLength(4);
    expect(bossFight?.intro.length).toBeGreaterThanOrEqual(2);
    expect(bossFight?.badgeId).toBe('git-mestre');
  });

  it('cada passo de cada rodada é uma fonte de regex válida', () => {
    const rounds = gitGithubTrail.bossFight?.mode === 'sequence' ? gitGithubTrail.bossFight.rounds : [];
    expect(rounds.length).toBeGreaterThan(0);
    for (const round of rounds) {
      for (const pattern of round.steps) {
        expect(() => new RegExp(pattern)).not.toThrow();
      }
    }
  });
});
