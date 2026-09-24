import { useEffect, useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { updatePassword } from '@/application/usecases';
import { Button } from '@/presentation/design-system';
import { useServices } from '@/presentation/app/ServicesContext';
import styles from './ResetPasswordPage.module.css';

type LinkCheck = 'checking' | 'valid' | 'invalid';

/**
 * Rota `/redefinir-senha`: destino do link enviado por `requestPasswordReset` (ver
 * `ForgotPasswordPage`). Ao abrir o link, o supabase-js já troca a URL por uma sessão
 * temporária de redefinição sozinho (nenhum código aqui precisa ler token nenhum) — só
 * falta pedir a senha nova e chamar `updatePassword`.
 *
 * Antes de mostrar o formulário, confere que essa sessão temporária realmente existe
 * (`hasRealSession`). Sem essa checagem, abrir esta rota sem token nenhum (link
 * expirado, aberto sem o fragmento da URL, ou simplesmente digitado) deixava a página
 * tentar `updatePassword` em cima de qualquer sessão que já estivesse ativa neste
 * aparelho — inclusive a sessão anônima de quem só estava jogando, o que definiria uma
 * senha inútil numa conta sem relação nenhuma com o pedido de redefinição.
 */
export function ResetPasswordPage() {
  const { leaderboard } = useServices();
  const [linkCheck, setLinkCheck] = useState<LinkCheck>('checking');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    let cancelled = false;
    leaderboard.hasRealSession().then((ok) => {
      if (!cancelled) setLinkCheck(ok ? 'valid' : 'invalid');
    });
    return () => {
      cancelled = true;
    };
  }, [leaderboard]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (saving) return;
    if (password !== confirm) {
      setError('As senhas não são iguais.');
      return;
    }
    setSaving(true);
    setError(null);
    const result = await updatePassword({ leaderboard }, { password });
    setSaving(false);
    if (!result.ok) {
      setError(result.reason);
      return;
    }
    setDone(true);
  }

  if (done) {
    return (
      <article>
        <h1>Senha alterada</h1>
        <p>Sua senha foi trocada. Agora entre com ela para continuar de onde parou.</p>
        <Link className={styles.link} to="/entrar">
          Entrar ▸
        </Link>
      </article>
    );
  }

  if (linkCheck === 'checking') {
    return (
      <article>
        <h1>Redefinir senha</h1>
        <p className={styles.hint}>Conferindo o link...</p>
      </article>
    );
  }

  if (linkCheck === 'invalid') {
    return (
      <article>
        <h1>Link inválido ou expirado</h1>
        <p className={styles.error}>
          Este link de redefinição não é mais válido — pode já ter sido usado, ou ter expirado. Peça um novo em
          &quot;Esqueci minha senha&quot;.
        </p>
        <Link className={styles.link} to="/esqueci-senha">
          Pedir um novo link ▸
        </Link>
      </article>
    );
  }

  return (
    <article>
      <h1>Redefinir senha</h1>
      <p className={styles.hint}>Escolha uma nova senha (mínimo 6 caracteres).</p>
      <form onSubmit={handleSubmit}>
        <input
          className={styles.field}
          type="password"
          autoComplete="new-password"
          placeholder="Nova senha"
          minLength={6}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <input
          className={styles.field}
          type="password"
          autoComplete="new-password"
          placeholder="Confirmar nova senha"
          minLength={6}
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          required
        />
        {error ? (
          <p role="alert" className={styles.error}>
            {error}
          </p>
        ) : null}
        <Button type="submit" disabled={saving}>
          {saving ? 'Salvando...' : 'Salvar nova senha'}
        </Button>
      </form>
    </article>
  );
}
