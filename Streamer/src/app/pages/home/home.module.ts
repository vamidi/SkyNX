import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import {
	NbCardModule,
	NbInputModule,
	NbSelectModule,
	NbThemeModule,
	NbToggleModule
} from '@nebular/theme';

import { HomeRoutingModule } from './home-routing.module';

import { HomeComponent } from './home.component';
import { StatsComponent } from './stats/stats.component';
import { SettingsComponent } from './settings/settings.component';
import { ConsoleComponent } from './console/console.component';

const NB_MODULES = [
	NbThemeModule,
	NbCardModule,
	NbSelectModule,
	NbInputModule,
	NbToggleModule,
];

const COMPONENTS = [
	HomeComponent,
	StatsComponent,
	SettingsComponent,
	ConsoleComponent,
];

@NgModule({
	declarations: [
		...COMPONENTS,
	],
	imports: [
		CommonModule,
		TranslateModule,
		HomeRoutingModule,

		...NB_MODULES,
	]
})
export class HomeModule {
}
