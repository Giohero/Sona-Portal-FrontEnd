import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import{MediaMatcher} from '@angular/cdk/layout';
import { MsalService } from '@azure/msal-angular';
import { Router } from '@angular/router';
import { DataSharingService } from '../service/data-sharing.service';

/**Changes import acivatedRoute*/
// import { ActivatedRoute } from '@angular/router';


@Component({
  selector: 'app-sidenav',
  templateUrl: './sidenav.component.html',
  styleUrls: ['./sidenav.component.css']
})
/**Add OnInit */
export class SidenavComponent {

  showToolbarOptions = false; // Agrega esta propiedad
  mobileQuery: MediaQueryList;

  // fillerNav = Array.from({length: 50}, (_, i) => `Nav Item ${i + 1}`);
  fillerNav=[
    {name: "Home", route:"Home", icon:"home"},
    {name: "Costumers", route:"Costumers", icon:"person"},
    {name: "Items", route:"Items", icon:"blur_linear"},
  ]

  fillerContent = Array.from(
    {length: 50},
    () =>
      `Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut
       labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco
       laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in
       voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat
       cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.`,
  );

  private _mobileQueryListener: () => void;
/**add private route inside constructor */
  constructor(changeDetectorRef: ChangeDetectorRef, media: MediaMatcher, private msalService: MsalService,private myRouter: Router, private dataSharing: DataSharingService) {
    this.mobileQuery = media.matchMedia('(max-width: 600px)');
    this._mobileQueryListener = () => changeDetectorRef.detectChanges();
    this.mobileQuery.addListener(this._mobileQueryListener);
  }
/**add changes conditional if  */
   shouldRun = true;


   logout() {
    //if is Active Directory or local
    if (this.msalService.instance.getActiveAccount() != null) 
    {
      this.msalService.logout();
      this.myRouter.navigate(['']);
    }
  }

  goToNewOrder()
  {
    this.dataSharing.setCustomerData(null);
    this.myRouter.navigate(['dashboard/order-customer/new-order']);
  }
}
