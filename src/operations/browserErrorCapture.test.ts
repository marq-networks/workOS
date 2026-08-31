import { describe, expect, it, vi } from 'vitest';
import { installGlobalErrorCapture } from './browserErrorCapture';

describe('global browser error capture', () => {
  it('reports errors and rejections, deduplicates repeats, and cleans up', async () => {
    const target = new EventTarget();
    const report = vi.fn().mockResolvedValue({ accepted: true, eventId: 'event' });
    const cleanup = installGlobalErrorCapture(target as Window, report);
    const error = new Event('error'); Object.defineProperties(error, { error: { value: new Error('same') }, message: { value: 'same' } });
    target.dispatchEvent(error); target.dispatchEvent(error);
    const rejection = new Event('unhandledrejection'); Object.defineProperty(rejection, 'reason', { value: new Error('promise') });
    target.dispatchEvent(rejection);
    await Promise.resolve();
    expect(report).toHaveBeenCalledTimes(2);
    expect(report.mock.calls.map(([value]) => value.code)).toEqual(['uncaught_browser_error', 'unhandled_promise_rejection']);
    cleanup(); target.dispatchEvent(error);
    expect(report).toHaveBeenCalledTimes(2);
  });
});

