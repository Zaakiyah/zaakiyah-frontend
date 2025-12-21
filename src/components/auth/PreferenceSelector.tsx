import { motion } from 'framer-motion';
import { PREFERENCES } from '../../types/auth.types';

interface PreferenceSelectorProps {
	selectedPreferences: string[];
	onToggle: (pref: string) => void;
	error?: string;
}

export default function PreferenceSelector({
	selectedPreferences,
	onToggle,
	error,
}: PreferenceSelectorProps) {
	return (
		<div>
			<label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-4">
				Preferences (Select at least one)
			</label>
			<div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
				{PREFERENCES.map((pref) => (
					<motion.button
						key={pref}
						type="button"
						whileHover={{ scale: 1.05, y: -2 }}
						whileTap={{ scale: 0.95 }}
						transition={{ type: 'spring', stiffness: 300, damping: 20 }}
						onClick={() => onToggle(pref)}
						className={`p-4 rounded-xl border-2 font-medium transition-all shadow-sm hover:shadow-md ${
							selectedPreferences.includes(pref)
								? 'border-primary-500 dark:border-primary-400 bg-gradient-to-br from-primary-50 to-primary-100 dark:from-primary-900/30 dark:to-primary-800/20 text-primary-700 dark:text-primary-400 shadow-md shadow-primary-500/20 dark:shadow-primary-600/20'
								: 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-700/50'
						}`}
					>
						{pref}
					</motion.button>
				))}
			</div>
			{error && (
				<p className="mt-3 text-sm font-medium text-red-600 dark:text-red-400" role="alert">
					{error}
				</p>
			)}
		</div>
	);
}

