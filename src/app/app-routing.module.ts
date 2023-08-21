import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { CostumersComponent } from './costumers/costumers.component';
import { ItemsComponent } from './items/items.component';
import { LoginComponent } from './login/login.component';

const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'login', component:LoginComponent},
  //Creating canActive for routes when is logged 
  { path: 'dashboard', loadChildren: () => import('./dashboard/dashboard.module').then(x => x.DashboardModule)},
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
