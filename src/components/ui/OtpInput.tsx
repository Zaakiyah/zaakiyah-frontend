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
			<div className="flex justify-center gap-1 sm:gap-2 md:gap-2.5 lg:gap-3 px-1 sm:px-2 md:px-0 max-w-full overflow-x-auto overflow-y-visible py-3">
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
							w-10 h-10 min-[375px]:w-12 min-[375px]:h-12 sm:w-14 sm:h-14 md:w-16 md:h-16
							text-center text-lg min-[375px]:text-xl sm:text-2xl md:text-3xl font-bold
							border-2 rounded-xl
							transition-all duration-200
							focus:outline-none focus:ring-2 focus:ring-offset-1 sm:focus:ring-offset-2
							shrink-0
							${
								error
									? 'border-red-300 focus:border-red-500 focus:ring-red-200 bg-red-50'
									: activeIndex === index
									? 'border-primary-500 focus:border-primary-600 focus:ring-primary-200 bg-primary-50'
									: 'border-slate-200 focus:border-primary-500 focus:ring-primary-200 bg-white'
							}
							${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-text'}
						`}
						initial={{ scale: 1 }}
						whileFocus={{ scale: 1.05 }}
						transition={{ duration: 0.2 }}
					/>
				))}
			</div>
			{error && (
				<motion.p
					initial={{ opacity: 0, y: -5 }}
					animate={{ opacity: 1, y: 0 }}
					className="mt-3 text-sm text-red-600 text-center"
				>
					{error}
				</motion.p>
			)}
		</div>
	);
}
