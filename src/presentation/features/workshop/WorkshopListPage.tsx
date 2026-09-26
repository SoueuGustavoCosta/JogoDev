import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { listWorkshops } from '@/application/usecases';
import { workshops } from '@/content/workshops';
import { SintaxeFace } from '@/presentation/design-system';
import { useServices } from '@/presentation/app/ServicesContext';
import styles from './Workshop.module.css';

/** Oficina do Viajante: a lista de mini projetos livres (Etapa 13). */
export function WorkshopListPage() {
  const { progressRepository, analytics } = useServices();
  const cards = listWorkshops({ repository: progressRepository }, { catalog: workshops });

  useEffect(() => {
    analytics.track('page_view');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <article className={styles.root}>
      <p className="eyebrow">Oficina do Viajante</p>
      <h1>Oficina do Viajante</h1>
      <div className={styles.sintaxe}>
        <SintaxeFace size={40} />
        <p>Aqui não tem resposta única: escolha a linguagem e resolva do seu jeito. Eu só confiro se o resultado bate.</p>
      </div>
      <ul className={styles.list}>
        {cards.map(({ workshop, solved }) => (
          <li key={workshop.id}>
            <Link to={`/oficina/${workshop.id}`} className={styles.card}>
              <span className={styles.cardText}>
                <b>{workshop.title}</b>
                <span>{workshop.prompt}</span>
              </span>
              <span className={solved ? styles.cardDone : styles.cardXp}>{solved ? `✓ ${solved.xp} XP` : '+50 XP'}</span>
            </Link>
          </li>
        ))}
      </ul>
    </article>
  );
}

/** As oficinas de uma ilha, depois do módulo relacionado (na tela da ilha). */
export function TrailWorkshops({ trailId }: { trailId: string }) {
  const { progressRepository } = useServices();
  const progress = progressRepository.load();
  const open = workshops.filter(
    (w) => w.after?.trailId === trailId && progress?.trails[trailId]?.modules[w.after.moduleId]?.completed,
  );
  if (open.length === 0) return null;
  const done = progress?.workshops ?? {};
  return (
    <section className={styles.trailBox} aria-labelledby="oficinas-da-era">
      <h2 id="oficinas-da-era">Oficina desta era</h2>
      <p>Mini projetos para resolver do seu jeito, na linguagem que quiser.</p>
      <ul>
        {open.map((w) => (
          <li key={w.id}>
            <Link to={`/oficina/${w.id}`}>
              {done[w.id] ? '✓ ' : ''}
              {w.title} ▸
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
