import { describe, expect, it } from 'vitest';
import { normalizeOperationalError } from './operationalError';

describe('operational error normalization', () => {
  it('normalizes unknown thrown values without exposing internal details', () => {
    const normalized = normalizeOperationalError({ password: 'do-not-log', detail: 'database exploded' });
    expect(normalized.code).toBe('unexpected_error');
    expect(normalized.userMessage).toBe('Something went wrong. Please try again.');
    expect(JSON.stringify(normalized)).not.toContain('database exploded');
    expect(JSON.stringify(normalized)).not.toContain('do-not-log');
  });
});

