import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
	EnvelopeIcon,
	DevicePhoneMobileIcon,
	BellAlertIcon,
	ClockIcon,
} from '@heroicons/react/24/outline';
import { authService } from '../../services/authService';
import { useAuthStore } from '../../store/authStore';
import { alert } from '../../store/alertStore';
import Input from '../ui/Input';
import Button from '../ui/Button';
import Checkbox from '../ui/Checkbox';
import TimezoneSelector from '../ui/TimezoneSelector';
import type { NotificationFrequency } from '../../types/wealth.types';

export default function NotificationPreferencesSection() {
	const { user, updateUser } = useAuthStore();
	const [isSaving, setIsSaving] = useState(false);

	// Channel preferences
	const [email, setEmail] = useState(true);
	const [inApp, setInApp] = useState(true);
	const [push, setPush] = useState(false);
	const [showPushSuggestion, setShowPushSuggestion] = useState(false);

	// Frequency and content preferences
	const [frequency, setFrequency] = useState<NotificationFrequency>('quarterly');
	const [customIntervalMonths, setCustomIntervalMonths] = useState(6);
	const [notifyRecalculate, setNotifyRecalculate] = useState(true);
	const [notifyZakatDue, setNotifyZakatDue] = useState(true);
	const [notifyNisaabChange, setNotifyNisaabChange] = useState(true);
	const [notifySummary, setNotifySummary] = useState(false);
	const [nisaabUpdatesEnabled, setNisaabUpdatesEnabled] = useState(true);
	const [communityNotifications, setCommunityNotifications] = useState(true);

	// Delivery time
	const [sendHour, setSendHour] = useState(7);
	const [timezone, setTimezone] = useState<string>('UTC');

	const frequencies: { value: NotificationFrequency; label: string; months: number }[] = [
		{ value: 'monthly', label: 'Monthly', months: 1 },
		{ value: 'quarterly', label: 'Quarterly', months: 3 },
		{ value: 'biannually', label: 'Bi-annually', months: 6 },
		{ value: 'annually', label: 'Annually', months: 12 },
		{ value: 'custom', label: 'Custom', months: customIntervalMonths },
	];

	// Load user preferences
	useEffect(() => {
		if (user?.notificationPreferences) {
			const prefs = user.notificationPreferences;
			setEmail(prefs.email ?? true);
			setInApp(prefs.inApp ?? true);
			setPush(prefs.push ?? false);
			setFrequency(prefs.frequency || 'quarterly');
			setCustomIntervalMonths(prefs.customIntervalMonths || 6);
			setNotifyRecalculate(prefs.notifyRecalculate ?? true);
			setNotifyZakatDue(prefs.notifyZakatDue ?? true);
			setNotifyNisaabChange(prefs.notifyNisaabChange ?? true);
			setNotifySummary(prefs.notifySummary ?? false);
			setNisaabUpdatesEnabled(prefs.nisaabUpdatesEnabled ?? true);
			setCommunityNotifications(prefs.communityNotifications ?? true);
			setSendHour(prefs.sendHour ?? 7);
			setTimezone(prefs.timezone || 'UTC');
		}
	}, [user]);

	// Option A: Suggest push when in-app is enabled
	useEffect(() => {
		if (inApp && !push) {
			setShowPushSuggestion(true);
		} else {
			setShowPushSuggestion(false);
		}
	}, [inApp, push]);

	const handleSave = async () => {
		setIsSaving(true);
		try {
			const notificationPreferences = {
				email,
				inApp,
				push,
				frequency,
				customIntervalMonths: frequency === 'custom' ? customIntervalMonths : undefined,
				notifyRecalculate,
				notifyZakatDue,
				notifyNisaabChange,
				notifySummary,
				nisaabUpdatesEnabled,
				communityNotifications,
				sendHour,
				timezone: timezone === 'UTC' ? undefined : timezone,
			};

			const response = await authService.updateProfile({
				notificationPreferences,
			});

			if (response.data) {
				updateUser(response.data);
				alert.success('Notification preferences saved successfully!');
			}
		} catch (error: any) {
			console.error('Failed to save notification preferences:', error);
			alert.error(
				error.response?.data?.message ||
					'Failed to save notification preferences. Please try again.'
			);
		} finally {
			setIsSaving(false);
		}
	};

	return (
		<motion.div
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			className="space-y-4"
		>
			{/* Channel Preferences */}
			<div className="space-y-3">
				<h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
					Notification Channels
				</h3>
				<p className="text-xs text-slate-600 dark:text-slate-400">
					Choose how you want to receive notifications
				</p>

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
								onClick={() => setEmail(!email)}
								className={`relative inline-flex h-5 w-9 flex-shrink-0 items-center rounded-full transition-colors ${
									email
										? 'bg-primary-500 dark:bg-primary-600'
										: 'bg-slate-300 dark:bg-slate-600'
								}`}
							>
								<span
									className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${
										email ? 'translate-x-5' : 'translate-x-0.5'
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
								onClick={() => setInApp(!inApp)}
								className={`relative inline-flex h-5 w-9 flex-shrink-0 items-center rounded-full transition-colors ${
									inApp
										? 'bg-primary-500 dark:bg-primary-600'
										: 'bg-slate-300 dark:bg-slate-600'
								}`}
							>
								<span
									className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${
										inApp ? 'translate-x-5' : 'translate-x-0.5'
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
								onClick={() => setPush(!push)}
								className={`relative inline-flex h-5 w-9 flex-shrink-0 items-center rounded-full transition-colors ${
									push
										? 'bg-primary-500 dark:bg-primary-600'
										: 'bg-slate-300 dark:bg-slate-600'
								}`}
							>
								<span
									className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${
										push ? 'translate-x-5' : 'translate-x-0.5'
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
							💡 <strong>Tip:</strong> In-app notifications work best with push
							notifications enabled. This ensures you receive real-time alerts even
							when the app is closed.
						</p>
						<button
							type="button"
							onClick={() => {
								setPush(true);
								setShowPushSuggestion(false);
							}}
							className="text-xs text-primary-700 dark:text-primary-300 font-medium hover:underline"
						>
							Enable push notifications
						</button>
					</motion.div>
				)}
			</div>

			{/* Default Frequency */}
			<div className="space-y-3 pt-4 border-t border-slate-200 dark:border-slate-700">
				<h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
					Default Notification Frequency
				</h3>
				<p className="text-xs text-slate-600 dark:text-slate-400">
					This will be used as the default for new calculations
				</p>
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

			{/* Content Preferences */}
			<div className="space-y-3 pt-4 border-t border-slate-200 dark:border-slate-700">
				<h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
					What to Notify About
				</h3>
				<div className="space-y-2">
					<Checkbox
						checked={notifyRecalculate}
						onChange={setNotifyRecalculate}
						label="Remind me to recalculate my wealth"
					/>
					<Checkbox
						checked={notifyZakatDue}
						onChange={setNotifyZakatDue}
						label="Notify when Zakaat is due"
					/>
					<Checkbox
						checked={notifyNisaabChange}
						onChange={setNotifyNisaabChange}
						label="Notify when Nisaab values change significantly"
					/>
					<Checkbox
						checked={notifySummary}
						onChange={setNotifySummary}
						label="Send monthly summary"
					/>
					<Checkbox
						checked={nisaabUpdatesEnabled}
						onChange={setNisaabUpdatesEnabled}
						label="Enable daily Nisaab update notifications"
					/>
					<Checkbox
						checked={communityNotifications}
						onChange={setCommunityNotifications}
						label="Community notifications (likes, comments, follows)"
					/>
				</div>
			</div>

			{/* Delivery Time */}
			<div className="space-y-3 pt-4 border-t border-slate-200 dark:border-slate-700">
				<h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
					<ClockIcon className="w-4 h-4" />
					Delivery Time
				</h3>
				<p className="text-xs text-slate-600 dark:text-slate-400">
					Choose when you want to receive notifications (UTC time)
				</p>
				<div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
					<Input
						type="text"
						inputMode="numeric"
						label="Hour (0-23)"
						value={sendHour.toString()}
						onChange={(e) => {
							const inputValue = e.target.value;
							if (inputValue === '') {
								setSendHour(7);
								return;
							}
							const hour = parseInt(inputValue);
							if (!isNaN(hour) && hour >= 0 && hour <= 23) {
								setSendHour(hour);
							}
						}}
						placeholder="7"
						helperText="Default: 7 AM UTC"
					/>
					<TimezoneSelector
						value={timezone}
						onChange={(value) => setTimezone(value)}
						label="Timezone"
						helperText="Select your timezone. UTC is used if no timezone is selected."
					/>
				</div>
			</div>

			{/* Save Button */}
			<div className="pt-4">
				<Button
					variant="primary"
					onClick={handleSave}
					isLoading={isSaving}
					disabled={isSaving}
					className="w-full"
				>
					Save Preferences
				</Button>
			</div>
		</motion.div>
	);
}
