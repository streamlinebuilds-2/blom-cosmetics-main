import React from 'react';

type Props = { children: React.ReactNode };
type State = { hasError: boolean; error?: Error };

export default class ErrorBoundary extends React.Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    // Log detailed diagnostics to console
    console.error('[Account ErrorBoundary]', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: 24 }}>
          <h1 style={{ fontWeight: 700, marginBottom: 12 }}>Account page crashed</h1>
          <pre style={{ whiteSpace: 'pre-wrap', color: '#b91c1c' }}>{String(this.state.error)}</pre>
          {this.state.error?.stack && (
            <details style={{ marginTop: 12 }} open>
              <summary style={{ cursor: 'pointer' }}>Stack trace</summary>
              <pre style={{ whiteSpace: 'pre-wrap' }}>{this.state.error.stack}</pre>
            </details>
          )}
        </div>
      );
    }
    return this.props.children;
  }
}


