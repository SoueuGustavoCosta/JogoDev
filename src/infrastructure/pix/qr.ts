import QRCode from 'qrcode';

/** Gera um data URL PNG do QR Code a partir do BR Code do Pix. */
export function generatePixQrDataUrl(brCode: string): Promise<string> {
  return QRCode.toDataURL(brCode, { margin: 1, width: 280 });
}
