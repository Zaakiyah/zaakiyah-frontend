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
				<div className="animate-spin rounded-full h-8 w-8 border-4 border-primary-500 border-t-transparent"></div>
			</div>
		);
	}

	return (
		<div>
			<label className="block text-base sm:text-sm font-medium text-slate-900 mb-4 sm:mb-3">
				Select Your Avatar
			</label>
			<div className="grid grid-cols-4 sm:grid-cols-4 md:grid-cols-4 gap-3 sm:gap-4">
				{avatars.map((avatar) => (
					<motion.button
						key={avatar.id}
						type="button"
						whileHover={{ scale: 1.1 }}
						whileTap={{ scale: 0.95 }}
						onClick={() => onSelect(avatar.id)}
						className={`
							relative aspect-square rounded-2xl sm:rounded-xl overflow-hidden
							border-4 transition-all duration-200
							${
								selectedAvatarId === avatar.id
									? 'border-primary-500 ring-4 ring-primary-200 shadow-lg shadow-primary-500/30'
									: 'border-slate-200 hover:border-slate-300'
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
								initial={{ scale: 0 }}
								animate={{ scale: 1 }}
								className="absolute inset-0 bg-primary-500/20 flex items-center justify-center"
							>
								<svg
									className="w-8 h-8 text-primary-600"
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
						)}
					</motion.button>
				))}
			</div>
			{error && (
				<p className="mt-3 text-sm text-red-600" role="alert">
					{error}
				</p>
			)}
		</div>
	);
}
