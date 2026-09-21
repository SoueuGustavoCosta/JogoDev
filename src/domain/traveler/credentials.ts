/**
 * Regras de telefone/senha para "salvar progresso" sem cadastro tradicional (sem SMS,
 * sem confirmação por e-mail): o telefone vira um e-mail sintético só para o provedor
 * de autenticação por e-mail/senha do Supabase aceitar, nunca é enviado nenhum e-mail
 * de verdade (exige desligar "Confirm email" no painel — ver `config/auth.ts`).
 *
 * Puro: TypeScript puro, sem I/O.
 */

/** Mínimo exigido pelo Supabase Auth por padrão. */
export const MIN_PASSWORD_LENGTH = 6;

/** Aceita `(31) 99999-9999`, `31999999999` etc.; exige DDD (10 ou 11 dígitos, padrão BR). */
export function normalizePhone(raw: string): string | null {
  const digits = raw.replace(/\D/g, '');
  if (digits.length !== 10 && digits.length !== 11) return null;
  return digits;
}

export function isValidPassword(password: string): boolean {
  return password.length >= MIN_PASSWORD_LENGTH;
}

/** E-mail sintético usado só internamente pelo provedor de auth; nunca mostrado ao aluno. */
export function syntheticEmailForPhone(digitsOnlyPhone: string, emailDomain: string): string {
  return `tel-${digitsOnlyPhone}@${emailDomain}`;
}

/** Checagem simples de formato (não confirma que o endereço existe de verdade). */
export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}
