import { Component, ErrorInfo, ReactNode } from 'react';
import { Button } from '@/components/ui';
import { checkApiHealth } from '@/lib/apiClient';
import { reportClientIncident } from '@/lib/incidentReporter';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  message: string;
  apiOnline: boolean | null;
}

export class ApiErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, message: '', apiOnline: null };

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, message: error.message };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('Dashboard error:', error, info.componentStack);
    void reportClientIncident({
      title: 'React error boundary triggered',
      severity: 'high',
      errorMessage: error.message,
      stackTrace: `${error.stack ?? ''}\n${info.componentStack ?? ''}`,
      source: 'ApiErrorBoundary',
    });
    checkApiHealth().then((ok) => this.setState({ apiOnline: ok }));
  }

  handleRetry = () => {
    this.setState({ hasError: false, message: '', apiOnline: null });
    window.location.reload();
  };

  render() {
    if (!this.state.hasError) {
      return this.props.children;
    }

    return (
      <div className="flex min-h-[50vh] items-center justify-center p-6">
        <div className="max-w-md rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-lg dark:border-slate-700 dark:bg-slate-900">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Something went wrong</h2>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">{this.state.message}</p>
          {this.state.apiOnline === false && (
            <p className="mt-3 text-sm text-amber-600 dark:text-amber-400">
              Backend is not reachable. Run <code className="text-xs">npm run dev</code> in the{' '}
              <code className="text-xs">backend</code> folder.
            </p>
          )}
          <Button className="mt-6" onClick={this.handleRetry}>
            Reload page
          </Button>
        </div>
      </div>
    );
  }
}
