import { Component, type ErrorInfo, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  err: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { err: null };

  static getDerivedStateFromError(err: Error): State {
    return { err };
  }

  componentDidCatch(err: Error, info: ErrorInfo): void {
    console.error(err, info.componentStack);
  }

  render(): ReactNode {
    if (this.state.err) {
      return (
        <div className="rg-error-fallback rg-panel">
          <h2>Something shorted in the bay</h2>
          <p>
            The garage tools hit an unexpected fault. Refresh the page to
            reboot the console — your save in this browser should still be
            there.
          </p>
          <p style={{ color: 'var(--rg-muted)', fontSize: '0.9rem' }}>
            Need a clean slate? Use <strong>Reset progress</strong> from the
            header after reload — that wipes this site&apos;s saved garage data
            on purpose.
          </p>
          <p style={{ color: 'var(--rg-muted)', fontSize: '0.9rem' }}>
            {this.state.err.message}
          </p>
          <button
            type="button"
            className="rg-btn rg-btn-primary"
            onClick={() => window.location.reload()}
          >
            Reload
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
