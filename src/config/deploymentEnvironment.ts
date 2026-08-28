export const PRODUCTION_SUPABASE_PROJECT_REF = 'zabpmtkzqetroiwbbofh';

export type DeploymentEnvironment = 'production' | 'preview' | 'development';

export interface SupabaseEnvironmentInput {
  VERCEL_ENV?: string;
  VITE_SUPABASE_URL?: string;
  VITE_SUPABASE_PUBLISHABLE_KEY?: string;
}

export interface ValidatedSupabaseEnvironment {
  deploymentEnvironment?: DeploymentEnvironment;
  projectRef: string;
  publishableKey: string;
  url: string;
}

const SUPABASE_HOST_PATTERN = /^([a-z0-9]{20})\.supabase\.co$/;
const SECRET_KEY_PREFIX_PATTERN = /^(?:sb_secret_|supabase_secret_)/i;

export class DeploymentEnvironmentError extends Error {
  constructor(message: string) {
    super(`Deployment environment validation failed: ${message}`);
    this.name = 'DeploymentEnvironmentError';
  }
}

function deploymentEnvironment(value: string | undefined): DeploymentEnvironment | undefined {
  if (value === 'production' || value === 'preview' || value === 'development') {
    return value;
  }

  return undefined;
}

function isObviouslySecretBrowserKey(key: string): boolean {
  if (SECRET_KEY_PREFIX_PATTERN.test(key) || /service[_-]?role/i.test(key)) {
    return true;
  }

  const jwtParts = key.split('.');
  if (jwtParts.length !== 3) {
    return false;
  }

  try {
    const payload = JSON.parse(
      globalThis.atob(jwtParts[1].replace(/-/g, '+').replace(/_/g, '/')),
    ) as { role?: unknown };
    return payload.role === 'service_role';
  } catch {
    return false;
  }
}

export function validateSupabaseEnvironment(
  input: SupabaseEnvironmentInput,
): ValidatedSupabaseEnvironment {
  const vercelEnvironment = deploymentEnvironment(input.VERCEL_ENV);
  const requiresDeploymentBackend =
    vercelEnvironment === 'production' || vercelEnvironment === 'preview';
  const rawUrl = input.VITE_SUPABASE_URL?.trim();
  const publishableKey = input.VITE_SUPABASE_PUBLISHABLE_KEY?.trim();

  if (!rawUrl) {
    throw new DeploymentEnvironmentError(
      requiresDeploymentBackend
        ? `${vercelEnvironment} deployments require VITE_SUPABASE_URL; Preview requires an isolated non-production backend.`
        : 'VITE_SUPABASE_URL is required to create the browser client.',
    );
  }

  let parsedUrl: URL;
  try {
    parsedUrl = new URL(rawUrl);
  } catch {
    throw new DeploymentEnvironmentError('VITE_SUPABASE_URL must be a valid URL.');
  }

  if (parsedUrl.protocol !== 'https:') {
    throw new DeploymentEnvironmentError('VITE_SUPABASE_URL must use HTTPS.');
  }

  const hostMatch = parsedUrl.hostname.match(SUPABASE_HOST_PATTERN);
  if (!hostMatch || parsedUrl.port || parsedUrl.username || parsedUrl.password) {
    throw new DeploymentEnvironmentError(
      'VITE_SUPABASE_URL must use the canonical <project-ref>.supabase.co host.',
    );
  }

  if (!publishableKey) {
    throw new DeploymentEnvironmentError('VITE_SUPABASE_PUBLISHABLE_KEY is required.');
  }

  if (isObviouslySecretBrowserKey(publishableKey)) {
    throw new DeploymentEnvironmentError(
      'VITE_SUPABASE_PUBLISHABLE_KEY must not contain a secret or service-role credential.',
    );
  }

  const projectRef = hostMatch[1];
  if (
    vercelEnvironment === 'production' &&
    projectRef !== PRODUCTION_SUPABASE_PROJECT_REF
  ) {
    throw new DeploymentEnvironmentError(
      `production deployments must use Supabase project ${PRODUCTION_SUPABASE_PROJECT_REF}.`,
    );
  }

  if (
    vercelEnvironment === 'preview' &&
    projectRef === PRODUCTION_SUPABASE_PROJECT_REF
  ) {
    throw new DeploymentEnvironmentError(
      'Preview deployments require an isolated non-production Supabase project and must not use production.',
    );
  }

  return {
    deploymentEnvironment: vercelEnvironment,
    projectRef,
    publishableKey,
    url: parsedUrl.origin,
  };
}
