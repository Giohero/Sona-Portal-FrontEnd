import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { MediaMatcher } from '@angular/cdk/layout';
import { MsalService } from '@azure/msal-angular';
import { AuthService } from '../service/auth.service';
import { Router } from '@angular/router';
import { DataSharingService } from '../service/data-sharing.service';
import { AfterViewInit, ElementRef } from '@angular/core';
import { Renderer2 } from '@angular/core';
import { AccountInfo } from '@azure/msal-browser';
import { Observable } from 'rxjs';
import { SignalRService } from '../service/signalr.service';
import { DialogRechargeComponent } from '../dialog-recharge/dialog-recharge.component';
import { MatDialog } from '@angular/material/dialog';



@Component({
  selector: 'app-sidenav',
  templateUrl: './sidenav.component.html',
  styleUrls: ['./sidenav.component.css']
})
export class SidenavComponent implements OnInit {
  showToolbarOptions = false; 
  mobileQuery: MediaQueryList;
  isSidebarClosed: boolean = true;
  currentUserEmail: string | null = null;
  usernameAzure = '';
  nameAzure = '';
  // isSubMenuOpen: boolean = false;
  // showSubMenu: boolean = false;
  // isOrdersMenuExpanded: boolean = false;
  // isSidebarExpanded: boolean = false;
  // isDropdownOpen = false;

  // toggleSidebar() {
  //   this.isSidebarExpanded = !this.isSidebarExpanded;
  // }

  expandSidebar() {
    this.isSidebarClosed = false;
  }

  collapseSidebar() {
    this.isSidebarClosed = true;
  }
  toggleSubMenu() {
    // this.showSubMenu = !this.showSubMenu;
    // event.preventDefault();
  }
  // toggleOrdersMenu(): void {
  //   this.isOrdersMenuExpanded = !this.isOrdersMenuExpanded;
  // }
  
  fillerNav = [
    { name: "Home", route: "Home", icon: "home" },
    { name: "Costumers", route: "Costumers", icon: "person" },
    { name: "Items", route: "Items", icon: "blur_linear" },
  ];

  fillerContent = Array.from(
    { length: 50 },
    () =>
      `Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut
       labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco
       laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in
       voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat
       cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.`,
  );

  private _mobileQueryListener: () => void;

  constructor(
    private changeDetectorRef: ChangeDetectorRef,
    private media: MediaMatcher,
    private msalService: AuthService,
    private myRouter: Router,
    private dataSharing: DataSharingService,
    private elementRef: ElementRef,
    private renderer: Renderer2,
    private auth: AuthService,
    private signalr: SignalRService,
    private dialog: MatDialog,
  ) {
    this.mobileQuery = media.matchMedia('(max-width: 600px)');
    this._mobileQueryListener = () => this.changeDetectorRef.detectChanges();
    this.mobileQuery.addListener(this._mobileQueryListener);
  }

  ngOnInit() {
    this.auth.userAzure$.subscribe(
      (username: string) => {
        this.usernameAzure = username
      },
      (error: any) => {
        this.usernameAzure = ''
      }
    );

    this.auth.nameAzure$.subscribe(
      (username: string) => {
        this.nameAzure = username
      },
      (error: any) => {
        this.nameAzure = ''
      }
    );

    this.loadCurrentUserEmail();
    //console.log(this.msalService.accountAzure$)
  }

  shouldRun = true;

  loadCurrentUserEmail() {
    // const activeAccount: AccountInfo | null = this.msalService.getActiveAccount();
    // if (activeAccount) {
    //   this.currentUserEmail = activeAccount.username;
    // }

    this.msalService.userAzure$.subscribe(
      (username: string) => {
        this.currentUserEmail = username
      },
      (error: any) => {
        this.currentUserEmail = ''
      }
    );
  }
  
  // logout() {
  //   //if is Active Directory or local
  //   if (this.msalService.getActiveAccount() != null) {
  //     this.msalService.logout();
  //     this.myRouter.navigate(['']);
  //   }
  // }

  logout() {
    this.signalr.removeSignalRMessageUser(this.usernameAzure, this.nameAzure, '0', '0')
    this.msalService.logout()
  }

  goToDashboard() {
    this.dataSharing.setCustomerData(null);
    this.myRouter.navigate(['/dashboard']);
  }

  goToNewOrder() {
    this.dataSharing.setCustomerData(null);
    this.myRouter.navigate(['dashboard/order-customer/new-order']);
  }

  goToCustomers() {
    this.dataSharing.setCustomerData(null);
    this.myRouter.navigate(['dashboard/costumers']);
  }

  goToItems() {
    this.dataSharing.setCustomerData(null);
    this.myRouter.navigate(['dashboard/items']);
  }
  toggleSidebar() {
    this.isSidebarClosed = !this.isSidebarClosed;
  }
}
