import { motion } from 'framer-motion';
import { SparklesIcon, CalculatorIcon, ScaleIcon, BookOpenIcon, ArrowTopRightOnSquareIcon } from '@heroicons/react/24/outline';
import Button from '../../ui/Button';

interface WelcomeStepProps {
	onNext: () => void;
}

export default function WelcomeStep({ onNext }: WelcomeStepProps) {
	const features = [
		{
			icon: CalculatorIcon,
			title: 'Calculate Your Wealth',
			description: 'Add your assets and liabilities to determine your net worth',
		},
		{
			icon: ScaleIcon,
			title: 'Check Nisaab Eligibility',
			description: 'See if your wealth meets the Gold or Silver nisaab threshold',
		},
		{
			icon: BookOpenIcon,
			title: 'Know Your Zakaat',
			description: 'Calculate your Zakaat obligation (2.5% of eligible wealth)',
		},
	];

	return (
		<motion.div
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.3 }}
			className="space-y-6"
		>
			{/* Header */}
			<div className="text-center space-y-4">
				<div className="flex justify-center">
					<div className="relative">
						<div className="absolute inset-0 bg-gradient-to-br from-primary-500/20 via-secondary-500/20 to-primary-400/10 rounded-full blur-2xl" />
						<div className="relative w-20 h-20 bg-gradient-to-br from-primary-100 to-primary-200 dark:from-primary-900/30 dark:to-primary-800/20 rounded-2xl flex items-center justify-center shadow-lg shadow-primary-500/20 dark:shadow-primary-600/20">
							<SparklesIcon className="w-10 h-10 text-primary-600 dark:text-primary-400" />
						</div>
					</div>
				</div>
				<h2 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
					Let's Calculate Your Zakaat
				</h2>
				<p className="text-sm text-slate-600 dark:text-slate-400 max-w-md mx-auto leading-relaxed">
					Determine if your wealth meets the nisaab threshold and calculate your Zakaat
					obligation. This process takes about 5-10 minutes.
				</p>
			</div>

			{/* Features */}
			<div className="space-y-4 pt-4">
				{features.map((feature, index) => {
					const Icon = feature.icon;
					return (
						<motion.div
							key={feature.title}
							initial={{ opacity: 0, x: -20, scale: 0.95 }}
							animate={{ opacity: 1, x: 0, scale: 1 }}
							transition={{ duration: 0.3, delay: index * 0.1, type: 'spring', stiffness: 100 }}
							className="flex items-start gap-4 p-4 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-700/50 dark:to-slate-800/50 rounded-xl shadow-sm"
						>
							<div className="w-12 h-12 bg-gradient-to-br from-primary-100 to-primary-200 dark:from-primary-900/30 dark:to-primary-800/20 rounded-xl flex items-center justify-center shrink-0 shadow-sm">
								<Icon className="w-6 h-6 text-primary-600 dark:text-primary-400" />
							</div>
							<div className="flex-1">
								<h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 mb-1">
									{feature.title}
								</h3>
								<p className="text-xs text-slate-600 dark:text-slate-400">
									{feature.description}
								</p>
							</div>
						</motion.div>
					);
				})}
			</div>

			{/* Motivational Verses */}
			<motion.div
				initial={{ opacity: 0, y: 10 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ delay: 0.4 }}
				className="relative overflow-hidden bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50 dark:from-emerald-900/30 dark:via-green-900/20 dark:to-teal-900/30 rounded-2xl p-5 border-2 border-emerald-200/50 dark:border-emerald-800/50 shadow-lg"
			>
				<div className="absolute top-0 right-0 w-40 h-40 bg-emerald-200/20 dark:bg-emerald-800/20 rounded-full blur-3xl -mr-20 -mt-20" />
				<div className="relative">
					<div className="flex items-start gap-3 mb-3">
						<div className="flex-shrink-0 w-10 h-10 bg-emerald-500/10 dark:bg-emerald-400/20 rounded-xl flex items-center justify-center">
							<BookOpenIcon className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
						</div>
						<div className="flex-1">
							<p className="text-sm font-semibold text-emerald-900 dark:text-emerald-100 mb-2">
								From the Qur'an
							</p>
							<p className="text-sm leading-relaxed text-emerald-800 dark:text-emerald-200 italic mb-3 font-medium">
								"And establish prayer and give zakāh, and whatever good you put forward for yourselves - you will find it with Allah. Indeed, Allah of what you do, is Seeing."
							</p>
							<a
								href="https://quran.com/2:110"
								target="_blank"
								rel="noopener noreferrer"
								className="inline-flex items-center gap-2 text-xs font-medium text-emerald-700 dark:text-emerald-300 hover:text-emerald-800 dark:hover:text-emerald-200 transition-colors group"
							>
								<span>Read on Quran.com</span>
								<ArrowTopRightOnSquareIcon className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
							</a>
						</div>
					</div>
				</div>
			</motion.div>

			{/* Info Box */}
			<motion.div
				initial={{ opacity: 0, y: 10 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ delay: 0.5 }}
				className="relative overflow-hidden bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/30 dark:to-indigo-900/30 rounded-2xl p-5 border-2 border-blue-200/50 dark:border-blue-800/50 shadow-lg"
			>
				<div className="absolute top-0 right-0 w-32 h-32 bg-blue-200/20 dark:bg-blue-800/20 rounded-full blur-2xl -mr-16 -mt-16" />
				<div className="relative flex items-start gap-3">
					<div className="flex-shrink-0 w-10 h-10 bg-blue-500/10 dark:bg-blue-400/20 rounded-xl flex items-center justify-center text-xl">
						💡
					</div>
					<div className="flex-1">
						<p className="text-sm font-semibold text-blue-900 dark:text-blue-100 mb-1">
							Preparation Tip
						</p>
						<p className="text-sm text-blue-800 dark:text-blue-200 leading-relaxed">
							Have your financial information ready, including cash, bank balances, gold/silver holdings, and any debts or liabilities.
						</p>
					</div>
				</div>
			</motion.div>

			{/* Action Button */}
			<div className="pt-4">
				<Button onClick={onNext} variant="primary" size="lg" className="w-full">
					Get Started
				</Button>
			</div>
		</motion.div>
	);
}


