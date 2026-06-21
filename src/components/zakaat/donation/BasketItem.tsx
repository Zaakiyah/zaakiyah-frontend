import { useNavigate } from 'react-router-dom';
import { useDonationStore } from '../../../store/donationStore';
import Avatar from '../../ui/Avatar';
import { XMarkIcon } from '@heroicons/react/24/outline';
import type { BasketItem as BasketItemType } from '../../../types/donation.types';

interface BasketItemProps {
	item: BasketItemType;
}

export default function BasketItem({ item }: BasketItemProps) {
	const navigate = useNavigate();
	const { removeFromBasket } = useDonationStore();
	const { recipient, amount } = item;

	const handleRemove = () => {
		removeFromBasket(recipient.id);
	};

	return (
		<div className="bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900 rounded-2xl border-2 border-slate-200/60 dark:border-slate-700/60 p-4 shadow-sm relative overflow-hidden">
			{/* Decorative gradient overlay */}
			<div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-primary-500/5 via-secondary-500/5 to-primary-400/5 rounded-full blur-2xl -z-0" />
			
			<div className="relative z-10">
				<div className="flex items-start gap-3">
					<Avatar
						avatarUrl={recipient.avatarUrl}
						firstName={recipient.firstName}
						lastName={recipient.lastName}
						size="md"
					/>
					<div className="flex-1 min-w-0">
						<button
							onClick={() => navigate(`/zakaat/donation/recipients/${recipient.id}`)}
							className="text-left w-full"
						>
							<h3 className="text-[15px] font-bold text-slate-900 dark:text-slate-100 mb-1">
								{recipient.name}
							</h3>
							<p className="text-xs text-slate-500 dark:text-slate-400 mb-2">
								{recipient.location}
							</p>
						</button>
						<div className="flex items-center justify-between">
							<div>
								<p className="text-xs text-slate-500 dark:text-slate-400 mb-0.5">
									Allocated Amount
								</p>
								<p className="text-base font-bold text-slate-900 dark:text-slate-100">
									₦{amount.toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
								</p>
							</div>
							<button
								onClick={handleRemove}
								className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-red-500 transition-colors"
								aria-label="Remove from basket"
							>
								<XMarkIcon className="w-5 h-5" />
							</button>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}



