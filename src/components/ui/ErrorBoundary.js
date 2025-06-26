// components/ui/ErrorBoundary.js
import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Log error details
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    // Update state with error info
    this.setState({
      error,
      errorInfo
    });

    // Call onError prop if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        if (typeof this.props.fallback === 'function') {
          return this.props.fallback(this.state.error, this.state.errorInfo);
        }
        return this.props.fallback;
      }

      // Default fallback UI
      return (
        <div className="error-boundary-fallback p-6 bg-red-50 border border-red-200 rounded-lg">
          <h2 className="text-lg font-semibold text-red-800 mb-2">
            Algo deu errado
          </h2>
          <p className="text-red-600 mb-4">
            Ocorreu um erro inesperado. Tente recarregar a página.
          </p>
          
          {process.env.NODE_ENV === 'development' && (
            <details className="text-sm">
              <summary className="cursor-pointer font-medium text-red-700 mb-2">
                Detalhes técnicos (desenvolvimento)
              </summary>
              
              <div className="bg-red-100 p-3 rounded border text-red-800">
                <div className="mb-2">
                  <strong>Erro:</strong>
                  <pre className="mt-1 text-xs overflow-auto">
                    {this.state.error && this.state.error.toString()}
                  </pre>
                </div>
                  <div>
                  <strong>Stack Trace:</strong>
                  <pre className="mt-1 text-xs overflow-auto">
                    {this.state.errorInfo && this.state.errorInfo.componentStack}
                  </pre>
                </div>
              </div>
            </details>
          )}

          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
          >
            Recarregar Página
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
