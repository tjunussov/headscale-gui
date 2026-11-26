import type { CustomThemeConfig } from '@skeletonlabs/tw-plugin';

// Monochrome shadcn-style theme (zinc scale). Status colors kept for meaning only.
const zinc = ['255 255 255', '244 244 245', '228 228 231', '212 212 216', '161 161 170', '113 113 122', '63 63 70', '39 39 42', '24 24 27', '9 9 11'];
const steps = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900];
const scale = (name: string, rgb: string[]) => Object.fromEntries(steps.map((s, i) => [`--color-${name}-${s}`, rgb[i]]));

export const tjnpv: CustomThemeConfig = {
	name: 'tjnpv',
	properties: {
		'--theme-font-family-base': "ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
		'--theme-font-family-heading': 'var(--theme-font-family-base)',
		'--theme-font-color-base': '9 9 11',
		'--theme-font-color-dark': '250 250 250',
		'--theme-rounded-base': '6px',
		'--theme-rounded-container': '8px',
		'--theme-border-base': '1px',
		'--on-primary': '250 250 250',
		'--on-secondary': '250 250 250',
		'--on-tertiary': '250 250 250',
		'--on-success': '255 255 255',
		'--on-warning': '9 9 11',
		'--on-error': '255 255 255',
		'--on-surface': '250 250 250',
		...scale('primary', zinc),
		...scale('secondary', zinc),
		...scale('tertiary', zinc),
		...scale('surface', zinc),
		// emerald / amber / red — status only
		...scale('success', ['236 253 245', '209 250 229', '167 243 208', '110 231 183', '52 211 153', '16 185 129', '5 150 105', '4 120 87', '6 95 70', '6 78 59']),
		...scale('warning', ['255 251 235', '254 243 199', '253 230 138', '252 211 77', '251 191 36', '245 158 11', '217 119 6', '180 83 9', '146 64 14', '120 53 15']),
		...scale('error', ['254 242 242', '254 226 226', '254 202 202', '252 165 165', '248 113 113', '239 68 68', '220 38 38', '185 28 28', '153 27 27', '127 29 29']),
	},
};
