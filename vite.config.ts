import { purgeCss } from 'vite-plugin-tailwind-purgecss';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import Icons from 'unplugin-icons/vite'

export default defineConfig({
	plugins: [
		sveltekit(),
		purgeCss(),
		Icons({
			autoInstall: true,
			compiler: 'svelte',
		}),
	],
	// dev only: HEADSCALE=http://host:8080 npm run dev → proxy API, avoids CORS (set API URL to the dev origin)
	server: { proxy: process.env.HEADSCALE ? { '/api': { target: process.env.HEADSCALE, changeOrigin: true } } : {} },
});
