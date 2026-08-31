const codes = new Set(['validation', 'unauthenticated', 'forbidden', 'not_found', 'conflict', 'transient', 'internal', 'unknown']);
const sources = new Set(['react', 'browser', 'service', 'self_test']);
const allowedFields = new Set(['code', 'message', 'retryable', 'correlationId', 'operation', 'release', 'timestamp', 'source', 'route']);
const MAX_BODY_BYTES = 4_096;

interface RequestLike { method?: string; body?: unknown; headers?: Record<string, string | string[] | undefined> }
interface ResponseLike { status(code: number): { json(body: unknown): void } }
interface HandlerDependencies { fetch?: typeof fetch; env?: Record<string, string | undefined>; log?: (record: string) => void }

function header(request: RequestLike, name: string): string {
  const value = request.headers?.[name] ?? request.headers?.[name.toLowerCase()];
  return Array.isArray(value) ? value[0] ?? '' : value ?? '';
}

export function createOperationalErrorHandler(dependencies: HandlerDependencies = {}) {
  return async function handler(request: RequestLike, response: ResponseLike) {
    if (request.method !== 'POST') return response.status(405).json({ error: 'method_not_allowed' });
    if (!header(request, 'content-type').toLowerCase().startsWith('application/json')) {
      return response.status(415).json({ error: 'unsupported_media_type' });
    }
    const authorization = header(request, 'authorization');
    const match = /^Bearer ([^\s]+)$/.exec(authorization);
    if (!match) return response.status(401).json({ error: 'unauthorized' });

    const env = dependencies.env ?? process.env;
    const supabaseUrl = env.VITE_SUPABASE_URL;
    const publishableKey = env.VITE_SUPABASE_PUBLISHABLE_KEY;
    if (!supabaseUrl || !publishableKey) return response.status(503).json({ error: 'telemetry_unavailable' });
    try {
      const authResponse = await (dependencies.fetch ?? fetch)(`${supabaseUrl.replace(/\/$/, '')}/auth/v1/user`, {
        headers: { authorization: `Bearer ${match[1]}`, apikey: publishableKey },
      });
      if (!authResponse.ok) return response.status(401).json({ error: 'unauthorized' });
      const user = await authResponse.json() as { id?: unknown };
      if (typeof user.id !== 'string' || !user.id) return response.status(401).json({ error: 'unauthorized' });

      const value = request.body as Record<string, unknown> | null;
      if (!value || Array.isArray(value) || Buffer.byteLength(JSON.stringify(value), 'utf8') > MAX_BODY_BYTES ||
          Object.keys(value).some((key) => !allowedFields.has(key)) ||
          !codes.has(String(value.code)) || !sources.has(String(value.source)) ||
          typeof value.correlationId !== 'string' || !value.correlationId || value.correlationId.length > 128 ||
          typeof value.operation !== 'string' || !value.operation || value.operation.length > 128 ||
          typeof value.release !== 'string' || value.release.length > 128 ||
          typeof value.timestamp !== 'string' || value.timestamp.length > 64 ||
          (value.route !== undefined && (typeof value.route !== 'string' || value.route.length > 256 || !value.route.startsWith('/') || /[?#]/.test(value.route)))) {
        return response.status(400).json({ error: 'invalid_operational_error' });
      }
      const record = {
        eventType: 'client_operational_error', correlationId: value.correlationId,
        timestamp: value.timestamp, severity: value.retryable ? 'warning' : 'error', code: value.code,
        source: value.source, operation: value.operation, ...(value.route ? { route: value.route } : {}),
        userId: user.id, release: env.VERCEL_GIT_COMMIT_SHA ?? 'unknown',
        deployment: env.VERCEL_URL ?? 'unknown', environment: env.VERCEL_ENV ?? 'unknown',
      };
      (dependencies.log ?? console.error)(JSON.stringify(record));
      return response.status(202).json({ accepted: true, correlationId: value.correlationId });
    } catch {
      return response.status(401).json({ error: 'unauthorized' });
    }
  };
}

export default createOperationalErrorHandler();
