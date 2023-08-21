import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { DashboardRoutingModule } from './dashboard-routing.module';
import { DashboardComponent } from './dashboard.component';
import { SharedModule } from '../shared/shared.module';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { ItemsComponent } from '../items/items.component';
import { CostumersComponent } from '../costumers/costumers.component';
import { HomeComponent } from '../home/home.component';
import { SidenavComponent } from '../sidenav/sidenav.component';


@NgModule({
  declarations: [
    SidenavComponent,
    DashboardComponent,
    ItemsComponent,
    CostumersComponent,
    HomeComponent
  ],
  imports: [
    CommonModule,
    SharedModule,
    DashboardRoutingModule,
    HttpClientModule
  ]
})
export class DashboardModule { }
