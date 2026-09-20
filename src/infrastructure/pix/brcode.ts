import { PIX } from '@/config/pix';

function tlv(id: string, value: string): string {
  const length = value.length.toString().padStart(2, '0');
  return `${id}${length}${value}`;
}

/** Remove acentos, corta caracteres fora do padrão ASCII simples e maiúsculas. */
function sanitize(value: string, maxLength: number): string {
  const normalized = value
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^A-Za-z0-9 ]/g, '')
    .toUpperCase()
    .trim();
  return normalized.slice(0, maxLength);
}

function crc16ccitt(payload: string): string {
  let crc = 0xffff;
  for (let i = 0; i < payload.length; i++) {
    crc ^= payload.charCodeAt(i) << 8;
    for (let bit = 0; bit < 8; bit++) {
      crc = (crc & 0x8000) !== 0 ? ((crc << 1) ^ 0x1021) & 0xffff : (crc << 1) & 0xffff;
    }
  }
  return crc.toString(16).toUpperCase().padStart(4, '0');
}

export type BrCodeOptions = {
  key?: string;
  receiverName?: string;
  receiverCity?: string;
  /** Valor fixo opcional. O Pix voluntário é estático: sem valor, o aluno escolhe quanto dar. */
  amount?: number;
};

/**
 * Gera o BR Code estático do Pix (padrão EMV), seguindo o layout da seção 9 do CLAUDE.md.
 * Sem valor definido por padrão (o aluno escolhe quanto contribuir).
 */
export function generatePixBrCode(options: BrCodeOptions = {}): string {
  const key = options.key ?? PIX.key;
  const receiverName = sanitize(options.receiverName ?? PIX.receiverName, 25);
  const receiverCity = sanitize(options.receiverCity ?? PIX.receiverCity, 15);

  const merchantAccountInfo = tlv('00', 'BR.GOV.BCB.PIX') + tlv('01', key);

  let payload =
    tlv('00', '01') +
    tlv('01', '11') +
    tlv('26', merchantAccountInfo) +
    tlv('52', '0000') +
    tlv('53', '986') +
    (options.amount !== undefined ? tlv('54', options.amount.toFixed(2)) : '') +
    tlv('58', 'BR') +
    tlv('59', receiverName) +
    tlv('60', receiverCity) +
    tlv('62', tlv('05', '***'));

  payload += '6304';
  const crc = crc16ccitt(payload);
  return payload + crc;
}
