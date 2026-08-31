import { Component, type ErrorInfo, type ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { normalizeOperationalError } from '../../operations/operationalError';
import { createEventId, reportOperationalError, type TelemetryResult } from '../../operations/telemetry';

interface Props {
  children: ReactNode;
  report?: (error: ReturnType<typeof normalizeOperationalError>, eventId: string) => Promise<TelemetryResult>;
}

interface State { hasError: boolean; eventId: string | null }

/** The root recovery boundary deliberately exposes neither exception messages nor stacks. */
export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, eventId: null };

  static getDerivedStateFromError(): Partial<State> {
    return { hasError: true };
  }

  componentDidCatch(error: Error, _info: ErrorInfo) {
    const eventId = createEventId();
    this.setState({ eventId });
    const normalized = normalizeOperationalError(error, {
      code: 'react_render_failure', category: 'unknown', severity: 'critical', retryable: true,
    });
    void (this.props.report ?? reportOperationalError)(normalized, eventId).catch(() => undefined);
    if (import.meta.env.DEV) console.error('[ErrorBoundary]', error);
  }

  private retry = () => this.setState({ hasError: false, eventId: null });
  private reload = () => window.location.reload();

  render() {
    if (!this.state.hasError) return this.props.children;
    return (
      <main className="min-h-screen bg-background grid place-items-center p-6">
        <section className="w-full max-w-md rounded-xl border border-border bg-card p-8 text-center shadow-sm" role="alert">
          <AlertTriangle className="mx-auto mb-4 h-10 w-10 text-destructive" aria-hidden="true" />
          <h1 className="text-2xl font-bold">Work OS could not continue</h1>
          <p className="mt-2 text-sm text-muted-foreground">An unexpected display error occurred. Try again or reload the page.</p>
          {this.state.eventId && <p className="mt-3 text-xs text-muted-foreground">Reference: {this.state.eventId}</p>}
          <div className="mt-6 flex justify-center gap-3">
            <button type="button" onClick={this.retry} className="rounded-md bg-primary px-4 py-2 text-primary-foreground">Try again</button>
            <button type="button" onClick={this.reload} className="flex items-center gap-2 rounded-md border px-4 py-2"><RefreshCw className="h-4 w-4" />Reload</button>
          </div>
        </section>
      </main>
    );
  }
}
