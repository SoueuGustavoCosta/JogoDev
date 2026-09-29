import { useCallback, useEffect, useReducer, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { getWebEra } from '@/application/usecases';
import { useServices } from '@/presentation/app/ServicesContext';
import type { LayoutOutletContext } from '@/presentation/shell';
import type { WebStage } from './StageRunner';

/** Estado comum das telas da era: progresso relido ao fechar o palco, palco aberto, portfólio e aviso curto. */
export function useWebEraScreen() {
  const { progressRepository } = useServices();
  const { refreshSummary } = useOutletContext<LayoutOutletContext>();
  const [version, bump] = useReducer((n: number) => n + 1, 0);
  const [stage, setStage] = useState<WebStage | null>(null);
  const [portfolioOpen, setPortfolioOpen] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  // `version` força a releitura depois de uma etapa.
  const view = getWebEra({ repository: progressRepository });

  useEffect(() => {
    if (!notice) return;
    const t = window.setTimeout(() => setNotice(null), 1800);
    return () => window.clearTimeout(t);
  }, [notice]);

  const closeStage = useCallback(() => {
    setStage(null);
    bump();
    refreshSummary();
  }, [refreshSummary]);

  return { view, version, stage, setStage, closeStage, portfolioOpen, setPortfolioOpen, notice, setNotice, refresh: bump };
}
