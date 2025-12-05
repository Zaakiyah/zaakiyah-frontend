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
			<label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
				Preferences (Select at least one)
			</label>
			<div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
				{PREFERENCES.map((pref) => (
					<motion.button
						key={pref}
						type="button"
						whileHover={{ scale: 1.05 }}
						whileTap={{ scale: 0.95 }}
						onClick={() => onToggle(pref)}
						className={`p-3 rounded-xl border-2 transition-all ${
							selectedPreferences.includes(pref)
								? 'border-primary-500 dark:border-primary-400 bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-400'
								: 'border-slate-300 dark:border-slate-600 hover:border-slate-400 dark:hover:border-slate-500 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100'
						}`}
					>
						{pref}
					</motion.button>
				))}
			</div>
			{error && <p className="mt-2 text-sm text-red-600 dark:text-red-400">{error}</p>}
		</div>
	);
}

