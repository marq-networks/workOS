import { operationalException } from './operationalError';
import { reportOperationalError } from './telemetry';

export function throwReportedServiceFailure(cause: unknown, code: string, userMessage: string): never {
  const error = operationalException(cause, { code, userMessage, category: 'server', severity: 'error', retryable: true });
  void reportOperationalError(error.operationalError).catch(() => undefined);
  throw error;
}
