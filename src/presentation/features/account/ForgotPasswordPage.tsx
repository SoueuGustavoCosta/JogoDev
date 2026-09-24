import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { requestPasswordReset } from '@/application/usecases';
import { Button } from '@/presentation/design-system';
import { useServices } from '@/presentation/app/ServicesContext';
import { AccountScreen } from './AccountScreen';
import styles from './Account.module.css';

/** Rota `/esqueci-senha`: manda o link de redefinição (só para contas com e-mail). */
export function ForgotPasswordPage() {
  const { leaderboard } = useServices();
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    setError(null);
    const result = await requestPasswordReset({ leaderboard }, { email });
    setBusy(false);
    if (!result.ok) {
      setError(result.reason);
      return;
    }
    setSent(true);
  }

  if (sent) {
    return (
      <AccountScreen title="Confira seu e-mail" backTo="/entrar" backLabel="◂ Voltar para Entrar">
        <p className={styles.hint}>
          Se esse e-mail tiver uma conta, você vai receber um link para trocar a senha em instantes.
          Confira também a caixa de spam.
        </p>
        <Link className={styles.link} to="/entrar">
          Voltar para Entrar
        </Link>
      </AccountScreen>
    );
  }

  return (
    <AccountScreen title="Esqueci minha senha" backTo="/entrar" backLabel="◂ Voltar para Entrar">
      <p className={styles.hint}>
        Digite o e-mail que você usou no cadastro. Só funciona se você informou um e-mail: sem ele,
        não há como recuperar a senha.
      </p>
      <form onSubmit={handleSubmit} noValidate>
        <label className={styles.label} htmlFor="forgot-email">
          E-mail do cadastro
        </label>
        <input
          id="forgot-email"
          className={styles.field}
          type="email"
          autoCapitalize="off"
          autoCorrect="off"
          spellCheck={false}
          autoComplete="email"
          placeholder="voce@exemplo.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        {error ? (
          <p role="alert" className={styles.error}>
            {error}
          </p>
        ) : null}
        <Button type="submit" className={styles.submit} disabled={busy}>
          {busy ? 'Enviando...' : 'Enviar link de redefinição'}
        </Button>
      </form>
    </AccountScreen>
  );
}
