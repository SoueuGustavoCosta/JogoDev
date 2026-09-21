import { useState, type FormEvent } from 'react';
import { hasPhoneLinked, saveProgressWithPhone } from '@/application/usecases';
import { Button, Modal } from '@/presentation/design-system';
import { useServices } from '@/presentation/app/ServicesContext';
import styles from './SaveProgressWidget.module.css';

/**
 * Caixa flutuante "Salvar progresso": cadastro rápido por telefone+senha (sem SMS,
 * sem código pra copiar — ver `application/usecases/phoneAuth.ts`), pra continuar de
 * qualquer aparelho. Some sozinha depois que o viajante já vinculou um telefone
 * (`hasPhoneLinked`), neste ou em outro aparelho que tenha restaurado a mesma conta.
 */
export function SaveProgressWidget() {
  const { progressRepository, leaderboard } = useServices();
  const [linked, setLinked] = useState(() => hasPhoneLinked({ repository: progressRepository }));
  const [open, setOpen] = useState(false);
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  if (linked) return null;

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (saving) return;
    setSaving(true);
    setError(null);
    const result = await saveProgressWithPhone({ repository: progressRepository, leaderboard }, { phone, password });
    setSaving(false);
    if (!result.ok) {
      setError(result.reason);
      return;
    }
    setLinked(true);
    setOpen(false);
  }

  return (
    <>
      <button type="button" className={styles.floating} onClick={() => setOpen(true)}>
        Salvar progresso
      </button>

      {open ? (
        <Modal title="Salvar progresso" onClose={() => setOpen(false)}>
          <h2 className={styles.title}>Salvar progresso</h2>
          <p className={styles.hint}>
            Cadastre um telefone e uma senha pra continuar de qualquer aparelho — sem código nenhum pra copiar.
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
            <input
              className={styles.field}
              type="password"
              autoComplete="new-password"
              placeholder="Senha (mínimo 6 caracteres)"
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            {error ? (
              <p role="alert" className={styles.error}>
                {error}
              </p>
            ) : null}
            <Button type="submit" disabled={saving}>
              {saving ? 'Salvando...' : 'Salvar'}
            </Button>
          </form>
        </Modal>
      ) : null}
    </>
  );
}
