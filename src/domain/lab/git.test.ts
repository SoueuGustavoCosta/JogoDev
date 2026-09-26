import { describe, expect, it } from 'vitest';
import { applyGitCommand, createGitRepoState, runGitScript } from './git';
import { gitMissions } from './gitMissions';

function run(state: ReturnType<typeof createGitRepoState>, raw: string) {
  return applyGitCommand(state, raw);
}

describe('applyGitCommand', () => {
  it('erra fora de um repositório inicializado', () => {
    const s0 = createGitRepoState('vazio');
    const { lines } = run(s0, 'git status');
    expect(lines.some((l) => l.cls === 'tl-err')).toBe(true);
  });

  it('git init inicializa o repositório', () => {
    const s0 = createGitRepoState('vazio');
    const { state, lines } = run(s0, 'git init');
    expect(state.initialized).toBe(true);
    expect(state.branches.main).toBeNull();
    expect(lines.some((l) => l.cls === 'tl-ok')).toBe(true);
    expect(s0.initialized).toBe(false); // não muta o estado recebido
  });

  it('ciclo completo: init, add, commit gera um commit', () => {
    let s = createGitRepoState('vazio');
    s = run(s, 'git init').state;
    s = run(s, 'git add .').state;
    const { state, lines } = run(s, 'git commit -m "primeiro commit"');
    expect(Object.keys(state.commits)).toHaveLength(1);
    expect(lines.some((l) => l.cls === 'tl-ok')).toBe(true);
  });

  it('commit sem add antes falha', () => {
    let s = createGitRepoState('vazio');
    s = run(s, 'git init').state;
    const { lines } = run(s, 'git commit -m "nada preparado"');
    expect(lines.some((l) => l.cls === 'tl-err')).toBe(true);
  });

  it('branch + switch trocam o head e criam uma mudança pendente', () => {
    let s = createGitRepoState('vazio');
    s = run(s, 'git init').state;
    s = run(s, 'git add .').state;
    s = run(s, 'git commit -m "base"').state;
    s = run(s, 'git branch feature').state;
    const { state } = run(s, 'git switch feature');
    expect(state.head).toBe('feature');
    expect(state.branches.feature).toBe(state.branches.main);
  });

  it('checkout -b cria e troca de branch em um passo', () => {
    let s = createGitRepoState('vazio');
    s = run(s, 'git init').state;
    s = run(s, 'git add .').state;
    s = run(s, 'git commit -m "base"').state;
    const { state } = run(s, 'git checkout -b feature');
    expect(state.head).toBe('feature');
    expect(state.branches.feature).toBeDefined();
  });

  it('merge funde duas branches e cria um commit com dois pais', () => {
    let s = createGitRepoState('vazio');
    s = run(s, 'git init').state;
    s = run(s, 'git add .').state;
    s = run(s, 'git commit -m "base"').state;
    s = run(s, 'git branch feature').state;
    s = run(s, 'git switch feature').state;
    s = run(s, 'git add .').state;
    s = run(s, 'git commit -m "feature"').state;
    s = run(s, 'git switch main').state;
    const { state, lines } = run(s, 'git merge feature');
    const mainCommit = state.commits[state.branches.main as string];
    expect(mainCommit.parents).toHaveLength(2);
    expect(lines.some((l) => l.cls === 'tl-ok')).toBe(true);
  });

  it('stash guarda e devolve as mudanças', () => {
    let s = createGitRepoState('vazio');
    s = run(s, 'git init').state;
    const { state: afterStash } = run(s, 'git stash');
    expect(afterStash.stash).toHaveLength(1);
    const { state: afterPop } = run(afterStash, 'git stash pop');
    expect(afterPop.stash).toHaveLength(0);
  });

  it('push exige um remote configurado antes', () => {
    let s = createGitRepoState('vazio');
    s = run(s, 'git init').state;
    const { lines } = run(s, 'git push');
    expect(lines.some((l) => l.cls === 'tl-err')).toBe(true);
  });

  it('remote add + push marcam o remoteHead da branch atual', () => {
    let s = createGitRepoState('vazio');
    s = run(s, 'git init').state;
    s = run(s, 'git add .').state;
    s = run(s, 'git commit -m "c1"').state;
    s = run(s, 'git remote add origin https://github.com/exemplo/projeto.git').state;
    const { state } = run(s, 'git push');
    expect(state.remoteHeads.main).toBe(state.branches.main);
  });

  it('"clear" sinaliza para limpar o terminal sem linhas', () => {
    const s0 = createGitRepoState('vazio');
    const { lines, cleared } = run(s0, 'clear');
    expect(cleared).toBe(true);
    expect(lines).toHaveLength(0);
  });

  it('comando não-git dá erro amigável', () => {
    const s0 = createGitRepoState('vazio');
    const { lines } = run(s0, 'ls -la');
    expect(lines.some((l) => l.cls === 'tl-err')).toBe(true);
  });
});

describe('gitMissions', () => {
  it('as 6 missões completam a bifurcação, na ordem, quando os comandos certos são digitados', () => {
    let s = createGitRepoState('vazio');
    expect(gitMissions).toHaveLength(6);
    expect(gitMissions.map((m) => m.id)).toEqual(['m1', 'm2', 'm3', 'm4', 'm5', 'm6']);

    expect(gitMissions[0].check(s)).toBe(false);
    s = run(s, 'git init').state;
    expect(gitMissions[0].check(s)).toBe(true);

    expect(gitMissions[1].check(s)).toBe(false);
    s = run(s, 'git add .').state;
    s = run(s, 'git commit -m "primeiro commit"').state;
    expect(gitMissions[1].check(s)).toBe(true);

    expect(gitMissions[2].check(s)).toBe(false);
    s = run(s, 'git branch feature').state;
    s = run(s, 'git switch feature').state;
    expect(gitMissions[2].check(s)).toBe(true);

    expect(gitMissions[3].check(s)).toBe(false);
    s = run(s, 'git add .').state;
    s = run(s, 'git commit -m "mudanca na feature"').state;
    expect(gitMissions[3].check(s)).toBe(true);

    expect(gitMissions[4].check(s)).toBe(false);
    s = run(s, 'git switch main').state;
    s = run(s, 'git merge feature').state;
    expect(gitMissions[4].check(s)).toBe(true);

    expect(gitMissions[5].check(s)).toBe(false);
    s = run(s, 'git remote add origin https://github.com/exemplo/projeto.git').state;
    s = run(s, 'git push').state;
    expect(gitMissions[5].check(s)).toBe(true);
  });
});

describe('runGitScript', () => {
  it('roda um comando por linha, ignorando linhas vazias e comentários', () => {
    const { state, lines } = runGitScript('projeto', '# começo\ngit init\n\ngit add .\ngit commit -m "primeiro"');
    expect(state.initialized).toBe(true);
    expect(Object.keys(state.commits)).toHaveLength(1);
    expect(lines.filter((l) => l.cls === 'tl-cmd').map((l) => l.text)).toEqual(['git init', 'git add .', 'git commit -m "primeiro"']);
  });

  it('comando errado vira linha de erro, e o resto continua', () => {
    const { state, lines } = runGitScript('vazio', 'gti init\ngit init');
    expect(lines.some((l) => l.cls === 'tl-err')).toBe(true);
    expect(state.initialized).toBe(true);
  });
});
