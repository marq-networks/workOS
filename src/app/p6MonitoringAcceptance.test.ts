import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const appSource = readFileSync(new URL('./App.tsx', import.meta.url), 'utf8');
const boundarySource = readFileSync(new URL('./components/ErrorBoundary.tsx', import.meta.url), 'utf8');
const consoleSource = readFileSync(new URL('./components/screens/super/S01Console.tsx', import.meta.url), 'utf8');
const healthSource = readFileSync(new URL('./components/screens/super/S06SystemHealth.tsx', import.meta.url), 'utf8');

describe('P6-4 application wiring', () => {
  it('places the root error boundary outside authentication bootstrap', () => {
    expect(appSource).toContain('return <ErrorBoundary><AuthProvider><AuthEntry /></AuthProvider></ErrorBoundary>');
  });

  it('keeps raw exception messages and stacks out of the recovery fallback', () => {
    expect(boundarySource).not.toContain('error.message');
    expect(boundarySource).not.toContain('componentStack}');
    expect(boundarySource).toContain('Reference ID');
  });

  it('uses the normal telemetry reporter only on the canonical Platform Admin console', () => {
    expect(consoleSource).toContain("reportOperationalError(event)");
    expect(consoleSource).toContain("createOperationalError('monitoring_self_test'");
    expect(consoleSource).toContain('Operational Monitoring');
    expect(healthSource).not.toContain('reportOperationalError');
  });
});
