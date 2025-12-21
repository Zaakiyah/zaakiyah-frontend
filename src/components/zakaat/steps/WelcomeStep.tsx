import { motion } from 'framer-motion';
import { SparklesIcon, HandRaisedIcon, DocumentTextIcon, CheckCircleIcon, ArrowTopRightOnSquareIcon } from '@heroicons/react/24/outline';
import Button from '../../ui/Button';

interface WelcomeStepProps {
	onNext: () => void;
}

export default function WelcomeStep({ onNext }: WelcomeStepProps) {
	const features = [
		{
			icon: HandRaisedIcon,
			title: 'Apply for Assistance',
			description: 'Submit your application for Zakaat assistance or create a campaign',
		},
		{
			icon: DocumentTextIcon,
			title: 'Complete Your Profile',
			description: 'Provide personal information and verify your identity',
		},
		{
			icon: CheckCircleIcon,
			title: 'Get Reviewed',
			description: 'Our team will review your application and provide assistance',
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
					Apply for Zakaat Assistance
				</h2>
				<p className="text-sm text-slate-600 dark:text-slate-400 max-w-md mx-auto leading-relaxed">
					Whether you're an individual in need or an organization creating a campaign, 
					we're here to help. This process takes about 10-15 minutes.
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

			{/* Motivational Content */}
			<motion.div
				initial={{ opacity: 0, y: 10 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ delay: 0.4 }}
				className="relative overflow-hidden bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50 dark:from-emerald-900/30 dark:via-green-900/20 dark:to-teal-900/30 rounded-2xl p-5 border-2 border-emerald-200/50 dark:border-emerald-800/50 shadow-lg"
			>
				<div className="absolute top-0 right-0 w-32 h-32 bg-emerald-200/20 dark:bg-emerald-800/20 rounded-full blur-3xl -mr-16 -mt-16" />
				<div className="relative">
					<div className="flex items-start gap-3 mb-3">
						<div className="flex-shrink-0 w-10 h-10 bg-emerald-500/10 dark:bg-emerald-400/20 rounded-xl flex items-center justify-center">
							<DocumentTextIcon className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
						</div>
						<div className="flex-1">
							<p className="text-sm font-semibold text-emerald-900 dark:text-emerald-100 mb-2">
								From the Qur'an
							</p>
							<p className="text-sm leading-relaxed text-emerald-800 dark:text-emerald-200 italic mb-3 font-medium">
								"And whoever is mindful of Allah, He will make a way out for them, and provide for them from sources they could never imagine. And whoever puts their trust in Allah, then He ˹alone˺ is sufficient for them. Surely Allah achieves His Will. Allah has already set a destiny for everything."
							</p>
							<a
								href="https://quran.com/65:2-3"
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
				<div className="absolute top-0 right-0 w-24 h-24 bg-blue-200/20 dark:bg-blue-800/20 rounded-full blur-2xl -mr-12 -mt-12" />
				<div className="relative flex items-start gap-3">
					<div className="flex-shrink-0 w-10 h-10 bg-blue-500/10 dark:bg-blue-400/20 rounded-xl flex items-center justify-center text-xl">
						💡
					</div>
					<div className="flex-1">
						<p className="text-sm font-semibold text-blue-900 dark:text-blue-100 mb-1">
							Preparation Tip
						</p>
						<p className="text-sm text-blue-800 dark:text-blue-200 leading-relaxed">
							Have your identification documents, bank details, and information about your needs ready before starting.
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

