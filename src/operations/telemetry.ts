import type { OperationalError } from './operationalError';

export interface OperationalTelemetryPayload {
  eventId: string;
  timestamp: string;
  code: string;
  category: OperationalError['category'];
  severity: OperationalError['severity'];
  fingerprint: string;
  routePath: string;
  clientRelease?: string;
}

export interface TelemetryResult { accepted: boolean; eventId: string }
type Dependencies = { getAccessToken: () => Promise<string | null>; fetch: typeof fetch; pathname: () => string; release?: string };

const defaultDependencies: Dependencies = {
  getAccessToken: async () => {
    const { supabase } = await import('../lib/supabase');
    return (await supabase.auth.getSession()).data.session?.access_token ?? null;
  },
  fetch: globalThis.fetch.bind(globalThis),
  pathname: () => window.location.pathname,
  release: import.meta.env.VITE_RELEASE_ID,
};

let reporting = false;

export function createEventId(): string {
  return globalThis.crypto?.randomUUID?.() ?? `oe-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export function createTelemetryReporter(dependencies: Dependencies = defaultDependencies) {
  return async (error: OperationalError, suppliedEventId = createEventId()): Promise<TelemetryResult> => {
    if (reporting) return { accepted: false, eventId: suppliedEventId };
    reporting = true;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 3_000);
    try {
      const token = await dependencies.getAccessToken();
      if (!token) return { accepted: false, eventId: suppliedEventId };
      const payload: OperationalTelemetryPayload = {
        eventId: suppliedEventId,
        timestamp: new Date().toISOString(),
        code: error.code,
        category: error.category,
        severity: error.severity,
        fingerprint: error.fingerprint,
        routePath: dependencies.pathname().split(/[?#]/, 1)[0] || '/',
        ...(dependencies.release ? { clientRelease: dependencies.release.slice(0, 80) } : {}),
      };
      const response = await dependencies.fetch('/api/operational-error', {
        method: 'POST',
        headers: { 'content-type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });
      return { accepted: response.ok, eventId: suppliedEventId };
    } catch (diagnostic) {
      if (import.meta.env.DEV) console.warn('[operational-telemetry] report failed', diagnostic);
      return { accepted: false, eventId: suppliedEventId };
    } finally {
      clearTimeout(timeout);
      reporting = false;
    }
  };
}

export const reportOperationalError = createTelemetryReporter();
