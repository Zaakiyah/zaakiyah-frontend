import { Component } from 'react';
import type { ErrorInfo, ReactNode } from 'react';
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import Button from './ui/Button';

interface Props {
	children: ReactNode;
}

interface State {
	hasError: boolean;
	error: Error | null;
}

export default class ErrorBoundary extends Component<Props, State> {
	constructor(props: Props) {
		super(props);
		this.state = { hasError: false, error: null };
	}

	static getDerivedStateFromError(error: Error): State {
		return { hasError: true, error };
	}

	componentDidCatch(error: Error, errorInfo: ErrorInfo) {
		if (import.meta.env.DEV) {
			console.error('ErrorBoundary caught an error:', error, errorInfo);
		}
	}

	handleReset = () => {
		this.setState({ hasError: false, error: null });
		window.location.href = '/';
	};

	render() {
		if (this.state.hasError) {
			return (
				<div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center px-4">
					<div className="max-w-md w-full bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 p-6 text-center">
						<div className="mx-auto w-16 h-16 bg-error-100 dark:bg-error-900/20 rounded-full flex items-center justify-center mb-4">
							<ExclamationTriangleIcon className="w-8 h-8 text-error-600 dark:text-error-400" />
						</div>
						<h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-2">
							Something went wrong
						</h1>
						<p className="text-sm text-slate-600 dark:text-slate-400 mb-6">
							We're sorry, but something unexpected happened. Please try refreshing
							the page.
						</p>
						<div className="flex gap-3">
							<Button
								variant="outline"
								onClick={() => window.location.reload()}
								className="flex-1"
							>
								Refresh Page
							</Button>
							<Button variant="primary" onClick={this.handleReset} className="flex-1">
								Go Home
							</Button>
						</div>
						{import.meta.env.DEV && this.state.error && (
							<details className="mt-4 text-left">
								<summary className="text-xs text-slate-500 dark:text-slate-400 cursor-pointer">
									Error Details
								</summary>
								<pre className="mt-2 text-xs text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-700 p-2 rounded overflow-auto">
									{this.state.error.toString()}
								</pre>
							</details>
						)}
					</div>
				</div>
			);
		}

		return this.props.children;
	}
}
