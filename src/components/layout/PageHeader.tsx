import type { ReactNode } from 'react';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import { useNavigate } from 'react-router-dom';

interface PageHeaderProps {
	title: string;
	subtitle?: string;
	showBack?: boolean;
	rightAction?: ReactNode;
}

export default function PageHeader({
	title,
	subtitle,
	showBack = false,
	rightAction,
}: PageHeaderProps) {
	const navigate = useNavigate();

	return (
		<header className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-xl border-b-2 border-slate-200/60 dark:border-slate-700/60 sticky top-0 z-40 shadow-lg">
			<div className="px-4 py-3.5">
				<div className="flex items-center justify-between"> 
					<div className="flex items-center gap-3">
						{showBack && (
							<button
								onClick={() => navigate(-1)}
								className="p-2 rounded-xl hover:bg-gradient-to-r hover:from-slate-100 hover:to-slate-50 dark:hover:from-slate-700 dark:hover:to-slate-800 transition-all active:scale-95"
							>
								<ArrowLeftIcon className="w-5 h-5 text-slate-700 dark:text-slate-300" />
							</button>
						)}
						<div>
							<h1
								className="text-lg font-bold text-slate-900 dark:text-slate-100"
								id="page-title"
							>
								{title}
							</h1>
							{subtitle && (
								<p
									className="text-xs font-medium text-slate-500 dark:text-slate-400"
									aria-describedby="page-title"
								>
									{subtitle}
								</p>
							)}
						</div>
					</div>
					{rightAction && <div>{rightAction}</div>}
				</div>
			</div>
		</header>
	);
}
