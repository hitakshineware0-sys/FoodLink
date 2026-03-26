import React, { ErrorInfo, ReactNode } from 'react';
import { AlertCircle, RefreshCcw } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
  public state: State;
  public props: Props;

  constructor(props: Props) {
    super(props);
    this.props = props;
    this.state = {
      hasError: false,
      error: null
    };
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    const { children } = this.props;
    if (this.state.hasError) {
      let errorMessage = 'An unexpected error occurred.';
      
      try {
        // Check if it's a Firestore permission error (JSON string)
        if (this.state.error?.message.startsWith('{')) {
          const errorData = JSON.parse(this.state.error.message);
          if (errorData.error.includes('Missing or insufficient permissions')) {
            errorMessage = 'You do not have permission to access this data. Please ensure you are signed in with the correct account.';
          }
        }
      } catch (e) {
        // Fallback to default message
      }

      return (
        <div className="min-h-[400px] flex flex-col items-center justify-center p-8 text-center">
          <div className="bg-red-50 p-6 rounded-[2.5rem] max-w-md border border-red-100 shadow-sm">
            <div className="bg-red-100 w-16 h-16 rounded-2xl flex items-center justify-center text-red-600 mx-auto mb-6">
              <AlertCircle size={32} />
            </div>
            <h2 className="text-2xl font-black text-gray-900 mb-4">Something went wrong</h2>
            <p className="text-gray-600 mb-8 leading-relaxed">
              {errorMessage}
            </p>
            <button
              onClick={() => window.location.reload()}
              className="flex items-center gap-2 bg-primary text-white px-8 py-3 rounded-2xl font-bold shadow-lg hover:bg-primary-dark transition-all mx-auto"
            >
              <RefreshCcw size={20} />
              Reload Application
            </button>
          </div>
        </div>
      );
    }

    return children;
  }
}
