import Modal from '../../ui/Modal';
import type { Document } from '../../../types/donation.types';

interface DocumentViewerProps {
	document: Document;
	isOpen: boolean;
	onClose: () => void;
}

export default function DocumentViewer({ document, isOpen, onClose }: DocumentViewerProps) {
	return (
		<Modal isOpen={isOpen} onClose={onClose} title={document.name} size="lg">
			<div className="flex flex-col">
				{document.type === 'pdf' ? (
					<div className="w-full h-[70vh] bg-slate-100 dark:bg-slate-800 rounded-xl flex items-center justify-center overflow-hidden">
						<iframe
							src={document.url}
							className="w-full h-full rounded-xl border-0"
							title={document.name}
						/>
					</div>
				) : document.type === 'image' ? (
					<div className="w-full max-h-[70vh] overflow-auto">
						<img
							src={document.url}
							alt={document.name}
							className="w-full h-auto rounded-xl"
						/>
					</div>
				) : (
					<div className="w-full h-[400px] bg-slate-100 dark:bg-slate-800 rounded-xl flex items-center justify-center">
						<p className="text-slate-500 dark:text-slate-400">
							Document preview not available
						</p>
					</div>
				)}
			</div>
		</Modal>
	);
}
