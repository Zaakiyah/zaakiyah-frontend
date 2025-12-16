import React from 'react';
import { CheckBadgeIcon, ShieldCheckIcon } from '@heroicons/react/24/solid';

interface AvatarProps {
	avatarUrl?: string | null;
	firstName: string;
	lastName?: string;
	size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
	isVerified?: boolean;
	isAdmin?: boolean;
	className?: string;
	showBadge?: boolean;
}

export default function Avatar({
	avatarUrl,
	firstName,
	lastName = '',
	size = 'md',
	isVerified = false,
	isAdmin = false,
	className = '',
	showBadge = true,
}: AvatarProps) {
	const getInitials = (first: string, last: string) => {
		return `${first?.[0]?.toUpperCase() || ''}${last?.[0]?.toUpperCase() || ''}`.trim() || 'U';
	};

	const sizeClasses = {
		xs: 'w-7 h-7',
		sm: 'w-8 h-8',
		md: 'w-9 h-9',
		lg: 'w-10 h-10',
		xl: 'w-12 h-12',
	};

	const badgeSizeClasses = {
		xs: 'w-2.5 h-2.5 -bottom-0.5 -right-0.5',
		sm: 'w-3 h-3 -bottom-0.5 -right-0.5',
		md: 'w-3.5 h-3.5 -bottom-0.5 -right-0.5',
		lg: 'w-4 h-4 -bottom-0.5 -right-0.5',
		xl: 'w-5 h-5 -bottom-1 -right-1',
	};

	const borderSizeClasses = {
		xs: 'border-[1.5px]',
		sm: 'border-[1.5px]',
		md: 'border-2',
		lg: 'border-2',
		xl: 'border-2',
	};

	const iconSizeClasses = {
		xs: 'w-1.5 h-1.5',
		sm: 'w-2 h-2',
		md: 'w-2.5 h-2.5',
		lg: 'w-3 h-3',
		xl: 'w-3.5 h-3.5',
	};

	const avatarSize = sizeClasses[size];
	const badgeSize = badgeSizeClasses[size];
	const borderSize = borderSizeClasses[size];
	const iconSize = iconSizeClasses[size];

	// Determine badge type and color
	let badgeBgColor = '';
	let BadgeIcon: React.ComponentType<{ className?: string }> | null = null;

	if (isAdmin) {
		badgeBgColor = 'bg-gradient-to-br from-amber-500 to-amber-600';
		BadgeIcon = ShieldCheckIcon;
	} else if (isVerified) {
		badgeBgColor = 'bg-primary-600';
		BadgeIcon = CheckBadgeIcon;
	}

	return (
		<div className={`relative ${avatarSize} flex-shrink-0 ${className}`}>
			{avatarUrl ? (
				<img
					src={avatarUrl}
					alt={`${firstName} ${lastName}`}
					className={`${avatarSize} rounded-full object-cover`}
				/>
			) : (
				<div className={`${avatarSize} rounded-full bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center`}>
					<span className="text-white font-semibold text-xs">
						{getInitials(firstName, lastName)}
					</span>
				</div>
			)}
			{/* Badge */}
			{showBadge && BadgeIcon && (
				<div
					className={`absolute ${badgeSize} ${badgeBgColor} rounded-full flex items-center justify-center ${borderSize} border-white dark:border-slate-800 shadow-sm`}
				>
					<BadgeIcon className={`${iconSize} text-white`} />
				</div>
			)}
		</div>
	);
}

