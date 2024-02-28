import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { CostumersComponent } from './costumers/costumers.component';
import { ItemsComponent } from './items/items.component';
import { LoginComponent } from './login/login.component';

import { MsalGuard } from '@azure/msal-angular';
import { BrowserUtils } from '@azure/msal-browser';
import { AuthGuardService } from './service/auth-guard.service';

//const redirectToLogin = () => redirectUnauthorizedTo(['']);
const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'login', component:LoginComponent},
  // { path: 'order-edit',
  // loadChildren: () => import('./order-edit/order-edit.component').then(m => m.OrderEditComponent)},
  //Creating canActive for routes when is logged 
  { path: 'dashboard', loadChildren: () => import('./dashboard/dashboard.module').then(x => x.DashboardModule),canActivate: [MsalGuard]},
];

@NgModule({
  imports: [RouterModule.forRoot(routes,{
    initialNavigation: !BrowserUtils.isInIframe() && !BrowserUtils.isInPopup() ? 'enabledNonBlocking' : 'disabled'  
  })],
  exports: [RouterModule]
})
export class AppRoutingModule { }
