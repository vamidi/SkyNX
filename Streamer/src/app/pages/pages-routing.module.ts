import { RouterModule, Routes } from '@angular/router';
import { NgModule } from '@angular/core';

import { PagesComponent } from './pages.component';
import { NotFoundComponent } from './miscellaneous/not-found/not-found.component';

const routes: Routes = [{
	path: '',
	component: PagesComponent,
	children: [
		{
			path: 'dashboard',
			loadChildren: () => import('./home/home.module')
				.then(m => m.HomeModule),
		},
		{
			path: '',
			redirectTo: 'dashboard',
			pathMatch: 'full',
		},
		{
			path: '**',
			component: NotFoundComponent,
		},
	],
}];

@NgModule({
	imports: [RouterModule.forChild(routes)],
	exports: [RouterModule],
})
export class PagesRoutingModule {
}