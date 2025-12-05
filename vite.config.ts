import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
	plugins: [
		react(),
		{
			name: 'remove-console',
			transform(code, id) {
				if (process.env.NODE_ENV === 'production' && !id.includes('node_modules')) {
					return {
						code: code.replace(
							/console\.(log|debug|info|warn|error|trace|table|group|groupEnd)\([^)]*\);?/g,
							''
						),
						map: null,
					};
				}
			},
		},
	],
	server: {
		port: 3000,
	},
	build: {
		outDir: 'dist',
		sourcemap: false,
		minify: 'esbuild',
		rollupOptions: {
			output: {
				manualChunks: {
					vendor: ['react', 'react-dom', 'react-router-dom'],
					ui: ['framer-motion', '@heroicons/react'],
					forms: ['react-hook-form', '@hookform/resolvers', 'zod'],
					state: ['zustand'],
				},
			},
		},
		chunkSizeWarningLimit: 1000,
	},
	define: {
		'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development'),
	},
});
