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
import { FilterPipe } from '../service/filter.pipe';
import { CartComponent } from '../cart/cart.component';
import { OrderIndexComponent } from '../order-index/order-index.component';
import { OrderEditComponent } from '../order-edit/order-edit.component';
import { FilterPipeCustomer } from '../service/filterCustomers.pipe';
import { DialogAddressComponent } from '../dialog-address/dialog-address.component';
import { DialogAddcustomComponent } from '../dialog-addcustom/dialog-addcustom.component';
import { SnackbarsComponent } from '../snackbars/snackbars.component';
import { OrderReviewComponent } from '../order-review/order-review.component';
import { OrdersComponent } from '../orders/orders.component';
import { MatRadioModule } from '@angular/material/radio';
import { MatMenuModule } from '@angular/material/menu';
import {MatTabsModule} from '@angular/material/tabs';
import { CustomersEditComponent } from '../customers-edit/customers-edit.component';




@NgModule({
  declarations: [
    SidenavComponent,
    DashboardComponent,
    ItemsComponent,
    CostumersComponent,
    HomeComponent,
    FilterPipe,
    CartComponent,
    OrderIndexComponent,
    OrderEditComponent,
    FilterPipeCustomer,
    DialogAddressComponent,
    DialogAddcustomComponent,
    OrderReviewComponent,
    SnackbarsComponent,
    OrdersComponent,
    CustomersEditComponent,
    
  ],
  imports: [
    CommonModule,
    SharedModule,
    DashboardRoutingModule,
    HttpClientModule,
    MatTabsModule,
  ]
})
export class DashboardModule { }
