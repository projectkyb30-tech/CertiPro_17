import { Component, ErrorInfo, ReactNode } from 'react';
import { captureError } from '../monitoring';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    captureError(error, { componentStack: errorInfo.componentStack });
    this.setState({ errorInfo });
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900 p-4 text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Ceva nu a mers bine.</h1>
          <div className="bg-white dark:bg-black p-4 rounded shadow-lg text-left overflow-auto max-w-2xl w-full max-h-96">
            <p className="font-mono text-sm text-red-500 mb-2">
              {this.state.error && this.state.error.toString()}
            </p>
            <pre className="font-mono text-xs text-gray-500">
              {this.state.errorInfo && this.state.errorInfo.componentStack}
            </pre>
          </div>
          <button
            onClick={() => window.location.reload()}
            className="mt-6 px-4 py-2 bg-primary text-white rounded hover:bg-primary-dark"
          >
            Reîncarcă Pagina
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
