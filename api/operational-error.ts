const codes = new Set(['validation', 'unauthenticated', 'forbidden', 'not_found', 'conflict', 'transient', 'internal', 'unknown']);
const sources = new Set(['react', 'browser', 'service', 'self_test']);

export default function handler(request: { method?: string; body?: unknown }, response: { status(code: number): { json(body: unknown): void } }) {
  if (request.method !== 'POST') return response.status(405).json({ error: 'method_not_allowed' });
  const value = request.body as Record<string, unknown> | null;
  if (!value || !codes.has(String(value.code)) || !sources.has(String(value.source)) ||
      typeof value.correlationId !== 'string' || typeof value.operation !== 'string' ||
      typeof value.release !== 'string' || typeof value.timestamp !== 'string') {
    return response.status(400).json({ error: 'invalid_operational_error' });
  }
  console.error(JSON.stringify({
    type: 'operational_error', code: value.code, retryable: Boolean(value.retryable),
    correlationId: value.correlationId.slice(0, 128), operation: value.operation.slice(0, 128),
    release: value.release.slice(0, 128), timestamp: value.timestamp, source: value.source,
  }));
  return response.status(202).json({ accepted: true, correlationId: value.correlationId });
}
