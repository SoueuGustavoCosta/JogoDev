import { useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { getArchive, openArchive } from '@/application/usecases';
import { cometCalendar } from '@/content/comets/calendar';
import { trailRegistry } from '@/content/registry';
import { SintaxeFace } from '@/presentation/design-system';
import { useServices } from '@/presentation/app/ServicesContext';
import styles from './ArchivePage.module.css';

const dateFmt = new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', timeZone: 'America/Sao_Paulo' });

/** Arquivo da AVT: os cometas que já passaram, para jogar depois (vale a insígnia comum). */
export function ArchivePage() {
  const { progressRepository, analytics } = useServices();
  const entries = useMemo(
    () => getArchive({ repository: progressRepository, analytics }, { calendar: cometCalendar, trails: trailRegistry }),
    [progressRepository, analytics],
  );

  useEffect(() => {
    openArchive({ analytics });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <article className={styles.page}>
      <p className="eyebrow">Autoridade de Variância Temporal</p>
      <h1>Arquivo da AVT</h1>
      <div className={styles.sintaxe}>
        <SintaxeFace size={40} />
        <p>
          Todo cometa que passa pela linha do tempo fica guardado aqui, Viajante. Perdeu algum? Dá para jogar agora. Quem
          venceu o chefe com o cometa no céu levou a <b>insígnia rara</b>; pelo Arquivo, vale a <b>insígnia comum</b>.
        </p>
      </div>

      {entries.length === 0 ? (
        <p className={styles.empty}>Nenhum cometa passou ainda. Fique de olho no céu do mapa.</p>
      ) : (
        <ul className={styles.list}>
          {entries.map(({ comet, done, total, badge }) => (
            <li key={comet.id} className={styles.item}>
              <div>
                <h2>Cometa {comet.name}</h2>
                <p className={styles.meta}>
                  Passou de {dateFmt.format(new Date(comet.from))} a {dateFmt.format(new Date(Date.parse(comet.to) - 1))} · {done}/
                  {total} trilhas
                </p>
                <p className={styles.badge}>
                  {badge === 'rare'
                    ? '★ Insígnia rara conquistada durante o cometa'
                    : badge === 'common'
                      ? '☆ Insígnia comum conquistada pelo Arquivo'
                      : 'Vença o chefe para ganhar a insígnia comum'}
                </p>
              </div>
              <Link to={`/trilhas/${comet.trailId}`} className={styles.play}>
                {done > 0 ? 'Continuar' : 'Jogar'} ▸
              </Link>
            </li>
          ))}
        </ul>
      )}
    </article>
  );
}
