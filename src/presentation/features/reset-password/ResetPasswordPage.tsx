import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { updatePassword } from '@/application/usecases';
import { Button } from '@/presentation/design-system';
import { useServices } from '@/presentation/app/ServicesContext';
import styles from './ResetPasswordPage.module.css';

/**
 * Rota `/redefinir-senha`: destino do link enviado por `requestPasswordReset` (ver
 * `SaveProgressWidget`). Ao abrir o link, o supabase-js já troca a URL por uma sessão
 * temporária de redefinição sozinho (nenhum código aqui precisa ler token nenhum) — só
 * falta pedir a senha nova e chamar `updatePassword`.
 */
export function ResetPasswordPage() {
  const { leaderboard } = useServices();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);

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
        <p>Sua senha foi trocada. Já pode continuar jogando.</p>
        <Link className={styles.link} to="/">
          ◂ Voltar ao mapa
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
