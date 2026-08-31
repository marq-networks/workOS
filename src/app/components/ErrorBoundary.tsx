/**
 * ═══════════════════════════════════════════════════════════════════════════
 * ERROR BOUNDARY — Global React Error Catch
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * Wraps the entire app to catch render-time errors. Without this, any
 * uncaught component exception unmounts the entire app silently.
 *
 * Phase 14 gap closure — added to App.tsx root.
 * ═══════════════════════════════════════════════════════════════════════════
 */

import { Component, type ReactNode, type ErrorInfo } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { captureOperationalError } from '../../observability/telemetry';

interface Props {
  children: ReactNode;
  /** Optional fallback UI — defaults to the built-in recovery screen */
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  correlationId: string | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null, correlationId: null };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    const event = captureOperationalError('react.root', 'react', error);
    this.setState({ errorInfo, correlationId: event.correlationId });
  }

  handleReload = () => {
    window.location.reload();
  };

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null, correlationId: null });
  };

  render() {
    if (!this.state.hasError) {
      return this.props.children;
    }

    if (this.props.fallback) {
      return this.props.fallback;
    }

    const { correlationId } = this.state;

    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <div className="w-full max-w-lg">
          {/* Icon + Heading */}
          <div className="flex flex-col items-center text-center mb-8">
            <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mb-4">
              <AlertTriangle className="h-8 w-8 text-destructive" />
            </div>
            <h1 className="text-2xl font-bold mb-2">Something went wrong</h1>
            <p className="text-muted-foreground text-sm max-w-sm">
              An unexpected error occurred in the WorkOS interface.
              Your data is safe — this is a display error only.
            </p>
          </div>

          {correlationId && (
            <div className="bg-destructive/5 border border-destructive/20 rounded-lg p-4 mb-4">
              <p className="text-sm text-muted-foreground">Reference ID</p>
              <p className="text-sm font-mono break-all">{correlationId}</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-col gap-3 mb-4">
            <button
              onClick={this.handleReset}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
            >
              Try Again
            </button>
            <button
              onClick={this.handleReload}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-card border border-border rounded-lg hover:bg-accent transition-colors text-sm"
            >
              <RefreshCw className="h-4 w-4" />
              Reload Page
            </button>
          </div>

        </div>
      </div>
    );
  }
}
