import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

describe('Platform Admin monitoring self-test', () => {
  it('uses the normal telemetry pipeline without crashing the console', () => {
    const source = readFileSync(new URL('./S01Console.tsx', import.meta.url), 'utf8');
    expect(source).toContain("code: 'monitoring_self_test'");
    expect(source).toContain('reportOperationalError(createOperationalError');
    expect(source).toContain('Send test event');
    expect(source).not.toContain('throw new Error');
  });
});
