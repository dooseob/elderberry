/**
 * ErrorBoundary - React Error Boundary for catching infinite loops and other errors
 * 
 * @version 1.0.0
 * @author DEBUG_AGENT
 */

import React from 'react';
import { AlertCircle, RotateCcw } from 'lucide-react';
import { Button } from '../shared/ui';

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
  errorCount: number;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<{ error: Error; retry: () => void }>;
  maxErrors?: number;
}

/**
 * Error Boundary to catch infinite rendering loops and other React errors
 */
export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  private retryTimeoutId: NodeJS.Timeout | null = null;

  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorCount: 0,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('🚨 ErrorBoundary caught an error:', error);
    console.error('Error Info:', errorInfo);
    
    // Check for potential infinite loop indicators
    if (
      error.message.includes('Maximum update depth exceeded') ||
      error.message.includes('Too many re-renders') ||
      this.state.errorCount > (this.props.maxErrors || 3)
    ) {
      console.error('🔄 Infinite loop detected! Stopping auto-retry.');
    }

    this.setState(prevState => ({
      errorInfo,
      errorCount: prevState.errorCount + 1,
    }));
  }

  handleRetry = () => {
    // Clear any existing timeout
    if (this.retryTimeoutId) {
      clearTimeout(this.retryTimeoutId);
    }

    // Add a small delay to prevent immediate re-error
    this.retryTimeoutId = setTimeout(() => {
      this.setState({
        hasError: false,
        error: null,
        errorInfo: null,
      });
    }, 100);
  };

  componentWillUnmount() {
    if (this.retryTimeoutId) {
      clearTimeout(this.retryTimeoutId);
    }
  }

  render() {
    if (this.state.hasError && this.state.error) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        const FallbackComponent = this.props.fallback;
        return <FallbackComponent error={this.state.error} retry={this.handleRetry} />;
      }

      // Default error UI
      return (
        <div className="min-h-screen flex items-center justify-center bg-[var(--linear-color-surface-modal)]">
          <div className="max-w-md mx-auto p-6 bg-white rounded-[var(--linear-radius-large)] shadow-lg border border-[var(--linear-color-border-subtle)]">
            <div className="flex items-center gap-3 mb-4">
              <AlertCircle className="w-6 h-6 text-red-500" />
              <h2 className="text-lg font-semibold text-[var(--linear-color-text-primary)]">
                Something went wrong
              </h2>
            </div>
            
            <p className="text-sm text-[var(--linear-color-text-secondary)] mb-4">
              {this.state.errorCount > (this.props.maxErrors || 3)
                ? 'Multiple errors detected. Please refresh the page.'
                : 'An unexpected error occurred. You can try again or refresh the page.'}
            </p>
            
            {import.meta.env.MODE === 'development' && (
              <details className="mb-4 p-3 bg-gray-50 rounded text-xs font-mono">
                <summary className="cursor-pointer text-gray-600 mb-2">
                  Error Details (Development)
                </summary>
                <pre className="whitespace-pre-wrap text-red-600">
                  {this.state.error.message}
                  {this.state.errorInfo?.componentStack}
                </pre>
              </details>
            )}
            
            <div className="flex gap-2">
              {this.state.errorCount <= (this.props.maxErrors || 3) && (
                <Button
                  onClick={this.handleRetry}
                  variant="primary"
                  size="sm"
                  className="flex items-center gap-2"
                >
                  <RotateCcw className="w-4 h-4" />
                  Try Again
                </Button>
              )}
              
              <Button
                onClick={() => window.location.reload()}
                variant="outline"
                size="sm"
              >
                Refresh Page
              </Button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

/**
 * HOC to wrap components with ErrorBoundary
 */
export const withErrorBoundary = <P extends object>(
  Component: React.ComponentType<P>,
  errorBoundaryProps?: Omit<ErrorBoundaryProps, 'children'>
) => {
  return React.forwardRef<any, P>((props, ref) => (
    <ErrorBoundary {...errorBoundaryProps}>
      <Component {...props} ref={ref} />
    </ErrorBoundary>
  ));
};