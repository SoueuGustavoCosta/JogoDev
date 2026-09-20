import { describe, expect, it } from 'vitest';
import { generatePixBrCode } from './brcode';

/** Percorre um payload TLV (id de 2 dígitos + tamanho de 2 dígitos + valor) sequencialmente. */
function parseTlv(payload: string): Map<string, string> {
  const fields = new Map<string, string>();
  let i = 0;
  while (i < payload.length) {
    const id = payload.slice(i, i + 2);
    const length = Number(payload.slice(i + 2, i + 4));
    const value = payload.slice(i + 4, i + 4 + length);
    fields.set(id, value);
    i += 4 + length;
  }
  return fields;
}

function readTlvField(payload: string, id: string): string {
  const value = parseTlv(payload).get(id);
  if (value === undefined) throw new Error(`field ${id} not found`);
  return value;
}

/** Implementação independente do CRC16/CCITT-FALSE (tabela pré-computada), só para conferência nos testes. */
function crc16Reference(payload: string): string {
  const poly = 0x1021;
  const table = new Array(256);
  for (let i = 0; i < 256; i++) {
    let c = i << 8;
    for (let j = 0; j < 8; j++) {
      c = (c & 0x8000) !== 0 ? ((c << 1) ^ poly) & 0xffff : (c << 1) & 0xffff;
    }
    table[i] = c;
  }
  let crc = 0xffff;
  for (let i = 0; i < payload.length; i++) {
    const byte = payload.charCodeAt(i) & 0xff;
    crc = ((crc << 8) ^ table[((crc >> 8) ^ byte) & 0xff]) & 0xffff;
  }
  return crc.toString(16).toUpperCase().padStart(4, '0');
}

describe('generatePixBrCode', () => {
  it('starts with the Payload Format Indicator and static point-of-initiation fields', () => {
    const code = generatePixBrCode();
    expect(code.startsWith('000201')).toBe(true);
    expect(code).toContain('010211');
  });

  it('embeds the Pix key inside the merchant account information (field 26)', () => {
    const key = 'abc@example.com';
    const code = generatePixBrCode({ key });
    const merchantAccountInfo = readTlvField(code, '26');
    expect(readTlvField(merchantAccountInfo, '00')).toBe('BR.GOV.BCB.PIX');
    expect(readTlvField(merchantAccountInfo, '01')).toBe(key);
  });

  it('ends with a valid CRC16-CCITT checksum over the whole payload including "6304"', () => {
    const code = generatePixBrCode();
    const withoutCrc = code.slice(0, -4);
    const crc = code.slice(-4);
    expect(withoutCrc.endsWith('6304')).toBe(true);
    expect(crc).toBe(crc16Reference(withoutCrc));
  });

  it('normalizes and truncates the receiver name to 25 characters, without accents', () => {
    const longName = 'José Antônio da Silva Nascimento Ferreira';
    const code = generatePixBrCode({ receiverName: longName });
    const value = readTlvField(code, '59');
    expect(value.length).toBeLessThanOrEqual(25);
    expect(value).not.toMatch(/[ÁÉÍÓÚÃÕÇáéíóúãõç]/);
  });

  it('normalizes and truncates the receiver city to 15 characters', () => {
    const code = generatePixBrCode({ receiverCity: 'São João da Boa Vista' });
    const value = readTlvField(code, '60');
    expect(value.length).toBeLessThanOrEqual(15);
  });

  it('uses the default receiver from config/pix.ts when no override is given', () => {
    const code = generatePixBrCode();
    expect(code).toContain('GUSTAVO COSTA GOMES');
    expect(code).toContain('IPATINGA');
  });

  it('does not include a fixed amount by default (static, voluntary contribution)', () => {
    const code = generatePixBrCode();
    expect(code).not.toMatch(/54\d{2}/);
  });

  it('includes a fixed amount field when one is provided', () => {
    const code = generatePixBrCode({ amount: 10 });
    expect(code).toContain('540510.00');
  });
});
