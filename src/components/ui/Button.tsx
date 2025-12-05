import { motion } from 'framer-motion';
import { forwardRef } from 'react';
import type { ButtonHTMLAttributes } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
	variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
	size?: 'sm' | 'md' | 'lg';
	isLoading?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
	(
		{
			className = '',
			variant = 'primary',
			size = 'md',
			isLoading = false,
			disabled,
			children,
			...props
		},
		ref
	) => {
		const baseStyles =
			'inline-flex items-center justify-center font-semibold rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]';

		const variants = {
			primary:
				'bg-primary-500 dark:bg-primary-600 text-white hover:bg-primary-600 dark:hover:bg-primary-700 focus:ring-primary-500 dark:focus:ring-primary-400 shadow-md shadow-primary-500/20 dark:shadow-primary-600/20 hover:shadow-lg hover:shadow-primary-500/30 dark:hover:shadow-primary-600/30',
			secondary:
				'bg-secondary-500 dark:bg-secondary-600 text-primary-900 dark:text-primary-100 hover:bg-secondary-600 dark:hover:bg-secondary-700 focus:ring-secondary-500 dark:focus:ring-secondary-400 shadow-md shadow-secondary-500/20 dark:shadow-secondary-600/20 hover:shadow-lg hover:shadow-secondary-500/30 dark:hover:shadow-secondary-600/30',
			outline:
				'border-2 border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 focus:ring-slate-500 dark:focus:ring-slate-400 hover:border-slate-400 dark:hover:border-slate-500 bg-white dark:bg-slate-800',
			ghost: 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 focus:ring-slate-500 dark:focus:ring-slate-400',
			danger:
				'bg-error-500 dark:bg-error-600 text-white hover:bg-error-600 dark:hover:bg-error-700 focus:ring-error-500 dark:focus:ring-error-400 shadow-md shadow-error-500/20 dark:shadow-error-600/20 hover:shadow-lg hover:shadow-error-500/30 dark:hover:shadow-error-600/30',
		};

		const sizes = {
			sm: 'px-4 py-2 text-sm',
			md: 'px-5 py-3 text-sm',
			lg: 'px-6 py-3.5 text-sm',
		};

		return (
			<motion.button
				ref={ref}
				whileHover={{ scale: disabled || isLoading ? 1 : 1.02 }}
				whileTap={{ scale: disabled || isLoading ? 1 : 0.98 }}
				className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
				disabled={disabled || isLoading}
				{...(props as any)}
			>
				{isLoading ? (
					<>
						<svg
							className="animate-spin -ml-1 mr-3 h-5 w-5"
							xmlns="http://www.w3.org/2000/svg"
							fill="none"
							viewBox="0 0 24 24"
						>
							<circle
								className="opacity-25"
								cx="12"
								cy="12"
								r="10"
								stroke="currentColor"
								strokeWidth="4"
							></circle>
							<path
								className="opacity-75"
								fill="currentColor"
								d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
							></path>
						</svg>
						Loading...
					</>
				) : (
					children
				)}
			</motion.button>
		);
	}
);

Button.displayName = 'Button';

export default Button;
