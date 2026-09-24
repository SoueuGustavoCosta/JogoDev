import { useState, type FormEvent, type ReactNode } from 'react';
import { requestPasswordReset, signInWithPhone, signUpWithPhone } from '@/application/usecases';
import { MIN_PASSWORD_LENGTH } from '@/domain/traveler';
import { Button } from '@/presentation/design-system';
import { useServices } from '@/presentation/app/ServicesContext';
import { PasswordField } from './PasswordField';
import styles from './Account.module.css';

/** Telas em que não faz sentido "ficar" depois de entrar: voltam para o mapa. */
const LEAVE_AFTER_SIGN_IN = new Set(['/prologo', '/entrar', '/cadastro', '/esqueci-senha', '/conta']);

/**
 * Depois de entrar ou criar a conta, recarrega o app NA MESMA TELA em que a pessoa estava
 * (o resto da árvore lê o progresso uma vez só, no carregamento). Só as telas de conta e
 * o prólogo voltam para o mapa.
 */
function reloadStayingHere() {
  const { pathname, search } = window.location;
  window.location.href = LEAVE_AFTER_SIGN_IN.has(pathname) ? '/' : pathname + search;
}

function ErrorLine({ children }: { children: ReactNode }) {
  return (
    <p role="alert" className={styles.error}>
      {children}
    </p>
  );
}

/** Formulário "Entrar": telefone (ou e-mail do cadastro) + senha. */
export function LoginForm({ idPrefix, expired, onForgot, onCreateAccount }: {
  idPrefix: string;
  expired: boolean;
  onForgot: () => void;
  onCreateAccount: () => void;
}) {
  const { progressRepository, leaderboard } = useServices();
  const [login, setLogin] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    setError(null);
    const result = await signInWithPhone({ repository: progressRepository, leaderboard }, { login, password });
    if (!result.ok) {
      setBusy(false);
      setError(result.reason);
      return;
    }
    reloadStayingHere();
  }

  return (
    <>
      {expired ? (
        <p className={styles.notice} role="status">
          Sua sessão expirou. Entre de novo para voltar a salvar: o que você fez neste aparelho continua guardado aqui.
        </p>
      ) : (
        <p className={styles.hint}>Entre com o telefone (ou o e-mail) e a senha que você cadastrou.</p>
      )}
      <form onSubmit={handleSubmit} noValidate>
        <label className={styles.label} htmlFor={`${idPrefix}-login-id`}>
          Telefone com DDD ou e-mail
        </label>
        <input
          id={`${idPrefix}-login-id`}
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
          id={`${idPrefix}-login-password`}
          label="Senha"
          autoComplete="current-password"
          value={password}
          onChange={setPassword}
        />
        {error ? <ErrorLine>{error}</ErrorLine> : null}
        <Button type="submit" className={styles.submit} disabled={busy}>
          {busy ? 'Entrando...' : 'Entrar'}
        </Button>
      </form>
      <div className={styles.links}>
        <button type="button" className={styles.link} onClick={onCreateAccount}>
          Criar conta
        </button>
        <button type="button" className={styles.mutedLink} onClick={onForgot}>
          Esqueci minha senha
        </button>
      </div>
    </>
  );
}

/** Formulário "Criar conta": leva junto o progresso de quem já está jogando sem conta. */
export function SignUpForm({ idPrefix, onSignIn }: { idPrefix: string; onSignIn: () => void }) {
  const { progressRepository, leaderboard } = useServices();
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [exists, setExists] = useState(false);
  const [busy, setBusy] = useState(false);

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
    reloadStayingHere();
  }

  return (
    <>
      <p className={styles.hint}>
        Salve seu progresso com telefone e senha para continuar de qualquer aparelho. Tudo o que você já fez até aqui
        vai junto para a conta.
      </p>
      <form onSubmit={handleSubmit} noValidate>
        <label className={styles.label} htmlFor={`${idPrefix}-signup-phone`}>
          Telefone com DDD
        </label>
        <input
          id={`${idPrefix}-signup-phone`}
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
          id={`${idPrefix}-signup-password`}
          label={`Senha (mínimo ${MIN_PASSWORD_LENGTH} caracteres)`}
          autoComplete="new-password"
          value={password}
          onChange={setPassword}
        />
        <label className={styles.label} htmlFor={`${idPrefix}-signup-email`}>
          E-mail (opcional)
        </label>
        <input
          id={`${idPrefix}-signup-email`}
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
          O e-mail só serve para recuperar a senha se você esquecer. Se cadastrar um, você também pode entrar com ele.
        </p>
        {error ? (
          <ErrorLine>
            {error}{' '}
            {exists ? (
              <button type="button" className={styles.link} onClick={onSignIn}>
                Entrar ▸
              </button>
            ) : null}
          </ErrorLine>
        ) : null}
        <Button type="submit" className={styles.submit} disabled={busy}>
          {busy ? 'Criando...' : 'Criar conta'}
        </Button>
      </form>
      <div className={styles.links}>
        <button type="button" className={styles.link} onClick={onSignIn}>
          Já tenho conta
        </button>
      </div>
    </>
  );
}

/** Formulário "Esqueci minha senha": manda o link de redefinição (só contas com e-mail). */
export function ForgotForm({ idPrefix, onBack }: { idPrefix: string; onBack: () => void }) {
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
      <>
        <p className={styles.hint}>
          Se esse e-mail tiver uma conta, você vai receber um link para trocar a senha em instantes. Confira também a
          caixa de spam.
        </p>
        <button type="button" className={styles.link} onClick={onBack}>
          ◂ Voltar para Entrar
        </button>
      </>
    );
  }

  return (
    <>
      <p className={styles.hint}>
        Digite o e-mail que você usou no cadastro. Só funciona se você informou um e-mail: sem ele, não há como
        recuperar a senha.
      </p>
      <form onSubmit={handleSubmit} noValidate>
        <label className={styles.label} htmlFor={`${idPrefix}-forgot-email`}>
          E-mail do cadastro
        </label>
        <input
          id={`${idPrefix}-forgot-email`}
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
        {error ? <ErrorLine>{error}</ErrorLine> : null}
        <Button type="submit" className={styles.submit} disabled={busy}>
          {busy ? 'Enviando...' : 'Enviar link de redefinição'}
        </Button>
      </form>
      <div className={styles.links}>
        <button type="button" className={styles.link} onClick={onBack}>
          ◂ Voltar para Entrar
        </button>
      </div>
    </>
  );
}
