import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { SupportedCurrency } from '../services/currencyService';
import { currencyService } from '../services/currencyService';
import { useAuthStore } from './authStore';

export type CurrencyCode = string;

interface CurrencyState {
	// User's preferred currency
	preferredCurrency: CurrencyCode;
	
	// Available currencies from API
	supportedCurrencies: SupportedCurrency[];
	
	// Latest exchange rates
	latestRates: Record<string, { rate: number; source: string; effectiveDate: string } | null>;
	
	// Loading states
	isLoadingCurrencies: boolean;
	isLoadingRates: boolean;
	
	// Actions
	setPreferredCurrency: (currency: CurrencyCode) => void;
	setSupportedCurrencies: (currencies: SupportedCurrency[]) => void;
	setLatestRates: (rates: Record<string, any>) => void;
	fetchSupportedCurrencies: () => Promise<void>;
	fetchLatestRates: () => Promise<void>;
	syncWithUserProfile: () => void;
}

const DEFAULT_CURRENCY = 'USD';

export const useCurrencyStore = create<CurrencyState>()(
	persist(
		(set, get) => ({
			preferredCurrency: DEFAULT_CURRENCY,
			supportedCurrencies: [],
			latestRates: {},
			isLoadingCurrencies: false,
			isLoadingRates: false,

			setPreferredCurrency: (currency) => {
				set({ preferredCurrency: currency });
			},

			setSupportedCurrencies: (currencies) => {
				set({ supportedCurrencies: currencies });
			},

			setLatestRates: (rates) => {
				set({ latestRates: rates });
			},

			fetchSupportedCurrencies: async () => {
				set({ isLoadingCurrencies: true });
				try {
					const response = await currencyService.getSupportedCurrencies();
					if (response.data) {
						set({ supportedCurrencies: response.data });
					}
				} catch (error) {
					console.error('Failed to fetch supported currencies:', error);
				} finally {
					set({ isLoadingCurrencies: false });
				}
			},

			fetchLatestRates: async () => {
				set({ isLoadingRates: true });
				try {
					const response = await currencyService.getLatestRates();
					if (response.data) {
						set({ latestRates: response.data });
					}
				} catch (error) {
					console.error('Failed to fetch latest rates:', error);
				} finally {
					set({ isLoadingRates: false });
				}
			},

			syncWithUserProfile: () => {
				const user = useAuthStore.getState().user;
				if (user?.preferredCurrency) {
					set({ preferredCurrency: user.preferredCurrency });
				}
			},
		}),
		{
			name: 'currency-storage',
			partialize: (state) => ({
				preferredCurrency: state.preferredCurrency,
				supportedCurrencies: state.supportedCurrencies,
			}),
		}
	)
);

