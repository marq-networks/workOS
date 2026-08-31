import { createOperationalError, type OperationalError } from './operationalError';

export async function reportOperationalError(event: OperationalError): Promise<void> {
  try {
    await fetch('/api/operational-error', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(event),
      keepalive: true,
    });
  } catch {
    // Telemetry must never cause a second application failure.
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

export function installGlobalErrorCapture(): () => void {
  const onError = (event: ErrorEvent) => captureOperationalError('window.error', 'browser', event.error);
  const onRejection = (event: PromiseRejectionEvent) => captureOperationalError('window.unhandledrejection', 'browser', event.reason);
  window.addEventListener('error', onError);
  window.addEventListener('unhandledrejection', onRejection);
  return () => {
    window.removeEventListener('error', onError);
    window.removeEventListener('unhandledrejection', onRejection);
  };
}
