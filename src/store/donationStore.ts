import { create } from 'zustand';
import type { BasketItem, DonationBasket, Recipient, WatchlistItem } from '../types/donation.types';

interface DonationStore {
	// Basket State
	basket: DonationBasket;
	
	// Watchlist State
	watchlist: WatchlistItem[];
	
	// Actions - Basket
	addToBasket: (recipient: Recipient, amount?: number) => void;
	removeFromBasket: (recipientId: string) => void;
	updateBasketItemAmount: (recipientId: string, amount: number) => void;
	clearBasket: () => void;
	setDistributionMethod: (method: 'equal' | 'manual' | null) => void;
	setSupportZaakiyah: (support: boolean, amount?: number) => void;
	setIsAnonymous: (isAnonymous: boolean) => void;
	distributeEqually: (totalAmount: number) => void;
	
	// Actions - Watchlist
	addToWatchlist: (recipient: Recipient) => void;
	removeFromWatchlist: (recipientId: string) => void;
	isInWatchlist: (recipientId: string) => boolean;
	
	// Computed
	getBasketTotal: () => number;
	getBasketItemCount: () => number;
}

const initialBasket: DonationBasket = {
	items: [],
	totalAmount: 0,
	distributionMethod: null,
	supportZaakiyah: false,
	zaakiyahAmount: 0,
	isAnonymous: false,
};

export const useDonationStore = create<DonationStore>((set, get) => ({
	basket: initialBasket,
	watchlist: [],
	
	// Basket Actions
	addToBasket: (recipient, amount) => {
		const basket = get().basket;
		const existingItem = basket.items.find(item => item.recipientId === recipient.id);
		
		if (existingItem) {
			// Update existing item
			set({
				basket: {
					...basket,
					items: basket.items.map(item =>
						item.recipientId === recipient.id
							? { ...item, amount: amount || item.amount }
							: item
					),
				},
			});
		} else {
			// Add new item
			const newItem: BasketItem = {
				recipientId: recipient.id,
				recipient,
				amount: amount || 0,
				isManuallyAllocated: false,
			};
			set({
				basket: {
					...basket,
					items: [...basket.items, newItem],
				},
			});
		}
	},
	
	removeFromBasket: (recipientId) => {
		const basket = get().basket;
		set({
			basket: {
				...basket,
				items: basket.items.filter(item => item.recipientId !== recipientId),
			},
		});
	},
	
	updateBasketItemAmount: (recipientId, amount) => {
		const basket = get().basket;
		set({
			basket: {
				...basket,
				items: basket.items.map(item =>
					item.recipientId === recipientId
						? { ...item, amount, isManuallyAllocated: true }
						: item
				),
			},
		});
	},
	
	clearBasket: () => {
		set({ basket: initialBasket });
	},
	
	setDistributionMethod: (method) => {
		const basket = get().basket;
		set({
			basket: {
				...basket,
				distributionMethod: method,
			},
		});
	},
	
	setSupportZaakiyah: (support, amount) => {
		const basket = get().basket;
		set({
			basket: {
				...basket,
				supportZaakiyah: support,
				zaakiyahAmount: amount || 0,
			},
		});
	},
	
	setIsAnonymous: (isAnonymous) => {
		const basket = get().basket;
		set({
			basket: {
				...basket,
				isAnonymous,
			},
		});
	},
	
	distributeEqually: (totalAmount) => {
		const basket = get().basket;
		const itemCount = basket.items.length;
		
		if (itemCount === 0) return;
		
		const amountPerRecipient = Math.floor((totalAmount / itemCount) * 100) / 100; // Round to 2 decimals
		const remainder = totalAmount - (amountPerRecipient * itemCount);
		
		set({
			basket: {
				...basket,
				items: basket.items.map((item, index) => ({
					...item,
					amount: index === 0 ? amountPerRecipient + remainder : amountPerRecipient,
					isManuallyAllocated: false,
				})),
				distributionMethod: 'equal',
			},
		});
	},
	
	// Watchlist Actions
	addToWatchlist: (recipient) => {
		const watchlist = get().watchlist;
		if (watchlist.some(item => item.recipientId === recipient.id)) {
			return; // Already in watchlist
		}
		
		const newItem: WatchlistItem = {
			id: `watchlist-${Date.now()}`,
			recipientId: recipient.id,
			recipient,
			addedAt: new Date().toISOString(),
		};
		
		set({ watchlist: [...watchlist, newItem] });
	},
	
	removeFromWatchlist: (recipientId) => {
		const watchlist = get().watchlist;
		set({
			watchlist: watchlist.filter(item => item.recipientId !== recipientId),
		});
	},
	
	isInWatchlist: (recipientId) => {
		return get().watchlist.some(item => item.recipientId === recipientId);
	},
	
	// Computed
	getBasketTotal: () => {
		const basket = get().basket;
		const recipientsTotal = basket.items.reduce((sum, item) => sum + item.amount, 0);
		return recipientsTotal + basket.zaakiyahAmount;
	},
	
	getBasketItemCount: () => {
		return get().basket.items.length;
	},
}));



