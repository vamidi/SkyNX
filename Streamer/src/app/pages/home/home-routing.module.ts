import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { HomeComponent } from './home.component';
import { StatsComponent } from './stats/stats.component';
import { SettingsComponent } from './settings/settings.component';
import { ConsoleComponent } from './console/console.component';

const routes: Routes = [
	{
		path: '',
		component: HomeComponent
	},
	{
		path: 'stats',
		component: StatsComponent
	},
	{
		path: 'settings',
		component: SettingsComponent
	},
	{
		path: 'console',
		component: ConsoleComponent,
	}
];

@NgModule({
	declarations: [],
	imports: [CommonModule, RouterModule.forChild(routes)],
	exports: [RouterModule]
})
export class HomeRoutingModule {
}
