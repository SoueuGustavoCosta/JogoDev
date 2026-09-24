import { Link, useNavigate } from 'react-router-dom';
import { hasPhoneLinked, needsSignInAgain } from '@/application/usecases';
import { useServices } from '@/presentation/app/ServicesContext';
import { AccountScreen } from './AccountScreen';
import { LoginForm } from './forms';
import styles from './Account.module.css';

/**
 * Rota `/entrar`: versão em página do formulário da gaveta de conta, para links diretos
 * (ex.: depois de redefinir a senha). Dentro do jogo, "Entrar" abre a gaveta.
 */
export function LoginPage() {
  const { progressRepository } = useServices();
  const navigate = useNavigate();
  const linked = hasPhoneLinked({ repository: progressRepository });
  const expired = needsSignInAgain({ repository: progressRepository });

  if (linked) {
    return (
      <AccountScreen title="Você já está numa conta">
        <p className={styles.hint}>
          Este aparelho já está conectado a uma conta e o progresso está sendo salvo nela. Para
          entrar em outra conta, saia desta primeiro na tela do Viajante.
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
    <AccountScreen title="Entrar">
      <LoginForm
        idPrefix="page"
        expired={expired}
        onForgot={() => navigate('/esqueci-senha')}
        onCreateAccount={() => navigate('/cadastro')}
      />
    </AccountScreen>
  );
}
