import { useEffect, useState } from 'react';
import { loadMural, publishToMural, toggleStar, type MuralView, type PublishResult } from '@/application/usecases';
import type { Workshop, WorkshopLang } from '@/domain/workshop';
import { Avatar, Modal } from '@/presentation/design-system';
import { useServices } from '@/presentation/app/ServicesContext';
import styles from './Workshop.module.css';

const LANG_LABEL: Record<string, string> = { php: 'PHP', js: 'JS', python: 'Python' };

const PUBLISH_ERROR: Record<Exclude<PublishResult, { ok: true }>['reason'], string> = {
  'not-solved': 'Resolva a oficina antes de publicar.',
  'no-identity': 'Para publicar, entre de novo na sua conta (aba Viajante).',
  empty: 'Não tem código para publicar.',
  'too-long': 'O código passou do limite de tamanho do mural.',
  profanity: 'O código tem uma palavra que o mural não aceita. Troque e tente de novo.',
  offline: 'O mural está fora do ar agora. Tente mais tarde.',
};

/**
 * Mural da turma (Etapa 13B): soluções que outros viajantes escolheram publicar, com
 * estrelas. Só abre depois de resolver a oficina. Publicar é sempre escolha da pessoa.
 */
export function MuralSection({ workshop, publish }: { workshop: Workshop; publish?: { lang: WorkshopLang; code: string } }) {
  const { progressRepository, leaderboard, analytics } = useServices();
  const [view, setView] = useState<MuralView | null>(null);
  const [open, setOpen] = useState<string | null>(null);
  const [confirming, setConfirming] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [published, setPublished] = useState(false);

  function refresh() {
    void loadMural({ repository: progressRepository, leaderboard }, { workshop }).then(setView);
  }

  useEffect(refresh, [workshop.id]); // eslint-disable-line react-hooks/exhaustive-deps

  async function doPublish() {
    if (!publish) return;
    setConfirming(false);
    const r = await publishToMural({ repository: progressRepository, leaderboard, analytics }, { workshop, ...publish });
    if (r.ok) {
      setPublished(true);
      setMessage('Publicado! Sua solução está no mural.');
      refresh();
    } else {
      setMessage(PUBLISH_ERROR[r.reason]);
    }
  }

  async function star(id: string, on: boolean) {
    if (view?.status !== 'ok') return;
    const entry = view.entries.find((e) => e.id === id);
    if (!entry) return;
    // Otimista: atualiza já e desfaz se não der certo.
    const flip = (value: boolean) =>
      setView((v) =>
        v?.status === 'ok'
          ? { ...v, entries: v.entries.map((e) => (e.id === id ? { ...e, starredByMe: value, stars: e.stars + (value ? 1 : -1) } : e)) }
          : v,
      );
    flip(on);
    const ok = await toggleStar({ repository: progressRepository, leaderboard, analytics }, { entry, on });
    if (!ok) flip(!on);
  }

  if (view?.status === 'locked') return null;

  return (
    <section className={styles.mural} aria-labelledby="mural-titulo">
      <div className={styles.solutionHead}>
        <h2 id="mural-titulo">Mural da turma</h2>
        <span>{view?.status === 'ok' ? `${view.entries.length} ${view.entries.length === 1 ? 'solução' : 'soluções'}` : ''}</span>
      </div>
      {view === null ? <p className={styles.muted}>Carregando…</p> : null}
      {view?.status === 'offline' ? <p className={styles.muted}>O mural está fora do ar agora.</p> : null}
      {view?.status === 'ok' && view.entries.length === 0 ? <p className={styles.muted}>Ninguém publicou ainda. Seja a primeira pessoa!</p> : null}
      {view?.status === 'ok' ? (
        <ul className={styles.muralList}>
          {view.entries.map((e) => {
            const mine = e.uuid === view.myUuid;
            return (
              <li key={e.id}>
                <div className={styles.muralRow}>
                  <Avatar name={e.nome} url={e.fotoUrl} size={36} />
                  <button type="button" className={styles.muralWho} aria-expanded={open === e.id} onClick={() => setOpen(open === e.id ? null : e.id)}>
                    {mine ? 'Você' : e.nome} resolveu em <b>{LANG_LABEL[e.lang] ?? e.lang}</b>
                  </button>
                  <button
                    type="button"
                    className={`${styles.star} ${e.starredByMe ? styles.starOn : ''}`}
                    disabled={mine}
                    aria-pressed={e.starredByMe}
                    aria-label={mine ? `${e.stars} estrelas na sua solução` : e.starredByMe ? 'Tirar estrela' : 'Dar estrela'}
                    onClick={() => void star(e.id, !e.starredByMe)}
                  >
                    ★ {e.stars}
                  </button>
                </div>
                {open === e.id ? <pre className={styles.muralCode}>{e.code}</pre> : null}
              </li>
            );
          })}
        </ul>
      ) : null}
      {message ? (
        <p className={styles.muted} role="status">
          {message}
        </p>
      ) : null}
      {publish && !published && view?.status === 'ok' ? (
        <button type="button" className={styles.secondary} onClick={() => setConfirming(true)}>
          Publicar no mural
        </button>
      ) : null}
      {confirming ? (
        <Modal title="Publicar no mural" onClose={() => setConfirming(false)}>
          <h2 className={styles.label}>Publicar no mural?</h2>
          <p className={styles.lead}>Seu nome, sua foto e este código ficam visíveis para a turma no mural desta oficina.</p>
          <pre className={styles.muralCode}>{publish?.code.trim()}</pre>
          <div className={styles.endActions}>
            <button type="button" className={styles.primary} onClick={() => void doPublish()}>
              Publicar
            </button>
            <button type="button" className={styles.secondary} onClick={() => setConfirming(false)}>
              Agora não
            </button>
          </div>
        </Modal>
      ) : null}
    </section>
  );
}
