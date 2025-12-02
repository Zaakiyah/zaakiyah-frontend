import { api } from '../lib/api';

export interface ChatMessage {
	role: 'user' | 'assistant';
	content: string;
}

export interface ChatRequest {
	message: string;
	conversationHistory?: ChatMessage[];
}

export interface ChatResponse {
	response: string;
	suggestions?: string[];
}

export const aiService = {
	/**
	 * Send a message to the AI Zakaat Advisor
	 */
	async chat(request: ChatRequest): Promise<ChatResponse> {
		const response = await api.post<ChatResponse>('/ai/chat', request);
		return response.data;
	},

	/**
	 * Check if AI service is available
	 */
	async checkAvailability(): Promise<{ available: boolean; message: string }> {
		const response = await api.post<{ available: boolean; message: string }>('/ai/health');
		return response.data;
	},
};
