import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';
import { LoginScreen } from './LoginScreen';

describe('LoginScreen', () => {
  it('is the canonical signed-out entry and does not offer browser role selection', () => {
    const markup = renderToStaticMarkup(<LoginScreen onLogin={vi.fn()} onRequestPasswordReset={vi.fn()} />);
    expect(markup).toContain('Sign in to Work OS');
    expect(markup).toContain('validated organization membership');
    expect(markup).toContain('Forgot password?');
    expect(markup).not.toContain('Select your role to sign in');
    expect(markup).not.toContain('Personal Workspace');
    expect(markup).not.toContain('Organization Control Center');
    expect(markup).not.toContain('Platform Console');
    expect(markup).not.toContain('Back to role selection');
    expect(markup).not.toContain('platform@workos.io');
    expect(markup).not.toContain('platform123');
    expect(markup).not.toContain('Demo Credentials');
  });
});
