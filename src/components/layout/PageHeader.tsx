import type { ReactNode } from 'react';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import { useNavigate } from 'react-router-dom';

interface PageHeaderProps {
	title: string;
	showBack?: boolean;
	rightAction?: ReactNode;
}

export default function PageHeader({ title, showBack = false, rightAction }: PageHeaderProps) {
	const navigate = useNavigate();

	return (
		<header className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl border-b border-slate-200/60 dark:border-slate-700/60 sticky top-0 z-40 shadow-sm">
			<div className="px-4 py-3">
				<div className="flex items-center justify-between">
					<div className="flex items-center gap-3">
						{showBack && (
							<button
								onClick={() => navigate(-1)}
								className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors active:scale-95"
							>
								<ArrowLeftIcon className="w-5 h-5 text-slate-700 dark:text-slate-300" />
							</button>
						)}
						<h1 className="text-lg font-bold text-slate-900 dark:text-slate-100">{title}</h1>
					</div>
					{rightAction && <div>{rightAction}</div>}
				</div>
			</div>
		</header>
	);
}

