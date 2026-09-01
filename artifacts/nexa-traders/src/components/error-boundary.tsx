import {
  Component,
  type ComponentType,
  type ErrorInfo,
  type ReactNode,
} from 'react';

export interface ErrorFallbackProps {
  error: Error;
  resetError: () => void;
}

interface ErrorBoundaryProps {
  children: ReactNode;
  FallbackComponent?: ComponentType<ErrorFallbackProps>;
  /** Changing this clears a caught error. Pass the route to recover on navigation. */
  resetKey?: unknown;
}

interface ErrorBoundaryState {
  error: Error | null;
}

function toError(value: unknown): Error {
  if (value instanceof Error) {
    return value;
  }
  if (typeof value === 'string') {
    return new Error(value);
  }
  try {
    return new Error(JSON.stringify(value));
  } catch {
    return new Error(String(value));
  }
}

function DefaultFallback({ error, resetError }: ErrorFallbackProps) {
  const handleClearCacheAndReset = () => {
    try {
      localStorage.removeItem('nexa_purchased_packages');
      localStorage.removeItem('nexa_transactions');
      localStorage.removeItem('nexa_kyc_data');
    } catch (e) {}
    resetError();
    window.location.reload();
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#070908] text-foreground p-6 font-sans">
      <div className="max-w-lg w-full text-center rounded-3xl border border-rose-500/30 bg-[#0f1412] p-8 shadow-2xl backdrop-blur-2xl">
        <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-500/10 text-rose-400 font-mono font-bold text-xl mb-4 border border-rose-500/30">
          ⚠️
        </div>
        <h1 className="text-xl font-bold text-foreground tracking-tight">
          Application Error Detected
        </h1>
        <p className="mt-2 text-xs text-muted-foreground font-mono">
          An unexpected error occurred while rendering this component.
        </p>

        <div className="mt-4 overflow-x-auto rounded-xl border border-rose-500/20 bg-rose-950/20 p-3 text-left font-mono text-[11px] text-rose-300 max-h-40">
          {error.message || String(error)}
        </div>

        <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3 font-mono text-xs">
          <button
            type="button"
            onClick={resetError}
            className="w-full sm:w-auto rounded-xl bg-primary px-5 py-2.5 font-bold text-primary-foreground hover:bg-[#f3cc68] transition-all"
          >
            Try Again
          </button>
          <button
            type="button"
            onClick={handleClearCacheAndReset}
            className="w-full sm:w-auto rounded-xl border border-white/10 bg-white/5 px-5 py-2.5 font-bold text-muted-foreground hover:text-foreground hover:border-white/20 transition-all"
          >
            Reset Session & Reload
          </button>
        </div>
      </div>
    </div>
  );
}

export class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  state: ErrorBoundaryState = { error: null };

  static getDerivedStateFromError(error: unknown): ErrorBoundaryState {
    return { error: toError(error) };
  }

  componentDidCatch(error: unknown, info: ErrorInfo): void {
    console.error(
      'ErrorBoundary caught an error:',
      toError(error),
      info.componentStack,
    );
  }

  componentDidUpdate(prevProps: ErrorBoundaryProps): void {
    if (
      this.state.error !== null &&
      prevProps.resetKey !== this.props.resetKey
    ) {
      this.resetError();
    }
  }

  resetError = (): void => {
    this.setState({ error: null });
  };

  render(): ReactNode {
    const { error } = this.state;
    if (error === null) {
      return this.props.children;
    }
    const Fallback = this.props.FallbackComponent ?? DefaultFallback;
    return <Fallback error={error} resetError={this.resetError} />;
  }
}
