import { HostListener, NgModule, isDevMode } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FlexLayoutModule } from '@angular/flex-layout';
import { FormsModule } from '@angular/forms';

/**Material modules */
import {MatToolbarModule} from '@angular/material/toolbar';
import {MatSidenavModule} from '@angular/material/sidenav';
import {MatIconModule} from '@angular/material/icon';
import {MatListModule} from '@angular/material/list';
import { MatRadioModule } from '@angular/material/radio';
import {MatExpansionModule} from '@angular/material/expansion';
import { MatPaginatorModule } from '@angular/material/paginator';
import {MatTabsModule} from '@angular/material/tabs';

/**Components */
import { SidenavComponent } from './sidenav/sidenav.component';
import { HomeComponent } from './home/home.component';
import { MatTableModule } from '@angular/material/table';
import {MatButtonModule} from '@angular/material/button';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http'; /* component for us an api  */
import { SignalRService } from './service/signalr.service';

/**default */
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { CostumersComponent } from './costumers/costumers.component';
import { ItemsComponent } from './items/items.component';
import { SharedModule } from './shared/shared.module';
import { LoginComponent } from './login/login.component';
import { RouterModule } from '@angular/router';
import { DashboardComponent } from './dashboard/dashboard.component';

// MSAL imports
import { MsalInterceptor, MsalModule, MsalRedirectComponent } from '@azure/msal-angular';
import { BrowserUtils, InteractionType, PublicClientApplication } from '@azure/msal-browser';
import { MsalGuard } from '@azure/msal-angular';
import { OrdersComponent } from './orders/orders.component';
import { FilterPipe } from './service/filter.pipe';
import { FilterPipeCustomer } from './service/filterCustomers.pipe';
import { DialogAddressComponent } from './dialog-address/dialog-address.component';
import { DialogAddcustomComponent } from './dialog-addcustom/dialog-addcustom.component';
import { OrderReviewComponent } from './order-review/order-review.component';
import { SnackbarsComponent } from './snackbars/snackbars.component';
import { OrderIndexComponent } from './order-index/order-index.component';
import { OrderEditComponent } from './order-edit/order-edit.component';
import { ServiceWorkerModule } from '@angular/service-worker';
import { DialogRechargeComponent } from './dialog-recharge/dialog-recharge.component';
import { ScannerItemComponent } from './scanner-item/scanner-item.component';


const isIE =
  window.navigator.userAgent.indexOf("MSIE ") > -1 ||
  window.navigator.userAgent.indexOf("Trident/") > -1;

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    ScannerItemComponent
    //CartComponent
    // FilterPipe
    // SidenavComponent,
    // HomeComponent,
    // CostumersComponent,
    // ItemsComponent
  ],
  imports: [
    BrowserModule,
    FlexLayoutModule,
    AppRoutingModule,
    MatSidenavModule,
    MatToolbarModule,
    BrowserAnimationsModule,
    MatIconModule,
    MatListModule,
    MatButtonModule,
    MatTableModule,
    HttpClientModule,
    SharedModule,
    MatExpansionModule,
    MatPaginatorModule,
    MatTabsModule,
    FormsModule,
    RouterModule.forRoot([
      { path: '', component: LoginComponent },
      { path: 'login', component: LoginComponent },
      { path: 'dashboard', component: DashboardComponent, canActivate:[MsalGuard]}
    ],
    {
       // Don't perform initial navigation in iframes or popups
       initialNavigation:
       !BrowserUtils.isInIframe() && !BrowserUtils.isInPopup()
         ? "enabledNonBlocking"
         : "disabled", // Set to enabledBlocking to use Angular Universal
    }),
    // MSAL configuration
    MsalModule.forRoot(new PublicClientApplication({
      auth: {
        //clientId: '58eb92b7-6661-4642-8409-420f059fb6d3',
        clientId: 'ce0b913e-f335-43eb-ae81-f5556733590b',
        authority: 'https://login.microsoftonline.com/26e6cc6b-2157-4879-a8f3-f2fc5a6a1bfd',
        redirectUri: 'http://localhost:4200/dashboard'
        // redirectUri: 'https://sonaportal.azurewebsites.net/dashboard'
        
        
      },
      cache: {
        cacheLocation: "localStorage",
        storeAuthStateInCookie: isIE,
      }      
    }), {
      interactionType: InteractionType.Redirect, // MSAL Guard Configuration
        authRequest: {
          scopes: ["user.read"],
        },
    }, {
      protectedResourceMap: new Map([
        ['https://graph.microsoft.com/v1.0/me', ['user.read']]
      ]),
      interactionType: InteractionType.Redirect 
    }),
    ServiceWorkerModule.register('ngsw-worker.js', {
      enabled: !isDevMode(),
      // Register the ServiceWorker as soon as the application is stable
      // or after 30 seconds (whichever comes first).
      registrationStrategy: 'registerWhenStable:30000'
    })
  ],
  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useClass: MsalInterceptor,
      multi: true,
    },
    MsalGuard,SignalRService
  ],
  bootstrap: [AppComponent, MsalRedirectComponent],
  
})
export class AppModule { }