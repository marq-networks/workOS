export type OperationalErrorCode =
  | 'validation' | 'unauthenticated' | 'forbidden' | 'not_found'
  | 'conflict' | 'transient' | 'internal' | 'unknown';

export interface OperationalError {
  code: OperationalErrorCode;
  message: string;
  retryable: boolean;
  correlationId: string;
  operation: string;
  release: string;
  timestamp: string;
  source: 'react' | 'browser' | 'service' | 'self_test';
}

export const RELEASE = import.meta.env.VITE_VERCEL_GIT_COMMIT_SHA || 'development';

export function createOperationalError(
  operation: string,
  source: OperationalError['source'],
  error: unknown,
  overrides: Partial<Pick<OperationalError, 'code' | 'message' | 'retryable'>> = {},
): OperationalError {
  const correlationId = crypto.randomUUID();
  const fallback = error instanceof Error && error.name === 'TypeError'
    ? 'A network or application operation failed.'
    : 'An unexpected application error occurred.';
  return {
    code: overrides.code ?? 'unknown',
    message: overrides.message ?? fallback,
    retryable: overrides.retryable ?? false,
    correlationId,
    operation,
    release: RELEASE,
    timestamp: new Date().toISOString(),
    source,
  };
}
