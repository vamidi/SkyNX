import { NgModule } from '@angular/core';
import { NbSidebarModule, NbMenuModule } from '@nebular/theme';

import { ThemeModule } from '../@theme/theme.module';
import { PagesRoutingModule } from './pages-routing.module';
import { PagesComponent } from './pages.component';
import { DashboardModule } from './dashboard/dashboard.module';
import { HomeModule } from './home/home.module';

@NgModule({
	imports: [
		NbSidebarModule.forRoot(),
		NbMenuModule.forRoot(),

		PagesRoutingModule,
		ThemeModule,
		NbMenuModule,
		DashboardModule,
		HomeModule,
	],
	declarations: [
		PagesComponent,
	],
})
export class PagesModule {
}