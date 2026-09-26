import { Fragment, useEffect, useState } from 'react';
import { Link, useOutletContext } from 'react-router-dom';
import { claimLeagueSeal, getLeague, getLooksOf, openLeague, syncWeeklyXp, type LeagueView } from '@/application/usecases';
import { cosmetics } from '@/content/cosmetics';
import type { AvatarLook } from '@/domain/cosmetics';
import { LEAGUE_SEAL_TOP } from '@/domain/league';
import { Avatar } from '@/presentation/design-system';
import { useServices } from '@/presentation/app/ServicesContext';
import { ConvergenceCard, EventStrip } from '@/presentation/features/events';
import type { LayoutOutletContext } from '@/presentation/shell';
import styles from './LeaguePage.module.css';

/** Quantas linhas mostrar antes de pular direto para a do viajante. */
const VISIBLE_ROWS = 20;

function countdown(ms: number): string {
  const minutes = Math.floor(ms / 60_000);
  const d = Math.floor(minutes / 1440);
  const h = Math.floor((minutes % 1440) / 60);
  const m = minutes % 60;
  if (d > 0) return `${d}d ${h}h`;
  if (h > 0) return `${h}h ${m}min`;
  return `${Math.max(1, m)}min`;
}

/**
 * Liga dos Viajantes (Etapa 10): ranking do XP ganho na semana (segunda a domingo, horário
 * de São Paulo). Recomeça toda segunda, para quem chegou depois ter chance. Os três
 * primeiros ganham o selo da semana (cosmético). Sem rebaixamento nem punição.
 */
export function LeaguePage() {
  const { progressRepository, leaderboard, analytics } = useServices();
  const { summary, refreshSummary } = useOutletContext<LayoutOutletContext>();
  const [view, setView] = useState<LeagueView | null>(null);
  const [loadedAt, setLoadedAt] = useState(0);
  const [looks, setLooks] = useState<Record<string, AvatarLook>>({});
  const [seal, setSeal] = useState<{ rank: number } | null>(null);
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    let cancelled = false;
    openLeague({ analytics });
    const deps = { repository: progressRepository, leaderboard };
    syncWeeklyXp(deps);
    void getLeague(deps).then((v) => {
      if (cancelled) return;
      setView(v);
      setLoadedAt(Date.now());
      void getLooksOf({ leaderboard }, { uuids: v.entries.map((e) => e.uuid), catalog: cosmetics }).then((l) => {
        if (!cancelled) setLooks(l);
      });
    });
    // Sem checar `cancelled`: o selo é gravado uma vez só, então quem recebe a resposta
    // precisa mostrá-la (em desenvolvimento o StrictMode roda este efeito duas vezes).
    void claimLeagueSeal({ ...deps, analytics }).then((won) => {
      if (!won) return;
      setSeal({ rank: won.rank });
      refreshSummary();
    });
    const id = window.setInterval(() => setNow(Date.now()), 60_000);
    return () => {
      cancelled = true;
      window.clearInterval(id);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const resetIn = view ? Math.max(0, view.resetInMs - (now - loadedAt)) : null;
  const entries = view?.entries ?? [];
  const myIndex = view?.myRank ? view.myRank - 1 : -1;
  const shown = entries.slice(0, VISIBLE_ROWS);
  const meBelow = myIndex >= VISIBLE_ROWS ? entries[myIndex] : null;

  return (
    <article>
      <header className={styles.head}>
        <h1>Liga dos Viajantes</h1>
        {resetIn !== null ? (
          <span className={styles.reset} aria-label={`A Liga recomeça em ${countdown(resetIn)}`}>
            zera em {countdown(resetIn)}
          </span>
        ) : null}
      </header>
      <p className={styles.lead}>
        XP ganho de segunda a domingo. Toda segunda recomeça do zero, então quem chegou agora também tem chance.
      </p>

      <div className={styles.events}>
        <EventStrip />
        <ConvergenceCard onUnlocked={refreshSummary} />
      </div>

      {seal ? (
        <p className={styles.seal} role="status">
          Você ficou em {seal.rank}º na semana passada e ganhou o <b>Selo da semana</b>. Ele já está na sua{' '}
          <Link to="/configuracoes/loja">Loja do Viajante</Link>, pronto para equipar.
        </p>
      ) : null}

      {view === null ? (
        <p className={styles.muted}>Carregando o ranking…</p>
      ) : (
        <>
          {!view.online ? (
            <p className={styles.offline}>
              O ranking da turma está fora do ar agora. Seu XP da semana continua contando e aparece aqui quando voltar.
            </p>
          ) : null}
          {entries.length === 0 ? (
            <p className={styles.muted}>Ninguém pontuou nesta semana ainda. Uma pergunta certa já coloca você aqui.</p>
          ) : (
            <ol className={styles.list}>
              {shown.map((entry, i) => (
                <Fragment key={entry.uuid}>
                  <Row
                    rank={i + 1}
                    entry={entry}
                    me={entry.uuid === view.myUuid}
                    look={entry.uuid === view.myUuid ? summary.look : looks[entry.uuid]}
                    photoUrl={entry.uuid === view.myUuid ? summary.avatarUrl : entry.photoUrl}
                  />
                  {i === LEAGUE_SEAL_TOP - 1 && entries.length > LEAGUE_SEAL_TOP ? (
                    <li className={styles.cut} aria-hidden="true">
                      <span>top {LEAGUE_SEAL_TOP} ganham o selo da semana</span>
                    </li>
                  ) : null}
                </Fragment>
              ))}
              {meBelow ? (
                <>
                  <li className={styles.gap} aria-hidden="true">
                    ⋯
                  </li>
                  <Row rank={myIndex + 1} entry={meBelow} me look={summary.look} photoUrl={summary.avatarUrl} />
                </>
              ) : null}
            </ol>
          )}
          {entries.length > 0 && entries.length <= LEAGUE_SEAL_TOP ? (
            <p className={styles.muted}>Os {LEAGUE_SEAL_TOP} primeiros da semana ganham o selo da semana.</p>
          ) : null}
        </>
      )}

      <p className={styles.hall}>
        <Link to="/hall">Hall dos Viajantes: todos que já passaram por aqui ▸</Link>
      </p>
    </article>
  );
}

function Row({
  rank,
  entry,
  me,
  look,
  photoUrl,
}: {
  rank: number;
  entry: LeagueView['entries'][number];
  me: boolean;
  look?: AvatarLook;
  photoUrl: string | null;
}) {
  return (
    <li className={`${styles.row} ${me ? styles.me : ''}`} aria-current={me ? 'true' : undefined}>
      <span className={styles.rank}>{rank}</span>
      <Avatar name={entry.name} url={photoUrl} size={40} look={look} />
      <span className={styles.name}>
        {entry.name}
        {me ? <span className={styles.srOnly}> (você)</span> : null}
      </span>
      <span className={styles.days} title="Dias seguidos da Linha do Tempo">
        {entry.lineDays}d
      </span>
      <span className={styles.xp}>
        {entry.xp}
        <span className={styles.srOnly}> XP</span>
      </span>
    </li>
  );
}
