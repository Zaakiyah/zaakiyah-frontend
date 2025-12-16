import { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuthStore } from '../../store/authStore';
import { communityService } from '../../services/communityService';
import { alert } from '../../store/alertStore';
import { logger } from '../../utils/logger';
import { UserPlusIcon, UserMinusIcon } from '@heroicons/react/24/outline';

interface FollowButtonProps {
	userId: string;
	isFollowing: boolean;
	onFollowChange?: (isFollowing: boolean) => void;
	variant?: 'default' | 'outline' | 'minimal';
	size?: 'sm' | 'md' | 'lg';
}

export default function FollowButton({
	userId,
	isFollowing: initialIsFollowing,
	onFollowChange,
	variant = 'default',
	size = 'md',
}: FollowButtonProps) {
	const { user } = useAuthStore();
	const [isFollowing, setIsFollowing] = useState(initialIsFollowing);
	const [isLoading, setIsLoading] = useState(false);

	// Don't show button if viewing own profile
	if (user?.id === userId) {
		return null;
	}

	const handleToggleFollow = async () => {
		if (!user) {
			alert.error('Please log in to follow users');
			return;
		}

		try {
			setIsLoading(true);
			if (isFollowing) {
				await communityService.unfollowUser(userId);
				setIsFollowing(false);
				onFollowChange?.(false);
			} else {
				await communityService.followUser(userId);
				setIsFollowing(true);
				onFollowChange?.(true);
			}
		} catch (error: any) {
			logger.error('Error toggling follow:', error);
			alert.error(error.response?.data?.message || 'Failed to update follow status');
		} finally {
			setIsLoading(false);
		}
	};

	const sizeClasses = {
		sm: 'px-3 py-1.5 text-xs',
		md: 'px-4 py-2 text-sm',
		lg: 'px-5 py-2.5 text-base',
	};

	const variantClasses = {
		default: isFollowing
			? 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-600'
			: 'bg-primary-500 text-white hover:bg-primary-600',
		outline: isFollowing
			? 'border-2 border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
			: 'border-2 border-primary-500 text-primary-600 dark:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/20',
		minimal: isFollowing
			? 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
			: 'text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300',
	};

	const iconSize = {
		sm: 'w-3.5 h-3.5',
		md: 'w-4 h-4',
		lg: 'w-5 h-5',
	};

	return (
		<motion.button
			whileHover={{ scale: 1.02 }}
			whileTap={{ scale: 0.98 }}
			onClick={handleToggleFollow}
			disabled={isLoading}
			className={`flex items-center gap-2 font-semibold rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed ${sizeClasses[size]} ${variantClasses[variant]}`}
		>
			{isFollowing ? (
				<UserMinusIcon className={iconSize[size]} />
			) : (
				<UserPlusIcon className={iconSize[size]} />
			)}
			<span>{isFollowing ? 'Following' : 'Follow'}</span>
		</motion.button>
	);
}

