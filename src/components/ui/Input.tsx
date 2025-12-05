import { forwardRef } from 'react';
import type { InputHTMLAttributes } from 'react';
import { ExclamationCircleIcon } from '@heroicons/react/24/outline';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
	label?: string;
	error?: string;
	helperText?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
	({ label, error, helperText, className = '', ...props }, ref) => {
		return (
			<div className="w-full">
				{label && (
					<label className="block text-sm font-medium text-slate-900 dark:text-slate-100 mb-2">
						{label}
					</label>
				)}
				<div className="relative">
					<input
						ref={ref}
						className={`
              w-full px-5 py-3 
              text-sm
              rounded-xl border-2 transition-all duration-200
              focus:outline-none focus:ring-2 focus:ring-offset-0
              bg-white dark:bg-slate-800
              text-slate-900 dark:text-slate-100
              ${
					error
						? 'border-error-300 dark:border-error-600 focus:border-error-500 dark:focus:border-error-500 focus:ring-error-500/20'
						: 'border-slate-200 dark:border-slate-700 focus:border-primary-500 dark:focus:border-primary-400 focus:ring-primary-500/20 dark:focus:ring-primary-400/20'
				}
              ${className}
            `}
						{...props}
					/>
					{error && (
						<div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
							<ExclamationCircleIcon
								className="h-5 w-5 text-red-500 dark:text-red-400"
								aria-hidden="true"
							/>
						</div>
					)}
				</div>
				{error && (
					<p className="mt-2 text-sm text-error-600 dark:text-error-400" role="alert">
						{error}
					</p>
				)}
				{helperText && !error && (
					<p className="mt-2 text-sm text-slate-500 dark:text-slate-400">{helperText}</p>
				)}
			</div>
		);
	}
);

Input.displayName = 'Input';

export default Input;
