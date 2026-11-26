import House from '@lucide/svelte/icons/house';
import User from '@lucide/svelte/icons/user';
import MonitorSmartphone from '@lucide/svelte/icons/monitor-smartphone';
import HousePlus from '@lucide/svelte/icons/house-plus';
import Router from '@lucide/svelte/icons/router';
import Shield from '@lucide/svelte/icons/shield';
import Settings from '@lucide/svelte/icons/settings';

// Same items/order as upstream headscale-admin. Settings must stay last: without a valid API key only it is shown.
export const nav = [
	{ path: '/', name: 'Home', icon: House },
	{ path: '/users', name: 'Users', icon: User },
	{ path: '/nodes', name: 'Nodes', icon: MonitorSmartphone },
	{ path: '/deploy', name: 'Deploy', icon: HousePlus },
	{ path: '/routes', name: 'Routes', icon: Router },
	{ path: '/acls', name: 'ACLs', icon: Shield },
	{ path: '/settings', name: 'Settings', icon: Settings },
];
