import { NbMenuItem } from '@nebular/theme';

export const MENU_ITEMS: NbMenuItem[] = [
	{
		title: 'Home',
		icon: 'home-outline',
		link: '/dashboard',
		home: true,
	},
	{
		title: 'FEATURES',
		group: true,
	},
	{
		title: 'Stats',
		icon: 'pie-chart-outline',
		link: '/dashboard/stats',
	},
	{
		title: 'Settings',
		icon: 'settings-2-outline',
		link: '/dashboard/settings',
	},
	{
		title: 'Console',
		icon: 'settings-2-outline',
		link: '/dashboard/console',
	},
];