/**
 * Gera um código de recuperação de 8 caracteres, legível e digitável no celular:
 * alfabeto Crockford-base32-like, sem `0/O/1/I/L` nem outros caracteres fáceis de
 * confundir. Usa `crypto.getRandomValues` (Web Crypto), disponível em todo navegador
 * que este app já exige — sem dependência nova.
 *
 * Infraestrutura pura de navegador: por isso vive aqui, fora de `domain/`/`application/`,
 * que não podem tocar `crypto`/`window` (mesmo motivo de `resizeAvatar.ts`).
 */

const ALPHABET = '23456789ABCDEFGHJKMNPQRSTVWXYZ';
const CODE_LENGTH = 8;
const GROUP_SIZE = 4;

export function generateRecoveryCode(): string {
  const bytes = new Uint8Array(CODE_LENGTH);
  crypto.getRandomValues(bytes);

  let raw = '';
  for (let i = 0; i < CODE_LENGTH; i += 1) {
    raw += ALPHABET[bytes[i] % ALPHABET.length];
  }

  const groups: string[] = [];
  for (let i = 0; i < raw.length; i += GROUP_SIZE) {
    groups.push(raw.slice(i, i + GROUP_SIZE));
  }
  return groups.join('-');
}
