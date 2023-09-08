import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DashboardComponent } from './dashboard.component';
import { HomeComponent } from '../home/home.component';
import { ItemsComponent } from '../items/items.component';
import { CostumersComponent } from '../costumers/costumers.component';
import { OrdersComponent } from '../orders/orders.component';
import { OrderReviewComponent } from '../order-review/order-review.component';
import { CartComponent } from '../cart/cart.component';
import { OrderIndexComponent } from '../order-index/order-index.component';
import { OrderEditComponent } from '../order-edit/order-edit.component';
const routes: Routes = [
  { path: '', component: DashboardComponent, children: [
    { path: '', component: HomeComponent,},
    { path: 'items', component: ItemsComponent, },
    { path: 'costumers', component: CostumersComponent, },
    { path: 'orders', component: OrdersComponent, },
    { path: 'order-review', component: OrderReviewComponent },
    { path: 'cart', component: CartComponent, },
    { path: 'order-index', component: OrderIndexComponent},
    { path: 'order-edit', component: OrderEditComponent}
    ]}
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DashboardRoutingModule { }
