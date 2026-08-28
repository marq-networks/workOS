import { operationalErrorCategories, type OperationalErrorCategory, type OperationalErrorSeverity } from '../src/operations/operationalError';

interface RequestLike {
  method?: string;
  headers: Record<string, string | string[] | undefined>;
  body?: unknown;
}
interface ResponseLike {
  status(code: number): ResponseLike;
  json(body: Record<string, unknown>): void;
}
interface ValidPayload {
  eventId: string;
  timestamp: string;
  code: string;
  category: OperationalErrorCategory;
  severity: OperationalErrorSeverity;
  fingerprint: string;
  routePath: string;
  clientRelease?: string;
}

const ALLOWED_KEYS = new Set(['eventId', 'timestamp', 'code', 'category', 'severity', 'fingerprint', 'routePath', 'clientRelease']);
const bounded = (value: unknown, maximum: number) => typeof value === 'string' && value.length > 0 && value.length <= maximum;

export function validatePayload(value: unknown): ValidPayload | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
  const input = value as Record<string, unknown>;
  if (Object.keys(input).some((key) => !ALLOWED_KEYS.has(key))) return null;
  if (!bounded(input.eventId, 80) || !bounded(input.timestamp, 40) || !bounded(input.code, 64) ||
      !operationalErrorCategories.includes(input.category as OperationalErrorCategory) ||
      !['warning', 'error', 'critical'].includes(String(input.severity)) || !bounded(input.fingerprint, 80) ||
      !bounded(input.routePath, 256) || (input.clientRelease !== undefined && !bounded(input.clientRelease, 80))) return null;
  if (!/^[a-z][a-z0-9_]{0,63}$/.test(String(input.code)) || !String(input.routePath).startsWith('/') || /[?#]/.test(String(input.routePath))) return null;
  if (Number.isNaN(Date.parse(String(input.timestamp)))) return null;
  return input as unknown as ValidPayload;
}

function header(request: RequestLike, name: string): string {
  const found = request.headers[name] ?? request.headers[name.toLowerCase()];
  return Array.isArray(found) ? found[0] ?? '' : found ?? '';
}

async function validateBearer(token: string): Promise<{ id: string } | null> {
  const url = process.env.VITE_SUPABASE_URL;
  const key = process.env.VITE_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) return null;
  try {
    const response = await fetch(`${url}/auth/v1/user`, { headers: { apikey: key, Authorization: `Bearer ${token}` } });
    if (!response.ok) return null;
    const user = await response.json() as { id?: unknown };
    return bounded(user.id, 128) ? { id: user.id as string } : null;
  } catch {
    return null;
  }
}

export function createHandler(dependencies: { authenticate?: (token: string) => Promise<{ id: string } | null>; log?: (record: Record<string, unknown>) => void } = {}) {
  return async (request: RequestLike, response: ResponseLike): Promise<void> => {
    if (request.method !== 'POST') { response.status(405).json({ error: 'method_not_allowed' }); return; }
    if (!header(request, 'content-type').toLowerCase().startsWith('application/json')) { response.status(415).json({ error: 'json_required' }); return; }
    const contentLength = Number(header(request, 'content-length') || '0');
    if (contentLength > 4_096) { response.status(413).json({ error: 'payload_too_large' }); return; }
    if (JSON.stringify(request.body ?? null).length > 4_096) { response.status(413).json({ error: 'payload_too_large' }); return; }
    const match = header(request, 'authorization').match(/^Bearer ([^\s]{1,4096})$/);
    if (!match) { response.status(401).json({ error: 'authentication_required' }); return; }
    const user = await (dependencies.authenticate ?? validateBearer)(match[1]);
    if (!user) { response.status(401).json({ error: 'invalid_authentication' }); return; }
    const payload = validatePayload(request.body);
    if (!payload) { response.status(400).json({ error: 'invalid_payload' }); return; }
    const release = (process.env.VERCEL_GIT_COMMIT_SHA ?? 'local').slice(0, 80);
    (dependencies.log ?? console.error)({
      eventType: 'client_operational_error', eventId: payload.eventId, timestamp: payload.timestamp,
      severity: payload.severity, code: payload.code, category: payload.category, fingerprint: payload.fingerprint,
      routePath: payload.routePath, userId: user.id, release,
      deployment: (process.env.VERCEL_URL ?? 'local').slice(0, 160), environment: (process.env.VERCEL_ENV ?? 'local').slice(0, 20),
      ...(payload.clientRelease ? { clientRelease: payload.clientRelease } : {}),
    });
    response.status(202).json({ accepted: true, eventId: payload.eventId });
  };
}

export default createHandler();
