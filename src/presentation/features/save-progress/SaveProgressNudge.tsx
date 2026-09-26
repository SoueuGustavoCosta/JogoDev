import { hasPhoneLinked, needsSignInAgain } from '@/application/usecases';
import { useServices } from '@/presentation/app/ServicesContext';
import { useAccountSheet } from '@/presentation/features/account';
import styles from './SaveProgressWidget.module.css';

/**
 * Botão flutuante para quem joga sem conta: abre a gaveta de conta na aba "Criar conta"
 * por cima da tela atual (a pessoa não sai de onde está), levando junto todo o progresso
 * feito até aqui. Se a sessão da conta deste aparelho se perdeu, vira "Entrar de novo".
 * Some quando o aparelho já está numa conta.
 */
export function SaveProgressWidget() {
  const { progressRepository } = useServices();
  const { openAccount } = useAccountSheet();
  if (hasPhoneLinked({ repository: progressRepository })) return null;
  const expired = needsSignInAgain({ repository: progressRepository });
  return (
    <button type="button" className={styles.floating} onClick={() => openAccount(expired ? 'login' : 'signup')}>
      {expired ? 'Entrar de novo' : 'Salvar progresso'}
    </button>
  );
}
