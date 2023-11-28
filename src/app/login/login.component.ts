import { Component, Inject, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { MSAL_GUARD_CONFIG, MsalBroadcastService, MsalGuardConfiguration, MsalService } from '@azure/msal-angular';
import { AuthenticationResult, InteractionStatus } from '@azure/msal-browser';
import { Router } from '@angular/router';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Observable, Subject, filter, from, takeUntil } from 'rxjs';
import { AuthService } from '../service/auth.service'; 


@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent implements OnInit, OnDestroy{

  isIframe = false;
  loginDisplay = false;
  private readonly _destroying$ = new Subject<void>();

  constructor(
    @Inject(MSAL_GUARD_CONFIG) private msalGuardConfig: MsalGuardConfiguration, 
  private broadcastService: MsalBroadcastService,
    private msalService: MsalService,
    private myRouter: Router,
    private authService: AuthService
  ) {
    //this.msalService.initialize();
  }
  
  
  ngOnInit() {
    this.isIframe = window !== window.parent && !window.opener;

    this.broadcastService.inProgress$
    .pipe(
      filter((status: InteractionStatus) => status === InteractionStatus.None),
      takeUntil(this._destroying$)
    )
    .subscribe(() => {
      this.authService.setLoginDisplay();
    })

    this.msalService.instance.handleRedirectPromise().then(
      res => {
        if(res != null && res.account != null)
        {
          this.msalService.instance.setActiveAccount(res.account)
        }
      }
    )
  }

  ngOnDestroy(): void {
    this._destroying$.next(undefined);
    this._destroying$.complete();
  }

  // isLoggedIn(): boolean {
  //   return this.authService.isLoggedIn();
  // }

  // login() {
  //   .subscribe((response: AuthenticationResult) => {
  //     this.msalService.instance.setActiveAccount(response.account);
  //     if (response.account) {
  //       console.log(this.msalService.instance.getActiveAccount());
  //       console.log(this.msalService.instance.getTokenCache())
        
  //     }
  //   });
  // }

  login() {
    // this.authService.login().subscribe((result) => {
    //   console.log('Inicio de sesión exitoso', result);
    //   this.authService.getAccount(result)
    //   this.authService.getToken(result.idToken!)
    //   this.authService.getUser(result.account.username!)
      
    //   //console.log(result.account.username!)
    //   //this.authService.isLoggedInUpdate(true);
    //   //this.authService.getUser()
    //   this.myRouter.navigate(['dashboard']);
    // });
    this.authService.login()
  }

  getAccessToken() {
    //this.authService.getToken();
    console.log(this.authService.tokenAzure$)
  }

  // logout() {
  //   this.authService.logout().subscribe(() => {
  //     this.authService.getToken('');
  //     console.log('Cierre de sesión exitoso');
  //   });
  // }

  // login() {
  //   this.authService.login().subscribe((result) => {
  //     console.log('Inicio de sesión exitoso', result);
  //     console.log(result)
  //     this.myRouter.navigate(['dashboard']);
  //   });
  // }

  // getAccessToken() {
  //   this.authService.getAccessToken().subscribe((token) => {
  //     console.log('Token de acceso', token);
  //   });
  // }

  // logout() {
  //   this.authService.logout().subscribe(() => {
  //     console.log('Cierre de sesión exitoso');
  //   });
  // }

  hide = true;
}
