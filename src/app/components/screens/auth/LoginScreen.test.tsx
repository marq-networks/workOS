import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';
import { LoginScreen } from './LoginScreen';

describe('LoginScreen', () => {
  it('renders one canonical credential login with no pre-authentication role selector', () => {
    const markup = renderToStaticMarkup(<LoginScreen onLogin={vi.fn()} onRequestPasswordReset={vi.fn()} />);

    expect(markup).toContain('Sign in to Work OS');
    expect(markup).toContain('type="email"');
    expect(markup).toContain('type="password"');
    expect(markup).toContain('Forgot password?');
    expect(markup).toContain('organization membership after sign-in');
    expect(markup).not.toContain('Select your role');
    expect(markup).not.toContain('Employee');
    expect(markup).not.toContain('Org Admin');
    expect(markup).not.toContain('Platform Admin');
    expect(markup).not.toContain('platform@workos.io');
    expect(markup).not.toContain('platform123');
    expect(markup).not.toContain('Demo Credentials');
  });
});
