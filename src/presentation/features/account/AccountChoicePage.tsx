import { useSearchParams } from 'react-router-dom';
import { useAccountSheet } from './accountSheetContext';
import { AccountScreen } from './AccountScreen';
import styles from './Account.module.css';

/**
 * Rota `/conta`: para onde o app leva depois de "Sair". Duas saídas claras, entrar numa
 * conta ou criar uma, e um link discreto para jogar sem conta (o jogo nunca exige login).
 */
export function AccountChoicePage() {
  const [params] = useSearchParams();
  const signedOut = params.get('saiu') === '1';
  const { openAccount } = useAccountSheet();
  return (
    <AccountScreen
      title={signedOut ? 'Você saiu da conta' : 'Sua conta'}
      backTo="/prologo"
      backLabel="Jogar sem conta"
    >
      <p className={styles.hint}>
        {signedOut
          ? 'Seu progresso continua salvo na conta. Entre de novo quando quiser, ou crie uma conta nova.'
          : 'Entre na sua conta ou crie uma para salvar o progresso e continuar de qualquer aparelho.'}
      </p>
      <div className={styles.choices}>
        <button type="button" className={styles.choicePrimary} onClick={() => openAccount('login')}>
          <strong>Entrar</strong>
          <span>Já tenho conta com telefone e senha</span>
        </button>
        <button type="button" className={styles.choice} onClick={() => openAccount('signup')}>
          <strong>Criar conta</strong>
          <span>Cadastrar telefone e senha</span>
        </button>
      </div>
    </AccountScreen>
  );
}
