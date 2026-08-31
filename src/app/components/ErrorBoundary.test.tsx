import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';
import { ErrorBoundary } from './ErrorBoundary';

describe('root ErrorBoundary', () => {
  it('turns a controlled child render exception into a safe reported fallback', () => {
    const internal = 'raw database password=secret';
    const ThrowingChild = () => { throw new Error(internal); };
    expect(() => ThrowingChild()).toThrow(internal);
    const report = vi.fn().mockResolvedValue({ accepted: true, eventId: 'event-safe' });
    const boundary = new ErrorBoundary({ children: <ThrowingChild />, report });
    boundary.state = { hasError: true, eventId: 'event-safe' };
    boundary.componentDidCatch(new Error(internal), { componentStack: '\n at ThrowingChild' });
    const markup = renderToStaticMarkup(boundary.render());
    expect(markup).toContain('Work OS could not continue');
    expect(markup).toContain('Try again');
    expect(markup).toContain('Reload');
    expect(markup).toContain('event-safe');
    expect(markup).not.toContain(internal);
    expect(markup).not.toContain('ThrowingChild');
    expect(report).toHaveBeenCalledOnce();
  });
});

