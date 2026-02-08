import { Component } from 'react';

/**
 * Catches React render errors so the app doesn’t go blank; shows a fallback and keeps layout visible.
 */
class ErrorBoundary extends Component {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    console.error('ErrorBoundary caught:', error, info?.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[40vh] flex flex-col items-center justify-center p-8 text-center">
          <p className="text-slate-700 font-medium mb-2">Something went wrong</p>
          <p className="text-slate-500 text-sm mb-4">Try refreshing the page.</p>
          <button
            type="button"
            onClick={() => this.setState({ hasError: false })}
            className="px-4 py-2 rounded-xl bg-[#4FC3F7]/20 text-slate-700 hover:bg-[#4FC3F7]/30"
          >
            Try again
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
