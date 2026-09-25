import { describe, expect, it } from 'vitest';
import { PostHogAnalytics, type FetchInit } from './PostHogAnalytics';

type Call = { url: string; init: FetchInit };

function recorder() {
  const calls: Call[] = [];
  const fetchFn = (url: string, init: FetchInit) => {
    calls.push({ url, init });
    return Promise.resolve({});
  };
  return { calls, fetchFn };
}

describe('PostHogAnalytics', () => {
  it('envia o evento para a API de captura com as props, sem perfil de pessoa e sem geolocalização', () => {
    const { calls, fetchFn } = recorder();
    const analytics = new PostHogAnalytics({ apiKey: 'phc_teste', host: 'https://us.i.posthog.com/', fetchFn, sessionId: 'sessao-1' });

    analytics.track('module_left', { island: 'logica', module: 'variaveis', percent: 40 });

    expect(calls).toHaveLength(1);
    expect(calls[0].url).toBe('https://us.i.posthog.com/i/v0/e/');
    const body = JSON.parse(String(calls[0].init.body));
    expect(body).toMatchObject({
      api_key: 'phc_teste',
      event: 'module_left',
      distinct_id: 'sessao-1',
      properties: {
        island: 'logica',
        module: 'variaveis',
        percent: 40,
        $process_person_profile: false,
        $geoip_disable: true,
      },
    });
  });

  it('não usa cookies nem pede preflight de CORS, e sobrevive ao fechamento da aba', () => {
    const { calls, fetchFn } = recorder();
    new PostHogAnalytics({ apiKey: 'k', host: 'https://eu.i.posthog.com', fetchFn }).track('page_view');
    expect(calls[0].init).toMatchObject({
      method: 'POST',
      credentials: 'omit',
      keepalive: true,
      headers: { 'Content-Type': 'text/plain' },
    });
  });

  it('usa o mesmo id anônimo em todos os eventos da mesma aba, e um id novo em outra', () => {
    const { calls, fetchFn } = recorder();
    const a = new PostHogAnalytics({ apiKey: 'k', host: 'https://h', fetchFn });
    a.track('page_view');
    a.track('lab_opened');
    const b = new PostHogAnalytics({ apiKey: 'k', host: 'https://h', fetchFn });
    b.track('page_view');
    const ids = calls.map((c) => JSON.parse(String(c.init.body)).distinct_id);
    expect(ids[0]).toBe(ids[1]);
    expect(ids[2]).not.toBe(ids[0]);
  });

  it('nunca lança erro, nem com a rede fora do ar', async () => {
    const failing = new PostHogAnalytics({ apiKey: 'k', host: 'https://h', fetchFn: () => Promise.reject(new Error('offline')) });
    expect(() => failing.track('page_view')).not.toThrow();
    const throwing = new PostHogAnalytics({
      apiKey: 'k',
      host: 'https://h',
      fetchFn: () => {
        throw new Error('sem fetch');
      },
    });
    expect(() => throwing.track('page_view')).not.toThrow();
    await Promise.resolve();
  });
});
