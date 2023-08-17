import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouterModule } from '@angular/router';
/**Material modules */
import {MatToolbarModule} from '@angular/material/toolbar';
import {MatSidenavModule} from '@angular/material/sidenav';
import {MatIconModule} from '@angular/material/icon';
import {MatListModule} from '@angular/material/list';
import {MatCardModule} from '@angular/material/card';
import {MatFormFieldModule} from '@angular/material/form-field';

/**Components */
import { SidenavComponent } from './sidenav/sidenav.component';
import { HomeComponent } from './sidenav/home/home.component';
import { MatTableModule } from '@angular/material/table';
import {MatButtonModule} from '@angular/material/button';
import { HttpClientModule } from '@angular/common/http'; /* component for us an api  */
/**default */
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { CostumersComponent } from './costumers/costumers.component';
import { ItemsComponent } from './items/items.component';
import { LoginComponent } from './login/login.component';
import { SharedModule } from './shared/shared.module';



@NgModule({
  declarations: [
    LoginComponent
  ],
  imports: [
    SharedModule,
    RouterModule.forRoot([
      { path: '', component: LoginComponent },
      { path: 'sidenav', component: SidenavComponent}]),
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }

