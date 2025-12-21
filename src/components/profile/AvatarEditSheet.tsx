import { useState, useEffect } from 'react';
import { useAuthStore } from '../../store/authStore';
import { authService } from '../../services/authService';
import BottomSheet from '../ui/BottomSheet';
import AvatarSelector from '../auth/AvatarSelector';
import Button from '../ui/Button';
import api from '../../lib/api';
import { XMarkIcon } from '@heroicons/react/24/outline';

interface Avatar {
	id: string;
	name: string;
	url: string;
}

interface AvatarEditSheetProps {
	isOpen: boolean;
	onClose: () => void;
}

export default function AvatarEditSheet({ isOpen, onClose }: AvatarEditSheetProps) {
	const { user, updateUser } = useAuthStore();
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [avatars, setAvatars] = useState<Avatar[]>([]);
	const [selectedAvatarId, setSelectedAvatarId] = useState<string | null>(null);
	const [currentAvatarId, setCurrentAvatarId] = useState<string | null>(null);

	// Fetch avatars when sheet opens
	useEffect(() => {
		if (isOpen) {
			setError(null);
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
					setError('Failed to load avatars. Please try again.');
				}
			};

			fetchAvatars();
		}
	}, [isOpen]);

	// Find current avatar ID from avatar URL when avatars are loaded
	useEffect(() => {
		if (avatars.length === 0 || !user?.avatarUrl) {
			setCurrentAvatarId(null);
			setSelectedAvatarId(null);
			return;
		}

		const matchingAvatar = avatars.find((avatar) => avatar.url === user.avatarUrl);
		const avatarId = matchingAvatar?.id || null;
		setCurrentAvatarId(avatarId);
		setSelectedAvatarId(avatarId);
	}, [user?.avatarUrl, avatars]);

	const handleSave = async () => {
		// Check if avatar actually changed
		if (selectedAvatarId === currentAvatarId) {
			setError('Please select a different avatar');
			return;
		}

		setIsLoading(true);
		setError(null);

		try {
			const response = await authService.updateAvatar(
				selectedAvatarId || undefined
			);
			if (response.data) {
				updateUser(response.data);
				onClose();
			}
		} catch (err: any) {
			const errorMessage =
				err.response?.data?.message || 'Failed to update avatar. Please try again.';
			setError(errorMessage);
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<BottomSheet isOpen={isOpen} onClose={onClose} title="Change Avatar">
			<div className="space-y-5 pb-4">
				{error && (
					<div className="p-4 bg-gradient-to-r from-red-50 to-red-100 dark:from-red-900/30 dark:to-red-800/20 border-2 border-red-200 dark:border-red-800/30 rounded-xl flex items-start justify-between gap-2 shadow-sm">
						<p className="text-sm font-medium text-red-600 dark:text-red-400 flex-1">{error}</p>
						<button
							type="button"
							onClick={() => setError(null)}
							className="p-1.5 rounded-xl hover:bg-red-100 dark:hover:bg-red-900/30 transition-all"
						>
							<XMarkIcon className="w-4 h-4 text-red-600 dark:text-red-400" />
						</button>
					</div>
				)}

				<AvatarSelector
					selectedAvatarId={selectedAvatarId}
					onSelect={(avatarId) => setSelectedAvatarId(avatarId)}
					error={undefined}
				/>

				<div className="flex gap-3 pt-2">
					<Button
						type="button"
						variant="outline"
						onClick={onClose}
						className="flex-1"
						disabled={isLoading}
					>
						Cancel
					</Button>
					<Button
						type="button"
						variant="primary"
						className="flex-1"
						isLoading={isLoading}
						onClick={handleSave}
					>
						Save
					</Button>
				</div>
			</div>
		</BottomSheet>
	);
}

