import { motion } from 'framer-motion';
import { forwardRef } from 'react';
import type { ButtonHTMLAttributes } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
	variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
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
			'inline-flex items-center justify-center font-semibold rounded-2xl sm:rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]';

		const variants = {
			primary:
				'bg-primary-500 text-white hover:bg-primary-600 focus:ring-primary-500 shadow-md sm:shadow-lg shadow-primary-500/20 sm:shadow-primary-500/30 hover:shadow-lg sm:hover:shadow-xl hover:shadow-primary-500/30 sm:hover:shadow-primary-500/40',
			secondary:
				'bg-secondary-500 text-primary-900 hover:bg-secondary-600 focus:ring-secondary-500 shadow-md sm:shadow-lg shadow-secondary-500/20 sm:shadow-secondary-500/30 hover:shadow-lg sm:hover:shadow-xl hover:shadow-secondary-500/30 sm:hover:shadow-secondary-500/40',
			outline:
				'border-2 border-slate-300 text-slate-700 hover:bg-slate-50 focus:ring-slate-500 hover:border-slate-400 bg-white',
			ghost: 'text-slate-700 hover:bg-slate-100 focus:ring-slate-500',
		};

		const sizes = {
			sm: 'px-5 py-2.5 text-sm sm:px-4 sm:py-2',
			md: 'px-6 py-3.5 text-base sm:px-6 sm:py-3 sm:text-sm',
			lg: 'px-8 py-5 text-lg sm:px-8 sm:py-4 sm:text-base',
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
