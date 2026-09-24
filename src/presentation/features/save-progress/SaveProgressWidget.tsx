import { Link } from 'react-router-dom';
import { hasPhoneLinked, needsSignInAgain } from '@/application/usecases';
import { useServices } from '@/presentation/app/ServicesContext';
import styles from './SaveProgressWidget.module.css';

/**
 * Botão flutuante para quem joga sem conta: leva à tela "Criar conta" (`/cadastro`), que
 * leva junto todo o progresso feito até aqui. Se a sessão da conta deste aparelho se
 * perdeu, vira "Entrar de novo" (`/entrar`). Some quando o aparelho já está numa conta.
 */
export function SaveProgressWidget() {
  const { progressRepository } = useServices();
  if (hasPhoneLinked({ repository: progressRepository })) return null;
  const expired = needsSignInAgain({ repository: progressRepository });
  return (
    <Link to={expired ? '/entrar' : '/cadastro'} className={styles.floating}>
      {expired ? 'Entrar de novo' : 'Salvar progresso'}
    </Link>
  );
}
