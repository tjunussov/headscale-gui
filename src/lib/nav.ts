import House from '@lucide/svelte/icons/house';
import Users from '@lucide/svelte/icons/users';
import MonitorSmartphone from '@lucide/svelte/icons/monitor-smartphone';
import Rocket from '@lucide/svelte/icons/rocket';
import Route from '@lucide/svelte/icons/route';
import Shield from '@lucide/svelte/icons/shield';
import Settings from '@lucide/svelte/icons/settings';

// Upstream headscale-admin labels, grouped (sidebar sections + header breadcrumb).
// Settings must stay last: without a valid API key only it is shown.
export const nav = [
	{ path: '/', name: 'Home', icon: House, group: 'Overview', description: 'Overview of your Headscale tailnet.' },
	{ path: '/users', name: 'Users', icon: Users, group: 'Network', description: 'People and namespaces that own machines.' },
	{ path: '/nodes', name: 'Machines', icon: MonitorSmartphone, group: 'Network', description: 'Manage the devices connected to your tailnet.' },
	{ path: '/routes', name: 'Routes', icon: Route, group: 'Network', description: 'Subnet and exit-node routes advertised by machines.' },
	{ path: '/acls', name: 'ACLs', icon: Shield, group: 'Network', description: 'Build the tailnet ACL policy. Changes are local until you save.' },
	{ path: '/deploy', name: 'Deploy', icon: Rocket, group: 'Tools', description: 'Build a tailscale up command for a new device.' },
	{ path: '/settings', name: 'Settings', icon: Settings, group: 'Tools', description: 'Connect to your Headscale API. Stored only in this browser.' },
];
