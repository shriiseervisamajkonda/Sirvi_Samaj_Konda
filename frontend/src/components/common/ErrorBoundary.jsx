import React from 'react';
import { FiAlertTriangle, FiRefreshCw } from 'react-icons/fi';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Uncaught Error in UI Component:', error, errorInfo);
  }

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-[#0d0905] text-[#f4e8d1] p-6">
          <div className="max-w-md w-full text-center bg-[#18110a] border border-[#d4af37]/30 rounded-2xl p-8 shadow-2xl">
            <div className="w-16 h-16 bg-[#d4af37]/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-[#d4af37]/40">
              <FiAlertTriangle className="text-3xl text-[#d4af37]" />
            </div>
            <h2 className="text-2xl font-bold text-[#f4e8d1] mb-2 font-serif">
              Something went wrong
            </h2>
            <p className="text-sm text-[#c5b598] mb-6 leading-relaxed">
              We encountered an unexpected issue while loading this page. Please try refreshing the portal.
            </p>
            <button
              onClick={this.handleReload}
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-[#d4af37] text-[#0d0905] font-semibold rounded-xl hover:bg-[#e6c250] transition-colors shadow-lg"
            >
              <FiRefreshCw className="text-lg" />
              Reload Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
