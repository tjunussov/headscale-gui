import { toast } from 'svelte-sonner';
export { openDrawer, closeDrawer } from './drawer.svelte';


import IPAddr from 'ipaddr.js';
import { debug } from './debug';
import DOMPurify from 'dompurify';
import type { Direction, Node, OnlineStatus, User } from './types';
import { App } from '$lib/States.svelte';

export function clone<T>(item: T): T {
	return JSON.parse(JSON.stringify(item)) as T
}

export function focus(el: HTMLElement | null) {
	if (el !== null) {
		el.focus();
	}
}

export function arraysEqual<T>(a: T[], b: T[]): boolean {
	if(a.length !== b.length){
		return false
	}

	return JSON.stringify(a) == JSON.stringify(b)

	if (a === b){
		return true;
	}

	if (a == null || b == null){
		return false;
	}
	
	if (a.length !== b.length) {
		return false;
	}

	for (var i = 0; i < a.length; ++i) {
		if (a[i] !== b[i]){
			return false;
		}
	}

	return true;
}

const DurationInfiniteString = '0001-01-01T00:00:00Z';
const DurationInfinite = new Date(DurationInfiniteString);
const ExpirationColorFuture = '';
const ExpirationColorPast = 'text-destructive';

export function isZeroDate(date: Date | string): boolean {
	if (typeof date === 'string') {
		date = new Date(date);
	}
	return date.getTime() == DurationInfinite.getTime();
}

export function isExpired(expiry: string): boolean {
	const date = new Date(expiry ?? DurationInfiniteString);
	const now = new Date();
	if (date.getTime() == DurationInfinite.getTime()) {
		return false;
	}
	return date.getTime() - now.getTime() < 0;
}

export function setsEqual<T>(set1: Set<T>, set2: Set<T>): boolean {
	if (set1.size !== set2.size) {
		return false;
	}

	for (const item of set1) {
		if (!set2.has(item)) {
			return false;
		}
	}

	return true;
}

interface TimeDifference {
	future: boolean;
	finite: boolean;
	message: string;
}

export function getTime(
	msg?: string | null | Date,
	fallback: string = DurationInfiniteString,
): number {
	if (msg === null) {
		return DurationInfinite.getTime()
	}

	if (msg === undefined) {
		msg = new Date();
	}

	if (msg instanceof Date) {
		return msg.getTime();
	}
	return new Date(msg ?? fallback).getTime();
}

export function getTimeDifferenceMessage(time1: number): string {
	const difference = getTimeDifference(time1, new Date().getTime());
	return difference.finite ? difference.message : 'Does Not Expire';
}

export function getTimeDifferenceColor(td: TimeDifference): string {
	return !td.finite || td.future ? ExpirationColorFuture : ExpirationColorPast;
}

export function getTimeDifference(time1: number, time2?: number): TimeDifference {
	if (time2 === undefined) {
		time2 = new Date().getTime();
	}

	if (time1 == DurationInfinite.getTime()) {
		return {
			future: true,
			finite: false,
			message: 'Does Not Expire',
		};
	}

	time2 = Math.floor(time2 / 1000) * 1000;
	let difference = time1 - time2;
	const isFuture = difference > 0;
	let message = '';

	difference = Math.abs(difference);
	const seconds = Math.floor(difference / 1000);
	const minutes = Math.floor(seconds / 60);
	const hours = Math.floor(minutes / 60);
	const days = Math.floor(hours / 24);
	const weeks = Math.floor(days / 7);
	const months = Math.floor(weeks / 4);

	if (months > 0) {
		message = `${months} month${months == 1 ? '' : 's'}`;
	} else if (weeks > 0) {
		message = `${weeks} week${weeks == 1 ? '' : 's'}`;
	} else if (days > 0) {
		message = `${days} day${days == 1 ? '' : 's'}`;
	} else if (hours > 0) {
		message = `${hours} hour${hours == 1 ? '' : 's'}`;
	} else if (minutes > 0) {
		message = `${minutes} minute${minutes == 1 ? '' : 's'}`;
	} else {
		message = `${seconds} second${seconds == 1 ? '' : 's'}`;
	}

	return {
		future: isFuture,
		finite: true,
		message: message + ` ${isFuture ? 'from now' : 'ago'}`,
	};
}

export function dateToStr(d: Date | string) {
	if (typeof d === 'string') {
		d = new Date(d);
	}

	return d.toLocaleString('en-US', {
		day: '2-digit',
		month: '2-digit',
		year: 'numeric',
		hour: 'numeric',
		minute: '2-digit',
		//hour12: false
	});
}

export const toastSuccess = (message: string) => toast.success(DOMPurify.sanitize(message));
export const toastWarning = (message: string) => toast.warning(DOMPurify.sanitize(message));
export const toastError = (message: string, error?: Error) =>
	toast.error(DOMPurify.sanitize(message + (error ? (message ? ': ' : '') + error.message : '')));

export const copyToClipboard = (s: string, toastMessage = 'Copied to Clipboard!') =>
	navigator.clipboard.writeText(s).then(() => toastSuccess(toastMessage), () => toastError('Failed to copy to clipboard!'));

export function isValidTag(tag: string): boolean {
	// the only restrictions I could find were to be all lowercase, no-spaces
	// I made it alphanumeric with dashes and underscores only
	return new RegExp(/^[a-z0-9-_]+$/, 'g').test(tag);
}

function getInverseMask(prefix: number, bitsTotal: number, bitsPart: number = 8) {
	const ibitmask = '0'.repeat(prefix) + '1'.repeat(bitsTotal - prefix);
	const imask = [] as number[];

	for (let i = 0; i < bitsTotal; i += bitsPart) {
		imask.push(parseInt(ibitmask.substring(i, i + bitsPart), 2));
	}

	return imask;
}

export function getInverseMask4(prefix: number): number[] {
	return getInverseMask(prefix, 32);
}

export function getInverseMask6(prefix: number): number[] {
	return getInverseMask(prefix, 128);
}

export function isValidIP(addr: string): boolean {
	try {
		IPAddr.parse(addr)
		return true
	} catch(err) {
		debug(err)
		return false
	}
}

export function isValidCIDR(cidr: string): boolean {
	try {
		const [addr, mask] = IPAddr.parseCIDR(cidr);
		let imask: number[];
		if (addr instanceof IPAddr.IPv4) {
			imask = getInverseMask4(mask);
		} else if (addr instanceof IPAddr.IPv6) {
			imask = getInverseMask6(mask);
		} else {
			throw new Error('invalid address type');
		}

		const addrBytes = addr.toByteArray();

		if (imask.length != addrBytes.length) {
			throw new Error('mask and addr length mismtch');
		}

		for (let i = 0; i < imask.length; i++) {
			if ((imask[i] & addrBytes[i]) !== 0) {
				throw new Error('host bits set');
			}
		}

		return true;
	} catch (err) {
		debug(err);
	}
	return false;
}

export function toOptions(values: string[]): {label: string, value:string}[] {
	return values.map(v => ({
		label: v,
		value: v,
	}))
}

export function deduplicate<T>(arr: T[]): T[] {
	return Array.from(new Set(arr))
}

export function getSortedUsers(users: User[], sortMethod: string, sortDirection: Direction): User[] {
	if (sortMethod === 'id') {
		users = users.sort((a: User, b: User) => {
			const aid = parseInt(a.id);
			const bid = parseInt(b.id);
			if (aid < bid) {
				return -1;
			}
			if (aid > bid) {
				return 1;
			}
			return 0;
		});
	}
	if (sortMethod === 'name') {
		users = users.sort((a: User, b: User) => {
			if (a.name < b.name) {
				return -1;
			}
			if (a.name > b.name) {
				return 1;
			}
			return 0;
		});
	}
	if (sortDirection === 'down') {
		return users.reverse();
	}
	return users;
}


const nodeSortKey: Record<string, (n: Node) => number | string> = {
	id: (n) => parseInt(n.id),
	name: (n) => n.givenName,
	user: (n) => n.user.name,
	lastseen: (n) => (n.online ? Infinity : new Date(n.lastSeen ?? 0).getTime()),
};

export function getSortedNodes(nodes: Node[], sortMethod: string, sortDirection: Direction): Node[] {
	const k = nodeSortKey[sortMethod] ?? nodeSortKey.id;
	const sorted = nodes.toSorted((a, b) => (k(a) < k(b) ? -1 : k(a) > k(b) ? 1 : 0));
	return sortDirection === 'down' ? sorted.reverse() : sorted;
}

export function filterUser(user: User, filterString: string, onlineStatus: OnlineStatus = "all"): boolean {
	try {
		if (
			(onlineStatus === 'online' && !App.nodes.value.filter((n) => n.user.id === user.id).some((n) => n.online)) ||
			(onlineStatus === 'offline' && App.nodes.value.filter((n) => n.user.id === user.id).some((n) => n.online))
		) {
			return false;
		}

		if (filterString === '') {
			return true;
		}

		const r = RegExp(filterString);
		return r.test(user.name) || r.test(user.name.toLowerCase());
	} catch (error) {
		return true;
	}
}

export function filterNode(node: Node, filterString: string, onlineStatus: OnlineStatus = "all"): boolean {
	if((onlineStatus === "online" && !node.online) || (onlineStatus === "offline" && node.online)){
		return false
	}

	if (filterString === '') {
		return true;
	}

	try {
		const r = RegExp(filterString);
		// name, hostname, owner, tag (without "tag:"; upstream compared only the prefix), any IP
		return [node.name, node.givenName, node.user.name, ...node.tags.map((t) => t.replace(/^tag:/, '')), ...node.ipAddresses].some((s) => r.test(s));
	} catch (err) {
		return true;
	}
}

export function getSortedFilteredUsers(
	users: User[],
	filterString:string,
	sortMethod: string,
	sortDirection: Direction,
	onlineStatus: OnlineStatus,
){
	return getSortedUsers(
		users.filter((user)=> filterUser(user, filterString, onlineStatus)),
		sortMethod,
		sortDirection,
	)
}

export function getSortedFilteredNodes(
	nodes: Node[],
	filterString:string,
	sortMethod: string,
	sortDirection: Direction,
	onlineStatus: OnlineStatus,
	ignoreRouteless: boolean = false,
){
	let nodesSortedFiltered = getSortedNodes(
		nodes.filter((node)=> filterNode(node, filterString, onlineStatus)),
		sortMethod,
		sortDirection,
	)
	if(ignoreRouteless === true){
		return nodesSortedFiltered.filter((n) => {
			return n.availableRoutes.length > 0;
		})
	}
	return nodesSortedFiltered
}
export const lastSeenText = (n: Node) => (n.online ? 'Online now' : n.lastSeen && new Date(n.lastSeen).getFullYear() > 1970 ? getTimeDifferenceMessage(getTime(n.lastSeen)) : 'Never');

// counts for the All/Online/Offline filter tabs
export const onlineCounts = <T>(items: T[], isOnline: (i: T) => boolean): Record<OnlineStatus, number> => {
	const online = items.filter(isOnline).length;
	return { all: items.length, online, offline: items.length - online };
};

// Tailscale-style status pills from advertised routes; pending = some not approved yet
const EXIT_ROUTES = ['0.0.0.0/0', '::/0'];
export function machinePills(n: Node) {
	const exit = n.availableRoutes.filter((r) => EXIT_ROUTES.includes(r)), subnet = n.availableRoutes.filter((r) => !EXIT_ROUTES.includes(r));
	const pill = (label: string, rs: string[]) => ({ label, pending: rs.some((r) => !n.approvedRoutes.includes(r)), title: `${rs.filter((r) => n.approvedRoutes.includes(r)).length}/${rs.length} approved: ${rs.join(', ')}` });
	return [...(exit.length ? [pill('Exit Node', exit)] : []), ...(subnet.length ? [pill('Subnet', subnet)] : [])];
}
export const machineHref = (n: Node) => `/nodes/${n.ipAddresses.find((s) => !s.includes(':')) ?? n.id}/`;
