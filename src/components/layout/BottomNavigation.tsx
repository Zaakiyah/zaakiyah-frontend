import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
	HomeIcon,
	HeartIcon,
	UserGroupIcon,
	UserIcon,
} from '@heroicons/react/24/solid';
import {
	HomeIcon as HomeIconOutline,
	HeartIcon as HeartIconOutline,
	UserGroupIcon as UserGroupIconOutline,
	UserIcon as UserIconOutline,
	SparklesIcon,
} from '@heroicons/react/24/outline';
import { useAiChatStore } from '../../store/aiChatStore';

interface NavItem {
	path: string;
	label: string;
	icon: React.ComponentType<{ className?: string }>;
	iconActive: React.ComponentType<{ className?: string }>;
}

const navItems: NavItem[] = [
	{
		path: '/dashboard',
		label: 'Home',
		icon: HomeIconOutline,
		iconActive: HomeIcon,
	},
	{
		path: '/donations',
		label: 'Donations',
		icon: HeartIconOutline,
		iconActive: HeartIcon,
	},
	{
		path: '/community',
		label: 'Community',
		icon: UserGroupIconOutline,
		iconActive: UserGroupIcon,
	},
	{
		path: '/profile',
		label: 'Profile',
		icon: UserIconOutline,
		iconActive: UserIcon,
	},
];

export default function BottomNavigation() {
	const location = useLocation();
	const openChat = useAiChatStore((state) => state.openChat);

	return (
		<nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 z-50 safe-area-inset-bottom">
			<div className="flex items-center justify-around h-16 px-2 relative">
				{/* Left navigation items */}
				<div className="flex items-center justify-around flex-1">
					{navItems.slice(0, 2).map((item) => {
						const isActive = location.pathname === item.path;
						const Icon = isActive ? item.iconActive : item.icon;

						return (
							<Link
								key={item.path}
								to={item.path}
								className="flex flex-col items-center justify-center flex-1 h-full transition-colors"
							>
								<Icon
									className={`w-6 h-6 mb-1 ${
										isActive
											? 'text-primary-600'
											: 'text-slate-400'
									}`}
								/>
								<span
									className={`text-xs font-medium ${
										isActive
											? 'text-primary-600'
											: 'text-slate-500'
									}`}
								>
									{item.label}
								</span>
							</Link>
						);
					})}
				</div>

				{/* Center AI Button - Standing Out */}
				<div className="relative flex-shrink-0 mx-2">
					<motion.button
						onClick={openChat}
						className="relative w-16 h-16 rounded-2xl shadow-2xl flex items-center justify-center overflow-hidden group -mt-7"
						whileHover={{ scale: 1.05, y: -2 }}
						whileTap={{ scale: 0.95 }}
						aria-label="Open Zakaat Advisor"
						style={{
							boxShadow: '0 10px 25px -5px rgba(251, 191, 36, 0.4), 0 8px 10px -6px rgba(251, 191, 36, 0.3)',
						}}
					>
						{/* Shining golden gradient background */}
						<div className="absolute inset-0 bg-gradient-to-br from-yellow-400 via-yellow-500 to-amber-600 rounded-2xl" />

						{/* Animated brightness pulse */}
						<motion.div
							className="absolute inset-0 bg-gradient-to-br from-yellow-300 via-yellow-400 to-yellow-500 rounded-2xl"
							animate={{
								opacity: [0.5, 1, 0.5],
							}}
							transition={{
								duration: 2,
								repeat: Infinity,
								ease: 'easeInOut',
							}}
						/>

						{/* Shining sweep effect */}
						<motion.div
							className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent rounded-2xl"
							style={{ width: '200%' }}
							animate={{
								x: ['-100%', '100%'],
							}}
							transition={{
								duration: 2.5,
								repeat: Infinity,
								ease: 'linear',
								repeatDelay: 0.8,
							}}
						/>

						{/* Subtle inner glow */}
						<div className="absolute inset-[2px] bg-gradient-to-br from-white/20 to-transparent rounded-2xl pointer-events-none" />

						{/* Pulsing outer glow - contained within button */}
						<motion.div
							className="absolute inset-0 rounded-2xl border-2 border-yellow-300/60 pointer-events-none"
							style={{ transformOrigin: 'center' }}
							animate={{
								scale: [1, 1.15, 1],
								opacity: [0.5, 0, 0.5],
							}}
							transition={{
								duration: 2,
								repeat: Infinity,
								ease: 'easeInOut',
							}}
						/>

						{/* Icon with subtle animation */}
						<motion.div
							animate={{
								rotate: [0, 5, -5, 0],
							}}
							transition={{
								duration: 3,
								repeat: Infinity,
								ease: 'easeInOut',
							}}
						>
							<SparklesIcon className="w-7 h-7 text-white relative z-10 drop-shadow-lg" />
						</motion.div>
					</motion.button>
				</div>

				{/* Right navigation items */}
				<div className="flex items-center justify-around flex-1">
					{navItems.slice(2).map((item) => {
						const isActive = location.pathname === item.path;
						const Icon = isActive ? item.iconActive : item.icon;

						return (
							<Link
								key={item.path}
								to={item.path}
								className="flex flex-col items-center justify-center flex-1 h-full transition-colors"
							>
								<Icon
									className={`w-6 h-6 mb-1 ${
										isActive
											? 'text-primary-600'
											: 'text-slate-400'
									}`}
								/>
								<span
									className={`text-xs font-medium ${
										isActive
											? 'text-primary-600'
											: 'text-slate-500'
									}`}
								>
									{item.label}
								</span>
							</Link>
						);
					})}
				</div>
			</div>
		</nav>
	);
}

