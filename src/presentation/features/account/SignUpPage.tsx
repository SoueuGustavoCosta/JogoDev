import { Link, useNavigate } from 'react-router-dom';
import { hasPhoneLinked, needsSignInAgain } from '@/application/usecases';
import { useServices } from '@/presentation/app/ServicesContext';
import { AccountScreen } from './AccountScreen';
import { SignUpForm } from './forms';
import styles from './Account.module.css';

/**
 * Rota `/cadastro`: quem está jogando sem conta cadastra telefone+senha e continua com o
 * mesmo progresso. Nunca entra numa conta existente (isso é `/entrar`).
 */
export function SignUpPage() {
  const { progressRepository } = useServices();
  const navigate = useNavigate();

  if (
    hasPhoneLinked({ repository: progressRepository }) ||
    needsSignInAgain({ repository: progressRepository })
  ) {
    return (
      <AccountScreen title="Você já tem conta">
        <p className={styles.hint}>
          Este aparelho já está ligado a uma conta. Para criar outra, saia desta primeiro na tela do
          Viajante.
        </p>
        <div className={styles.links}>
          <Link className={styles.link} to="/">
            Ir para o mapa
          </Link>
          <Link className={styles.link} to="/configuracoes">
            Tela do Viajante ▸
          </Link>
        </div>
      </AccountScreen>
    );
  }

  return (
    <AccountScreen title="Criar conta">
      <SignUpForm idPrefix="page" onSignIn={() => navigate('/entrar')} />
    </AccountScreen>
  );
}
