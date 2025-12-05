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
				"Assalamu Alaikum! I'm your AI Zakaat Advisor. I can help you understand Zakaat calculations, eligibility, Nisaab thresholds, and answer questions about Islamic finance. How can I assist you today?",
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
		if (e.key === 'Enter' && !e.shiftKey) {
			e.preventDefault();
			handleSend();
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
				className="relative w-full max-w-md h-[600px] md:h-[700px] bg-white dark:bg-slate-800 rounded-t-2xl md:rounded-2xl shadow-2xl flex flex-col pointer-events-auto m-4 md:m-0 md:mr-4 md:mb-4"
			>
				{/* Header */}
				<div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700 bg-gradient-to-r from-primary-50 dark:from-primary-900/20 to-teal-50 dark:to-teal-900/20 rounded-t-2xl">
					<div className="flex items-center gap-3">
						<div className="w-10 h-10 bg-primary-600 dark:bg-primary-500 rounded-full flex items-center justify-center">
							<SparklesIconSolid className="w-6 h-6 text-white" />
						</div>
						<div>
							<h3 className="font-bold text-slate-900 dark:text-slate-100">Zakaat Advisor</h3>
							<p className="text-xs text-slate-600 dark:text-slate-400">AI Assistant</p>
						</div>
					</div>
					<button
						onClick={onClose}
						className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
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
									className={`max-w-[80%] rounded-2xl px-4 py-3 ${
										message.role === 'user'
											? 'bg-primary-600 dark:bg-primary-500 text-white'
											: 'bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-slate-100'
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
							<div className="bg-slate-100 dark:bg-slate-700 rounded-2xl px-4 py-3">
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
							className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/30 rounded-lg p-3"
						>
							<p className="text-sm text-red-600 dark:text-red-400">{error}</p>
						</motion.div>
					)}

					<div ref={messagesEndRef} />
				</div>

				{/* Input Area */}
				<div className="p-4 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-700/50 rounded-b-2xl">
					<div className="flex gap-2">
						<textarea
							ref={inputRef}
							value={input}
							onChange={(e) => setInput(e.target.value)}
							onKeyPress={handleKeyPress}
							placeholder="Ask about Zakaat, calculations, or eligibility..."
							className="flex-1 resize-none rounded-lg border border-slate-300 dark:border-slate-600 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400 focus:border-transparent bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500"
							rows={1}
							disabled={isLoading}
						/>
						<button
							onClick={handleSend}
							disabled={!input.trim() || isLoading}
							className="px-4 py-2.5 bg-primary-600 dark:bg-primary-500 text-white rounded-lg hover:bg-primary-700 dark:hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
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
