import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import api from '../../lib/api';

interface Avatar {
	id: string;
	name: string;
	url: string;
}

interface AvatarSelectorProps {
	selectedAvatarId: string | null;
	onSelect: (avatarId: string) => void;
	error?: string;
}

export default function AvatarSelector({ selectedAvatarId, onSelect, error }: AvatarSelectorProps) {
	const [avatars, setAvatars] = useState<Avatar[]>([]);
	const [isLoading, setIsLoading] = useState(true);

	useEffect(() => {
		const fetchAvatars = async () => {
			try {
				const response = await api.get<{
					data: Avatar[];
					message: string;
					statusCode: number;
				}>('/avatars');
				setAvatars(response.data.data || []);
			} catch (err) {
				console.error('Failed to fetch avatars:', err);
			} finally {
				setIsLoading(false);
			}
		};

		fetchAvatars();
	}, []);

	if (isLoading) {
		return (
			<div className="flex justify-center items-center py-12">
				<div className="relative">
					<div className="animate-spin rounded-full h-10 w-10 border-4 border-primary-200 dark:border-primary-800 border-t-primary-600 dark:border-t-primary-400"></div>
					<div className="absolute inset-0 animate-ping rounded-full border-2 border-primary-400/30"></div>
				</div>
			</div>
		);
	}

	return (
		<div>
			<label className="block text-base sm:text-sm font-semibold text-slate-900 dark:text-slate-100 mb-4 sm:mb-3">
				Select Your Avatar
			</label>
			<div className="grid grid-cols-4 sm:grid-cols-4 md:grid-cols-4 gap-3 sm:gap-4">
				{avatars.map((avatar) => (
					<motion.button
						key={avatar.id}
						type="button"
						whileHover={{ scale: 1.1, y: -4 }}
						whileTap={{ scale: 0.95 }}
						transition={{ type: 'spring', stiffness: 300, damping: 20 }}
						onClick={() => onSelect(avatar.id)}
						className={`
							relative aspect-square rounded-2xl sm:rounded-xl overflow-hidden
							border-4 transition-all duration-200 shadow-md hover:shadow-lg
							${
								selectedAvatarId === avatar.id
									? 'border-primary-500 dark:border-primary-400 ring-4 ring-primary-200 dark:ring-primary-800/30 shadow-xl shadow-primary-500/30 dark:shadow-primary-600/30'
									: 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
							}
						`}
					>
						<img
							src={avatar.url}
							alt={avatar.name}
							className="w-full h-full object-cover"
						/>
							{selectedAvatarId === avatar.id && (
								<motion.div
									initial={{ scale: 0, opacity: 0 }}
									animate={{ scale: 1, opacity: 1 }}
									transition={{ type: 'spring', stiffness: 200 }}
									className="absolute inset-0 bg-gradient-to-br from-primary-500/30 via-primary-600/20 to-primary-700/10 dark:from-primary-400/30 dark:via-primary-500/20 dark:to-primary-600/10 flex items-center justify-center"
								>
									<motion.div
										initial={{ scale: 0 }}
										animate={{ scale: 1 }}
										transition={{ delay: 0.1, type: 'spring', stiffness: 200 }}
										className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-600 dark:from-primary-400 dark:to-primary-500 rounded-full flex items-center justify-center shadow-lg"
									>
										<svg
											className="w-6 h-6 text-white"
											fill="currentColor"
											viewBox="0 0 20 20"
										>
											<path
												fillRule="evenodd"
												d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
												clipRule="evenodd"
											/>
										</svg>
									</motion.div>
								</motion.div>
							)}
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
