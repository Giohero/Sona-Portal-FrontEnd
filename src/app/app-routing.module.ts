import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './sidenav/home/home.component';
import { CostumersComponent } from './costumers/costumers.component';
import { ItemsComponent } from './items/items.component';
import { LoginComponent } from './login/login.component';

// const routes: Routes = [
//   { path: '', redirectTo: '/login', pathMatch: 'full' },
//   { path: 'home', component:HomeComponent},
//   { path: 'customers', component:CostumersComponent},
//   { path: 'items', component:ItemsComponent},
//   { path: 'login', component:LoginComponent},
// ];
const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'login', component:LoginComponent},
  //Creating canActive for routes when is logged
  { path: 'sidenav', loadChildren: () => import('./sidenav/sidenav.module').then(x => x.SidenavModule)},
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
