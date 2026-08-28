import { describe, expect, it } from 'vitest';
import {
  PRODUCTION_SUPABASE_PROJECT_REF,
  validateSupabaseEnvironment,
} from './deploymentEnvironment';

const publishableKey = 'sb_publishable_test_fixture_not_a_credential';
const productionUrl = `https://${PRODUCTION_SUPABASE_PROJECT_REF}.supabase.co`;
const previewUrl = 'https://abcdefghijklmnopqrst.supabase.co';

describe('deployment environment policy', () => {
  it('allows production only with the locked production project', () => {
    expect(
      validateSupabaseEnvironment({
        VERCEL_ENV: 'production',
        VITE_SUPABASE_URL: productionUrl,
        VITE_SUPABASE_PUBLISHABLE_KEY: publishableKey,
      }).projectRef,
    ).toBe(PRODUCTION_SUPABASE_PROJECT_REF);
  });

  it.each([
    ['a wrong project', previewUrl, publishableKey],
    ['a malformed URL', 'not-a-url', publishableKey],
    ['a missing URL', undefined, publishableKey],
    ['a missing publishable key', productionUrl, undefined],
  ])('rejects production with %s', (_case, url, key) => {
    expect(() =>
      validateSupabaseEnvironment({
        VERCEL_ENV: 'production',
        VITE_SUPABASE_URL: url,
        VITE_SUPABASE_PUBLISHABLE_KEY: key,
      }),
    ).toThrow('Deployment environment validation failed');
  });

  it('rejects production Supabase in Preview', () => {
    expect(() =>
      validateSupabaseEnvironment({
        VERCEL_ENV: 'preview',
        VITE_SUPABASE_URL: productionUrl,
        VITE_SUPABASE_PUBLISHABLE_KEY: publishableKey,
      }),
    ).toThrow('Preview deployments require an isolated non-production Supabase project');
  });

  it('allows an isolated non-production Supabase project in Preview', () => {
    expect(
      validateSupabaseEnvironment({
        VERCEL_ENV: 'preview',
        VITE_SUPABASE_URL: previewUrl,
        VITE_SUPABASE_PUBLISHABLE_KEY: publishableKey,
      }).projectRef,
    ).toBe('abcdefghijklmnopqrst');
  });

  it('fails Preview closed when backend configuration is missing', () => {
    expect(() => validateSupabaseEnvironment({ VERCEL_ENV: 'preview' })).toThrow(
      'Preview requires an isolated non-production backend',
    );
  });

  it.each([
    'sb_secret_test_fixture',
    'a-service_role-key',
    'header.eyJyb2xlIjoic2VydmljZV9yb2xlIn0.signature',
  ])(
    'rejects an obviously secret browser credential: %s',
    (key) => {
      expect(() =>
        validateSupabaseEnvironment({
          VITE_SUPABASE_URL: previewUrl,
          VITE_SUPABASE_PUBLISHABLE_KEY: key,
        }),
      ).toThrow('must not contain a secret or service-role credential');
    },
  );

  it('does not apply deployment identity checks without VERCEL_ENV', () => {
    expect(
      validateSupabaseEnvironment({
        VITE_SUPABASE_URL: previewUrl,
        VITE_SUPABASE_PUBLISHABLE_KEY: publishableKey,
      }).deploymentEnvironment,
    ).toBeUndefined();
  });

  it.each([
    'http://abcdefghijklmnopqrst.supabase.co',
    'https://example.com',
    'https://short.supabase.co',
  ])('rejects a non-canonical Supabase URL: %s', (url) => {
    expect(() =>
      validateSupabaseEnvironment({
        VITE_SUPABASE_URL: url,
        VITE_SUPABASE_PUBLISHABLE_KEY: publishableKey,
      }),
    ).toThrow('Deployment environment validation failed');
  });
});
