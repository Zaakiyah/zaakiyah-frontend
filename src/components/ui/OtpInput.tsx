import { useEffect, useRef, useState } from 'react';
import type { KeyboardEvent, ClipboardEvent } from 'react';
import { motion } from 'framer-motion';

interface OtpInputProps {
	length?: number;
	onComplete: (code: string) => void;
	disabled?: boolean;
	autoFocus?: boolean;
	error?: string;
	className?: string;
}

export default function OtpInput({
	length = 6,
	onComplete,
	disabled = false,
	autoFocus = true,
	error,
	className = '',
}: OtpInputProps) {
	const [otp, setOtp] = useState<string[]>(new Array(length).fill(''));
	const [activeIndex, setActiveIndex] = useState<number>(0);
	const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

	useEffect(() => {
		if (autoFocus && inputRefs.current[0]) {
			inputRefs.current[0]?.focus();
		}
	}, [autoFocus]);

	const handleChange = (index: number, value: string) => {
		if (value && !/^\d$/.test(value)) {
			return;
		}

		const newOtp = [...otp];
		newOtp[index] = value;
		setOtp(newOtp);

		if (value && index < length - 1) {
			inputRefs.current[index + 1]?.focus();
			setActiveIndex(index + 1);
		}

		const code = newOtp.join('');
		if (code.length === length) {
			onComplete(code);
		}
	};

	const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
		if (e.key === 'Backspace') {
			if (otp[index]) {
				const newOtp = [...otp];
				newOtp[index] = '';
				setOtp(newOtp);
			} else if (index > 0) {
				const newOtp = [...otp];
				newOtp[index - 1] = '';
				setOtp(newOtp);
				inputRefs.current[index - 1]?.focus();
				setActiveIndex(index - 1);
			}
		} else if (e.key === 'ArrowLeft' && index > 0) {
			inputRefs.current[index - 1]?.focus();
			setActiveIndex(index - 1);
		} else if (e.key === 'ArrowRight' && index < length - 1) {
			inputRefs.current[index + 1]?.focus();
			setActiveIndex(index + 1);
		} else if (e.key === 'Delete' && otp[index]) {
			const newOtp = [...otp];
			newOtp[index] = '';
			setOtp(newOtp);
		}
	};

	const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
		e.preventDefault();
		const pastedData = e.clipboardData.getData('text/plain').trim();

		if (!/^\d+$/.test(pastedData)) {
			return;
		}

		const digits = pastedData.slice(0, length).split('');
		const newOtp = [...otp];

		let currentIndex = 0;
		for (let i = 0; i < digits.length && currentIndex < length; i++) {
			newOtp[currentIndex] = digits[i];
			currentIndex++;
		}

		setOtp(newOtp);

		const nextIndex = Math.min(currentIndex, length - 1);
		inputRefs.current[nextIndex]?.focus();
		setActiveIndex(nextIndex);

		const code = newOtp.join('');
		if (code.length === length) {
			onComplete(code);
		}
	};

	const handleFocus = (index: number) => {
		setActiveIndex(index);
		inputRefs.current[index]?.select();
	};

	return (
		<div className={className}>
			<div className="flex justify-center items-center gap-1.5 sm:gap-2 md:gap-2.5 w-full py-3 px-4 sm:px-6 md:px-8 lg:px-16 xl:px-24 2xl:px-32">
				{otp.map((digit, index) => (
					<motion.input
						key={index}
						ref={(el) => {
							inputRefs.current[index] = el;
						}}
						type="text"
						inputMode="numeric"
						maxLength={1}
						value={digit}
						onChange={(e) => handleChange(index, e.target.value)}
						onKeyDown={(e) => handleKeyDown(index, e)}
						onPaste={handlePaste}
						onFocus={() => handleFocus(index)}
						disabled={disabled}
						className={`
							w-10 h-10 min-[375px]:w-12 min-[375px]:h-12 sm:w-14 sm:h-14 md:w-14 md:h-14 lg:w-12 lg:h-12 xl:w-12 xl:h-12 2xl:w-11 2xl:h-11
							text-center text-lg min-[375px]:text-xl sm:text-2xl md:text-2xl lg:text-xl xl:text-xl 2xl:text-lg font-bold
							border-2 rounded-xl
							transition-all duration-200
							focus:outline-none focus:ring-2 focus:ring-primary-500/20 dark:focus:ring-primary-400/20 focus:border-primary-500 dark:focus:border-primary-400
							focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/20 dark:focus-visible:ring-primary-400/20 focus-visible:border-primary-500 dark:focus-visible:border-primary-400
							shrink-0 shadow-sm hover:shadow-md focus:shadow-lg
							${
								error
									? 'border-red-500 dark:border-red-500 focus:border-red-500 dark:focus:border-red-500 focus:ring-red-500/20 focus-visible:border-red-500 dark:focus-visible:border-red-500 focus-visible:ring-red-500/20 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100'
									: activeIndex === index
									? 'border-primary-500 dark:border-primary-400 focus:border-primary-500 dark:focus:border-primary-400 focus:ring-primary-500/20 focus-visible:border-primary-500 dark:focus-visible:border-primary-400 focus-visible:ring-primary-500/20 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 shadow-md shadow-primary-500/20 dark:shadow-primary-400/20'
									: 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100'
							}
							${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-text'}
						`}
						initial={{ scale: 1 }}
						whileFocus={{ scale: 1.05 }}
						transition={{ type: 'spring', stiffness: 300, damping: 20 }}
					/>
				))}
			</div>
			{error && (
				<motion.p
					initial={{ opacity: 0, y: -5 }}
					animate={{ opacity: 1, y: 0 }}
					className="mt-3 text-sm text-red-600 dark:text-red-400 text-center"
				>
					{error}
				</motion.p>
			)}
		</div>
	);
}
