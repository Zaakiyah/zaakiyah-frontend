import { create } from 'zustand';
import type { AlertVariant } from '../components/ui/Alert';

interface AlertState {
	isOpen: boolean;
	title?: string;
	message: string;
	variant: AlertVariant;
	showIcon: boolean;
	autoClose: boolean;
	autoCloseDelay: number;
	showAlert: (config: AlertConfig) => void;
	closeAlert: () => void;
}

interface AlertConfig {
	title?: string;
	message: string;
	variant?: AlertVariant;
	showIcon?: boolean;
	autoClose?: boolean;
	autoCloseDelay?: number;
}

const initialState = {
	isOpen: false,
	title: undefined,
	message: '',
	variant: 'info' as AlertVariant,
	showIcon: true,
	autoClose: false,
	autoCloseDelay: 3000,
};

export const useAlertStore = create<AlertState>((set) => ({
	...initialState,

	showAlert: (config: AlertConfig) => {
		set({
			isOpen: true,
			title: config.title,
			message: config.message,
			variant: config.variant || 'info',
			showIcon: config.showIcon !== undefined ? config.showIcon : true,
			autoClose: config.autoClose || false,
			autoCloseDelay: config.autoCloseDelay || 3000,
		});
	},

	closeAlert: () => {
		set(initialState);
	},
}));

export const alert = {
	info: (message: string, title?: string) => {
		useAlertStore.getState().showAlert({ message, title, variant: 'info' });
	},
	success: (message: string, title?: string) => {
		useAlertStore.getState().showAlert({ message, title, variant: 'success', autoClose: true });
	},
	warning: (message: string, title?: string) => {
		useAlertStore.getState().showAlert({ message, title, variant: 'warning' });
	},
	error: (message: string, title?: string) => {
		useAlertStore.getState().showAlert({ message, title, variant: 'error' });
	},
};

