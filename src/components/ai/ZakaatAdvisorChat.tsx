import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { aiService, type ChatMessage } from '../../services/aiService';
import { PaperAirplaneIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { SparklesIcon as SparklesIconSolid } from '@heroicons/react/24/solid';

interface ZakaatAdvisorChatProps {
	isOpen: boolean;
	onClose: () => void;
}

export default function ZakaatAdvisorChat({ isOpen, onClose }: ZakaatAdvisorChatProps) {
	const [messages, setMessages] = useState<ChatMessage[]>([
		{
			role: 'assistant',
			content:
				"Assalāmu 'alaykum! I'm your AI Zakaat Advisor. I can help you understand Zakaat calculations, eligibility, Nisaab thresholds, and answer questions about Islamic finance. How can I assist you today?",
		},
	]);
	const [input, setInput] = useState('');
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const messagesEndRef = useRef<HTMLDivElement>(null);
	const inputRef = useRef<HTMLTextAreaElement>(null);

	const scrollToBottom = () => {
		messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
	};

	useEffect(() => {
		scrollToBottom();
	}, [messages]);

	useEffect(() => {
		if (isOpen && inputRef.current) {
			inputRef.current.focus();
		}
	}, [isOpen]);

	const handleSend = async () => {
		if (!input.trim() || isLoading) return;

		const userMessage: ChatMessage = {
			role: 'user',
			content: input.trim(),
		};

		setMessages((prev) => [...prev, userMessage]);
		setInput('');
		setIsLoading(true);
		setError(null);

		try {
			const conversationHistory = messages.map((msg) => ({
				role: msg.role,
				content: msg.content,
			}));

			const response = await aiService.chat({
				message: userMessage.content,
				conversationHistory,
			});

			const assistantMessage: ChatMessage = {
				role: 'assistant',
				content: response.response,
			};

			setMessages((prev) => [...prev, assistantMessage]);
		} catch (err: any) {
			setError(err.response?.data?.message || 'Failed to get response. Please try again.');
		} finally {
			setIsLoading(false);
		}
	};

	const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
		if (e.key === 'Enter' && !e.shiftKey && !isLoading) {
			e.preventDefault();
			// Send button is disabled, so don't send
		}
	};

	if (!isOpen) return null;

	return (
		<div className="fixed inset-0 z-[60] flex items-end justify-end pointer-events-none">
			{/* Backdrop */}
			<motion.div
				initial={{ opacity: 0 }}
				animate={{ opacity: 1 }}
				exit={{ opacity: 0 }}
				onClick={onClose}
				className="absolute inset-0 bg-black/50 pointer-events-auto"
			/>

			{/* Chat Window */}
			<motion.div
				initial={{ y: '100%', opacity: 0 }}
				animate={{ y: 0, opacity: 1 }}
				exit={{ y: '100%', opacity: 0 }}
				transition={{ type: 'spring', damping: 25, stiffness: 300 }}
				className="relative w-full max-w-md h-[600px] md:h-[700px] bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900 rounded-t-2xl md:rounded-2xl shadow-2xl flex flex-col pointer-events-auto m-4 md:m-0 md:mr-4 md:mb-4 overflow-hidden"
			>
				{/* Decorative gradient overlay */}
				<div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-primary-500/10 via-secondary-500/10 to-primary-400/5 rounded-full blur-3xl -z-0" />
				
				{/* Header */}
				<div className="relative flex items-center justify-between p-4 border-b-2 border-primary-500/20 dark:border-primary-400/20 bg-gradient-to-r from-primary-50 via-primary-100/50 dark:from-primary-900/30 dark:via-primary-800/20 to-teal-50 dark:to-teal-900/20 rounded-t-2xl z-10">
					<div className="flex items-center gap-3">
						<div className="w-12 h-12 bg-gradient-to-br from-primary-600 to-primary-700 dark:from-primary-500 dark:to-primary-600 rounded-full flex items-center justify-center shadow-lg shadow-primary-500/30">
							<SparklesIconSolid className="w-6 h-6 text-white" />
						</div>
						<div>
							<h3 className="font-bold text-slate-900 dark:text-slate-100">
								Zakaat Advisor
							</h3>
							<p className="text-xs text-slate-600 dark:text-slate-400">
								AI Assistant
							</p>
						</div>
					</div>
					<button
						onClick={onClose}
						className="p-2 hover:bg-gradient-to-r hover:from-slate-100 hover:to-slate-50 dark:hover:from-slate-700 dark:hover:to-slate-800 rounded-xl transition-all"
					>
						<XMarkIcon className="w-5 h-5 text-slate-600 dark:text-slate-300" />
					</button>
				</div>

				{/* Messages */}
				<div className="flex-1 overflow-y-auto p-4 space-y-4">
					<AnimatePresence>
						{messages.map((message, index) => (
							<motion.div
								key={index}
								initial={{ opacity: 0, y: 10 }}
								animate={{ opacity: 1, y: 0 }}
								className={`flex ${
									message.role === 'user' ? 'justify-end' : 'justify-start'
								}`}
							>
								<div
									className={`max-w-[80%] rounded-2xl px-4 py-3 shadow-sm ${
										message.role === 'user'
											? 'bg-gradient-to-br from-primary-600 to-primary-700 dark:from-primary-500 dark:to-primary-600 text-white shadow-primary-500/20'
											: 'bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-800 text-slate-900 dark:text-slate-100'
									}`}
								>
									<p className="text-sm whitespace-pre-wrap leading-relaxed">
										{message.content}
									</p>
								</div>
							</motion.div>
						))}
					</AnimatePresence>

					{isLoading && (
						<motion.div
							initial={{ opacity: 0 }}
							animate={{ opacity: 1 }}
							className="flex justify-start"
						>
							<div className="bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-800 rounded-2xl px-4 py-3 shadow-sm">
								<div className="flex gap-1">
									<div className="w-2 h-2 bg-slate-400 dark:bg-slate-500 rounded-full animate-bounce" />
									<div
										className="w-2 h-2 bg-slate-400 dark:bg-slate-500 rounded-full animate-bounce"
										style={{ animationDelay: '0.1s' }}
									/>
									<div
										className="w-2 h-2 bg-slate-400 dark:bg-slate-500 rounded-full animate-bounce"
										style={{ animationDelay: '0.2s' }}
									/>
								</div>
							</div>
						</motion.div>
					)}

					{error && (
						<motion.div
							initial={{ opacity: 0, y: 10 }}
							animate={{ opacity: 1, y: 0 }}
							className="bg-gradient-to-r from-red-50 to-red-100 dark:from-red-900/30 dark:to-red-800/20 border-2 border-red-200 dark:border-red-800/30 rounded-xl p-4 shadow-sm"
						>
							<p className="text-sm text-red-600 dark:text-red-400">{error}</p>
						</motion.div>
					)}

					<div ref={messagesEndRef} />
				</div>

				{/* Input Area */}
				<div className="relative p-4 border-t-2 border-slate-200/60 dark:border-slate-700/60 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-700/50 dark:to-slate-800/50 rounded-b-2xl z-10">
					<div className="flex gap-2">
						<textarea
							ref={inputRef}
							value={input}
							onChange={(e) => setInput(e.target.value)}
							onKeyPress={handleKeyPress}
							placeholder="Ask about Zakaat..."
							className="flex-1 resize-none rounded-xl border-2 border-slate-200/60 dark:border-slate-700/60 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 dark:focus:ring-primary-400/20 focus:border-primary-500 dark:focus:border-primary-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/20 dark:focus-visible:ring-primary-400/20 focus-visible:border-primary-500 dark:focus-visible:border-primary-400 bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 shadow-sm"
							rows={1}
							disabled={isLoading || true}
						/>
						<button
							onClick={handleSend}
							disabled={true}
							className="px-4 py-2.5 bg-gradient-to-br from-primary-600 to-primary-700 dark:from-primary-500 dark:to-primary-600 text-white rounded-xl hover:from-primary-700 hover:to-primary-800 dark:hover:from-primary-600 dark:hover:to-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center shadow-lg shadow-primary-500/30 hover:shadow-xl hover:shadow-primary-500/40"
							title="API key not available"
						>
							<PaperAirplaneIcon className="w-5 h-5" />
						</button>
					</div>
					<p className="text-xs text-slate-500 dark:text-slate-400 mt-2 text-center">
						Press Enter to send, Shift+Enter for new line
					</p>
				</div>
			</motion.div>
		</div>
	);
}
