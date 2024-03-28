import { ModuleWithProviders, NgModule } from "@angular/core";
import { CommonModule } from '@angular/common';

import {
	NbActionsModule,
	NbLayoutModule,
	NbMenuModule,
	NbSearchModule,
	NbSidebarModule,
	NbUserModule,
	NbContextMenuModule,
	NbButtonModule,
	NbSelectModule,
	NbIconModule,
	NbThemeModule,
} from '@nebular/theme';
import { NbEvaIconsModule } from '@nebular/eva-icons';

import {
	FooterComponent,
	HeaderComponent,
} from './components';

import {
	OneColumnLayoutComponent,
	ThreeColumnsLayoutComponent,
	TwoColumnsLayoutComponent,
} from './layouts';
import { DEFAULT_THEME } from './styles/theme.default';
import { COSMIC_THEME } from './styles/theme.cosmic';
import { CORPORATE_THEME } from './styles/theme.corporate';
import { DARK_THEME } from './styles/theme.dark';

const NB_MODULES = [
	NbLayoutModule,
	NbMenuModule,
	NbUserModule,
	NbActionsModule,
	NbSearchModule,
	NbSidebarModule,
	NbContextMenuModule,
	NbButtonModule,
	NbSelectModule,
	NbIconModule,
	NbEvaIconsModule,
];

const COMPONENTS = [
	OneColumnLayoutComponent,
	ThreeColumnsLayoutComponent,
	TwoColumnsLayoutComponent,

	FooterComponent,
	HeaderComponent,
];

const PIPES = [];

@NgModule({
	imports: [CommonModule, ...NB_MODULES],
	exports: [CommonModule, ...PIPES, ...COMPONENTS],
	declarations: [...COMPONENTS, ...PIPES],
})
export class ThemeModule {
	static forRoot(): ModuleWithProviders<ThemeModule> {
		return {
			ngModule: ThemeModule,
			providers: [
				...NbThemeModule.forRoot(
					{
						name: 'default',
					},
					[ DEFAULT_THEME, COSMIC_THEME, CORPORATE_THEME, DARK_THEME ],
				).providers,
			],
		};
	}
}