import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { MediaMatcher } from '@angular/cdk/layout';
import { MsalService } from '@azure/msal-angular';
import { Router } from '@angular/router';
import { DataSharingService } from '../service/data-sharing.service';
import { AfterViewInit, ElementRef } from '@angular/core';


@Component({
  selector: 'app-sidenav',
  templateUrl: './sidenav.component.html',
  styleUrls: ['./sidenav.component.css']
})
export class SidenavComponent implements OnInit {
  showToolbarOptions = false; 
  mobileQuery: MediaQueryList;
  isSidebarClosed: boolean = true;

  toggleSidebar() {
    this.isSidebarClosed = !this.isSidebarClosed;
  }

  expandSidebar() {
    this.isSidebarClosed = false;
  }

  collapseSidebar() {
    this.isSidebarClosed = true;
  }
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
    private msalService: MsalService,
    private myRouter: Router,
    private dataSharing: DataSharingService,
    private elementRef: ElementRef
  ) {
    this.mobileQuery = media.matchMedia('(max-width: 600px)');
    this._mobileQueryListener = () => this.changeDetectorRef.detectChanges();
    this.mobileQuery.addListener(this._mobileQueryListener);
  }

  ngOnInit() {
    // Código de inicialización aquí
  }

  shouldRun = true;

  logout() {
    //if is Active Directory or local
    if (this.msalService.instance.getActiveAccount() != null) {
      this.msalService.logout();
      this.myRouter.navigate(['']);
    }
  }

  goToNewOrder() {
    this.dataSharing.setCustomerData(null);
    this.myRouter.navigate(['dashboard/order-customer/new-order']);
  }
}
