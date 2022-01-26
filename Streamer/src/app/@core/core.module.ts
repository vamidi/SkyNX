import { ModuleWithProviders, NgModule, Optional, SkipSelf } from '@angular/core';
import { CommonModule } from '@angular/common';
import { throwIfAlreadyLoaded } from './module-import-guard';
import { LayoutService } from './utils';
import { UserData } from './data/users';
import { UserService } from './mock/users.service';

const socialLinks = [
	{
		url: 'https://github.com/akveo/nebular',
		target: '_blank',
		icon: 'github',
	},
	{
		url: 'https://www.facebook.com/akveo/',
		target: '_blank',
		icon: 'facebook',
	},
	{
		url: 'https://twitter.com/akveo_inc',
		target: '_blank',
		icon: 'twitter',
	},
];

const DATA_SERVICES = [
	{ provide: UserData, useClass: UserService },
];

export const NB_CORE_PROVIDERS = [
	...DATA_SERVICES,
	LayoutService,
];

@NgModule({
	declarations: [],
	imports: [
		CommonModule
	]
})
export class CoreModule {
	constructor(@Optional() @SkipSelf() parentModule: CoreModule) {
		throwIfAlreadyLoaded(parentModule, 'CoreModule');
	}

	static forRoot(): ModuleWithProviders<CoreModule> {
		return {
			ngModule: CoreModule,
			providers: [
				...NB_CORE_PROVIDERS,
			],
		};
	}
}
