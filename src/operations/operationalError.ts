export const operationalErrorCategories = ['authentication', 'authorization', 'validation', 'network', 'conflict', 'not_found', 'server', 'unknown'] as const;
export type OperationalErrorCategory = typeof operationalErrorCategories[number];
export type OperationalErrorSeverity = 'warning' | 'error' | 'critical';

export interface OperationalError {
  code: string;
  category: OperationalErrorCategory;
  severity: OperationalErrorSeverity;
  userMessage: string;
  retryable: boolean;
  causeName?: string;
  fingerprint: string;
}

export class OperationalErrorException extends Error {
  readonly operationalError: OperationalError;
  constructor(operationalError: OperationalError) {
    super(operationalError.userMessage);
    this.name = 'OperationalErrorException';
    this.operationalError = operationalError;
  }
}

const SAFE_MESSAGE = 'Something went wrong. Please try again.';
const CODE_PATTERN = /^[a-z][a-z0-9_]{0,63}$/;

function stableFingerprint(code: string, category: string, causeName: string): string {
  const value = `${code}:${category}:${causeName}`;
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return `oe_${(hash >>> 0).toString(16).padStart(8, '0')}`;
}

export function createOperationalError(input: Omit<OperationalError, 'fingerprint'> & { fingerprint?: string }): OperationalError {
  const code = CODE_PATTERN.test(input.code) ? input.code : 'unexpected_error';
  const causeName = input.causeName?.slice(0, 64);
  return {
    code,
    category: operationalErrorCategories.includes(input.category) ? input.category : 'unknown',
    severity: input.severity,
    userMessage: input.userMessage.slice(0, 160) || SAFE_MESSAGE,
    retryable: input.retryable,
    ...(causeName ? { causeName } : {}),
    fingerprint: (input.fingerprint ?? stableFingerprint(code, input.category, causeName ?? 'unknown')).slice(0, 80),
  };
}

export function normalizeOperationalError(thrown: unknown, overrides: Partial<Pick<OperationalError, 'code' | 'category' | 'severity' | 'retryable' | 'userMessage'>> = {}): OperationalError {
  if (thrown instanceof OperationalErrorException) return thrown.operationalError;
  const causeName = thrown instanceof Error ? thrown.name : typeof thrown;
  return createOperationalError({
    code: overrides.code ?? 'unexpected_error',
    category: overrides.category ?? 'unknown',
    severity: overrides.severity ?? 'error',
    retryable: overrides.retryable ?? true,
    userMessage: overrides.userMessage ?? SAFE_MESSAGE,
    causeName,
  });
}

export function operationalException(thrown: unknown, overrides: Parameters<typeof normalizeOperationalError>[1]): OperationalErrorException {
  return new OperationalErrorException(normalizeOperationalError(thrown, overrides));
}
