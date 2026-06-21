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
				<div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 flex items-center justify-center px-4">
					<div className="relative max-w-md w-full bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900 rounded-2xl shadow-xl border-2 border-slate-200/60 dark:border-slate-700/60 p-8 text-center overflow-hidden">
						{/* Decorative gradient overlay */}
						<div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-br from-red-500/10 via-rose-500/10 to-red-400/5 rounded-full blur-3xl -z-0" />
						
						<div className="mx-auto w-20 h-20 bg-gradient-to-br from-red-100 to-rose-200 dark:from-red-900/30 dark:to-rose-800/20 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-red-500/20 dark:shadow-red-600/20 relative z-10">
							<ExclamationTriangleIcon className="w-10 h-10 text-red-600 dark:text-red-400" />
						</div>
						<h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-3 relative z-10">
							Something went wrong
						</h1>
						<p className="text-sm text-slate-600 dark:text-slate-400 mb-8 leading-relaxed relative z-10">
							We're sorry, but something unexpected happened. Please try refreshing
							the page.
						</p>
						<div className="flex gap-3 relative z-10">
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
							<details className="mt-6 text-left relative z-10">
								<summary className="text-xs font-semibold text-slate-500 dark:text-slate-400 cursor-pointer hover:text-slate-700 dark:hover:text-slate-200 transition-colors">
									Error Details
								</summary>
								<pre className="mt-3 text-xs text-slate-600 dark:text-slate-400 bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-800 p-3 rounded-xl overflow-auto border-2 border-slate-200 dark:border-slate-600">
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
