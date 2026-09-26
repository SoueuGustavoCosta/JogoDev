import { hasPhoneLinked } from '@/application/usecases';
import { useServices } from '@/presentation/app/ServicesContext';
import { useAccountSheet } from '@/presentation/features/account';
import styles from './SaveProgressNudge.module.css';

/**
 * Aviso para quem joga sem conta, mostrado no fluxo da página (nunca flutuando por cima
 * do texto): aparece uma única vez, logo depois da primeira insígnia conquistada (quem
 * chama decide o momento, ver `CompleteModuleResult.firstBadge`). Abre a gaveta de conta
 * na aba "Criar conta" sem sair da tela, levando junto todo o progresso feito até aqui.
 * O caminho fixo para salvar fica na aba Viajante. Some quando o aparelho já está numa conta.
 */
export function SaveProgressNudge() {
  const { progressRepository } = useServices();
  const { openAccount } = useAccountSheet();
  if (hasPhoneLinked({ repository: progressRepository })) return null;
  return (
    <div className={styles.nudge} role="note">
      <p>
        <b>Sua primeira insígnia!</b> Por enquanto seu progresso só existe neste aparelho. Crie uma conta para não
        perder nada se trocar de celular ou limpar o navegador.
      </p>
      <button type="button" className={styles.action} onClick={() => openAccount('signup')}>
        Salvar progresso ▸
      </button>
    </div>
  );
}
