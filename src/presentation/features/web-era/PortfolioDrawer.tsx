import { useEffect, useMemo, useState } from 'react';
import { copyWebPortfolioFile, getWebEra, openWebPortfolio } from '@/application/usecases';
import { buildPortfolio, isWebStageDone, portfolioHost, unlockedPieces } from '@/domain/webEra';
import { webEraCopy, webEraTrails } from '@/content/webEra';
import { Modal } from '@/presentation/design-system';
import { useServices } from '@/presentation/app/ServicesContext';
import stage from './Stage.module.css';
import styles from './WebEra.module.css';

type FileKey = 'html' | 'css' | 'js';
const FILE_NAME: Record<FileKey, string> = { html: 'index.html', css: 'style.css', js: 'script.js' };

/**
 * Gaveta "Seu portfólio": prévia num navegador de mentira, as peças já liberadas e os botões
 * para copiar index.html, style.css e script.js, com a dica de publicar grátis.
 */
export function PortfolioDrawer({ onClose }: { onClose: () => void }) {
  const { progressRepository, analytics, clipboard } = useServices();
  const { web, travelerName } = getWebEra({ repository: progressRepository });
  const built = useMemo(
    () => buildPortfolio({ pieces: unlockedPieces(webEraTrails, web), portfolio: web.portfolio, travelerName, year: new Date().getFullYear() }),
    [web, travelerName],
  );
  const [shown, setShown] = useState<FileKey>('html');
  const [status, setStatus] = useState('');

  useEffect(() => {
    openWebPortfolio({ analytics });
  }, [analytics]);

  const copy = async (file: FileKey) => {
    setShown(file);
    const ok = await copyWebPortfolioFile({ clipboard, analytics }, { file, text: built[file] });
    setStatus(ok ? `${FILE_NAME[file]} copiado!` : 'Não deu para copiar: selecione o código abaixo e copie.');
  };

  return (
    <Modal title="Seu portfólio" onClose={onClose}>
      <div className={styles.sheet}>
        <h2>Seu portfólio</h2>
        <div className={styles.pieces} aria-label="Peças do portfólio">
          {webEraTrails.map((t) => {
            const on = isWebStageDone(web, t.id);
            return (
              <span key={t.id} className={`${styles.piece} ${on ? styles.pieceOn : ''}`}>
                {on ? '✓' : '·'} {t.pieceName}
              </span>
            );
          })}
        </div>
        <div className={styles.browser}>
          <div className={styles.bar}>
            <i />
            <i />
            <i />
            <span>{portfolioHost(web.portfolio?.name || travelerName)}</span>
          </div>
          {/* Só HTML e CSS do próprio viajante, gerados e escapados pelo jogo; o script é o do portfólio. */}
          <iframe title="Prévia do portfólio" sandbox="allow-scripts" srcDoc={built.srcdoc} />
        </div>
        <div className={styles.row}>
          <button type="button" className={`${stage.btn} ${stage.sm}`} onClick={() => void copy('html')}>
            Copiar index.html
          </button>
          {built.css ? (
            <button type="button" className={`${stage.btn} ${stage.sm} ${stage.hot}`} onClick={() => void copy('css')}>
              Copiar style.css
            </button>
          ) : null}
          {built.js ? (
            <button type="button" className={`${stage.btn} ${stage.sm} ${stage.yel}`} onClick={() => void copy('js')}>
              Copiar script.js
            </button>
          ) : null}
        </div>
        {status ? (
          <p className={styles.docl} role="status">
            {status}
          </p>
        ) : null}
        <pre className={styles.src} aria-label={FILE_NAME[shown]} tabIndex={0}>
          {built[shown]}
        </pre>
        <p className={styles.docl}>{webEraCopy.portfolioTip}</p>
      </div>
    </Modal>
  );
}
