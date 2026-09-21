/**
 * Simulador de terminal Git: reducer puro (sem `window`/`localStorage`/I/O).
 * Migrado de ilha_git_github.html (objeto `G` + funções `do*`), mantendo o mesmo
 * comportamento e as mesmas mensagens em português.
 */

export type GitFileState = { tracked: boolean; staged: boolean; modified: boolean };

export type GitCommit = { id: string; msg: string; parents: string[] };

export type GitRepoKind = 'vazio' | 'projeto';

export type GitRepoState = {
  kind: GitRepoKind;
  initialized: boolean;
  files: Record<string, GitFileState>;
  commits: Record<string, GitCommit>;
  /** Nome do branch -> id do commit que ele aponta (ou null se ainda sem commit). */
  branches: Record<string, string | null>;
  head: string;
  remote: { url: string } | null;
  remoteHeads: Record<string, string>;
  stash: Record<string, GitFileState>[];
  visitedBranches: Record<string, boolean>;
};

export type GitOutputLineClass =
  | 'tl-cmd'
  | 'tl-ok'
  | 'tl-err'
  | 'tl-info'
  | 'tl-log'
  | 'tl-diffnew'
  | 'tl-diffmod';

export type GitOutputLine = { cls: GitOutputLineClass; text: string };

function freshFiles(kind: GitRepoKind): Record<string, GitFileState> {
  const mkFile = (): GitFileState => ({ tracked: false, staged: false, modified: true });
  return kind === 'projeto'
    ? { 'index.html': mkFile(), 'style.css': mkFile(), 'app.js': mkFile() }
    : { 'README.md': mkFile() };
}

/** Cria o estado inicial de um cenário do laboratório ("Pasta vazia" ou "Projeto de exemplo"). */
export function createGitRepoState(kind: GitRepoKind): GitRepoState {
  return {
    kind,
    initialized: false,
    files: freshFiles(kind),
    commits: {},
    branches: {},
    head: 'main',
    remote: null,
    remoteHeads: {},
    stash: [],
    visitedBranches: {},
  };
}

/** Linha inicial mostrada ao abrir (ou trocar) o cenário, como no protótipo original. */
export function initialLineFor(kind: GitRepoKind): GitOutputLine {
  return {
    cls: 'tl-info',
    text:
      kind === 'projeto'
        ? 'Pasta "meu-projeto" carregada com index.html, style.css e app.js (ainda sem Git).'
        : 'Pasta vazia carregada. Comece do zero com git init.',
  };
}

function hashId(): string {
  return Math.random().toString(16).slice(2, 9);
}

function cloneState(state: GitRepoState): GitRepoState {
  return {
    ...state,
    files: Object.fromEntries(Object.entries(state.files).map(([n, f]) => [n, { ...f }])),
    commits: Object.fromEntries(Object.entries(state.commits).map(([id, c]) => [id, { ...c, parents: [...c.parents] }])),
    branches: { ...state.branches },
    remote: state.remote ? { ...state.remote } : null,
    remoteHeads: { ...state.remoteHeads },
    stash: state.stash.map((snap) => Object.fromEntries(Object.entries(snap).map(([n, f]) => [n, { ...f }]))),
    visitedBranches: { ...state.visitedBranches },
  };
}

function tokenize(raw: string): string[] {
  const re = /"([^"]*)"|'([^']*)'|(\S+)/g;
  const out: string[] = [];
  let m: RegExpExecArray | null;
  while ((m = re.exec(raw))) {
    out.push(m[1] !== undefined ? m[1] : m[2] !== undefined ? m[2] : (m[3] as string));
  }
  return out;
}

/** Contexto interno mutável usado só durante a execução de um comando. */
type Ctx = { state: GitRepoState; lines: GitOutputLine[] };

function print(ctx: Ctx, cls: GitOutputLineClass, text: string) {
  ctx.lines.push({ cls, text });
}
const printOk = (ctx: Ctx, t: string) => print(ctx, 'tl-ok', t);
const printErr = (ctx: Ctx, t: string) => print(ctx, 'tl-err', t);
const printInfo = (ctx: Ctx, t: string) => print(ctx, 'tl-info', t);

function needRepo(ctx: Ctx): boolean {
  if (!ctx.state.initialized) {
    printErr(ctx, 'fatal: not a git repository (or any of the parent directories): .git');
    return true;
  }
  return false;
}

function doInit(ctx: Ctx) {
  if (ctx.state.initialized) {
    printInfo(ctx, 'Reinitialized existing Git repository.');
    return;
  }
  ctx.state.initialized = true;
  ctx.state.branches = { main: null };
  ctx.state.head = 'main';
  printOk(ctx, 'Repositório Git inicializado (pasta .git criada).');
}

function doClone(ctx: Ctx, url: string | undefined) {
  if (ctx.state.initialized) {
    printErr(ctx, 'fatal: já existe um repositório aqui; git clone deve ser usado numa pasta nova.');
    return;
  }
  if (!url) {
    printErr(ctx, 'uso: git clone <url>');
    return;
  }
  ctx.state.initialized = true;
  const id = hashId();
  ctx.state.commits[id] = { id, msg: 'Commit inicial', parents: [] };
  ctx.state.branches = { main: id };
  ctx.state.head = 'main';
  ctx.state.remote = { url };
  ctx.state.remoteHeads = { main: id };
  Object.values(ctx.state.files).forEach((f) => {
    f.tracked = true;
    f.modified = false;
    f.staged = false;
  });
  printOk(ctx, `Clonando de ${url}... concluído. HEAD em main.`);
}

function doStatus(ctx: Ctx) {
  if (needRepo(ctx)) return;
  printInfo(ctx, `Na branch ${ctx.state.head}`);
  const staged = Object.keys(ctx.state.files).filter((n) => ctx.state.files[n].staged);
  const modified = Object.keys(ctx.state.files).filter(
    (n) => ctx.state.files[n].tracked && ctx.state.files[n].modified && !ctx.state.files[n].staged,
  );
  const untracked = Object.keys(ctx.state.files).filter((n) => !ctx.state.files[n].tracked && !ctx.state.files[n].staged);
  if (staged.length) print(ctx, 'tl-ok', 'Mudanças a serem commitadas: ' + staged.join(', '));
  if (modified.length) print(ctx, 'tl-err', 'Mudanças não preparadas: ' + modified.join(', '));
  if (untracked.length) print(ctx, 'tl-info', 'Arquivos não rastreados: ' + untracked.join(', '));
  if (!staged.length && !modified.length && !untracked.length) printInfo(ctx, 'Nada para commitar, diretório de trabalho limpo.');
}

function doAdd(ctx: Ctx, args: string[]) {
  if (needRepo(ctx)) return;
  if (!args.length) {
    printErr(ctx, 'uso: git add <arquivo> (ou .)');
    return;
  }
  if (args[0] === '.') {
    Object.values(ctx.state.files).forEach((f) => {
      if (!f.tracked || f.modified) f.staged = true;
    });
    printOk(ctx, 'Todas as mudanças foram adicionadas à staging area.');
  } else {
    let any = false;
    args.forEach((a) => {
      if (ctx.state.files[a]) {
        ctx.state.files[a].staged = true;
        any = true;
      }
    });
    if (any) printOk(ctx, 'Arquivo(s) adicionado(s) à staging area.');
    else printErr(ctx, 'pathspec não encontrado no diretório de trabalho.');
  }
}

function doCommit(ctx: Ctx, tokens: string[]) {
  if (needRepo(ctx)) return;
  const mIdx = tokens.indexOf('-m');
  if (mIdx === -1 || !tokens[mIdx + 1]) {
    printErr(ctx, 'uso: git commit -m "mensagem"');
    return;
  }
  const msg = tokens[mIdx + 1];
  const staged = Object.entries(ctx.state.files).filter(([, f]) => f.staged);
  if (!staged.length) {
    printErr(ctx, 'nada adicionado à staging area (use "git add" primeiro).');
    return;
  }
  const id = hashId();
  const parent = ctx.state.branches[ctx.state.head];
  ctx.state.commits[id] = { id, msg, parents: parent ? [parent] : [] };
  ctx.state.branches[ctx.state.head] = id;
  staged.forEach(([, f]) => {
    f.tracked = true;
    f.staged = false;
    f.modified = false;
  });
  printOk(ctx, `[${ctx.state.head} ${id}] ${msg}`);
}

function doLog(ctx: Ctx) {
  if (needRepo(ctx)) return;
  const id = ctx.state.branches[ctx.state.head];
  if (!id) {
    printInfo(ctx, 'Nenhum commit ainda nesta branch.');
    return;
  }
  const visited = new Set<string>();
  const out: GitCommit[] = [];
  const walk = (cid: string | null | undefined) => {
    if (!cid || visited.has(cid)) return;
    visited.add(cid);
    const c = ctx.state.commits[cid];
    if (!c) return;
    out.push(c);
    c.parents.forEach(walk);
  };
  walk(id);
  out.forEach((c) => print(ctx, 'tl-log', `commit ${c.id}  ${c.msg}`));
}

function doBranch(ctx: Ctx, args: string[]) {
  if (needRepo(ctx)) return;
  if (!args.length) {
    Object.keys(ctx.state.branches).forEach((b) => print(ctx, 'tl-log', (b === ctx.state.head ? '* ' : '  ') + b));
    return;
  }
  const name = args[0];
  if (ctx.state.branches[name]) {
    printErr(ctx, `a branch '${name}' já existe.`);
    return;
  }
  ctx.state.branches[name] = ctx.state.branches[ctx.state.head];
  printOk(ctx, `Branch '${name}' criada.`);
}

function enterBranch(ctx: Ctx, name: string) {
  ctx.state.head = name;
  if (name !== 'main' && !ctx.state.visitedBranches[name]) {
    ctx.state.visitedBranches[name] = true;
    const firstFileName = Object.keys(ctx.state.files)[0];
    const f = firstFileName ? ctx.state.files[firstFileName] : undefined;
    if (f) f.modified = true;
    if (firstFileName) {
      printInfo(ctx, '(uma mudança te espera em ' + firstFileName + ' — rode git status para ver)');
    }
  }
}

function doSwitch(ctx: Ctx, name: string | undefined) {
  if (needRepo(ctx)) return;
  if (!name) {
    printErr(ctx, 'uso: git switch <branch>');
    return;
  }
  if (!ctx.state.branches[name]) {
    printErr(ctx, `a branch '${name}' não existe (crie antes com git branch ${name}).`);
    return;
  }
  enterBranch(ctx, name);
  printOk(ctx, `Trocado para a branch '${name}'.`);
}

function doCheckout(ctx: Ctx, args: string[]) {
  if (needRepo(ctx)) return;
  if (args[0] === '-b') {
    const name = args[1];
    if (!name) {
      printErr(ctx, 'uso: git checkout -b <branch>');
      return;
    }
    if (ctx.state.branches[name]) {
      printErr(ctx, `a branch '${name}' já existe.`);
      return;
    }
    ctx.state.branches[name] = ctx.state.branches[ctx.state.head];
    enterBranch(ctx, name);
    printOk(ctx, `Branch '${name}' criada e ativa.`);
    return;
  }
  doSwitch(ctx, args[0]);
}

function doMerge(ctx: Ctx, name: string | undefined) {
  if (needRepo(ctx)) return;
  if (!name) {
    printErr(ctx, 'uso: git merge <branch>');
    return;
  }
  if (!ctx.state.branches[name]) {
    printErr(ctx, `a branch '${name}' não existe.`);
    return;
  }
  if (name === ctx.state.head) {
    printErr(ctx, 'não é possível fundir uma branch nela mesma.');
    return;
  }
  const targetId = ctx.state.branches[name];
  const curId = ctx.state.branches[ctx.state.head];
  if (!curId) {
    ctx.state.branches[ctx.state.head] = targetId;
    printOk(ctx, `Fast-forward: '${ctx.state.head}' agora aponta para o mesmo ponto que '${name}'.`);
    return;
  }
  const id = hashId();
  ctx.state.commits[id] = {
    id,
    msg: `Merge branch '${name}' em '${ctx.state.head}'`,
    parents: targetId ? [curId, targetId] : [curId],
  };
  ctx.state.branches[ctx.state.head] = id;
  printOk(ctx, `Merge realizado com sucesso: '${name}' → '${ctx.state.head}'.`);
}

function doDiff(ctx: Ctx) {
  if (needRepo(ctx)) return;
  const changed = Object.entries(ctx.state.files).filter(([, f]) => f.modified || !f.tracked);
  if (!changed.length) {
    printInfo(ctx, 'Nenhuma diferença: diretório de trabalho limpo.');
    return;
  }
  changed.forEach(([n, f]) => {
    print(ctx, 'tl-log', `diff --git a/${n} b/${n}`);
    print(ctx, f.tracked ? 'tl-diffmod' : 'tl-diffnew', f.tracked ? `~ ${n} modificado` : `+ ${n} (novo arquivo)`);
  });
}

function doStash(ctx: Ctx, sub: string | undefined) {
  if (needRepo(ctx)) return;
  if (sub === 'pop') {
    const snap = ctx.state.stash.pop();
    if (!snap) {
      printErr(ctx, 'nenhum stash salvo.');
      return;
    }
    ctx.state.files = snap;
    printOk(ctx, 'Mudanças restauradas do stash.');
    return;
  }
  const hasChanges = Object.values(ctx.state.files).some((f) => f.modified || f.staged || !f.tracked);
  if (!hasChanges) {
    printInfo(ctx, 'nada para guardar no stash.');
    return;
  }
  ctx.state.stash.push(JSON.parse(JSON.stringify(ctx.state.files)));
  Object.values(ctx.state.files).forEach((f) => {
    if (f.tracked) {
      f.modified = false;
      f.staged = false;
    }
  });
  printOk(ctx, 'Mudanças guardadas no stash (use git stash pop para recuperar).');
}

function doReset(ctx: Ctx) {
  if (needRepo(ctx)) return;
  printInfo(ctx, 'Nesta simulação, prefira git revert: ele desfaz sem reescrever o histórico compartilhado.');
}

function doRevert(ctx: Ctx, target: string | undefined) {
  if (needRepo(ctx)) return;
  if (!target) {
    printErr(ctx, 'uso: git revert <commit>');
    return;
  }
  const id = hashId();
  const parent = ctx.state.branches[ctx.state.head];
  ctx.state.commits[id] = { id, msg: `Revert: desfaz ${target}`, parents: parent ? [parent] : [] };
  ctx.state.branches[ctx.state.head] = id;
  printOk(ctx, `[${ctx.state.head} ${id}] Revert: desfaz ${target}`);
}

function doRemote(ctx: Ctx, args: string[]) {
  if (needRepo(ctx)) return;
  if (args[0] === 'add') {
    const url = args[2];
    if (!url) {
      printErr(ctx, 'uso: git remote add origin <url>');
      return;
    }
    ctx.state.remote = { url };
    printOk(ctx, `Remote 'origin' adicionado: ${url}`);
    return;
  }
  if (!args.length) {
    if (ctx.state.remote) print(ctx, 'tl-log', 'origin  ' + ctx.state.remote.url);
    return;
  }
  printErr(ctx, 'subcomando de remote não reconhecido nesta simulação.');
}

function doPush(ctx: Ctx) {
  if (needRepo(ctx)) return;
  if (!ctx.state.remote) {
    printErr(ctx, 'fatal: nenhum repositório remoto configurado (use git remote add origin <url>).');
    return;
  }
  const commitId = ctx.state.branches[ctx.state.head];
  if (commitId) ctx.state.remoteHeads[ctx.state.head] = commitId;
  printOk(ctx, `Enviado para ${ctx.state.remote.url} (branch '${ctx.state.head}').`);
}

function doPull(ctx: Ctx) {
  if (needRepo(ctx)) return;
  if (!ctx.state.remote) {
    printErr(ctx, 'fatal: nenhum repositório remoto configurado.');
    return;
  }
  const remoteId = ctx.state.remoteHeads[ctx.state.head];
  if (!remoteId || remoteId === ctx.state.branches[ctx.state.head]) {
    printInfo(ctx, 'Already up to date.');
    return;
  }
  ctx.state.branches[ctx.state.head] = remoteId;
  printOk(ctx, 'Atualizações trazidas do remoto.');
}

function doFetch(ctx: Ctx) {
  if (needRepo(ctx)) return;
  printInfo(ctx, 'Fetch simulado: referências do remoto atualizadas (use git pull para aplicar).');
}

/**
 * Aplica um comando de texto (ex.: "git status") a um `GitRepoState` e devolve o
 * novo estado (o `state` recebido não é alterado) junto das linhas produzidas no terminal.
 */
export function applyGitCommand(
  state: GitRepoState,
  raw: string,
): { state: GitRepoState; lines: GitOutputLine[]; cleared?: boolean } {
  const ctx: Ctx = { state: cloneState(state), lines: [] };
  if (!raw.trim()) return { state: ctx.state, lines: ctx.lines };

  if (raw.trim() === 'clear') {
    return { state: ctx.state, lines: [], cleared: true };
  }

  print(ctx, 'tl-cmd', raw);

  const tokens = tokenize(raw);
  if (tokens[0] !== 'git') {
    printErr(ctx, `comando não encontrado: ${tokens[0] || ''} (dica: comandos começam com "git")`);
    return { state: ctx.state, lines: ctx.lines };
  }

  const sub = tokens[1];
  switch (sub) {
    case 'init':
      doInit(ctx);
      break;
    case 'clone':
      doClone(ctx, tokens[2]);
      break;
    case 'status':
      doStatus(ctx);
      break;
    case 'add':
      doAdd(ctx, tokens.slice(2));
      break;
    case 'commit':
      doCommit(ctx, tokens);
      break;
    case 'log':
      doLog(ctx);
      break;
    case 'branch':
      doBranch(ctx, tokens.slice(2));
      break;
    case 'switch':
      doSwitch(ctx, tokens[2]);
      break;
    case 'checkout':
      doCheckout(ctx, tokens.slice(2));
      break;
    case 'merge':
      doMerge(ctx, tokens[2]);
      break;
    case 'diff':
      doDiff(ctx);
      break;
    case 'restore':
      printInfo(ctx, 'Simulação: arquivo restaurado ao último commit.');
      break;
    case 'reset':
      doReset(ctx);
      break;
    case 'revert':
      doRevert(ctx, tokens[2]);
      break;
    case 'stash':
      doStash(ctx, tokens[2]);
      break;
    case 'remote':
      doRemote(ctx, tokens.slice(2));
      break;
    case 'push':
      doPush(ctx);
      break;
    case 'pull':
      doPull(ctx);
      break;
    case 'fetch':
      doFetch(ctx);
      break;
    case undefined:
      printInfo(ctx, 'uso: git <comando> [opções]');
      break;
    default:
      printErr(ctx, `git: '${sub}' não é um comando git.`);
  }

  return { state: ctx.state, lines: ctx.lines };
}
