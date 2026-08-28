import { normalizeOperationalError } from './operationalError';
import { reportOperationalError, type TelemetryResult } from './telemetry';

type Reporter = (error: ReturnType<typeof normalizeOperationalError>) => Promise<TelemetryResult>;
const recent = new Map<string, number>();
let cleanupInstalled: (() => void) | null = null;

export function installGlobalErrorCapture(target: Window = window, reporter: Reporter = reportOperationalError): () => void {
  if (cleanupInstalled) return cleanupInstalled;
  const report = (value: unknown, code: string) => {
    const normalized = normalizeOperationalError(value, { code, category: 'unknown', severity: 'error' });
    const now = Date.now();
    const previous = recent.get(normalized.fingerprint) ?? 0;
    if (now - previous < 5_000) return;
    recent.set(normalized.fingerprint, now);
    void reporter(normalized).catch(() => undefined);
  };
  const onError = (event: ErrorEvent) => report(event.error ?? event.message, 'uncaught_browser_error');
  const onRejection = (event: PromiseRejectionEvent) => report(event.reason, 'unhandled_promise_rejection');
  target.addEventListener('error', onError);
  target.addEventListener('unhandledrejection', onRejection);
  cleanupInstalled = () => {
    target.removeEventListener('error', onError);
    target.removeEventListener('unhandledrejection', onRejection);
    cleanupInstalled = null;
    recent.clear();
  };
  return cleanupInstalled;
}

