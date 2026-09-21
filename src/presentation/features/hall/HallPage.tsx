import { useEffect, useState } from 'react';
import { getHallOfTravelers } from '@/application/usecases';
import type { HallOfTravelersEntry } from '@/application/ports';
import { BadgeMedal } from '@/presentation/design-system';
import { getBadgeById } from '@/content/badges/catalog';
import { useServices } from '@/presentation/app/ServicesContext';
import styles from './HallPage.module.css';

type LoadState = { status: 'loading' } | { status: 'error' } | { status: 'ok'; entries: HallOfTravelersEntry[] };

export function HallPage() {
  const { leaderboard } = useServices();
  const [state, setState] = useState<LoadState>({ status: 'loading' });

  useEffect(() => {
    let cancelled = false;
    getHallOfTravelers({ leaderboard })
      .then((entries) => {
        if (!cancelled) setState({ status: 'ok', entries });
      })
      .catch(() => {
        if (!cancelled) setState({ status: 'error' });
      });
    return () => {
      cancelled = true;
    };
  }, [leaderboard]);

  return (
    <article>
      <p className="eyebrow">Hall dos Viajantes</p>
      <h1>Hall dos Viajantes</h1>
      <p>
        Um mural público de quem já passou por aqui: nome (o mesmo que você escolheu no prólogo) e as insígnias
        conquistadas. Sem login, sem dados pessoais — só o apelido que você deu para o seu próprio viajante.
      </p>

      {state.status === 'loading' ? <p className={styles.status}>Carregando o Hall...</p> : null}

      {state.status === 'error' ? (
        <p className={styles.status}>
          Não foi possível carregar o Hall agora. Pode ser falta de internet, ou o projeto que guarda esses dados
          está descansando (ele acorda sozinho no próximo acesso). Tente de novo mais tarde.
        </p>
      ) : null}

      {state.status === 'ok' && state.entries.length === 0 ? (
        <p className={styles.status}>
          Ainda ninguém apareceu por aqui. Complete um salto ou vença um chefe de fase para ser o primeiro nome do
          Hall.
        </p>
      ) : null}

      {state.status === 'ok' && state.entries.length > 0 ? (
        <div className={styles.grid}>
          {state.entries.map((entry, i) => (
            <div key={`${entry.nome}-${i}`} className={styles.cardItem}>
              <h3>{entry.nome}</h3>
              {entry.insignias.length === 0 ? (
                <p className={styles.empty}>Ainda sem insígnias.</p>
              ) : (
                <div className={styles.badges}>
                  {entry.insignias.map((badgeId, j) => {
                    const badge = getBadgeById(badgeId);
                    return (
                      <div key={`${badgeId}-${j}`} className={styles.badge} title={badge?.name ?? badgeId}>
                        {badge ? (
                          <BadgeMedal badge={badge} earned size={48} showCaption={false} />
                        ) : (
                          <span>{badgeId}</span>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ))}
        </div>
      ) : null}
    </article>
  );
}
