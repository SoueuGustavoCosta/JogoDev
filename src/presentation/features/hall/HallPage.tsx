import { useEffect, useMemo, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { getHallOfTravelers } from '@/application/usecases';
import type { HallOfTravelersEntry } from '@/application/ports';
import { Avatar, BadgeMedal, Modal } from '@/presentation/design-system';
import { getBadgeById } from '@/content/badges/catalog';
import { trailRegistry } from '@/content/registry';
import { useServices } from '@/presentation/app/ServicesContext';
import type { LayoutOutletContext } from '@/presentation/shell';
import styles from './HallPage.module.css';

type LoadState = { status: 'loading' } | { status: 'error' } | { status: 'ok'; entries: HallOfTravelersEntry[] };

function trailTitle(trailId: string): string {
  return trailRegistry.find((t) => t.id === trailId)?.title ?? trailId;
}

function memberSince(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' });
  } catch {
    return iso;
  }
}

function BadgeGrid({ badgeIds }: { badgeIds: string[] }) {
  if (badgeIds.length === 0) return <p className={styles.empty}>Ainda sem insígnias.</p>;
  return (
    <div className={styles.badges}>
      {badgeIds.map((badgeId, i) => {
        const badge = getBadgeById(badgeId);
        return (
          <div key={`${badgeId}-${i}`} className={styles.badge} title={badge?.name ?? badgeId}>
            {badge ? <BadgeMedal badge={badge} earned size={48} showCaption={false} /> : <span>{badgeId}</span>}
          </div>
        );
      })}
    </div>
  );
}

export function HallPage() {
  const { leaderboard } = useServices();
  const { onlinePlayers } = useOutletContext<LayoutOutletContext>();
  const [state, setState] = useState<LoadState>({ status: 'loading' });
  const [selectedUuid, setSelectedUuid] = useState<string | null>(null);

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

  const onlineUuids = useMemo(() => new Set(onlinePlayers.map((p) => p.uuid)), [onlinePlayers]);

  const selected = state.status === 'ok' ? state.entries.find((e) => e.uuid === selectedUuid) : undefined;

  return (
    <article>
      <p className="eyebrow">Hall dos Viajantes</p>
      <h1>Hall dos Viajantes</h1>
      <p>
        Um mural público de quem já passou por aqui: nome (o mesmo que você escolheu no prólogo) e as insígnias
        conquistadas. Sem login, sem dados pessoais — só o apelido que você deu para o seu próprio viajante. Toque
        num viajante pra ver o perfil completo.
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
          {state.entries.map((entry, i) => {
            const online = onlineUuids.has(entry.uuid);
            return (
              <button
                key={`${entry.uuid}-${i}`}
                type="button"
                className={styles.cardItem}
                onClick={() => setSelectedUuid(entry.uuid)}
              >
                <div className={styles.cardHead}>
                  <Avatar name={entry.nome} url={entry.fotoUrl} size={40} online={online} />
                  <div className={styles.cardNames}>
                    <h3>{entry.nome}</h3>
                    <span className={styles.cardStatus}>{online ? 'Online agora' : 'Offline'}</span>
                  </div>
                </div>
                {entry.insignias.length === 0 ? (
                  <p className={styles.empty}>Ainda sem insígnias.</p>
                ) : (
                  <p className={styles.badgeCount}>
                    {entry.insignias.length} {entry.insignias.length === 1 ? 'insígnia' : 'insígnias'}
                  </p>
                )}
              </button>
            );
          })}
        </div>
      ) : null}

      {selected ? (
        <Modal title={selected.nome} onClose={() => setSelectedUuid(null)}>
          <div className={styles.detailHead}>
            <Avatar name={selected.nome} url={selected.fotoUrl} size={64} online={onlineUuids.has(selected.uuid)} />
            <div>
              <h2 className={styles.detailName}>{selected.nome}</h2>
              <p className={styles.detailMeta}>
                {onlineUuids.has(selected.uuid) ? 'Online agora' : 'Offline'} · viajante desde {memberSince(selected.criadoEm)}
              </p>
            </div>
          </div>

          {selected.bio ? <p className={styles.bio}>{selected.bio}</p> : null}

          <h3 className={styles.detailSection}>Insígnias</h3>
          <BadgeGrid badgeIds={selected.insignias} />

          <h3 className={styles.detailSection}>Caminhos percorridos</h3>
          {selected.trilhas.length === 0 ? (
            <p className={styles.empty}>Ainda não começou nenhuma trilha.</p>
          ) : (
            <ul className={styles.trailList}>
              {selected.trilhas.map((trailId) => (
                <li key={trailId} className={styles.trailChip}>
                  {trailTitle(trailId)}
                </li>
              ))}
            </ul>
          )}
        </Modal>
      ) : null}
    </article>
  );
}
