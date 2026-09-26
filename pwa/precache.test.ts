// @vitest-environment node
import { describe, expect, it } from 'vitest';
import { precacheFromBundle } from './precache';

describe('lista do cache inicial (service worker)', () => {
  it('guarda telas, estilos e imagens, mas não o laboratório pesado', () => {
    const list = precacheFromBundle([
      { type: 'chunk', fileName: 'assets/index-a.js', moduleIds: ['/src/main.tsx'] },
      { type: 'chunk', fileName: 'assets/lesson-b.js', moduleIds: ['/src/content/trails/logica/modules/ola.ts'] },
      { type: 'chunk', fileName: 'assets/pg-c.js', moduleIds: ['/x/node_modules/@electric-sql/pglite/dist/index.js'] },
      { type: 'chunk', fileName: 'assets/php-d.js', moduleIds: ['/x/node_modules/php-wasm/PhpWeb.mjs'] },
      { type: 'asset', fileName: 'assets/index-e.css' },
      { type: 'asset', fileName: 'assets/postgres-f.wasm' },
      { type: 'asset', fileName: 'assets/postgres-g.data' },
    ]);
    expect(list).toEqual(['/assets/index-a.js', '/assets/index-e.css', '/assets/lesson-b.js']);
  });
});
