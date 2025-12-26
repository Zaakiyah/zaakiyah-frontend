import BottomSheet from '../../ui/BottomSheet';
import { ScaleIcon, PencilIcon } from '@heroicons/react/24/outline';

interface DistributionModalProps {
	isOpen: boolean;
	onClose: () => void;
	onSelectEqual: () => void;
	onSelectManual: () => void;
}

export default function DistributionModal({
	isOpen,
	onClose,
	onSelectEqual,
	onSelectManual,
}: DistributionModalProps) {
	return (
		<BottomSheet isOpen={isOpen} onClose={onClose} title="Donation Basket">
			<div className="space-y-4">
				<p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
					Do you want to distribute fund manually to the recipients?
				</p>

				<div className="space-y-3">
					{/* Equal Distribution */}
					<button
						onClick={() => {
							onSelectEqual();
							onClose();
						}}
						className="w-full p-4 bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900 border-2 border-slate-200 dark:border-slate-700 rounded-xl hover:border-primary-500 dark:hover:border-primary-400 transition-all text-left group"
					>
						<div className="flex items-center gap-3">
							<div className="w-12 h-12 rounded-xl bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center group-hover:scale-110 transition-transform">
								<ScaleIcon className="w-6 h-6 text-primary-600 dark:text-primary-400" />
							</div>
							<div className="flex-1">
								<h3 className="text-base font-bold text-slate-900 dark:text-slate-100 mb-1">
									Equal Distribution
								</h3>
								<p className="text-sm text-slate-600 dark:text-slate-400">
									Distribute funds equally among all recipients
								</p>
							</div>
						</div>
					</button>

					{/* Manual Distribution */}
					<button
						onClick={() => {
							onSelectManual();
							onClose();
						}}
						className="w-full p-4 bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900 border-2 border-slate-200 dark:border-slate-700 rounded-xl hover:border-primary-500 dark:hover:border-primary-400 transition-all text-left group"
					>
						<div className="flex items-center gap-3">
							<div className="w-12 h-12 rounded-xl bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center group-hover:scale-110 transition-transform">
								<PencilIcon className="w-6 h-6 text-primary-600 dark:text-primary-400" />
							</div>
							<div className="flex-1">
								<h3 className="text-base font-bold text-slate-900 dark:text-slate-100 mb-1">
									Manual Distribution
								</h3>
								<p className="text-sm text-slate-600 dark:text-slate-400">
									Manually allocate specific amounts to each recipient
								</p>
							</div>
						</div>
					</button>
				</div>
			</div>
		</BottomSheet>
	);
}
