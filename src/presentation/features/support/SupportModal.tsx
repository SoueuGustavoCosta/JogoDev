import { useEffect, useState } from 'react';
import { PIX } from '@/config/pix';
import { SUPPORT_COPY } from '@/domain/support';
import { Button, Modal } from '@/presentation/design-system';
import { useServices } from '@/presentation/app/ServicesContext';
import styles from './SupportModal.module.css';

export function SupportModal({ onClose }: { onClose: () => void }) {
  const { clipboard, analytics } = useServices();
  const [brCode, setBrCode] = useState<string | null>(null);
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [copiedFeedback, setCopiedFeedback] = useState<string | null>(null);

  useEffect(() => {
    analytics.track('support_opened');
    let cancelled = false;
    import('@/infrastructure/pix').then(({ generatePixBrCode, generatePixQrDataUrl }) => {
      const code = generatePixBrCode();
      generatePixQrDataUrl(code).then((dataUrl) => {
        if (cancelled) return;
        setBrCode(code);
        setQrDataUrl(dataUrl);
        analytics.track('pix_qr_shown');
      });
    });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function copy(text: string, label: string) {
    const ok = await clipboard.copy(text);
    setCopiedFeedback(ok ? `${label} copiada!` : 'Não foi possível copiar. Copie manualmente.');
    if (ok) analytics.track('pix_key_copied');
    window.setTimeout(() => setCopiedFeedback(null), 2500);
  }

  return (
    <Modal title="Colabore com o projeto" onClose={onClose}>
      <div className={styles.rocket} aria-hidden="true">
        🚀
      </div>
      <h2 className={styles.title}>Colabore com o projeto</h2>
      <p className={styles.developer}>{SUPPORT_COPY.developerBlurb}</p>
      <p className={styles.thanks}>{SUPPORT_COPY.modalThanks}</p>

      {qrDataUrl ? (
        <img className={styles.qr} src={qrDataUrl} alt="QR Code do Pix para contribuição voluntária" />
      ) : (
        <p>Gerando QR Code...</p>
      )}

      <p>
        Recebedor: <strong>{PIX.receiverName}</strong> — confira no seu app do banco.
      </p>

      <div className={styles.actions}>
        <Button onClick={() => brCode && copy(brCode, 'Código')} disabled={!brCode}>
          {SUPPORT_COPY.copyPixCopiaECola}
        </Button>
      </div>

      {copiedFeedback ? <p role="status">{copiedFeedback}</p> : null}

      <p className={styles.voluntary}>{SUPPORT_COPY.modalVoluntary}</p>
    </Modal>
  );
}
