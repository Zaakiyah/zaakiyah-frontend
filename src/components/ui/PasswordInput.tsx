import { forwardRef, useState, useMemo, useRef, useEffect } from 'react';
import type { InputHTMLAttributes } from 'react';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import { CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/solid';

interface PasswordRequirement {
	label: string;
	check: (password: string) => boolean;
}

interface PasswordInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
	label?: string;
	error?: string;
	helperText?: string;
	showRequirements?: boolean;
}

const PasswordInput = forwardRef<HTMLInputElement, PasswordInputProps>(
	(
		{
			label,
			error,
			helperText,
			showRequirements = true,
			value,
			className = '',
			...props
		},
		ref
	) => {
		const [showPassword, setShowPassword] = useState(false);
		const [passwordValue, setPasswordValue] = useState('');
		const inputRef = useRef<HTMLInputElement | null>(null);

		useEffect(() => {
			if (typeof ref === 'function') {
				ref(inputRef.current);
			} else if (ref) {
				ref.current = inputRef.current;
			}
		}, [ref]);

		const requirements: PasswordRequirement[] = [
			{
				label: 'Minimum of 8 characters',
				check: (pwd) => pwd.length >= 8,
			},
			{
				label: 'At least a number (i.e 1-9)',
				check: (pwd) => /\d/.test(pwd),
			},
			{
				label: 'At least lowercase or uppercase letters',
				check: (pwd) => /[a-zA-Z]/.test(pwd),
			},
			{
				label: 'At least a special character (i.e!@#$%^&*)',
				check: (pwd) => /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(pwd),
			},
		];

		const requirementStatuses = useMemo(
			() => requirements.map((req) => req.check(passwordValue)),
			[passwordValue]
		);

		const { onChange: propsOnChange, ...restProps } = props;

		const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
			setPasswordValue(e.target.value);
			propsOnChange?.(e);
		};

		useEffect(() => {
			if (value !== undefined) {
				setPasswordValue(typeof value === 'string' ? value : '');
			}
		}, [value]);

		return (
			<div className="w-full">
				{label && (
					<label className="block text-sm font-medium text-slate-900 dark:text-slate-100 mb-2">
						{label}
					</label>
				)}
				<div className="relative">
					<input
						ref={inputRef}
						type={showPassword ? 'text' : 'password'}
						onChange={handleChange}
						className={`
							w-full px-5 py-3 
							rounded-xl border-2 transition-all duration-200
							text-sm
							focus:outline-none focus:ring-2 focus:ring-offset-0
							placeholder:text-slate-400 dark:placeholder:text-slate-500
							bg-white dark:bg-slate-800
							text-slate-900 dark:text-slate-100
							pr-12
							${
								error
									? 'border-error-300 dark:border-error-600 focus:border-error-500 dark:focus:border-error-500 focus:ring-error-500/20'
									: 'border-slate-200 dark:border-slate-700 focus:border-primary-500 dark:focus:border-primary-400 focus:ring-primary-500/20 dark:focus:ring-primary-400/20'
							}
							${className}
						`}
						{...restProps}
					/>
					<button
						type="button"
						onClick={() => setShowPassword(!showPassword)}
						className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 focus:outline-none"
						tabIndex={-1}
					>
						{showPassword ? (
							<EyeSlashIcon className="h-5 w-5" />
						) : (
							<EyeIcon className="h-5 w-5" />
						)}
					</button>
				</div>

				{showRequirements && passwordValue && (
					<div className="mt-3 space-y-2">
						{requirements.map((requirement, index) => {
							const isValid = requirementStatuses[index];
							return (
								<div key={index} className="flex items-center gap-2">
									{isValid ? (
										<CheckCircleIcon className="w-4 h-4 text-green-500 flex-shrink-0" />
									) : (
										<XCircleIcon className="w-4 h-4 text-red-500 flex-shrink-0" />
									)}
									<span
										className={`text-sm ${
											isValid ? 'text-green-700 dark:text-green-400' : 'text-red-600 dark:text-red-400'
										}`}
									>
										{requirement.label}
									</span>
								</div>
							);
						})}
					</div>
				)}

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

PasswordInput.displayName = 'PasswordInput';

export default PasswordInput;

