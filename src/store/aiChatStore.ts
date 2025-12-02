import { create } from 'zustand';

interface AiChatState {
	isOpen: boolean;
	openChat: () => void;
	closeChat: () => void;
}

export const useAiChatStore = create<AiChatState>((set) => ({
	isOpen: false,
	openChat: () => set({ isOpen: true }),
	closeChat: () => set({ isOpen: false }),
}));

