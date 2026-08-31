import { createOperationalError, type OperationalError } from './operationalError';

export interface TelemetryResult {
  accepted: boolean;
  correlationId: string;
}

interface ReporterDependencies {
  getAccessToken?: () => Promise<string | undefined>;
  fetch?: typeof fetch;
  routePath?: () => string | undefined;
  timeoutMs?: number;
}

let reporting = false;

async function currentAccessToken(): Promise<string | undefined> {
  const { supabase } = await import('../lib/supabase');
  const { data, error } = await supabase.auth.getSession();
  if (error) return undefined;
  return data.session?.access_token;
}

function safePathname(path: string | undefined): string | undefined {
  if (!path) return undefined;
  return path.split(/[?#]/, 1)[0].slice(0, 256);
}

export async function reportOperationalError(
  event: OperationalError,
  dependencies: ReporterDependencies = {},
): Promise<TelemetryResult> {
  if (reporting) return { accepted: false, correlationId: event.correlationId };
  reporting = true;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), dependencies.timeoutMs ?? 3_000);
  try {
    const token = await (dependencies.getAccessToken ?? currentAccessToken)();
    if (!token) return { accepted: false, correlationId: event.correlationId };
    const route = safePathname((dependencies.routePath ?? (() =>
      typeof window === 'undefined' ? undefined : window.location.pathname))());
    const payload = { ...event, ...(route ? { route } : {}) };
    const response = await (dependencies.fetch ?? fetch)('/api/operational-error', {
      method: 'POST',
      headers: { 'content-type': 'application/json', authorization: `Bearer ${token}` },
      body: JSON.stringify(payload),
      keepalive: true,
      signal: controller.signal,
    });
    if (!response.ok) return { accepted: false, correlationId: event.correlationId };
    const result = await response.json().catch(() => ({})) as { correlationId?: unknown };
    return {
      accepted: true,
      correlationId: typeof result.correlationId === 'string' ? result.correlationId : event.correlationId,
    };
  } catch {
    return { accepted: false, correlationId: event.correlationId };
  } finally {
    clearTimeout(timeout);
    reporting = false;
  }
}

export function captureOperationalError(
  operation: string,
  source: OperationalError['source'],
  error: unknown,
): OperationalError {
  const event = createOperationalError(operation, source, error);
  void reportOperationalError(event);
  return event;
}

type BrowserErrorTarget = Pick<EventTarget, 'addEventListener' | 'removeEventListener'>;

export function installGlobalErrorCapture(
  target: BrowserErrorTarget | undefined = typeof window === 'undefined' ? undefined : window,
  reporter: typeof captureOperationalError = captureOperationalError,
): () => void {
  if (!target) return () => undefined;
  const onError = (event: Event) => reporter('window.error', 'browser', (event as ErrorEvent).error);
  const onRejection = (event: Event) => reporter('window.unhandledrejection', 'browser', (event as PromiseRejectionEvent).reason);
  target.addEventListener('error', onError);
  target.addEventListener('unhandledrejection', onRejection);
  return () => {
    target.removeEventListener('error', onError);
    target.removeEventListener('unhandledrejection', onRejection);
  };
}
