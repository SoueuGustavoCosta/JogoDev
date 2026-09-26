import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { createHash } from 'node:crypto';
import type { Plugin } from 'vite';

/** Pacotes pesados do laboratório: ficam fora da lista (baixados só ao abrir o laboratório). */
const HEAVY = /node_modules[\\/](@electric-sql[\\/]pglite|php-wasm)[\\/]/;
const STATIC = /\.(css|svg|png|webp|jpg|woff2?)$/;

type BundleFile = { type: 'chunk'; fileName: string; moduleIds: string[] } | { type: 'asset'; fileName: string };

/** Quais arquivos do build entram no cache inicial (tudo, menos o laboratório pesado). */
export function precacheFromBundle(files: readonly BundleFile[]): string[] {
  return files
    .filter((f) => (f.type === 'chunk' ? !f.moduleIds.some((id) => HEAVY.test(id)) : STATIC.test(f.fileName)))
    .map((f) => `/${f.fileName}`)
    .sort();
}

function listPublic(dir: string, root = dir): string[] {
  return readdirSync(dir).flatMap((name) => {
    const full = join(dir, name);
    if (statSync(full).isDirectory()) return listPublic(full, root);
    return [`/${relative(root, full).split('\\').join('/')}`];
  });
}

/**
 * Plugin do Vite que gera o `sw.js` (Etapa 12A) com a lista de arquivos do build e uma
 * versão que muda a cada build (o service worker novo apaga o cache antigo).
 */
export function serviceWorkerPlugin(options: { publicDir: string; template: string }): Plugin {
  return {
    name: 'arquipelago-service-worker',
    apply: 'build',
    generateBundle(_opts, bundle) {
      const built = precacheFromBundle(Object.values(bundle) as unknown as BundleFile[]);
      // Da pasta public, só o que o app precisa para abrir (as insígnias vão para o cache
      // quando aparecem na tela, sem pesar o primeiro acesso).
      const extra = listPublic(options.publicDir).filter((p) => p === '/manifest.webmanifest' || p.startsWith('/icons/'));
      const urls = [...new Set(['/', '/index.html', ...extra, ...built])];
      const version = createHash('sha256').update(urls.join('\n')).digest('hex').slice(0, 12);
      const source = readFileSync(options.template, 'utf8')
        .replace("const VERSION = '__VERSION__';", `const VERSION = ${JSON.stringify(version)};`)
        .replace('const PRECACHE = __PRECACHE__;', `const PRECACHE = ${JSON.stringify(urls)};`);
      if (source.includes("= '__VERSION__'") || source.includes('= __PRECACHE__')) {
        this.error('pwa/service-worker.js: marcadores __VERSION__/__PRECACHE__ não encontrados');
      }
      this.emitFile({ type: 'asset', fileName: 'sw.js', source });
    },
  };
}
