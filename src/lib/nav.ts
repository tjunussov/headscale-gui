import House from '@lucide/svelte/icons/house';
import Users from '@lucide/svelte/icons/users';
import MonitorSmartphone from '@lucide/svelte/icons/monitor-smartphone';
import Rocket from '@lucide/svelte/icons/rocket';
import Route from '@lucide/svelte/icons/route';
import Shield from '@lucide/svelte/icons/shield';
import Settings from '@lucide/svelte/icons/settings';

// Settings must stay last: without a valid API key only it is shown
export const nav = [
	{ path: '/', name: 'Dashboard', icon: House, group: 'Overview' },
	{ path: '/users', name: 'Users', icon: Users, group: 'Network' },
	{ path: '/nodes', name: 'Nodes', icon: MonitorSmartphone, group: 'Network' },
	{ path: '/routes', name: 'Routes', icon: Route, group: 'Network' },
	{ path: '/acls', name: 'Access Control', icon: Shield, group: 'Network' },
	{ path: '/deploy', name: 'Deploy', icon: Rocket, group: 'Tools' },
	{ path: '/settings', name: 'Settings', icon: Settings, group: 'Tools' },
];
