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
			'inline-flex items-center justify-center font-semibold rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';

		const variants = {
			primary:
				'bg-gradient-to-r from-primary-500 via-primary-600 to-primary-700 dark:from-primary-600 dark:via-primary-700 dark:to-primary-800 text-white hover:from-primary-600 hover:via-primary-700 hover:to-primary-800 dark:hover:from-primary-700 dark:hover:via-primary-800 dark:hover:to-primary-900 focus:ring-primary-500/20 dark:focus:ring-primary-400/20 shadow-lg shadow-primary-500/30 dark:shadow-primary-600/30 hover:shadow-xl hover:shadow-primary-500/40 dark:hover:shadow-primary-600/40',
			secondary:
				'bg-gradient-to-r from-secondary-500 via-secondary-600 to-secondary-700 dark:from-secondary-600 dark:via-secondary-700 dark:to-secondary-800 text-primary-900 dark:text-primary-100 hover:from-secondary-600 hover:via-secondary-700 hover:to-secondary-800 dark:hover:from-secondary-700 dark:hover:via-secondary-800 dark:hover:to-secondary-900 focus:ring-secondary-500/20 dark:focus:ring-secondary-400/20 shadow-lg shadow-secondary-500/30 dark:shadow-secondary-600/30 hover:shadow-xl hover:shadow-secondary-500/40 dark:hover:shadow-secondary-600/40',
			outline:
				'border-2 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-gradient-to-r hover:from-slate-50 hover:to-slate-100 dark:hover:from-slate-700 dark:hover:to-slate-800 focus:ring-slate-500/20 dark:focus:ring-slate-400/20 hover:border-slate-300 dark:hover:border-slate-600 bg-white dark:bg-slate-800 shadow-sm hover:shadow-md',
			ghost: 'text-slate-700 dark:text-slate-300 hover:bg-gradient-to-r hover:from-slate-100 hover:to-slate-50 dark:hover:from-slate-700 dark:hover:to-slate-800 focus:ring-slate-500/20 dark:focus:ring-slate-400/20',
			danger:
				'bg-gradient-to-r from-red-500 via-red-600 to-red-700 dark:from-red-600 dark:via-red-700 dark:to-red-800 text-white hover:from-red-600 hover:via-red-700 hover:to-red-800 dark:hover:from-red-700 dark:hover:via-red-800 dark:hover:to-red-900 focus:ring-red-500/20 dark:focus:ring-red-400/20 shadow-lg shadow-red-500/30 dark:shadow-red-600/30 hover:shadow-xl hover:shadow-red-500/40 dark:hover:shadow-red-600/40',
		};

		const sizes = {
			sm: 'px-4 py-2 text-sm',
			md: 'px-5 py-3 text-sm',
			lg: 'px-6 py-3.5 text-sm',
		};

		return (
			<motion.button
				ref={ref}
				whileHover={disabled || isLoading ? {} : { scale: 1.02, y: -1 }}
				whileTap={disabled || isLoading ? {} : { scale: 0.98 }}
				transition={{ type: 'spring', stiffness: 300, damping: 20 }}
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
