import { Link, useLocation } from 'react-router-dom';
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
} from '@heroicons/react/24/outline';

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

	return (
		<nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 z-50 safe-area-inset-bottom">
			<div className="flex items-center justify-around h-16 px-2">
				{navItems.map((item) => {
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
		</nav>
	);
}

