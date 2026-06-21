import { useNavigate } from 'react-router-dom';
import { HeartIcon } from '@heroicons/react/24/outline';
import { HeartIcon as HeartIconSolid } from '@heroicons/react/24/solid';
import Avatar from '../../ui/Avatar';
import { useDonationStore } from '../../../store/donationStore';
import type { Recipient } from '../../../types/donation.types';

interface RecipientCardProps {
	recipient: Recipient;
	onAddToBasket?: () => void;
}

export default function RecipientCard({ recipient, onAddToBasket }: RecipientCardProps) {
	const navigate = useNavigate();
	const { addToWatchlist, removeFromWatchlist, isInWatchlist, basket } = useDonationStore();
	
	const isInBasket = basket.items.some(item => item.recipientId === recipient.id);
	const isWatched = isInWatchlist(recipient.id);
	
	const handleWatchlistToggle = (e: React.MouseEvent) => {
		e.stopPropagation();
		if (isWatched) {
			removeFromWatchlist(recipient.id);
		} else {
			addToWatchlist(recipient);
		}
	};
	
	const handleAddToBasket = (e: React.MouseEvent) => {
		e.stopPropagation();
		if (onAddToBasket) {
			onAddToBasket();
		} else {
			addToBasket(recipient);
		}
	};
	
	const addToBasket = (recipient: Recipient) => {
		const { addToBasket: addToBasketAction } = useDonationStore.getState();
		addToBasketAction(recipient);
	};

	return (
		<div
			onClick={() => navigate(`/zakaat/donation/recipients/${recipient.id}`)}
			className="bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900 rounded-2xl border-2 border-slate-200/60 dark:border-slate-700/60 p-4 mb-3 shadow-sm hover:shadow-md transition-all cursor-pointer relative overflow-hidden"
		>
			{/* Decorative gradient overlay */}
			<div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-primary-500/5 via-secondary-500/5 to-primary-400/5 rounded-full blur-2xl -z-0" />
			
			<div className="relative z-10">
				<div className="flex items-start gap-3 mb-3">
					<Avatar
						avatarUrl={recipient.avatarUrl}
						firstName={recipient.firstName}
						lastName={recipient.lastName}
						size="md"
					/>
					<div className="flex-1 min-w-0">
						<h3 className="text-[15px] font-bold text-slate-900 dark:text-slate-100 mb-0.5">
							{recipient.name}
						</h3>
						<p className="text-xs text-slate-500 dark:text-slate-400">
							{recipient.location}
						</p>
					</div>
					<button
						onClick={handleWatchlistToggle}
						className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors flex-shrink-0"
						aria-label={isWatched ? 'Remove from watchlist' : 'Add to watchlist'}
					>
						{isWatched ? (
							<HeartIconSolid className="w-5 h-5 text-red-500" />
						) : (
							<HeartIcon className="w-5 h-5 text-slate-400 dark:text-slate-500" />
						)}
					</button>
				</div>
				
				{/* Campaign Image */}
				{recipient.campaignImageUrl && (
					<div className="mb-3 rounded-xl overflow-hidden">
						<img
							src={recipient.campaignImageUrl}
							alt={`${recipient.name} campaign`}
							className="w-full h-40 object-cover"
						/>
					</div>
				)}
				
				{/* Why they need help - truncated */}
				{recipient.whyTheyNeedHelp && (
					<p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed line-clamp-2 mb-3">
						{recipient.whyTheyNeedHelp}
					</p>
				)}
				
				{/* Amount Information */}
				<div className="space-y-2 mb-3">
					<div className="flex items-center justify-between">
						<div>
							<p className="text-xs text-slate-500 dark:text-slate-400 mb-0.5">
								Requested Amount
							</p>
							<p className="text-base font-bold text-slate-900 dark:text-slate-100">
								₦{recipient.requestedAmount.toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
							</p>
						</div>
						{recipient.approvedAmount && (
							<div className="text-right">
								<p className="text-xs text-slate-500 dark:text-slate-400 mb-0.5">
									Approved
								</p>
								<p className="text-base font-bold text-primary-600 dark:text-primary-400">
									₦{recipient.approvedAmount.toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
								</p>
							</div>
						)}
					</div>
					{/* Shortfall */}
					{recipient.shortfall > 0 && (
						<div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-2.5">
							<div className="flex items-center justify-between">
								<p className="text-xs font-semibold text-amber-800 dark:text-amber-300">
									Shortfall
								</p>
								<p className="text-sm font-bold text-amber-700 dark:text-amber-400">
									₦{recipient.shortfall.toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
								</p>
							</div>
						</div>
					)}
					{recipient.shortfall <= 0 && (
						<div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-lg p-2.5">
							<div className="flex items-center justify-between">
								<p className="text-xs font-semibold text-emerald-800 dark:text-emerald-300">
									Fully Funded
								</p>
								<p className="text-sm font-bold text-emerald-700 dark:text-emerald-400">
									✓
								</p>
							</div>
						</div>
					)}
				</div>
				
				{/* Actions */}
				<div className="flex items-center gap-2">
					<button
						onClick={() => navigate(`/zakaat/donation/recipients/${recipient.id}`)}
						className="flex-1 px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-700 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
					>
						View Profile
					</button>
					<button
						onClick={handleAddToBasket}
						disabled={isInBasket}
						className="flex-1 px-3 py-2 text-xs font-semibold text-white bg-gradient-to-r from-primary-500 via-primary-600 to-primary-700 rounded-lg hover:from-primary-600 hover:via-primary-700 hover:to-primary-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-95 shadow-sm shadow-primary-500/20"
					>
						{isInBasket ? 'In Basket' : 'Donate'}
					</button>
				</div>
			</div>
		</div>
	);
}

