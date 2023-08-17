// import { canActivate, redirectUnauthorizedTo, redirectLoggedInTo } from '@angular/fire/auth-guard';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { CostumersComponent } from '../costumers/costumers.component';
import { SidenavComponent } from './sidenav.component';
import { ItemsComponent } from '../items/items.component';

// const redirectToLogin = () => redirectUnauthorizedTo(['']);

const routes: Routes = [
    { path: '', component: SidenavComponent, children: [
    { path: 'home', component: HomeComponent},
    { path: 'costumers', component: CostumersComponent},
    { path: 'items', component: ItemsComponent},
    // { path: 'allocation/details/:pDocNum', component: AllocationDetailsComponent, ...canActivate(redirectToLogin)  } //ItemCode
  ]}
];
//{ path: '', component: InicioComponent }
@NgModule({

  imports: [RouterModule.forChild(routes)],

  exports: [RouterModule]

})
export class DashboardRouterModule {

}