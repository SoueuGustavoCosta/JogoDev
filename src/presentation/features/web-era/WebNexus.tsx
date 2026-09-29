import { useMemo, useState } from 'react';
import { markNexusPlayed, type NexusBranchView } from '@/application/usecases';
import { WEB_NEXUS_KEY, type WebBranch } from '@/domain/webEra';
import { webBranches, webEraCopy } from '@/content/webEra';
import { Modal } from '@/presentation/design-system';
import { useServices } from '@/presentation/app/ServicesContext';
import { NexusScene } from '@/presentation/features/nexus';
import { SintaxeTalk } from './SintaxeTalk';
import styles from './WebEra.module.css';

/** Os três portais da cena (esquerda → direita); Next.js é ramo do React e Node.js fica de fora. */
const SCENE_IDS = ['react', 'vue', 'angular'];

/**
 * Ramificações da Era da Web: o mesmo Evento Nexus das outras luas (cena, regra de tocar uma
 * vez, `nexusSeen`), com React, Vue e Angular nos portais, Next.js como ramo do React e
 * Node.js bloqueado, porta da futura Era do Back-end.
 */
export function WebNexus({ open, playOnMount }: { open: boolean; playOnMount: boolean }) {
  const { progressRepository, analytics } = useServices();
  const [selected, setSelected] = useState<WebBranch | null>(null);
  // Lido uma vez: marcar a cena como vista não pode interromper a animação desta visita.
  const [play] = useState(playOnMount);
  const onPlayed = useMemo(
    () => () => markNexusPlayed({ repository: progressRepository, analytics }, { island: WEB_NEXUS_KEY }),
    [progressRepository, analytics],
  );

  const sceneBranches: NexusBranchView[] = SCENE_IDS.map((id) => {
    const b = webBranches.find((x) => x.id === id)!;
    // "exists" deixa o portal tocável; o toque abre a Sintaxe com as trilhas planejadas.
    return { trailId: b.id, name: b.name, color: b.color, exists: true, done: 0, total: b.trails.length };
  });

  return (
    <section id="ramificacoes" aria-label="Ramificações da Era da Web">
      <NexusScene
        islandName="Web"
        islandColor="var(--web-css)"
        bossName="os chefes das três luas"
        state={open ? 'open' : 'locked'}
        branches={sceneBranches}
        play={open && play}
        onPlayed={onPlayed}
        onEnter={(id) => setSelected(webBranches.find((b) => b.id === id) ?? null)}
        branchCaption={() => 'em construção'}
      />
      <div className={styles.branches}>
        {/* React, Vue e Angular já estão nos portais da cena; aqui ficam o ramo do React e a porta do Back-end. */}
        {webBranches.filter((b) => !SCENE_IDS.includes(b.id)).map((b) => {
          const locked = !open || Boolean(b.future);
          return (
            <button
              key={b.id}
              type="button"
              className={`${styles.branch} ${locked ? styles.lock : ''}`}
              style={{ ['--c' as string]: b.color }}
              onClick={() => setSelected(b)}
            >
              <span className={styles.portal}>
                <span className={styles.branchName}>{b.name.slice(0, 5)}</span>
              </span>
              <b>{b.name}</b>
              <small>
                {b.since}
                {b.parent ? ' · ramo do React' : ''}
                {b.future ? ' · Era do Back-end' : ''}
                {locked ? ' · 🔒' : ''}
              </small>
            </button>
          );
        })}
      </div>
      {selected ? <BranchSheet branch={selected} open={open} onClose={() => setSelected(null)} /> : null}
    </section>
  );
}

function BranchSheet({ branch, open, onClose }: { branch: WebBranch; open: boolean; onClose: () => void }) {
  const available = open && !branch.future;
  const line = branch.future ? webEraCopy.branchFuture : available ? webEraCopy.branchOpen(branch.name) : webEraCopy.branchLocked;
  return (
    <Modal title={branch.name} onClose={onClose}>
      <div className={styles.sheet}>
        <h2 style={{ color: branch.color }}>{branch.name}</h2>
        <SintaxeTalk lines={[line]} size={48} />
        <ol className={styles.planned}>
          {branch.trails.map((t) => (
            <li key={t}>{t}</li>
          ))}
          <li className={styles.bossItem}>Chefe da ramificação</li>
        </ol>
        <p className={styles.docl}>
          fonte:{' '}
          <a href={branch.doc} target="_blank" rel="noopener noreferrer">
            {branch.doc.replace('https://', '')}
          </a>{' '}
          · {branch.since}
        </p>
        <p className={styles.docl}>{branch.future ? 'Bloqueado: chega com a Era do Back-end.' : available ? 'Em construção: chega numa próxima atualização.' : 'Bloqueado'}</p>
      </div>
    </Modal>
  );
}
