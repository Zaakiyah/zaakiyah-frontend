import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BellIcon, EnvelopeIcon, DevicePhoneMobileIcon, BellAlertIcon } from '@heroicons/react/24/outline';
import Button from '../../ui/Button';
import Input from '../../ui/Input';
import { useWealthCalculationStore } from '../../../store/wealthCalculationStore';
import type { NotificationFrequency } from '../../../types/wealth.types';
import { alert } from '../../../store/alertStore';
import { useAuthStore } from '../../../store/authStore';

interface SavePreferencesStepProps {
	onComplete: () => void;
	onBack: () => void;
}

export default function SavePreferencesStep({ onComplete, onBack }: SavePreferencesStepProps) {
	const {
		formState,
		setSavePreference,
		setCalculationName,
		setNotificationPreferences,
		saveCalculation,
		isSaving,
	} = useWealthCalculationStore();
	const { user } = useAuthStore();

	const [saveCalc, setSaveCalc] = useState(formState.saveCalculation ?? true);
	const [calcName, setCalcName] = useState(formState.calculationName || '');
	const [useDefaults, setUseDefaults] = useState(true);
	const [notificationsEnabled, setNotificationsEnabled] = useState(
		formState.notificationPreferences?.enabled ?? true
	);
	const [frequency, setFrequency] = useState<NotificationFrequency | null>(
		formState.notificationPreferences?.frequency || 'annually'
	);
	const [customIntervalMonths, setCustomIntervalMonths] = useState(
		formState.notificationPreferences?.customIntervalMonths || 6
	);
	const [notifyRecalculate, setNotifyRecalculate] = useState(
		formState.notificationPreferences?.notifyRecalculate ?? true
	);
	const [notifyZakatDue, setNotifyZakatDue] = useState(
		formState.notificationPreferences?.notifyZakatDue ?? true
	);
	const [notifyNisaabChange, setNotifyNisaabChange] = useState(
		formState.notificationPreferences?.notifyNisaabChange ?? false
	);
	const [notifySummary, setNotifySummary] = useState(
		formState.notificationPreferences?.notifySummary ?? false
	);

	// Channel preferences
	const [emailEnabled, setEmailEnabled] = useState(true);
	const [inAppEnabled, setInAppEnabled] = useState(true);
	const [pushEnabled, setPushEnabled] = useState(false);
	const [showPushSuggestion, setShowPushSuggestion] = useState(false);

	// Load user defaults on mount
	useEffect(() => {
		if (user?.notificationPreferences) {
			const prefs = user.notificationPreferences;
			if (useDefaults) {
				setFrequency(prefs.frequency || 'annually');
				setCustomIntervalMonths(prefs.customIntervalMonths || 6);
				setNotifyRecalculate(prefs.notifyRecalculate ?? true);
				setNotifyZakatDue(prefs.notifyZakatDue ?? true);
				setNotifyNisaabChange(prefs.notifyNisaabChange ?? false);
				setNotifySummary(prefs.notifySummary ?? false);
				setEmailEnabled(prefs.email ?? true);
				setInAppEnabled(prefs.inApp ?? true);
				setPushEnabled(prefs.push ?? false);
			}
		}
	}, [user, useDefaults]);

	// Option A: Suggest push when in-app is enabled
	useEffect(() => {
		if (inAppEnabled && !pushEnabled) {
			setShowPushSuggestion(true);
		} else {
			setShowPushSuggestion(false);
		}
	}, [inAppEnabled, pushEnabled]);

	const frequencies: { value: NotificationFrequency; label: string; months: number }[] = [
		{ value: 'monthly', label: 'Monthly', months: 1 },
		{ value: 'quarterly', label: 'Quarterly', months: 3 },
		{ value: 'biannually', label: 'Bi-annually', months: 6 },
		{ value: 'annually', label: 'Annually', months: 12 },
		{ value: 'custom', label: 'Custom', months: customIntervalMonths },
	];

	const handleSave = async () => {
		try {
			// Update store with preferences
			setSavePreference(saveCalc);

			if (saveCalc && calcName.trim()) {
				setCalculationName(calcName.trim());
			}

			if (notificationsEnabled) {
				setNotificationPreferences({
					enabled: true,
					frequency: frequency || 'annually',
					customIntervalMonths: frequency === 'custom' ? customIntervalMonths : undefined,
					notifyRecalculate,
					notifyZakatDue,
					notifyNisaabChange,
					notifySummary,
					// Include channel preferences if customizing
					...(useDefaults ? {} : {
						email: emailEnabled,
						inApp: inAppEnabled,
						push: pushEnabled,
					}),
				});
			} else {
				setNotificationPreferences({
					enabled: false,
					frequency: null,
					notifyRecalculate: false,
					notifyZakatDue: false,
					notifyNisaabChange: false,
					notifySummary: false,
				});
			}

			// Save calculation if enabled
			if (saveCalc) {
				await saveCalculation();
				alert.success('Calculation saved successfully!');
			}

			onComplete();
		} catch (error) {
			console.error('Error saving calculation:', error);
			alert.error('Failed to save calculation. Please try again.');
		}
	};

	return (
		<motion.div
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.3 }}
			className="space-y-6 overflow-visible"
		>
			{/* Header */}
			<div>
				<h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-2">
					Save & Set Preferences
				</h2>
				<p className="text-sm text-slate-600 dark:text-slate-400">
					Choose whether to save this calculation and set up notification reminders.
				</p>
			</div>

			{/* Save Calculation Toggle */}
			<div className="p-4 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-visible">
				<label className="flex items-start justify-between cursor-pointer gap-4">
					<div className="flex-1 min-w-0">
						<h3 className="text-base font-semibold text-slate-900 dark:text-slate-100 mb-1">
							Save Calculation
						</h3>
						<p className="text-sm text-slate-600 dark:text-slate-400">
							Save this calculation to your history for future reference
						</p>
					</div>
					<button
						type="button"
						onClick={() => setSaveCalc(!saveCalc)}
						className={`relative inline-flex h-6 w-11 flex-shrink-0 items-center rounded-full transition-colors ${
							saveCalc
								? 'bg-primary-500 dark:bg-primary-600'
								: 'bg-slate-300 dark:bg-slate-600'
						}`}
					>
						<span
							className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
								saveCalc ? 'translate-x-6' : 'translate-x-1'
							}`}
						/>
					</button>
				</label>

				{saveCalc && (
					<motion.div
						initial={{ opacity: 0, height: 0, marginTop: 0 }}
						animate={{ opacity: 1, height: 'auto', marginTop: 16 }}
						exit={{ opacity: 0, height: 0, marginTop: 0 }}
						transition={{ duration: 0.2, ease: 'easeInOut' }}
						className="overflow-visible"
					>
						<Input
							label="Calculation Name (Optional)"
							placeholder="e.g., My Wealth 2024"
							value={calcName}
							onChange={(e) => setCalcName(e.target.value)}
							helperText="Give your calculation a name to easily identify it later"
						/>
					</motion.div>
				)}
			</div>

			{/* Notification Preferences */}
			<div className="p-4 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-visible">
				<label className="flex items-start justify-between cursor-pointer gap-4 mb-4">
					<div className="flex items-center gap-2 flex-1 min-w-0">
						<BellIcon className="w-5 h-5 text-slate-600 dark:text-slate-400 flex-shrink-0" />
						<div className="min-w-0">
							<h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">
								Enable Notifications
							</h3>
							<p className="text-sm text-slate-600 dark:text-slate-400">
								Get reminded to recalculate or give Zakaat
							</p>
						</div>
					</div>
					<button
						type="button"
						onClick={() => setNotificationsEnabled(!notificationsEnabled)}
						className={`relative inline-flex h-6 w-11 flex-shrink-0 items-center rounded-full transition-colors ${
							notificationsEnabled
								? 'bg-primary-500 dark:bg-primary-600'
								: 'bg-slate-300 dark:bg-slate-600'
						}`}
					>
						<span
							className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
								notificationsEnabled ? 'translate-x-6' : 'translate-x-1'
							}`}
						/>
					</button>
				</label>

				{notificationsEnabled && (
					<motion.div
						initial={{ opacity: 0, height: 0, marginTop: 0 }}
						animate={{ opacity: 1, height: 'auto', marginTop: 16 }}
						exit={{ opacity: 0, height: 0, marginTop: 0 }}
						transition={{ duration: 0.2, ease: 'easeInOut' }}
						className="space-y-4 overflow-visible"
					>
						{/* Use Defaults Toggle */}
						<div className="p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg border border-slate-200 dark:border-slate-600">
							<label className="flex items-center gap-3 cursor-pointer">
								<input
									type="checkbox"
									checked={useDefaults}
									onChange={(e) => setUseDefaults(e.target.checked)}
									className="w-5 h-5 text-primary-600 bg-white dark:bg-slate-700 border-2 border-slate-300 dark:border-slate-600 rounded focus:ring-2 focus:ring-primary-500 focus:ring-offset-0 cursor-pointer transition-all"
								/>
								<span className="text-sm font-medium text-slate-900 dark:text-slate-100">
									Use my notification defaults
								</span>
							</label>
							{useDefaults && user?.notificationPreferences && (
								<p className="text-xs text-slate-600 dark:text-slate-400 mt-2 ml-8">
									Using your saved preferences from Settings
								</p>
							)}
						</div>

						{/* Customize Section */}
						{!useDefaults && (
							<motion.div
								initial={{ opacity: 0, y: -10 }}
								animate={{ opacity: 1, y: 0 }}
								className="space-y-4 pt-3 border-t border-slate-200 dark:border-slate-700"
							>
								<h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
									Customize Notification Channels
								</h4>

								{/* Email Channel */}
								<label className="flex items-center gap-3 cursor-pointer p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
									<EnvelopeIcon className="w-5 h-5 text-slate-600 dark:text-slate-400 flex-shrink-0" />
									<div className="flex-1">
										<div className="flex items-center justify-between">
											<span className="text-sm font-medium text-slate-900 dark:text-slate-100">
												Email
											</span>
											<button
												type="button"
												onClick={() => setEmailEnabled(!emailEnabled)}
												className={`relative inline-flex h-5 w-9 flex-shrink-0 items-center rounded-full transition-colors ${
													emailEnabled
														? 'bg-primary-500 dark:bg-primary-600'
														: 'bg-slate-300 dark:bg-slate-600'
												}`}
											>
												<span
													className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${
														emailEnabled ? 'translate-x-5' : 'translate-x-0.5'
													}`}
												/>
											</button>
										</div>
									</div>
								</label>

								{/* In-App Channel */}
								<label className="flex items-center gap-3 cursor-pointer p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
									<BellAlertIcon className="w-5 h-5 text-slate-600 dark:text-slate-400 flex-shrink-0" />
									<div className="flex-1">
										<div className="flex items-center justify-between">
											<span className="text-sm font-medium text-slate-900 dark:text-slate-100">
												In-App
											</span>
											<button
												type="button"
												onClick={() => setInAppEnabled(!inAppEnabled)}
												className={`relative inline-flex h-5 w-9 flex-shrink-0 items-center rounded-full transition-colors ${
													inAppEnabled
														? 'bg-primary-500 dark:bg-primary-600'
														: 'bg-slate-300 dark:bg-slate-600'
												}`}
											>
												<span
													className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${
														inAppEnabled ? 'translate-x-5' : 'translate-x-0.5'
													}`}
												/>
											</button>
										</div>
									</div>
								</label>

								{/* Push Channel */}
								<label className="flex items-center gap-3 cursor-pointer p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
									<DevicePhoneMobileIcon className="w-5 h-5 text-slate-600 dark:text-slate-400 flex-shrink-0" />
									<div className="flex-1">
										<div className="flex items-center justify-between">
											<span className="text-sm font-medium text-slate-900 dark:text-slate-100">
												Push Notifications
											</span>
											<button
												type="button"
												onClick={() => setPushEnabled(!pushEnabled)}
												className={`relative inline-flex h-5 w-9 flex-shrink-0 items-center rounded-full transition-colors ${
													pushEnabled
														? 'bg-primary-500 dark:bg-primary-600'
														: 'bg-slate-300 dark:bg-slate-600'
												}`}
											>
												<span
													className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${
														pushEnabled ? 'translate-x-5' : 'translate-x-0.5'
													}`}
												/>
											</button>
										</div>
									</div>
								</label>

								{/* Option A: Push Suggestion */}
								{showPushSuggestion && (
									<motion.div
										initial={{ opacity: 0, y: -10 }}
										animate={{ opacity: 1, y: 0 }}
										className="p-3 bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-800 rounded-lg"
									>
										<p className="text-xs text-primary-800 dark:text-primary-200 mb-2">
											💡 <strong>Tip:</strong> Enable push notifications to receive real-time alerts even when the app is closed.
										</p>
										<button
											type="button"
											onClick={() => {
												setPushEnabled(true);
												setShowPushSuggestion(false);
											}}
											className="text-xs text-primary-700 dark:text-primary-300 font-medium hover:underline"
										>
											Enable push notifications
										</button>
									</motion.div>
								)}
							</motion.div>
						)}

						{/* Frequency Selection */}
						<div className="overflow-visible pt-3 border-t border-slate-200 dark:border-slate-700">
							<label className="block text-sm font-medium text-slate-900 dark:text-slate-100 mb-2">
								Notification Frequency
							</label>
							<div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
								{frequencies.map((freq) => (
									<button
										key={freq.value}
										type="button"
										onClick={() => setFrequency(freq.value)}
										className={`p-3 rounded-lg border-2 transition-all text-sm font-medium whitespace-nowrap ${
											frequency === freq.value
												? 'border-primary-500 dark:border-primary-400 bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300'
												: 'border-slate-200 dark:border-slate-700 hover:border-primary-300 dark:hover:border-primary-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300'
										}`}
									>
										{freq.label}
									</button>
								))}
							</div>

							{frequency === 'custom' && (
								<motion.div
									initial={{ opacity: 0, y: -10 }}
									animate={{ opacity: 1, y: 0 }}
									transition={{ duration: 0.2 }}
									className="mt-3"
								>
									<Input
										type="text"
										inputMode="numeric"
										label="Custom Interval (Months)"
										value={customIntervalMonths.toString()}
										onChange={(e) => {
											const inputValue = e.target.value;
											if (inputValue === '') {
												setCustomIntervalMonths(1);
												return;
											}
											const value = parseInt(inputValue);
											if (!isNaN(value) && value >= 1 && value <= 36) {
												setCustomIntervalMonths(value);
											}
										}}
										placeholder="6"
										helperText="Enter a number between 1 and 36"
									/>
								</motion.div>
							)}
						</div>

						{/* Notification Types */}
						<div className="space-y-3 pt-3 border-t border-slate-200 dark:border-slate-700">
							<label className="block text-sm font-medium text-slate-900 dark:text-slate-100 mb-2">
								Notification Types
							</label>

							<label className="flex items-start gap-3 cursor-pointer group">
								<input
									type="checkbox"
									checked={notifyRecalculate}
									onChange={(e) => setNotifyRecalculate(e.target.checked)}
									className="w-5 h-5 mt-0.5 text-primary-600 bg-white dark:bg-slate-700 border-2 border-slate-300 dark:border-slate-600 rounded focus:ring-2 focus:ring-primary-500 focus:ring-offset-0 cursor-pointer transition-all flex-shrink-0"
								/>
								<span className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
									Remind me to recalculate my wealth
								</span>
							</label>

							<label className="flex items-start gap-3 cursor-pointer group">
								<input
									type="checkbox"
									checked={notifyZakatDue}
									onChange={(e) => setNotifyZakatDue(e.target.checked)}
									className="w-5 h-5 mt-0.5 text-primary-600 bg-white dark:bg-slate-700 border-2 border-slate-300 dark:border-slate-600 rounded focus:ring-2 focus:ring-primary-500 focus:ring-offset-0 cursor-pointer transition-all flex-shrink-0"
								/>
								<span className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
									Notify when Zakaat is due
								</span>
							</label>

							<label className="flex items-start gap-3 cursor-pointer group">
								<input
									type="checkbox"
									checked={notifyNisaabChange}
									onChange={(e) => setNotifyNisaabChange(e.target.checked)}
									className="w-5 h-5 mt-0.5 text-primary-600 bg-white dark:bg-slate-700 border-2 border-slate-300 dark:border-slate-600 rounded focus:ring-2 focus:ring-primary-500 focus:ring-offset-0 cursor-pointer transition-all flex-shrink-0"
								/>
								<span className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
									Notify when Nisaab values change significantly
								</span>
							</label>

							<label className="flex items-start gap-3 cursor-pointer group">
								<input
									type="checkbox"
									checked={notifySummary}
									onChange={(e) => setNotifySummary(e.target.checked)}
									className="w-5 h-5 mt-0.5 text-primary-600 bg-white dark:bg-slate-700 border-2 border-slate-300 dark:border-slate-600 rounded focus:ring-2 focus:ring-primary-500 focus:ring-offset-0 cursor-pointer transition-all flex-shrink-0"
								/>
								<span className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
									Send monthly summary
								</span>
							</label>
						</div>
					</motion.div>
				)}
			</div>

			{/* Navigation */}
			<div className="flex gap-3 pt-4">
				<Button variant="outline" onClick={onBack} className="flex-1" disabled={isSaving}>
					Back
				</Button>
				<Button
					variant="primary"
					onClick={handleSave}
					className="flex-1"
					isLoading={isSaving}
					disabled={isSaving}
				>
					{saveCalc ? 'Save Calculation' : 'Complete'}
				</Button>
			</div>
		</motion.div>
	);
}
