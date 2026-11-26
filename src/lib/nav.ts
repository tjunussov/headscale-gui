import House from '@lucide/svelte/icons/house';
import User from '@lucide/svelte/icons/user';
import MonitorSmartphone from '@lucide/svelte/icons/monitor-smartphone';
import HousePlus from '@lucide/svelte/icons/house-plus';
import Router from '@lucide/svelte/icons/router';
import Shield from '@lucide/svelte/icons/shield';
import Settings from '@lucide/svelte/icons/settings';

// Same items/order as upstream headscale-admin. Settings must stay last: without a valid API key only it is shown.
// group → header breadcrumb, description → subtitle under the page title.
export const nav = [
	{ path: '/', name: 'Home', icon: House, group: 'Overview', description: 'Overview of your Headscale tailnet.' },
	{ path: '/users', name: 'Users', icon: User, group: 'Network', description: 'People and namespaces that own nodes.' },
	{ path: '/nodes', name: 'Nodes', icon: MonitorSmartphone, group: 'Network', description: 'Devices registered to the tailnet.' },
	{ path: '/deploy', name: 'Deploy', icon: HousePlus, group: 'Tools', description: 'Build a tailscale up command for a new device.' },
	{ path: '/routes', name: 'Routes', icon: Router, group: 'Network', description: 'Subnet and exit-node routes advertised by nodes.' },
	{ path: '/acls', name: 'ACLs', icon: Shield, group: 'Network', description: 'Build the tailnet ACL policy. Changes are local until you save.' },
	{ path: '/settings', name: 'Settings', icon: Settings, group: 'Tools', description: 'Connect to your Headscale API. Stored only in this browser.' },
];
