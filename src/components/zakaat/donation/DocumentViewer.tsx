import BottomSheet from '../../ui/BottomSheet';
import type { Document } from '../../../types/donation.types';

interface DocumentViewerProps {
	document: Document;
	isOpen: boolean;
	onClose: () => void;
}

export default function DocumentViewer({ document, isOpen, onClose }: DocumentViewerProps) {
	return (
		<BottomSheet isOpen={isOpen} onClose={onClose} title={document.name}>
			<div className="flex flex-col h-full">
				<div className="flex-1 overflow-y-auto -mx-4 px-4">
					{document.type === 'pdf' ? (
						<div className="w-full h-[600px] bg-slate-100 dark:bg-slate-800 rounded-xl flex items-center justify-center mb-4">
							<iframe
								src={document.url}
								className="w-full h-full rounded-xl"
								title={document.name}
							/>
						</div>
					) : document.type === 'image' ? (
						<div className="w-full mb-4">
							<img
								src={document.url}
								alt={document.name}
								className="w-full h-auto rounded-xl"
							/>
						</div>
					) : (
						<div className="w-full h-[400px] bg-slate-100 dark:bg-slate-800 rounded-xl flex items-center justify-center mb-4">
							<p className="text-slate-500 dark:text-slate-400">
								Document preview not available
							</p>
						</div>
					)}
				</div>
			</div>
		</BottomSheet>
	);
}



