import { useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { completeGitMission, getOrCreateTravelerUuid, getTraveler, getTrailProgress } from '@/application/usecases';
import {
  applyGitCommand,
  createGitRepoState,
  gitMissions,
  initialLineFor,
  type GitOutputLine,
  type GitRepoKind,
  type GitRepoState,
} from '@/domain/lab';
import type { Trail } from '@/domain/trail';
import { Button, NotebookFrame } from '@/presentation/design-system';
import { useServices } from '@/presentation/app/ServicesContext';
import styles from './GitLabPage.module.css';

function firstCommandLine(sql: string): string {
  const line = sql
    .split('\n')
    .map((l) => l.trim())
    .find((l) => l && !l.startsWith('#') && !l.startsWith('--'));
  return line ?? '';
}

const LINE_CLASS: Record<GitOutputLine['cls'], keyof typeof styles> = {
  'tl-cmd': 'tlCmd',
  'tl-ok': 'tlOk',
  'tl-err': 'tlErr',
  'tl-info': 'tlInfo',
  'tl-log': 'tlLog',
  'tl-diffnew': 'tlDiffnew',
  'tl-diffmod': 'tlDiffmod',
};

function fileChip(name: string, file: { tracked: boolean; staged: boolean; modified: boolean }) {
  if (file.staged) return { label: `${name} · preparado`, className: styles.chipStaged };
  if (file.tracked && file.modified) return { label: `${name} · modificado`, className: styles.chipModified };
  if (!file.tracked) return { label: `${name} · novo`, className: styles.chipUntracked };
  return { label: `${name} · ok`, className: styles.chip };
}

/** Laboratório Git: terminal simulado, puramente síncrono (sem dynamic import nem wasm). */
export function GitLabPage({ trail }: { trail: Trail }) {
  const location = useLocation();
  const { progressRepository, analytics, leaderboard } = useServices();
  const outputRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const [kind, setKind] = useState<GitRepoKind>('vazio');
  const [gitState, setGitState] = useState<GitRepoState>(() => createGitRepoState('vazio'));
  const [lines, setLines] = useState<GitOutputLine[]>(() => [initialLineFor('vazio')]);
  const [input, setInput] = useState('');
  const [missionsCompleted, setMissionsCompleted] = useState<Record<string, boolean>>({});

  useEffect(() => {
    analytics.track('lab_opened');
    const { trailProgress } = getTrailProgress({ repository: progressRepository }, { trail });
    setMissionsCompleted(trailProgress?.missionsCompleted ?? {});
    const prefill = (location.state as { sql?: string } | null)?.sql;
    if (prefill) {
      const line = firstCommandLine(prefill);
      if (line) setInput(line);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [trail.id]);

  useEffect(() => {
    outputRef.current?.scrollTo({ top: outputRef.current.scrollHeight });
  }, [lines]);

  function checkMissions(nextState: GitRepoState) {
    let changed = false;
    const next = { ...missionsCompleted };
    for (let i = 0; i < gitMissions.length; i++) {
      const mission = gitMissions[i];
      if (next[mission.id]) continue;
      const previousDone = gitMissions.slice(0, i).every((m) => next[m.id]);
      if (previousDone && mission.check(nextState)) {
        next[mission.id] = true;
        changed = true;
        const uuid = getOrCreateTravelerUuid({ repository: progressRepository });
        const { name } = getTraveler({ repository: progressRepository });
        completeGitMission(
          { repository: progressRepository, analytics, leaderboard, trailId: trail.id, traveler: { uuid, name } },
          mission.id,
        );
        break; // uma missão avança por comando, como no protótipo original
      }
    }
    if (changed) setMissionsCompleted(next);
  }

  function runCommand(raw: string) {
    if (!raw.trim()) return;
    const result = applyGitCommand(gitState, raw);
    setGitState(result.state);
    if (result.cleared) setLines([]);
    else setLines((prev) => [...prev, ...result.lines]);
    checkMissions(result.state);
  }

  function switchScenario(nextKind: GitRepoKind) {
    setKind(nextKind);
    setGitState(createGitRepoState(nextKind));
    setLines([initialLineFor(nextKind)]);
  }

  function handleSubmit() {
    const value = input;
    setInput('');
    runCommand(value);
  }

  const doneCount = Object.keys(missionsCompleted).length;

  return (
    <article>
      <p className="eyebrow">Máquina do Tempo</p>
      <h1>Laboratório Git</h1>
      <p>
        Um terminal Git simulado, direto no navegador. Digite comandos de verdade, erre, corrija, e veja o
        repositório reagir em tempo real.
      </p>

      <div className={styles.bar}>
        <div className={styles.seg} role="group" aria-label="Cenário do laboratório">
          <button
            type="button"
            className={`${styles.segButton} ${kind === 'vazio' ? styles.segButtonOn : ''}`}
            onClick={() => switchScenario('vazio')}
          >
            Pasta vazia
          </button>
          <button
            type="button"
            className={`${styles.segButton} ${kind === 'projeto' ? styles.segButtonOn : ''}`}
            onClick={() => switchScenario('projeto')}
          >
            Projeto de exemplo
          </button>
        </div>
        <span className={styles.status}>Digite comandos git no terminal abaixo.</span>
      </div>

      <div className={styles.chips} aria-label="Arquivos do repositório">
        {Object.entries(gitState.files).map(([name, file]) => {
          const chip = fileChip(name, file);
          return (
            <span key={name} className={`${styles.chip} ${chip.className}`}>
              {chip.label}
            </span>
          );
        })}
        <span className={`${styles.chip} ${styles.chipBranch}`}>branch: {gitState.head}</span>
      </div>

      <NotebookFrame title="bash — bifurcação">
        <div className={styles.termOut} ref={outputRef} role="log" aria-live="polite">
          {lines.map((line, i) => (
            <div key={i} className={styles[LINE_CLASS[line.cls]]}>
              {line.cls === 'tl-cmd' ? <span className={styles.prompt}>$ </span> : null}
              {line.text}
            </div>
          ))}
        </div>
        <div className={styles.termInput}>
          <span className={styles.prompt}>$</span>
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            autoComplete="off"
            autoCapitalize="off"
            autoCorrect="off"
            spellCheck={false}
            placeholder="git init"
            aria-label="Comando git"
            className={styles.termInputField}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSubmit();
            }}
          />
        </div>
        <div className={styles.labActions}>
          <Button variant="alt" size="sm" onClick={handleSubmit}>
            Executar ▸
          </Button>
          <Button variant="ghost" size="sm" onClick={() => runCommand('clear')}>
            Limpar
          </Button>
        </div>
      </NotebookFrame>

      <h2>
        Missões da bifurcação <span className={styles.status}>{doneCount}/{gitMissions.length}</span>
      </h2>
      <p>Cada missão avança sozinha assim que você digitar o comando certo no terminal acima. Siga a ordem e use as dicas se travar.</p>
      <div className={styles.missionsGrid}>
        {gitMissions.map((mission, i) => {
          const done = !!missionsCompleted[mission.id];
          const isCurrent = !done && gitMissions.slice(0, i).every((m) => missionsCompleted[m.id]);
          return (
            <div
              key={mission.id}
              className={`${styles.missionCard} ${done ? styles.missionDone : ''} ${isCurrent ? styles.missionCurrent : ''}`}
            >
              <h3>
                {i + 1}. {mission.title}
                {done ? <span className={styles.okBadge}>concluída</span> : null}
              </h3>
              <p>{mission.brief}</p>
              <p className={styles.hint}>dica: {mission.hint}</p>
            </div>
          );
        })}
      </div>
    </article>
  );
}
