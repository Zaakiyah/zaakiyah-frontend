import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { useCurrencyStore } from '../store/currencyStore';
import { useTheme } from '../hooks/useTheme';
import { logger } from '../utils/logger';
import { alert } from '../store/alertStore';
import { renderContentWithHashtagsAndLinks } from '../utils/textUtils';
import {
	nisaabService,
	type NisaabData,
	GOLD_NISAAB_GRAMS,
	SILVER_NISAAB_GRAMS,
} from '../services/nisaabService';
import { wealthCalculationService } from '../services/wealthCalculationService';
import { formatCurrency } from '../utils/currency';
import { currencyService } from '../services/currencyService';
import { communityService } from '../services/communityService';
import { formatDistanceToNow } from 'date-fns';
import PostPreviewCard from '../components/dashboard/PostPreviewCard';
import BottomNavigation from '../components/layout/BottomNavigation';
import NotificationIcon from '../components/ui/NotificationIcon';
import Avatar from '../components/ui/Avatar';
import { WEBSITE_PAGES } from '../config/website';
import {
	ArrowRightIcon,
	SparklesIcon,
	CalendarIcon,
	CalculatorIcon,
	HeartIcon,
	HandRaisedIcon,
	DocumentTextIcon,
	BookOpenIcon,
	QuestionMarkCircleIcon,
	ClockIcon,
	EyeIcon,
	EyeSlashIcon,
	ChartBarIcon,
	ChatBubbleLeftIcon,
	CheckCircleIcon,
	VideoCameraIcon,
	MusicalNoteIcon,
	PlayIcon,
	ShieldCheckIcon,
	DocumentDuplicateIcon,
	CheckIcon,
} from '@heroicons/react/24/outline';
import {
	CurrencyDollarIcon,
	HeartIcon as HeartIconSolid,
	CheckBadgeIcon,
} from '@heroicons/react/24/solid';

interface ZakaatCalculation {
	amount: number;
	currency: string; // Currency the calculation was done in
	lastCalculated: Date;
	meetsNisaab: boolean;
}

export default function DashboardPage() {
	const navigate = useNavigate();
	const { user } = useAuthStore();
	const { preferredCurrency, syncWithUserProfile, fetchSupportedCurrencies } = useCurrencyStore();
	useTheme();
	const [nisaabData, setNisaabData] = useState<NisaabData | null>(null);
	const [isLoadingNisaab, setIsLoadingNisaab] = useState(true);
	const [isAmountVisible, setIsAmountVisible] = useState(true);
	const [zakaatCalculation, setZakaatCalculation] = useState<ZakaatCalculation | null>(null);
	const [convertedAmount, setConvertedAmount] = useState<number | null>(null);
	const [isConverting, setIsConverting] = useState(false);
	const [communityPosts, setCommunityPosts] = useState<any[]>([]);
	const [knowledgeResources, setKnowledgeResources] = useState<any[]>([]);
	const [isLoadingCommunity, setIsLoadingCommunity] = useState(true);
	const [copiedValue, setCopiedValue] = useState<string | null>(null);
	const isFetchingRef = useRef(false);
	const [likingPostId, setLikingPostId] = useState<string | null>(null);

	// Sync currency with user profile and fetch currencies on mount
	useEffect(() => {
		syncWithUserProfile();
		fetchSupportedCurrencies();
	}, [syncWithUserProfile, fetchSupportedCurrencies]);

	useEffect(() => {
		if (isFetchingRef.current) {
			return;
		}

		isFetchingRef.current = true;

		const fetchData = async () => {
			try {
				// Fetch Nisaab data
				const currency = preferredCurrency || user?.preferredCurrency || 'USD';
				const nisaabResponse = await nisaabService.getTodayNisaab(currency);
				if (nisaabResponse?.data) {
					setNisaabData(nisaabResponse.data);
				}
				setIsLoadingNisaab(false);

				// Fetch latest active calculation
				try {
					const calculationsResponse = await wealthCalculationService.getCalculations(
						1,
						1,
						'active'
					);
					if (
						calculationsResponse?.data?.items &&
						calculationsResponse.data.items.length > 0
					) {
						const latestCalculation = calculationsResponse.data.items[0] as any;
						// Backend API returns zakatDue and meetsNisaab directly on the calculation object
						const zakatDue =
							latestCalculation.zakatDue ??
							latestCalculation.calculationResult?.zakatDue ??
							0;
						const meetsNisaab =
							latestCalculation.meetsNisaab ??
							latestCalculation.calculationResult?.meetsNisaab ??
							false;

						// Always set zakaatCalculation if a calculation exists, even if zakatDue is 0 or null
						const calculationCurrency =
							latestCalculation.currency ||
							preferredCurrency ||
							user?.preferredCurrency ||
							'USD';
						setZakaatCalculation({
							amount: zakatDue ?? 0,
							currency: calculationCurrency,
							lastCalculated: new Date(latestCalculation.calculationDate),
							meetsNisaab: meetsNisaab ?? false,
						});
					} else {
						// Explicitly set to null if no calculations exist
						setZakaatCalculation(null);
					}
				} catch (error) {
					logger.error('[Dashboard] Error fetching latest calculation:', error);
					// Don't set error state, just log - user can still use the dashboard
					setZakaatCalculation(null);
				}
			} catch (error) {
				logger.error('[Dashboard] Error fetching nisaab:', error);
				setIsLoadingNisaab(false);
			} finally {
				isFetchingRef.current = false;
			}
		};

		fetchData();
	}, [preferredCurrency, user?.preferredCurrency]);

	// Convert Zakaat amount if calculation currency differs from preferred currency
	useEffect(() => {
		if (
			zakaatCalculation &&
			zakaatCalculation.currency &&
			zakaatCalculation.currency !== preferredCurrency &&
			zakaatCalculation.amount > 0
		) {
			setIsConverting(true);
			currencyService
				.convertCurrency(
					zakaatCalculation.currency,
					preferredCurrency,
					zakaatCalculation.amount
				)
				.then((response) => {
					if (response.data) {
						const converted =
							response.data.convertedValue || response.data.convertedAmount;
						setConvertedAmount(converted || null);
					} else {
						setConvertedAmount(null);
					}
				})
				.catch((error) => {
					logger.error('Error converting Zakaat amount:', error);
					setConvertedAmount(null);
				})
				.finally(() => {
					setIsConverting(false);
				});
		} else {
			setConvertedAmount(null);
		}
	}, [zakaatCalculation, preferredCurrency]);

	// Fetch community posts and knowledge resources
	useEffect(() => {
		const fetchCommunityData = async () => {
			try {
				setIsLoadingCommunity(true);

				// Fetch recent posts (limit to 3)
				try {
					const postsResponse = await communityService.getPosts({ page: 1, limit: 3 });
					if (postsResponse?.data?.data) {
						setCommunityPosts(postsResponse.data.data);
					}
				} catch (error) {
					logger.error('[Dashboard] Error fetching community posts:', error);
				}

				// Fetch featured knowledge resources (limit to 3)
				try {
					const knowledgeResponse = await communityService.getKnowledgeResources({
						page: 1,
						limit: 3,
						featured: true,
					});
					if (knowledgeResponse?.data?.data) {
						setKnowledgeResources(knowledgeResponse.data.data);
					}
				} catch (error) {
					logger.error('[Dashboard] Error fetching knowledge resources:', error);
				}
			} catch (error) {
				logger.error('[Dashboard] Error fetching community data:', error);
			} finally {
				setIsLoadingCommunity(false);
			}
		};

		fetchCommunityData();
	}, []);

	const handlePostLike = async (postId: string) => {
		if (likingPostId === postId) return; // Prevent multiple clicks
		try {
			setLikingPostId(postId);
			const response = await communityService.togglePostLike(postId);
			if (response.data) {
				setCommunityPosts((posts) =>
					posts.map((post) =>
						post.id === postId
							? {
									...post,
									isLiked: response.data.liked,
									likesCount: response.data.liked
										? post.likesCount + 1
										: post.likesCount - 1,
							  }
							: post
					)
				);
			}
		} catch (error) {
			logger.error('Error toggling post like:', error);
		}
	};

	const getInitials = (firstName: string, lastName: string) => {
		return (
			`${firstName?.[0]?.toUpperCase() || ''}${lastName?.[0]?.toUpperCase() || ''}`.trim() ||
			'U'
		);
	};

	// Render content with clickable hashtags and links
	const renderContentWithHashtags = (text: string): React.ReactNode => {
		return renderContentWithHashtagsAndLinks(text);
	};

	const formatGrams = (grams: number): string => {
		return grams.toFixed(2);
	};

	const formatHijriDate = (hijriDate: string): string => {
		if (!hijriDate) return '';
		const parts = hijriDate.split('-');
		if (parts.length !== 3) return hijriDate;

		const day = parseInt(parts[2]);
		const month = parseInt(parts[1]);
		const year = parseInt(parts[0]);

		const monthNames = [
			'Muḥarram',
			'Ṣafar',
			'Rabīʿ al-awwal',
			'Rabīʿ al-thānī',
			'Jumādá al-ūlá',
			'Jumādá al-ākhirah',
			'Rajab',
			'Shaʿbān',
			'Ramaḍān',
			'Shawwāl',
			'Dhū al-Qaʿdah',
			'Dhū al-Ḥijjah',
		];

		return `${day}${getOrdinalSuffix(day)} ${monthNames[month - 1]} ${year} AH`;
	};

	const getOrdinalSuffix = (day: number): string => {
		if (day > 3 && day < 21) return 'th';
		switch (day % 10) {
			case 1:
				return 'st';
			case 2:
				return 'nd';
			case 3:
				return 'rd';
			default:
				return 'th';
		}
	};

	const formatTimeAgo = (date: Date): string => {
		const now = new Date();
		const diffInMs = now.getTime() - date.getTime();
		const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
		const diffInWeeks = Math.floor(diffInDays / 7);
		const diffInMonths = Math.floor(diffInDays / 30);

		if (diffInDays === 0) return 'Today';
		if (diffInDays === 1) return 'Yesterday';
		if (diffInDays < 7) return `${diffInDays} days ago`;
		if (diffInWeeks === 1) return '1 week ago';
		if (diffInWeeks < 4) return `${diffInWeeks} weeks ago`;
		if (diffInMonths === 1) return '1 month ago';
		return `${diffInMonths} months ago`;
	};

	const copyValue = async (value: string | number | null, type: 'gold' | 'silver') => {
		if (!value || value === 0 || value === '0') return;
		
		const formattedValue = formatCurrency(value);
		const copyId = `${type}-${Date.now()}`;

		try {
			if (navigator.clipboard && navigator.clipboard.writeText) {
				await navigator.clipboard.writeText(formattedValue);
			} else {
				const textarea = document.createElement('textarea');
				textarea.value = formattedValue;
				textarea.style.position = 'fixed';
				textarea.style.opacity = '0';
				document.body.appendChild(textarea);
				textarea.select();
				document.execCommand('copy');
				document.body.removeChild(textarea);
			}
			setCopiedValue(copyId);
			alert.success(`${type === 'gold' ? 'Gold' : 'Silver'} value copied!`);
			setTimeout(() => setCopiedValue(null), 2000);
		} catch (error) {
			logger.error('Failed to copy:', error);
			alert.error('Failed to copy value');
		}
	};

	const actionButtons = [
		{
			icon: CalculatorIcon,
			label: 'Calculate',
			onClick: () => navigate('/calculate'),
		},
		{
			icon: HeartIcon,
			label: 'Give',
			onClick: () => navigate('/zakaat/donation/recipients'),
		},
		{
			icon: HandRaisedIcon,
			label: 'Sadaqah',
			onClick: () => navigate('/sadaqah'),
		},
		{
			icon: DocumentTextIcon,
			label: 'Apply',
			onClick: () => navigate('/zakaat/apply'),
		},
	];

	const quickLinks = [
		{
			icon: ChartBarIcon,
			label: 'History',
			onClick: () => navigate('/donations/history'),
		},
		{
			icon: BookOpenIcon,
			label: 'Blog',
			onClick: () => window.open(WEBSITE_PAGES.BLOG, '_blank', 'noopener,noreferrer'),
		},
		{
			icon: QuestionMarkCircleIcon,
			label: 'Help',
			onClick: () => window.open(WEBSITE_PAGES.HELP, '_blank', 'noopener,noreferrer'),
		},
	];

	return (
		<div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 pb-20">
			{/* Compact Header */}
			<header className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-xl border-b-2 border-primary-500/20 dark:border-primary-400/20 sticky top-0 z-40 shadow-sm">
				<div className="px-4 py-3">
					<div className="flex items-center justify-between">
						<div className="flex items-center gap-2.5">
							<button onClick={() => navigate('/profile')} className="relative group">
								<Avatar
									avatarUrl={user?.avatarUrl}
									firstName={user?.firstName || ''}
									lastName={user?.lastName || ''}
									size="md"
									isVerified={user?.isVerified}
									isAdmin={user?.isAdmin}
								/>
							</button>
							<div>
								<p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
									Welcome back,
								</p>
								<p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
									{user?.firstName || 'User'} 👋
								</p>
							</div>
						</div>
						<NotificationIcon />
					</div>
				</div>
			</header>

			{/* Main Content */}
			<main className="px-4 py-4 space-y-4">
				{/* Modern Zakaat Due Card */}
				<motion.div
					initial={{ opacity: 0, y: 20, scale: 0.95 }}
					animate={{ opacity: 1, y: 0, scale: 1 }}
					transition={{ type: 'spring', stiffness: 100 }}
					whileHover={{ scale: 1.01, y: -2 }}
					className="group relative overflow-hidden rounded-2xl p-5 shadow-xl border-2 border-primary-200/60 dark:border-primary-800/60 bg-gradient-to-br from-primary-50 via-white to-slate-50 dark:from-slate-800 dark:via-slate-800 dark:to-slate-900"
				>
					{/* Decorative gradient overlay */}
					<div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-br from-primary-500/10 via-secondary-500/10 to-primary-400/5 rounded-full blur-3xl -z-0 pointer-events-none" />
					<div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-secondary-500/10 to-transparent rounded-full blur-2xl -z-0 pointer-events-none" />
					{zakaatCalculation &&
					zakaatCalculation.meetsNisaab &&
					zakaatCalculation.amount > 0 ? (
						<div className="flex items-start gap-4 relative z-20">
							<div className="flex-shrink-0">
								<div className="w-16 h-16 bg-gradient-to-br from-primary-500 via-primary-600 to-primary-700 dark:from-primary-700 dark:via-primary-800 dark:to-primary-900 rounded-2xl flex items-center justify-center shadow-lg shadow-primary-500/30 dark:shadow-primary-700/30 overflow-hidden">
									<div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent dark:opacity-0" />
									<CurrencyDollarIcon className="w-8 h-8 text-white relative z-10" />
								</div>
							</div>
							<div className="flex-1 min-w-0">
								<div className="flex items-center justify-between mb-2">
									<div className="flex items-center gap-2">
										<p className="text-sm font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
											Zakaat Due
										</p>
										<SparklesIcon className="w-4 h-4 text-primary-500 dark:text-primary-400" />
									</div>
									<button
										onClick={() => navigate('/calculations')}
										className="relative z-20 text-xs font-semibold text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 transition-colors inline-flex items-center gap-1 px-2 py-1 rounded-xl hover:bg-gradient-to-br hover:from-primary-50 hover:to-primary-100 dark:hover:from-primary-900/30 dark:hover:to-primary-800/20"
										type="button"
									>
										View all
										<ArrowRightIcon className="w-3.5 h-3.5" />
									</button>
								</div>
								<div className="flex items-center gap-2 mb-2">
									{isAmountVisible ? (
										<>
											<div className="flex-1 min-w-0">
												<p className="text-base sm:text-lg md:text-xl lg:text-2xl xl:text-3xl font-bold text-slate-900 dark:text-slate-100 mb-1 break-words">
													{formatCurrency(
														zakaatCalculation.amount,
														zakaatCalculation.currency
													)}
												</p>
												{convertedAmount !== null &&
													zakaatCalculation.currency !==
														preferredCurrency && (
														<p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 break-words">
															≈{' '}
															{formatCurrency(
																convertedAmount,
																preferredCurrency
															)}
															{isConverting && (
																<span className="ml-1 text-slate-400">
																	(converting...)
																</span>
															)}
														</p>
													)}
											</div>
											<button
												onClick={() => setIsAmountVisible(false)}
												className="relative z-20 p-1 rounded-xl hover:bg-gradient-to-br hover:from-primary-100 hover:to-primary-200 dark:hover:from-primary-800 dark:hover:to-primary-700 transition-all"
												aria-label="Hide amount"
											>
												<EyeSlashIcon className="w-3.5 h-3.5 text-slate-600 dark:text-slate-400" />
											</button>
										</>
									) : (
										<>
											<p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
												••••••
											</p>
											<button
												onClick={() => setIsAmountVisible(true)}
												className="relative z-20 p-1 rounded-xl hover:bg-gradient-to-br hover:from-primary-100 hover:to-primary-200 dark:hover:from-primary-800 dark:hover:to-primary-700 transition-all"
												aria-label="Show amount"
											>
												<EyeIcon className="w-3.5 h-3.5 text-slate-600 dark:text-slate-400" />
											</button>
										</>
									)}
								</div>
								<div className="flex items-center gap-1.5 mt-2">
									<ClockIcon className="w-4 h-4 text-slate-500 dark:text-slate-400" />
									<p className="text-xs font-medium text-slate-500 dark:text-slate-400">
										Last calculated{' '}
										{formatTimeAgo(zakaatCalculation.lastCalculated)}
									</p>
								</div>
							</div>
						</div>
					) : zakaatCalculation && !zakaatCalculation.meetsNisaab ? (
						<div className="flex items-start gap-4 relative z-20">
							<div className="flex-shrink-0">
								<div className="w-16 h-16 bg-gradient-to-br from-emerald-500 via-emerald-600 to-emerald-700 dark:from-emerald-700 dark:via-emerald-800 dark:to-emerald-900 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/30 dark:shadow-emerald-700/30 overflow-hidden">
									<div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent dark:opacity-0" />
									<CheckCircleIcon className="w-8 h-8 text-white relative z-10" />
								</div>
							</div>
							<div className="flex-1 min-w-0">
								<div className="flex items-center justify-between mb-2">
									<div className="flex items-center gap-2">
										<p className="text-sm font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
											No Zakaat Due
										</p>
										<SparklesIcon className="w-4 h-4 text-emerald-500 dark:text-emerald-400" />
									</div>
									<button
										onClick={() => navigate('/calculations')}
										className="relative z-20 text-xs font-semibold text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 transition-colors inline-flex items-center gap-1 px-2 py-1 rounded-xl hover:bg-gradient-to-br hover:from-primary-50 hover:to-primary-100 dark:hover:from-primary-900/30 dark:hover:to-primary-800/20"
										type="button"
									>
										View all
										<ArrowRightIcon className="w-3.5 h-3.5" />
									</button>
								</div>
								<p className="text-sm text-slate-700 dark:text-slate-300 mb-3 leading-relaxed">
									Your wealth is below the Nisab threshold. You're not required to
									pay Zakaat at this time. May Allāh continue to bless your
									wealth.
								</p>
								<div className="flex items-center gap-1.5 mb-3">
									<ClockIcon className="w-4 h-4 text-slate-500 dark:text-slate-400" />
									<p className="text-xs font-medium text-slate-500 dark:text-slate-400">
										Last checked{' '}
										{formatTimeAgo(zakaatCalculation.lastCalculated)}
									</p>
								</div>
								<button
									onClick={() => navigate('/calculate')}
									className="relative z-20 w-full inline-flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white text-sm font-semibold rounded-xl transition-all active:scale-95 shadow-lg shadow-primary-500/30"
									type="button"
								>
									<CalculatorIcon className="w-5 h-5" />
									<span>Recalculate</span>
								</button>
							</div>
						</div>
					) : (
						<div className="flex items-start gap-4 relative z-20">
							<div className="flex-shrink-0">
								<div className="w-16 h-16 bg-gradient-to-br from-primary-500 via-primary-600 to-primary-700 rounded-2xl flex items-center justify-center shadow-lg shadow-primary-500/30 overflow-hidden">
									<div className="absolute inset-0 bg-gradient-to-br from-white/20 dark:opacity-0 to-transparent" />
									<CalculatorIcon className="w-8 h-8 text-white relative z-10" />
								</div>
							</div>
							<div className="flex-1 min-w-0">
								<div className="flex items-center justify-between mb-2">
									<div className="flex items-center gap-2">
										<p className="text-sm font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
											Zakaat Due
										</p>
										<SparklesIcon className="w-4 h-4 text-primary-500 dark:text-primary-400" />
									</div>
									<button
										onClick={() => navigate('/calculations')}
										className="relative z-20 text-xs font-semibold text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 transition-colors inline-flex items-center gap-1 px-2 py-1 rounded-xl hover:bg-gradient-to-br hover:from-primary-50 hover:to-primary-100 dark:hover:from-primary-900/30 dark:hover:to-primary-800/20"
										type="button"
									>
										View all
										<ArrowRightIcon className="w-3.5 h-3.5" />
									</button>
								</div>
								<p className="text-sm text-slate-700 dark:text-slate-300 mb-3 leading-relaxed">
									Calculate your Zakaat to see how much you owe and fulfill your
									obligation.
								</p>
								<button
									onClick={() => navigate('/calculate')}
									className="relative z-20 w-full inline-flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white text-sm font-semibold rounded-xl transition-all active:scale-95 shadow-lg shadow-primary-500/30"
									type="button"
								>
									<CalculatorIcon className="w-5 h-5" />
									<span>Calculate</span>
								</button>
							</div>
						</div>
					)}
				</motion.div>

				{/* Modern Action Tiles */}
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ delay: 0.1 }}
					className="grid grid-cols-2 gap-4"
				>
					{actionButtons.map((button, index) => {
						const Icon = button.icon;
						const gradients = [
							'from-primary-500 via-primary-600 to-primary-700',
							'from-emerald-500 via-emerald-600 to-emerald-700',
							'from-amber-500 via-amber-600 to-amber-700',
							'from-blue-500 via-blue-600 to-blue-700',
						];
						const gradient = gradients[index % gradients.length];
						return (
							<motion.button
								key={button.label}
								onClick={button.onClick}
								whileHover={{ scale: 1.02, y: -2 }}
								whileTap={{ scale: 0.98 }}
								className="group relative bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:via-slate-800 dark:to-slate-900 rounded-2xl p-5 shadow-lg border-2 border-slate-200/60 dark:border-slate-700/60 hover:shadow-xl transition-all duration-300 overflow-hidden"
							>
								{/* Decorative gradient overlay */}
								<div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-primary-500/10 to-secondary-500/10 rounded-full blur-2xl -z-0" />

								<div className="relative flex flex-col items-center gap-3 z-10">
									<div
										className={`w-14 h-14 bg-gradient-to-br ${gradient} dark:from-slate-700 dark:via-slate-800 dark:to-slate-900 rounded-2xl flex items-center justify-center shadow-lg shadow-primary-500/30 dark:shadow-slate-700/30 group-hover:scale-110 transition-all duration-300 overflow-hidden`}
									>
										<div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent dark:opacity-0" />
										<Icon className="w-7 h-7 text-white dark:text-slate-300 relative z-10" />
									</div>
									<p className="text-sm font-bold text-slate-900 dark:text-slate-100 text-center leading-tight">
										{button.label}
									</p>
								</div>
							</motion.button>
						);
					})}
				</motion.div>

				{/* Modern Nisaab Card */}
				<motion.div
					initial={{ opacity: 0, y: 20, scale: 0.95 }}
					animate={{ opacity: 1, y: 0, scale: 1 }}
					transition={{ delay: 0.2, type: 'spring', stiffness: 100 }}
					whileHover={{ scale: 1.01, y: -2 }}
					className="group relative bg-gradient-to-br from-white via-slate-50 to-white dark:from-slate-800 dark:via-slate-800 dark:to-slate-900 rounded-2xl p-5 shadow-xl border-2 border-slate-200/60 dark:border-slate-700/60 overflow-hidden"
				>
					{/* Decorative gradient overlay */}
					<div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-primary-500/10 via-secondary-500/10 to-primary-400/5 rounded-full blur-3xl -z-0" />
					<div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-secondary-500/10 to-transparent rounded-full blur-2xl -z-0" />

					{/* Header */}
					<div className="flex items-start justify-between mb-4 relative z-10">
						<div className="flex items-center gap-3 flex-1">
							<div className="relative">
								<div className="w-16 h-16 bg-gradient-to-br from-primary-500 via-primary-600 to-primary-700 dark:from-primary-700 dark:via-primary-800 dark:to-primary-900 rounded-2xl flex items-center justify-center shadow-lg shadow-primary-500/30 dark:shadow-primary-700/30 overflow-hidden">
									<div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent dark:opacity-0" />
									<CalendarIcon className="w-8 h-8 text-white relative z-10" />
								</div>
								<div className="absolute -bottom-1 -right-1 w-7 h-7 bg-white dark:bg-slate-800 rounded-full flex items-center justify-center shadow-md border-2 border-primary-500">
									<span className="text-[11px] font-bold text-primary-600 dark:text-primary-400">
										{new Date().getDate()}
									</span>
								</div>
							</div>
							<div className="flex-1 min-w-0">
								<h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-1">
									Today's Nisaab
								</h2>
								{isLoadingNisaab ? (
									<div className="h-4 w-32 bg-gradient-to-r from-slate-200 to-slate-300 dark:from-slate-700 dark:to-slate-800 rounded animate-pulse" />
								) : nisaabData?.hijriDate ? (
									<div className="flex items-center gap-1.5">
										<CalendarIcon className="w-4 h-4 text-primary-500 dark:text-primary-400" />
										<p className="text-xs font-semibold text-slate-600 dark:text-slate-400">
											{formatHijriDate(nisaabData.hijriDate)}
										</p>
									</div>
								) : (
									<p className="text-xs text-slate-500 dark:text-slate-400">
										Date unavailable
									</p>
								)}
							</div>
						</div>
					</div>

					{isLoadingNisaab ? (
						<div className="space-y-3 mb-4 relative z-10">
							<div className="h-20 bg-gradient-to-br from-slate-200 to-slate-300 dark:from-slate-700 dark:to-slate-800 rounded-xl animate-pulse shadow-sm" />
							<div className="h-20 bg-gradient-to-br from-slate-200 to-slate-300 dark:from-slate-700 dark:to-slate-800 rounded-xl animate-pulse shadow-sm" />
						</div>
					) : nisaabData ? (
						<div className="grid grid-cols-2 gap-3 mb-4 relative z-10">
							{/* Gold Nisaab */}
							<div className="relative group/gold overflow-hidden rounded-xl bg-gradient-to-br from-amber-50 via-yellow-50 to-amber-100/50 dark:from-amber-900/20 dark:via-yellow-900/10 dark:to-amber-800/10 p-4 border-2 border-amber-200/50 dark:border-amber-800/30 hover:border-amber-300 dark:hover:border-amber-700 transition-all duration-300">
								<div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-amber-400/20 to-yellow-400/20 rounded-full blur-2xl" />
								<div className="relative z-10">
									<div className="flex items-center justify-between mb-2">
										<div className="flex items-center gap-2">
											<div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-yellow-600 rounded-xl flex items-center justify-center shadow-lg shadow-amber-500/30 flex-shrink-0">
												<SparklesIcon className="w-5 h-5 text-white" />
											</div>
											<p className="text-[10px] font-semibold text-amber-700 dark:text-amber-300 uppercase tracking-wider">
												Gold
											</p>
										</div>
										<button
											onClick={(e) => {
												e.stopPropagation();
												copyValue(nisaabData.goldNisaabValue, 'gold');
											}}
											className="p-1 rounded-lg hover:bg-amber-100 dark:hover:bg-amber-900/30 text-amber-600 dark:text-amber-400 transition-all active:scale-95 flex-shrink-0"
											title="Copy gold value"
										>
											{copiedValue?.startsWith('gold') ? (
												<CheckIcon className="w-3.5 h-3.5" />
											) : (
												<DocumentDuplicateIcon className="w-3.5 h-3.5" />
											)}
										</button>
									</div>
									<p className="text-[10px] sm:text-xs md:text-sm lg:text-base xl:text-lg font-bold text-slate-900 dark:text-slate-100 mb-1 whitespace-nowrap overflow-hidden text-ellipsis" title={formatCurrency(nisaabData.goldNisaabValue)}>
										{formatCurrency(nisaabData.goldNisaabValue)}
									</p>
									<p className="text-xs text-amber-700/80 dark:text-amber-300/80 font-medium">
										{formatGrams(GOLD_NISAAB_GRAMS)}g
									</p>
								</div>
							</div>

							{/* Silver Nisaab */}
							<div className="relative group/silver overflow-hidden rounded-xl bg-gradient-to-br from-slate-50 via-gray-50 to-slate-100/50 dark:from-slate-700/30 dark:via-gray-800/20 dark:to-slate-700/20 p-4 border-2 border-slate-200/50 dark:border-slate-600/30 hover:border-slate-300 dark:hover:border-slate-500 transition-all duration-300">
								<div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-slate-400/20 to-gray-400/20 rounded-full blur-2xl" />
								<div className="relative z-10">
									<div className="flex items-center justify-between mb-2">
										<div className="flex items-center gap-2">
											<div className="w-10 h-10 bg-gradient-to-br from-slate-500 to-gray-600 rounded-xl flex items-center justify-center shadow-lg shadow-slate-500/30 flex-shrink-0">
												<CurrencyDollarIcon className="w-5 h-5 text-white" />
											</div>
											<p className="text-[10px] font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
												Silver
											</p>
										</div>
										<button
											onClick={(e) => {
												e.stopPropagation();
												copyValue(nisaabData.silverNisaabValue, 'silver');
											}}
											className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-400 transition-all active:scale-95 flex-shrink-0"
											title="Copy silver value"
										>
											{copiedValue?.startsWith('silver') ? (
												<CheckIcon className="w-3.5 h-3.5" />
											) : (
												<DocumentDuplicateIcon className="w-3.5 h-3.5" />
											)}
										</button>
									</div>
									<p className="text-[10px] sm:text-xs md:text-sm lg:text-base xl:text-lg font-bold text-slate-900 dark:text-slate-100 mb-1 whitespace-nowrap overflow-hidden text-ellipsis" title={formatCurrency(nisaabData.silverNisaabValue)}>
										{formatCurrency(nisaabData.silverNisaabValue)}
									</p>
									<p className="text-xs text-slate-700/80 dark:text-slate-300/80 font-medium">
										{formatGrams(SILVER_NISAAB_GRAMS)}g
									</p>
								</div>
							</div>
						</div>
					) : (
						<div className="text-center py-6 relative z-10">
							<div className="w-16 h-16 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-3">
								<CalendarIcon className="w-8 h-8 text-slate-400 dark:text-slate-500" />
							</div>
							<p className="text-sm font-medium text-slate-600 dark:text-slate-400">
								Unable to load nisaab data
							</p>
						</div>
					)}

					<button
						onClick={() => navigate('/nisaab/history')}
						className="w-full relative z-10 flex items-center justify-center gap-2 text-primary-600 dark:text-primary-400 text-sm font-semibold py-3 bg-gradient-to-r from-primary-50 to-primary-100/50 dark:from-primary-900/20 dark:to-primary-800/10 hover:from-primary-100 hover:to-primary-200/50 dark:hover:from-primary-900/30 dark:hover:to-primary-800/20 rounded-xl transition-all duration-200 active:scale-[0.98] border-2 border-primary-200/60 dark:border-primary-800/60 shadow-sm hover:shadow-md group/button"
					>
						<span>View Full History</span>
						<ArrowRightIcon className="w-4 h-4 group-hover/button:translate-x-1 transition-transform" />
					</button>
				</motion.div>

				{/* Modern Quick Links */}
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ delay: 0.3 }}
					className="bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900 rounded-2xl p-4 shadow-lg border-2 border-slate-200/60 dark:border-slate-700/60 overflow-hidden relative"
				>
					{/* Decorative overlay */}
					<div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-primary-500/5 to-secondary-500/5 rounded-full blur-2xl -z-0" />

					<div className="flex items-center gap-3 relative z-10">
						{quickLinks.map((link, index) => {
							const Icon = link.icon;
							const colors = [
								'from-slate-500 to-slate-600',
								'from-primary-500 to-primary-600',
								'from-blue-500 to-blue-600',
							];
							const color = colors[index % colors.length];
							return (
								<motion.button
									key={link.label}
									onClick={link.onClick}
									whileHover={{ scale: 1.05, y: -2 }}
									whileTap={{ scale: 0.95 }}
									className="flex-1 flex flex-col items-center gap-2 p-3 rounded-xl hover:bg-white/50 dark:hover:bg-slate-700/50 transition-all duration-200"
								>
									<div
										className={`w-12 h-12 bg-gradient-to-br ${color} rounded-xl flex items-center justify-center shadow-md`}
									>
										<Icon className="w-6 h-6 text-white" />
									</div>
									<p className="text-xs font-bold text-slate-900 dark:text-slate-100">
										{link.label}
									</p>
								</motion.button>
							);
						})}
					</div>
				</motion.div>

				{/* Modern Community Section */}
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ delay: 0.4 }}
					className="bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900 rounded-2xl p-5 shadow-lg border-2 border-slate-200/60 dark:border-slate-700/60 overflow-hidden relative"
				>
					{/* Decorative overlay */}
					<div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-primary-500/5 to-secondary-500/5 rounded-full blur-3xl -z-0" />

					<div className="flex items-center justify-between mb-4 relative z-10">
						<div className="flex items-center gap-2">
							<div className="w-1 h-6 bg-gradient-to-b from-primary-500 to-primary-600 rounded-full" />
							<h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
								Community
							</h3>
						</div>
						<button
							onClick={() => navigate('/community')}
							className="text-xs font-semibold text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 transition-colors px-3 py-1.5 rounded-xl hover:bg-gradient-to-br hover:from-primary-50 hover:to-primary-100 dark:hover:from-primary-900/30 dark:hover:to-primary-800/20 inline-flex items-center gap-1"
						>
							See All
							<ArrowRightIcon className="w-3.5 h-3.5" />
						</button>
					</div>
					{isLoadingCommunity ? (
						<div className="space-y-3">
							{Array.from({ length: 2 }).map((_, i) => (
								<div
									key={i}
									className="h-24 bg-gradient-to-br from-slate-200 to-slate-300 dark:from-slate-700 dark:to-slate-800 rounded-xl animate-pulse shadow-sm"
								/>
							))}
						</div>
					) : communityPosts.length === 0 && knowledgeResources.length === 0 ? (
						<motion.div
							initial={{ opacity: 0, scale: 0.95 }}
							animate={{ opacity: 1, scale: 1 }}
							className="text-center py-12 relative z-10"
						>
							<div className="relative inline-block mb-4">
								<div className="absolute inset-0 bg-primary-500/20 rounded-full blur-2xl" />
								<ChatBubbleLeftIcon className="w-16 h-16 text-slate-400 dark:text-slate-500 relative z-10 mx-auto" />
							</div>
							<p className="text-base font-bold text-slate-900 dark:text-slate-100 mb-2">
								No community content yet
							</p>
							<p className="text-sm text-slate-500 dark:text-slate-400">
								Check back later for updates
							</p>
						</motion.div>
					) : (
						<div className="space-y-4">
							{/* Community Posts */}
							{communityPosts.length > 0 && (
								<div className="space-y-3">
									{communityPosts.map((post: any) => (
										<PostPreviewCard
											key={post.id}
											post={post}
											onLike={handlePostLike}
											renderContentWithHashtags={renderContentWithHashtags}
											formatDistanceToNow={formatDistanceToNow}
											isLiking={likingPostId === post.id}
										/>
									))}
								</div>
							)}

							{/* Legacy code - can be removed if PostPreviewCard works */}
							{false && communityPosts.length > 0 && (
								<div className="space-y-3">
									{communityPosts.map((post: any) => (
										<div
											key={post.id}
											onClick={() => navigate(`/community/posts/${post.id}`)}
											className="p-3 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-700/50 dark:to-slate-800/50 rounded-xl border-2 border-slate-200/60 dark:border-slate-700/60 cursor-pointer hover:from-slate-100 hover:to-slate-200 dark:hover:from-slate-600 dark:hover:to-slate-700 transition-all shadow-sm"
										>
											<div className="flex items-start gap-2.5 mb-2">
												{post.author?.isAnonymous ? (
													<div className="w-8 h-8 rounded-full bg-gradient-to-br from-slate-400 to-slate-600 flex items-center justify-center ring-2 ring-slate-200 dark:ring-slate-700 flex-shrink-0">
														<span className="text-sm font-bold text-white">
															A
														</span>
													</div>
												) : (
													<div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center flex-shrink-0 ring-2 ring-white dark:ring-slate-800">
														{post.author?.avatarUrl ? (
															<img
																src={post.author.avatarUrl}
																alt={post.author.firstName}
																className="w-8 h-8 rounded-full object-cover"
															/>
														) : (
															<span className="text-white font-semibold text-xs">
																{getInitials(
																	post.author?.firstName || '',
																	post.author?.lastName || ''
																)}
															</span>
														)}
													</div>
												)}
												<div className="flex-1 min-w-0">
													<div className="flex items-center gap-2 mb-0.5">
														<p className="text-xs font-semibold text-slate-900 dark:text-slate-100">
															{post.author?.firstName}{' '}
															{post.author?.lastName}
														</p>
														{/* Badges next to name */}
														{post.author?.isAdmin && (
															<ShieldCheckIcon
																className="w-3 h-3 text-amber-500 flex-shrink-0"
																title="Admin"
															/>
														)}
														{post.author?.isVerified &&
															!post.author?.isAdmin && (
																<CheckBadgeIcon
																	className="w-3 h-3 text-primary-500 flex-shrink-0"
																	title="Verified"
																/>
															)}
														<span className="text-slate-400 dark:text-slate-500">
															•
														</span>
														<p className="text-xs text-slate-500 dark:text-slate-400">
															{formatDistanceToNow(
																new Date(post.createdAt),
																{
																	addSuffix: true,
																}
															)}
														</p>
													</div>
													<div className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed mb-2 line-clamp-2">
														{renderContentWithHashtags(post.content)}
													</div>
													{post.mediaUrls &&
														post.mediaUrls.length > 0 && (
															<div className="rounded-xl overflow-hidden mb-2 border-2 border-slate-200/60 dark:border-slate-700/60">
																{post.mediaUrls.length === 1 ? (
																	<img
																		src={post.mediaUrls[0]}
																		alt="Post media"
																		className="w-full h-32 object-cover"
																	/>
																) : (
																	<div className="grid grid-cols-2 gap-1">
																		{post.mediaUrls
																			.slice(0, 4)
																			.map(
																				(
																					url: string,
																					index: number
																				) => (
																					<img
																						key={index}
																						src={url}
																						alt={`Post media ${
																							index +
																							1
																						}`}
																						className="w-full h-32 object-cover"
																					/>
																				)
																			)}
																	</div>
																)}
															</div>
														)}
													{/* Interactions */}
													<div className="flex items-center gap-4 pt-2 border-t-2 border-slate-200/60 dark:border-slate-700/60">
														<button
															onClick={(e) => {
																e.stopPropagation();
																handlePostLike(post.id);
															}}
															className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400 hover:text-error-500 transition-colors"
														>
															{post.isLiked ? (
																<HeartIconSolid className="w-4 h-4 text-error-500" />
															) : (
																<HeartIcon className="w-4 h-4" />
															)}
															<span className="text-xs font-medium">
																{post.likesCount || 0}
															</span>
														</button>
														<button
															onClick={(e) => {
																e.stopPropagation();
																navigate(
																	`/community/posts/${post.id}`
																);
															}}
															className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400 hover:text-primary-600 transition-colors"
														>
															<ChatBubbleLeftIcon className="w-4 h-4" />
															<span className="text-xs font-medium">
																{post.commentsCount || 0}
															</span>
														</button>
													</div>
												</div>
											</div>
										</div>
									))}
								</div>
							)}

							{/* Knowledge Resources */}
							{knowledgeResources.length > 0 && (
								<div className="pt-4 border-t-2 border-slate-200/60 dark:border-slate-700/60">
									<div className="flex items-center justify-between mb-4">
										<div className="flex items-center gap-2">
											<div className="w-1 h-5 bg-gradient-to-b from-primary-500 to-primary-600 rounded-full" />
											<h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">
												Featured Knowledge
											</h4>
										</div>
										<button
											onClick={() => navigate('/community?tab=knowledge')}
											className="text-xs font-medium text-primary-600 dark:text-primary-400 hover:underline"
										>
											View all
										</button>
									</div>
									<div className="space-y-3">
										{knowledgeResources.map((resource: any) => {
											const isVideo = resource.type === 'video';
											const isAudio = resource.type === 'audio';
											const getTypeIcon = () => {
												if (isVideo) return VideoCameraIcon;
												if (isAudio) return MusicalNoteIcon;
												if (resource.type === 'book') return BookOpenIcon;
												return DocumentTextIcon;
											};
											const TypeIcon = getTypeIcon();
											const formatDuration = (minutes?: number) => {
												if (!minutes) return null;
												if (minutes < 60) return `${minutes} min`;
												const hours = Math.floor(minutes / 60);
												const mins = minutes % 60;
												return mins > 0
													? `${hours}h ${mins}min`
													: `${hours}h`;
											};

											return (
												<div
													key={resource.id}
													onClick={() =>
														navigate(
															`/community/knowledge/${resource.id}`
														)
													}
													className="group relative bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900 rounded-xl border-2 border-slate-200/60 dark:border-slate-700/60 overflow-hidden cursor-pointer hover:border-primary-300 dark:hover:border-primary-700 hover:shadow-xl transition-all duration-200 shadow-sm"
												>
													<div className="flex gap-0">
														{/* Thumbnail */}
														<div className="relative w-24 flex-shrink-0 overflow-hidden bg-gradient-to-br from-primary-400 to-primary-600 self-stretch">
															{resource.thumbnailUrl ? (
																<>
																	<img
																		src={resource.thumbnailUrl}
																		alt={resource.title}
																		className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
																		loading="lazy"
																	/>
																	{(isVideo || isAudio) && (
																		<div className="absolute inset-0 bg-black/30 flex items-center justify-center">
																			<div className="w-8 h-8 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center group-hover:scale-110 transition-transform">
																				<PlayIcon className="w-4 h-4 text-primary-600 ml-0.5" />
																			</div>
																		</div>
																	)}
																</>
															) : (
																<div className="w-full h-full flex items-center justify-center">
																	<TypeIcon className="w-10 h-10 text-white opacity-90" />
																</div>
															)}
															{/* Featured Badge */}
															{resource.isFeatured && (
																<div className="absolute top-1.5 left-1.5 px-2 py-0.5 bg-primary-500 text-white text-[10px] font-bold rounded-full shadow-sm">
																	⭐
																</div>
															)}
														</div>

														{/* Content */}
														<div className="flex-1 p-3 flex flex-col justify-between min-w-0">
															<div className="flex-1 min-w-0">
																<div className="flex items-center gap-1.5 mb-1.5">
																	<TypeIcon className="w-3.5 h-3.5 text-primary-500 flex-shrink-0" />
																	<span className="text-[10px] font-bold text-primary-600 dark:text-primary-400 uppercase tracking-wider">
																		{resource.type}
																	</span>
																</div>
																<h5 className="text-sm font-bold text-slate-900 dark:text-slate-100 mb-1.5 line-clamp-2 leading-snug group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
																	{resource.title}
																</h5>
																{resource.description && (
																	<p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-1 mb-2">
																		{resource.description}
																	</p>
																)}
															</div>

															{/* Metadata */}
															<div className="flex items-center gap-3 text-[10px] text-slate-500 dark:text-slate-400">
																{resource.duration && (
																	<span className="flex items-center gap-1">
																		<ClockIcon className="w-3 h-3" />
																		{formatDuration(
																			resource.duration
																		)}
																	</span>
																)}
																<span className="flex items-center gap-1">
																	<EyeIcon className="w-3 h-3" />
																	{resource.viewCount || 0}
																</span>
																{resource.likeCount > 0 && (
																	<span className="flex items-center gap-1">
																		<HeartIcon className="w-3 h-3" />
																		{resource.likeCount}
																	</span>
																)}
															</div>
														</div>
													</div>
												</div>
											);
										})}
									</div>
								</div>
							)}
						</div>
					)}
				</motion.div>
			</main>

			{/* Bottom Navigation */}
			<BottomNavigation />
		</div>
	);
}
