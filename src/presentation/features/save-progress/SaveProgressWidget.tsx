import { useState, type FormEvent } from 'react';
import { hasPhoneLinked, requestPasswordReset, saveProgressWithPhone } from '@/application/usecases';
import { Button, Modal } from '@/presentation/design-system';
import { useServices } from '@/presentation/app/ServicesContext';
import styles from './SaveProgressWidget.module.css';

type Mode = 'form' | 'forgot' | 'forgot-sent';

/**
 * Caixa flutuante "Salvar ou entrar": cadastro rápido por telefone+senha (sem SMS,
 * sem código pra copiar — ver `application/usecases/phoneAuth.ts`), pra continuar de
 * qualquer aparelho. A mesma caixa também serve pra entrar numa conta que já existe:
 * se o telefone (e e-mail, se tiver sido usado no cadastro) já tiver conta e a senha
 * bater, entra nela em vez de criar outra. Some sozinha depois que o viajante já
 * vinculou um telefone (`hasPhoneLinked`), neste ou em outro aparelho que tenha
 * restaurado a mesma conta.
 */
export function SaveProgressWidget() {
  const { progressRepository, leaderboard } = useServices();
  const [linked, setLinked] = useState(() => hasPhoneLinked({ repository: progressRepository }));
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<Mode>('form');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [forgotEmail, setForgotEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  if (linked) return null;

  function close() {
    setOpen(false);
    setMode('form');
    setError(null);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (saving) return;
    setSaving(true);
    setError(null);
    const result = await saveProgressWithPhone(
      { repository: progressRepository, leaderboard },
      { phone, password, email: email.trim() || undefined },
    );
    setSaving(false);
    if (!result.ok) {
      setError(result.reason);
      return;
    }
    setLinked(true);
    close();
  }

  async function handleForgotSubmit(e: FormEvent) {
    e.preventDefault();
    if (saving) return;
    setSaving(true);
    setError(null);
    const result = await requestPasswordReset({ leaderboard }, { email: forgotEmail });
    setSaving(false);
    if (!result.ok) {
      setError(result.reason);
      return;
    }
    setMode('forgot-sent');
  }

  return (
    <>
      <button type="button" className={styles.floating} onClick={() => setOpen(true)}>
        Salvar ou entrar
      </button>

      {open ? (
        <Modal title={mode === 'form' ? 'Salvar ou entrar' : 'Esqueci minha senha'} onClose={close}>
          {mode === 'form' ? (
            <>
              <h2 className={styles.title}>Salvar ou entrar</h2>
              <p className={styles.hint}>
                Cadastre um telefone e uma senha pra continuar de qualquer aparelho — sem código nenhum pra copiar.
                Se esse telefone já tiver conta, é só preencher de novo: você entra nela direto.
              </p>
              <form onSubmit={handleSubmit}>
                <input
                  className={styles.field}
                  type="tel"
                  inputMode="numeric"
                  autoCapitalize="off"
                  autoCorrect="off"
                  spellCheck={false}
                  autoComplete="tel"
                  placeholder="Telefone com DDD"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                />
                <div className={styles.passwordWrap}>
                  <input
                    className={`${styles.field} ${styles.passwordField}`}
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    placeholder="Senha (mínimo 6 caracteres)"
                    minLength={6}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    className={styles.togglePassword}
                    onClick={() => setShowPassword((v) => !v)}
                    aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                  >
                    {showPassword ? 'Ocultar' : 'Mostrar'}
                  </button>
                </div>
                <input
                  className={styles.field}
                  type="email"
                  autoCapitalize="off"
                  autoCorrect="off"
                  spellCheck={false}
                  autoComplete="email"
                  placeholder="E-mail (opcional)"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                <p className={styles.smallHint}>
                  O e-mail é opcional: só serve pra você conseguir recuperar a senha se esquecer. Sem ele, a conta
                  fica só no telefone+senha, sem como redefinir a senha depois.
                </p>
                {error ? (
                  <p role="alert" className={styles.error}>
                    {error}
                  </p>
                ) : null}
                <Button type="submit" disabled={saving}>
                  {saving ? 'Salvando...' : 'Salvar'}
                </Button>
                <button
                  type="button"
                  className={styles.link}
                  onClick={() => {
                    setMode('forgot');
                    setError(null);
                  }}
                >
                  Esqueci minha senha
                </button>
              </form>
            </>
          ) : null}

          {mode === 'forgot' ? (
            <>
              <h2 className={styles.title}>Esqueci minha senha</h2>
              <p className={styles.hint}>
                Digite o e-mail que você usou no cadastro. Só funciona se você informou um e-mail — sem ele, não tem
                como recuperar a senha, é preciso cadastrar de novo.
              </p>
              <form onSubmit={handleForgotSubmit}>
                <input
                  className={styles.field}
                  type="email"
                  autoCapitalize="off"
                  autoCorrect="off"
                  spellCheck={false}
                  autoComplete="email"
                  placeholder="Seu e-mail"
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  required
                />
                {error ? (
                  <p role="alert" className={styles.error}>
                    {error}
                  </p>
                ) : null}
                <Button type="submit" disabled={saving}>
                  {saving ? 'Enviando...' : 'Enviar link de redefinição'}
                </Button>
                <button type="button" className={styles.link} onClick={() => setMode('form')}>
                  ◂ Voltar
                </button>
              </form>
            </>
          ) : null}

          {mode === 'forgot-sent' ? (
            <>
              <h2 className={styles.title}>Confira seu e-mail</h2>
              <p className={styles.hint}>
                Se esse e-mail tiver uma conta, você vai receber um link para trocar a senha em instantes. Confira
                também a caixa de spam.
              </p>
              <button type="button" className={styles.link} onClick={close}>
                Fechar
              </button>
            </>
          ) : null}
        </Modal>
      ) : null}
    </>
  );
}
