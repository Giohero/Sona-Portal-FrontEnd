import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CostumersComponent } from '../costumers/costumers.component';
import { ItemsComponent } from '../items/items.component';
import { HomeComponent } from './home/home.component';
import { MatTableModule } from '@angular/material/table';
import {MatButtonModule} from '@angular/material/button';
import { MatToolbar } from '@angular/material/toolbar';
import { SharedModule } from '../shared/shared.module';


@NgModule({

  declarations: [
    CostumersComponent,
    ItemsComponent,
    HomeComponent,
  ],
  imports: [
    CommonModule,
    HttpClientModule,
    MatButtonModule,
    MatTableModule,
    RouterModule,
    SharedModule,
  ],
  providers: [
    HttpClientModule
  ]
})
export class SidenavModule { }