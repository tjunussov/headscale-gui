import tailwindcss from '@tailwindcss/vite';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [
		sveltekit(),
		tailwindcss(),
	],
	// dev only: HEADSCALE=http://host:8080 npm run dev → proxy API, avoids CORS (set API URL to the dev origin)
	server: { proxy: process.env.HEADSCALE ? { '/api': { target: process.env.HEADSCALE, changeOrigin: true } } : {} },
});
