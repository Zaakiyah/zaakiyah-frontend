import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { useCurrencyStore } from '../store/currencyStore';
import {
	nisaabService,
	type NisaabData,
	GOLD_NISAAB_GRAMS,
	SILVER_NISAAB_GRAMS,
} from '../services/nisaabService';
import { formatCurrency } from '../utils/currency';
import BottomNavigation from '../components/layout/BottomNavigation';
import { WEBSITE_PAGES } from '../config/website';
import StoriesViewer from '../components/stories/StoriesViewer';
import { impactStories } from '../data/impactStories';
import {
	BellIcon,
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
	ShareIcon,
} from '@heroicons/react/24/outline';
import { CurrencyDollarIcon, HeartIcon as HeartIconSolid } from '@heroicons/react/24/solid';

interface ZakaatCalculation {
	amount: number;
	lastCalculated: Date;
}

interface CommunityPost {
	id: number;
	author: string;
	avatar: string | null;
	content: string;
	time: string;
	media?: string;
	likes: number;
	comments: number;
	shares: number;
	isLiked: boolean;
}

export default function DashboardPage() {
	const navigate = useNavigate();
	const { user } = useAuthStore();
	const { preferredCurrency, syncWithUserProfile, fetchSupportedCurrencies } = useCurrencyStore();
	const [nisaabData, setNisaabData] = useState<NisaabData | null>(null);
	const [isLoadingNisaab, setIsLoadingNisaab] = useState(true);
	const [isAmountVisible, setIsAmountVisible] = useState(true);
	const [zakaatCalculation, setZakaatCalculation] = useState<ZakaatCalculation | null>(null);
	const [isStoriesOpen, setIsStoriesOpen] = useState(false);
	const [communityPosts, setCommunityPosts] = useState<CommunityPost[]>([
		{
			id: 1,
			author: 'Ahmad Musa',
			avatar: null,
			content:
				'Just completed my annual Zakaat calculation. The process was so smooth and straightforward!',
			time: '2 hours ago',
			likes: 24,
			comments: 8,
			shares: 3,
			isLiked: false,
		},
		{
			id: 2,
			author: 'Fatima Ali',
			avatar: null,
			content:
				'Grateful for this platform that makes giving Zakaat so easy and transparent. May Allah accept it.',
			time: '5 hours ago',
			media: 'https://images.unsplash.com/photo-1567427017947-545c5f8d16ad?w=500',
			likes: 45,
			comments: 12,
			shares: 7,
			isLiked: true,
		},
		{
			id: 3,
			author: 'Ibrahim Hassan',
			avatar: null,
			content:
				'The Nisaab updates are very helpful for tracking my Zakaat obligations. Keep up the great work!',
			time: '1 day ago',
			likes: 18,
			comments: 5,
			shares: 2,
			isLiked: false,
		},
	]);
	const isFetchingRef = useRef(false);

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

		const fetchNisaab = async () => {
			try {
				const currency = preferredCurrency || user?.preferredCurrency || 'USD';
				const response = await nisaabService.getTodayNisaab(currency);
				if (response?.data) {
					setNisaabData(response.data);
				}
				setIsLoadingNisaab(false);
			} catch (error) {
				console.error('[Dashboard] Error fetching nisaab:', error);
				setIsLoadingNisaab(false);
			} finally {
				isFetchingRef.current = false;
			}
		};

		fetchNisaab();

		const mockCalculation: ZakaatCalculation = {
			amount: 125000,
			lastCalculated: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
		};
		setZakaatCalculation(mockCalculation);
	}, []);

	const handlePostLike = (postId: number) => {
		setCommunityPosts((posts) =>
			posts.map((post) =>
				post.id === postId
					? {
							...post,
							isLiked: !post.isLiked,
							likes: post.isLiked ? post.likes - 1 : post.likes + 1,
					  }
					: post
			)
		);
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

	const actionButtons = [
		{
			icon: CalculatorIcon,
			label: 'Calculate',
			onClick: () => navigate('/calculate'),
		},
		{
			icon: HeartIcon,
			label: 'Give',
			onClick: () => navigate('/donations'),
		},
		{
			icon: HandRaisedIcon,
			label: 'Sadaqah',
			onClick: () => navigate('/sadaqah'),
		},
		{
			icon: DocumentTextIcon,
			label: 'Apply',
			onClick: () => navigate('/apply'),
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
		<div className="min-h-screen bg-slate-50 pb-20">
			{/* Compact Header */}
			<header className="bg-white/80 backdrop-blur-xl border-b border-slate-200/60 sticky top-0 z-40 shadow-sm">
				<div className="px-4 py-3">
					<div className="flex items-center justify-between">
						<div className="flex items-center gap-2.5">
							<button onClick={() => navigate('/profile')} className="relative group">
								{user?.avatarUrl ? (
									<img
										src={user.avatarUrl}
										alt={user.firstName}
										className="w-9 h-9 rounded-full object-cover ring-2 ring-slate-200 group-hover:ring-primary-300 transition-all"
									/>
								) : (
									<div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center ring-2 ring-slate-200 group-hover:ring-primary-300 transition-all">
										<span className="text-white font-semibold text-sm">
											{user?.firstName?.[0]?.toUpperCase() || 'U'}
										</span>
									</div>
								)}
							</button>
							<div>
								<p className="text-xs text-slate-500 font-medium">Welcome back,</p>
								<p className="text-sm font-semibold text-slate-900">
									{user?.firstName || 'User'} 👋
								</p>
							</div>
						</div>
						<button
							onClick={() => navigate('/notifications')}
							className="relative p-2 rounded-lg hover:bg-slate-100 transition-all active:scale-95"
						>
							<BellIcon className="w-5 h-5 text-slate-700" />
							<span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-error-500 rounded-full ring-2 ring-white" />
						</button>
					</div>
				</div>
			</header>

			{/* Main Content */}
			<main className="px-4 py-4 space-y-4">
				{/* Compact Zakaat Due Card */}
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					className="bg-gradient-to-br from-primary-50 via-primary-50/50 to-white rounded-xl p-4 shadow-sm border border-primary-100/50"
				>
					<div className="flex items-center justify-between">
						<div className="flex-1">
							<p className="text-xs font-medium text-slate-600 mb-1">Zakaat Due</p>
							<div className="flex items-center gap-2">
								{isAmountVisible ? (
									<>
										<p className="text-2xl font-bold text-slate-900">
											{zakaatCalculation
												? formatCurrency(zakaatCalculation.amount)
												: '₦0.00'}
										</p>
										<button
											onClick={() => setIsAmountVisible(false)}
											className="p-1 rounded-lg hover:bg-white/50 transition-colors"
										>
											<EyeSlashIcon className="w-4 h-4 text-slate-600" />
										</button>
									</>
								) : (
									<>
										<p className="text-2xl font-bold text-slate-900">••••••</p>
										<button
											onClick={() => setIsAmountVisible(true)}
											className="p-1 rounded-lg hover:bg-white/50 transition-colors"
										>
											<EyeIcon className="w-4 h-4 text-slate-600" />
										</button>
									</>
								)}
							</div>
							{zakaatCalculation && (
								<div className="flex items-center gap-1 mt-1.5">
									<ClockIcon className="w-3 h-3 text-slate-500" />
									<p className="text-xs text-slate-500">
										Last calculated{' '}
										{formatTimeAgo(zakaatCalculation.lastCalculated)}
									</p>
								</div>
							)}
						</div>
					</div>
				</motion.div>

				{/* Compact Action Buttons */}
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ delay: 0.1 }}
					className="grid grid-cols-4 gap-2"
				>
					{actionButtons.map((button) => {
						const Icon = button.icon;
						return (
							<button
								key={button.label}
								onClick={button.onClick}
								className="bg-white rounded-xl p-2.5 shadow-sm border border-slate-200/60 hover:shadow-md hover:border-primary-200/60 transition-all active:scale-[0.98] flex flex-col items-center gap-1.5"
							>
								<div className="w-9 h-9 bg-gradient-to-br from-primary-500 to-primary-600 rounded-lg flex items-center justify-center shadow-sm">
									<Icon className="w-4.5 h-4.5 text-white" />
								</div>
								<p className="text-[10px] font-semibold text-slate-900 text-center leading-tight whitespace-nowrap">
									{button.label}
								</p>
							</button>
						);
					})}
				</motion.div>

				{/* Compact Nisaab Card */}
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ delay: 0.2 }}
					className="bg-white rounded-xl p-4 shadow-sm border border-slate-200/60 overflow-hidden"
				>
					<div className="flex items-center justify-between mb-3">
						<div className="flex-1">
							<h2 className="text-base font-bold text-slate-900 mb-0.5">
								Today's Nisaab
							</h2>
							{isLoadingNisaab ? (
								<p className="text-xs text-slate-500">Loading...</p>
							) : nisaabData?.hijriDate ? (
								<div className="flex items-center gap-1.5">
									<CalendarIcon className="w-3 h-3 text-slate-400" />
									<p className="text-xs font-medium text-slate-600">
										{formatHijriDate(nisaabData.hijriDate)}
									</p>
								</div>
							) : (
								<p className="text-xs text-slate-500">Date unavailable</p>
							)}
						</div>
						<div className="relative">
							<div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center shadow-sm overflow-hidden">
								<CalendarIcon className="absolute w-14 h-14 text-white/15 -bottom-1.5 -right-1.5" />
								<span className="relative text-xl font-bold text-white z-10">
									{new Date().getDate()}
								</span>
							</div>
						</div>
					</div>

					{isLoadingNisaab ? (
						<div className="space-y-2">
							<div className="h-16 bg-slate-100 rounded-lg animate-pulse" />
							<div className="h-16 bg-slate-100 rounded-lg animate-pulse" />
						</div>
					) : nisaabData ? (
						<div className="space-y-2 mb-3">
							{/* Gold Nisaab */}
							<div className="relative overflow-hidden p-3 bg-gradient-to-br from-secondary-50 via-secondary-50/60 to-secondary-50/80 rounded-lg border border-secondary-200/50">
								<div className="flex items-center gap-3">
									<div className="flex-shrink-0">
										<div className="w-10 h-10 bg-gradient-to-br from-secondary-500 to-secondary-600 rounded-lg flex items-center justify-center shadow-sm">
											<SparklesIcon className="w-5 h-5 text-white" />
										</div>
									</div>
									<div className="flex-1 min-w-0">
										<p className="text-xs font-semibold text-slate-700 uppercase tracking-wide mb-0.5">
											Gold
										</p>
										<p className="text-base font-bold text-slate-900">
											{formatCurrency(nisaabData.goldNisaabValue)}
										</p>
										<p className="text-xs text-slate-600/80 font-medium">
											{formatGrams(GOLD_NISAAB_GRAMS)}g
										</p>
									</div>
								</div>
							</div>

							{/* Silver Nisaab */}
							<div className="relative overflow-hidden p-3 bg-gradient-to-br from-slate-50 via-slate-50/60 to-slate-100/80 rounded-lg border border-slate-200/50">
								<div className="flex items-center gap-3">
									<div className="flex-shrink-0">
										<div className="w-10 h-10 bg-gradient-to-br from-slate-500 to-slate-600 rounded-lg flex items-center justify-center shadow-sm">
											<CurrencyDollarIcon className="w-5 h-5 text-white" />
										</div>
									</div>
									<div className="flex-1 min-w-0">
										<p className="text-xs font-semibold text-slate-700 uppercase tracking-wide mb-0.5">
											Silver
										</p>
										<p className="text-base font-bold text-slate-900">
											{formatCurrency(nisaabData.silverNisaabValue)}
										</p>
										<p className="text-xs text-slate-600/80 font-medium">
											{formatGrams(SILVER_NISAAB_GRAMS)}g
										</p>
									</div>
								</div>
							</div>
						</div>
					) : (
						<div className="text-center py-4">
							<p className="text-xs text-slate-500">Unable to load nisaab data</p>
						</div>
					)}

					<button
						onClick={() => navigate('/nisaab/history')}
						className="w-full flex items-center justify-center gap-1.5 text-primary-600 text-xs font-semibold py-2 hover:bg-primary-50/50 rounded-lg transition-all active:scale-[0.98] border border-primary-100 hover:border-primary-200"
					>
						<span>See History</span>
						<ArrowRightIcon className="w-3.5 h-3.5" />
					</button>
				</motion.div>

				{/* Compact Quick Links */}
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ delay: 0.3 }}
					className="bg-white rounded-xl p-3 shadow-sm border border-slate-200/60"
				>
					<div className="flex items-center gap-2">
						{quickLinks.map((link) => {
							const Icon = link.icon;
							return (
								<button
									key={link.label}
									onClick={link.onClick}
									className="flex-1 flex flex-col items-center gap-1.5 p-2.5 rounded-lg hover:bg-slate-50 transition-colors active:scale-[0.98]"
								>
									<div className="w-9 h-9 bg-slate-100 rounded-lg flex items-center justify-center">
										<Icon className="w-5 h-5 text-slate-700" />
									</div>
									<p className="text-xs font-semibold text-slate-900">
										{link.label}
									</p>
								</button>
							);
						})}
					</div>
				</motion.div>

				{/* Enhanced Community Posts */}
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ delay: 0.4 }}
					className="bg-white rounded-xl p-4 shadow-sm border border-slate-200/60"
				>
					<div className="flex items-center justify-between mb-3">
						<h3 className="text-base font-bold text-slate-900">Community</h3>
						<button
							onClick={() => navigate('/community')}
							className="text-xs font-medium text-primary-600 hover:text-primary-700"
						>
							See All
						</button>
					</div>
					<div className="space-y-3">
						{communityPosts.map((post) => (
							<div
								key={post.id}
								className="p-3 bg-slate-50 rounded-lg border border-slate-100"
							>
								<div className="flex items-start gap-2.5 mb-2">
									<div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center flex-shrink-0">
										<span className="text-white font-semibold text-xs">
											{post.author[0]}
										</span>
									</div>
									<div className="flex-1 min-w-0">
										<div className="flex items-center gap-2 mb-0.5">
											<p className="text-xs font-semibold text-slate-900">
												{post.author}
											</p>
											<span className="text-slate-400">•</span>
											<p className="text-xs text-slate-500">{post.time}</p>
										</div>
										<p className="text-sm text-slate-700 leading-relaxed mb-2">
											{post.content}
										</p>
										{post.media && (
											<div className="rounded-lg overflow-hidden mb-2 border border-slate-200">
												<img
													src={post.media}
													alt="Post media"
													className="w-full h-40 object-cover"
												/>
											</div>
										)}
										{/* Interactions */}
										<div className="flex items-center gap-4 pt-2 border-t border-slate-200">
											<button
												onClick={() => handlePostLike(post.id)}
												className="flex items-center gap-1.5 text-slate-600 hover:text-error-500 transition-colors"
											>
												{post.isLiked ? (
													<HeartIconSolid className="w-4 h-4 text-error-500" />
												) : (
													<HeartIcon className="w-4 h-4" />
												)}
												<span className="text-xs font-medium">
													{post.likes}
												</span>
											</button>
											<button className="flex items-center gap-1.5 text-slate-600 hover:text-primary-600 transition-colors">
												<ChatBubbleLeftIcon className="w-4 h-4" />
												<span className="text-xs font-medium">
													{post.comments}
												</span>
											</button>
											<button className="flex items-center gap-1.5 text-slate-600 hover:text-primary-600 transition-colors">
												<ShareIcon className="w-4 h-4" />
												<span className="text-xs font-medium">
													{post.shares}
												</span>
											</button>
										</div>
									</div>
								</div>
							</div>
						))}
					</div>
				</motion.div>
			</main>

			{/* Bottom Navigation */}
			<BottomNavigation />

			{/* Floating Action Buttons Container */}
			<div className="fixed bottom-24 right-4 md:right-6 flex flex-col gap-4 z-40">
				{/* Impact Stories Floating Button */}
				<div className="relative w-16 h-16">
					<motion.button
						onClick={() => setIsStoriesOpen(true)}
						className="relative w-full h-full rounded-full shadow-2xl flex items-center justify-center overflow-visible group bg-white"
						whileHover={{ scale: 1.1 }}
						whileTap={{ scale: 0.95 }}
						aria-label="View Impact Stories"
						initial={{ scale: 0, rotate: 180 }}
						animate={{ scale: 1, rotate: 0 }}
						transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.1 }}
					>
						{/* Custom dashed border - each curved dash represents a story */}
						<svg
							className="absolute inset-0 w-full h-full pointer-events-none"
							viewBox="0 0 64 64"
							style={{ transform: 'rotate(-90deg)' }}
						>
							{Array.from({ length: impactStories.length }).map((_, index) => {
								const segmentAngle = 360 / impactStories.length; // Angle for each segment
								const gapAngle = segmentAngle * 0.12; // Small gap (12% of segment) - adjusts automatically
								const dashAngle = segmentAngle - gapAngle; // Dash covers the rest (88% of segment)
								const angle = segmentAngle * index;
								const radius = 30;

								// Start angle with small gap from previous dash
								const startAngle = ((angle + gapAngle / 2) * Math.PI) / 180;
								// End angle before next gap
								const endAngle =
									((angle + gapAngle / 2 + dashAngle) * Math.PI) / 180;

								// Calculate start and end points on the circle
								const x1 = 32 + radius * Math.cos(startAngle);
								const y1 = 32 + radius * Math.sin(startAngle);
								const x2 = 32 + radius * Math.cos(endAngle);
								const y2 = 32 + radius * Math.sin(endAngle);

								// Create arc path - large-arc-flag=0, sweep-flag=1 for clockwise arc
								const largeArcFlag = dashAngle > 180 ? 1 : 0;
								const path = `M ${x1} ${y1} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}`;

								return (
									<motion.path
										key={index}
										d={path}
										fill="none"
										stroke="currentColor"
										strokeWidth="3"
										strokeLinecap="round"
										className="text-primary-600"
										animate={{
											opacity: [0.6, 1, 0.6],
										}}
										transition={{
											duration: 2,
											repeat: Infinity,
											ease: 'easeInOut',
											delay: index * 0.15,
										}}
									/>
								);
							})}
						</svg>

						{/* Animated pulsing ring around dashes */}
						<motion.div
							className="absolute inset-0 rounded-full border border-primary-400/30 pointer-events-none"
							animate={{
								scale: [1, 1.12, 1],
								opacity: [0.2, 0.5, 0.2],
							}}
							transition={{
								duration: 2,
								repeat: Infinity,
								ease: 'easeInOut',
							}}
						/>

						{/* Icon */}
						<HeartIcon className="w-7 h-7 text-primary-600 relative z-10" />
					</motion.button>
				</div>
			</div>

			{/* Impact Stories Viewer */}
			<StoriesViewer isOpen={isStoriesOpen} onClose={() => setIsStoriesOpen(false)} />
		</div>
	);
}
