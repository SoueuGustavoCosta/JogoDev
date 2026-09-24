import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { hasPhoneLinked, needsSignInAgain, signUpWithPhone } from '@/application/usecases';
import { MIN_PASSWORD_LENGTH } from '@/domain/traveler';
import { Button } from '@/presentation/design-system';
import { useServices } from '@/presentation/app/ServicesContext';
import { AccountScreen } from './AccountScreen';
import { PasswordField } from './PasswordField';
import styles from './Account.module.css';

/**
 * Rota `/cadastro`: quem está jogando sem conta cadastra telefone+senha e continua com o
 * mesmo progresso. Nunca entra numa conta existente (isso é `/entrar`).
 */
export function SignUpPage() {
  const { progressRepository, leaderboard } = useServices();
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [exists, setExists] = useState(false);
  const [busy, setBusy] = useState(false);

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

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    setError(null);
    setExists(false);
    const result = await signUpWithPhone(
      { repository: progressRepository, leaderboard },
      { phone, password, email: email.trim() || undefined },
    );
    if (!result.ok) {
      setBusy(false);
      setError(result.reason);
      setExists(Boolean(result.exists));
      return;
    }
    window.location.href = '/';
  }

  return (
    <AccountScreen title="Criar conta">
      <p className={styles.hint}>
        Salve seu progresso com telefone e senha para continuar de qualquer aparelho. Tudo o que
        você já fez até aqui vai junto para a conta.
      </p>
      <form onSubmit={handleSubmit} noValidate>
        <label className={styles.label} htmlFor="signup-phone">
          Telefone com DDD
        </label>
        <input
          id="signup-phone"
          className={styles.field}
          type="tel"
          inputMode="numeric"
          autoComplete="tel"
          placeholder="(31) 99999-9999"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          required
        />
        <PasswordField
          id="signup-password"
          label={`Senha (mínimo ${MIN_PASSWORD_LENGTH} caracteres)`}
          autoComplete="new-password"
          value={password}
          onChange={setPassword}
        />
        <label className={styles.label} htmlFor="signup-email">
          E-mail (opcional)
        </label>
        <input
          id="signup-email"
          className={styles.field}
          type="email"
          autoCapitalize="off"
          autoCorrect="off"
          spellCheck={false}
          autoComplete="email"
          placeholder="voce@exemplo.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <p className={styles.smallHint}>
          O e-mail só serve para recuperar a senha se você esquecer. Se cadastrar um, você também
          pode entrar com ele.
        </p>
        {error ? (
          <p role="alert" className={styles.error}>
            {error}{' '}
            {exists ? (
              <Link className={styles.link} to="/entrar">
                Entrar ▸
              </Link>
            ) : null}
          </p>
        ) : null}
        <Button type="submit" className={styles.submit} disabled={busy}>
          {busy ? 'Criando...' : 'Criar conta'}
        </Button>
      </form>
      <div className={styles.links}>
        <Link className={styles.link} to="/entrar">
          Já tenho conta
        </Link>
      </div>
    </AccountScreen>
  );
}
