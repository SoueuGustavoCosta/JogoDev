import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { hasPhoneLinked, needsSignInAgain, signInWithPhone } from '@/application/usecases';
import { Button } from '@/presentation/design-system';
import { useServices } from '@/presentation/app/ServicesContext';
import { AccountScreen } from './AccountScreen';
import { PasswordField } from './PasswordField';
import styles from './Account.module.css';

/** Rota `/entrar`: entra numa conta que já existe (telefone ou e-mail + senha). */
export function LoginPage() {
  const { progressRepository, leaderboard } = useServices();
  const [login, setLogin] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
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

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    setError(null);
    const result = await signInWithPhone(
      { repository: progressRepository, leaderboard },
      { login, password },
    );
    if (!result.ok) {
      setBusy(false);
      setError(result.reason);
      return;
    }
    // Recarrega o app: o resto da árvore lê o progresso uma vez só, no carregamento.
    window.location.href = '/';
  }

  return (
    <AccountScreen title="Entrar">
      {expired ? (
        <p className={styles.notice} role="status">
          Sua sessão expirou. Entre de novo para voltar a salvar: o que você fez neste aparelho
          continua guardado aqui.
        </p>
      ) : (
        <p className={styles.hint}>
          Entre com o telefone (ou o e-mail) e a senha que você cadastrou.
        </p>
      )}
      <form onSubmit={handleSubmit} noValidate>
        <label className={styles.label} htmlFor="login-id">
          Telefone com DDD ou e-mail
        </label>
        <input
          id="login-id"
          className={styles.field}
          type="text"
          inputMode="email"
          autoCapitalize="off"
          autoCorrect="off"
          spellCheck={false}
          autoComplete="username"
          placeholder="(31) 99999-9999"
          value={login}
          onChange={(e) => setLogin(e.target.value)}
          required
        />
        <PasswordField
          id="login-password"
          label="Senha"
          autoComplete="current-password"
          value={password}
          onChange={setPassword}
        />
        {error ? (
          <p role="alert" className={styles.error}>
            {error}
          </p>
        ) : null}
        <Button type="submit" className={styles.submit} disabled={busy}>
          {busy ? 'Entrando...' : 'Entrar'}
        </Button>
      </form>
      <div className={styles.links}>
        <Link className={styles.link} to="/cadastro">
          Criar conta
        </Link>
        <Link className={styles.mutedLink} to="/esqueci-senha">
          Esqueci minha senha
        </Link>
      </div>
    </AccountScreen>
  );
}
