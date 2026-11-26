// Remembered UI state (sort, filters, search, tabs, last page) in localStorage under "ui:<key>".
// Usage in a component:
//   const saved = uiLoad('nodes', { sortMethod: 'id', filterString: '' });
//   let sortMethod = $state(saved.sortMethod); ...
//   $effect(() => uiSave('nodes', { sortMethod, filterString }));
// ponytail: localStorage, not IndexedDB — a few small JSON blobs, read synchronously so pages render restored.
export function uiLoad<T extends object>(key: string, defaults: T): T {
	try {
		return { ...defaults, ...JSON.parse(localStorage.getItem('ui:' + key) ?? '{}') };
	} catch {
		return defaults;
	}
}

export function uiSave(key: string, value: unknown) {
	try {
		localStorage.setItem('ui:' + key, JSON.stringify(value));
	} catch {
		// storage full/blocked: nothing to remember, not worth an error
	}
}
