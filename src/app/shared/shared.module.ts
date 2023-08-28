import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
//Modulos
import { ReactiveFormsModule } from '@angular/forms';
import { FormsModule} from '@angular/forms';
//Angular Material
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatSliderModule } from '@angular/material/slider';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDialogModule} from '@angular/material/dialog';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTreeModule } from '@angular/material/tree';
import { MatMenuModule } from '@angular/material/menu';
import {MatSelectModule} from '@angular/material/select';
import {MatPaginatorModule} from '@angular/material/paginator';
import {MatExpansionModule} from '@angular/material/expansion';
import {MatSidenavModule} from '@angular/material/sidenav';
import {MatListModule} from '@angular/material/list';
import {MatSortModule} from '@angular/material/sort';
import {MatSnackBarModule} from '@angular/material/snack-bar';
import {FlexLayoutModule } from '@angular/flex-layout';
import {MatCardModule} from '@angular/material/card';
import { FilterPipe } from '../service/filter.pipe';
import {MatAutocompleteModule} from '@angular/material/autocomplete';


@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    ReactiveFormsModule,
    MatToolbarModule,
    MatTableModule,
    MatIconModule,
    MatSliderModule,
    MatDatepickerModule,
    MatNativeDateModule,
    FormsModule,
    MatDialogModule,
    MatProgressSpinnerModule,
    MatTreeModule,
    MatMenuModule,
    MatSelectModule,
    MatPaginatorModule,
    MatExpansionModule,
    MatExpansionModule,
    MatSidenavModule,
    MatListModule,
    MatSortModule,
    MatSnackBarModule,
    FlexLayoutModule,
    MatCardModule,
    MatAutocompleteModule
  ],

 exports: [
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    ReactiveFormsModule,
    MatToolbarModule,
    MatTableModule,
    MatIconModule,
    MatSliderModule,
    MatDatepickerModule,
    MatNativeDateModule,
    FormsModule,
    MatDialogModule,
    MatProgressSpinnerModule,
    MatTreeModule,
    MatMenuModule,
    MatSelectModule,
    MatPaginatorModule,
    MatExpansionModule,
    MatExpansionModule,
    MatSidenavModule,
    MatListModule,
    MatSortModule,
    MatSnackBarModule,
    FlexLayoutModule,
    MatCardModule,
    MatAutocompleteModule
 ]
})

export class SharedModule { }

 