/* Service worker do Arquipélago (Etapa 12A). Gerado no build por pwa/precache.ts:
 * __VERSION__ e __PRECACHE__ são trocados pela versão do build e pela lista de arquivos.
 *
 * - Lições, quiz e telas: tudo que o app precisa para abrir fica guardado no primeiro acesso,
 *   então as lições funcionam offline depois disso.
 * - Laboratório (PGlite, PHP em WebAssembly, vários MB): NÃO entra na lista; é guardado só
 *   quando a pessoa abre o laboratório pela primeira vez (pode pedir internet nessa hora).
 * - Nada de Supabase, métricas ou outras APIs: só arquivos do próprio app e as fontes.
 */
const VERSION = '__VERSION__';
const PRECACHE = __PRECACHE__;
const APP_CACHE = `arquipelago-app-${VERSION}`;
const RUNTIME_CACHE = 'arquipelago-runtime-v1';
const FONT_HOSTS = ['fonts.googleapis.com', 'fonts.gstatic.com'];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(APP_CACHE).then((cache) =>
      // Um arquivo que falhar não derruba a instalação inteira.
      Promise.all(PRECACHE.map((url) => cache.add(new Request(url, { cache: 'reload' })).catch(() => undefined))),
    ),
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k.startsWith('arquipelago-app-') && k !== APP_CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

async function networkFirstPage(request) {
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(APP_CACHE);
      cache.put('/index.html', response.clone());
    }
    return response;
  } catch {
    const cached = (await caches.match('/index.html')) || (await caches.match('/'));
    return cached || Response.error();
  }
}

async function cacheFirst(request) {
  const cached = await caches.match(request);
  if (cached) return cached;
  const response = await fetch(request);
  if (response.ok) {
    const cache = await caches.open(RUNTIME_CACHE);
    cache.put(request, response.clone());
  }
  return response;
}

async function staleWhileRevalidate(request) {
  const cached = await caches.match(request);
  const network = fetch(request)
    .then(async (response) => {
      if (response.ok || response.type === 'opaque') {
        const cache = await caches.open(RUNTIME_CACHE);
        cache.put(request, response.clone());
      }
      return response;
    })
    .catch(() => cached || Response.error());
  return cached || network;
}

self.addEventListener('fetch', (event) => {
  const request = event.request;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);

  if (url.origin === self.location.origin) {
    if (request.mode === 'navigate') {
      event.respondWith(networkFirstPage(request));
      return;
    }
    // Arquivos com hash no nome nunca mudam: cache primeiro (inclui o laboratório, depois da 1ª vez).
    if (url.pathname.startsWith('/assets/')) {
      event.respondWith(cacheFirst(request));
      return;
    }
    if (url.pathname === '/sw.js') return;
    event.respondWith(staleWhileRevalidate(request));
    return;
  }

  if (FONT_HOSTS.includes(url.hostname)) event.respondWith(staleWhileRevalidate(request));
});
