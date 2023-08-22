import { Component } from '@angular/core';
import { MsalService } from '@azure/msal-angular';
import { AuthenticationResult } from '@azure/msal-browser';
import { Router } from '@angular/router';
import { FormControl, FormGroup, Validators } from '@angular/forms';


@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {

  constructor(
    private msalService: MsalService,
    private myRouter: Router
    
  ) {
    this.msalService.initialize();
  }
  

  isLoggedIn(): boolean {
    return this.msalService.instance.getActiveAccount() != null;
  }
  login() {
    this.msalService.loginPopup().subscribe((response: AuthenticationResult) => {
      this.msalService.instance.setActiveAccount(response.account);
      if (response.account) {
        console.log(this.msalService.instance.getActiveAccount());
        this.myRouter.navigate(['dashboard']);
      }
    });
  }


  hide = true;
}
