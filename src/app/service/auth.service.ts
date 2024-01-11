import { HttpClient } from '@angular/common/http';
import { Inject, Injectable, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MSAL_GUARD_CONFIG, MsalBroadcastService, MsalGuardConfiguration, MsalService } from '@azure/msal-angular';
import { PublicClientApplication, AuthenticationResult, AccountInfo, ITokenCache, InteractionStatus, RedirectRequest } from '@azure/msal-browser';
import { BehaviorSubject, Observable, filter, from, map, of, takeUntil } from 'rxjs';
import { Profile } from '../models/loginAccount';
import { SignalRService } from './signalr.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService implements OnInit {

  //private msalService: PublicClientApplication;
  private tokenAzure: BehaviorSubject<string> = new BehaviorSubject<string>('');
  public tokenAzure$: Observable<string> = this.tokenAzure.asObservable();
  private userAzure: BehaviorSubject<string> = new BehaviorSubject<string>('');
  userAzure$: Observable<string> = this.userAzure.asObservable();
  private nameAzure: BehaviorSubject<string> = new BehaviorSubject<string>('');
  nameAzure$: Observable<string> = this.nameAzure.asObservable();
  private accountAzure: BehaviorSubject<any> = new BehaviorSubject<any>({});
  accountAzure$: Observable<any> = this.accountAzure.asObservable();

  loginDisplay = false;
  GRAPH_ENDPOINT = "https://graph.microsoft.com/v1.0/me";
  profile: Profile = {};

  constructor(@Inject(MSAL_GUARD_CONFIG) private msalGuardConfig: MsalGuardConfiguration, 
  private broadcastService: MsalBroadcastService, 
  private msalService: MsalService, 
  private myRouter: Router,
  private http: HttpClient) {
    //msalService = new PublicClientApplication(this.msalConfig);
    this.msalService.initialize();
  }

  ngOnInit() {
    
  }

  getToken(newToken:string): void {
    //console.log(newToken)
    this.tokenAzure.next(newToken);
  }

  getUser(newUser:string): void {
    //console.log(newUser)
    this.userAzure.next(newUser);
  }

  getName(newName:string): void {
    //console.log(newUser)
    this.nameAzure.next(newName);
  }

  getAccount(newAccount:any): void {
    //console.log(newAccount)
    this.userAzure.next(newAccount);
  }

  login() {
    // this.msalService.loginPopup()
    //   .subscribe({
    //     next: (result) => {
    //       console.log(result);
    //       this.setLoginDisplay();
    //       this.myRouter.navigate(['dashboard']);
    //     },
    //     error: (error) => console.log(error)
    //   });

    this.msalService.loginRedirect({
      scopes: ['openid', 'profile', 'user.read'],  
      redirectStartPage: '/dashboard',
      onRedirectNavigate(url) {
        url : '/login'
        return true;  
      },
      tokenBodyParameters: {
      },
    }).subscribe();


    console.log(this.msalService.instance.getAllAccounts())

    // if (this.msalGuardConfig.authRequest){
    //   this.msalService.loginRedirect({...this.msalGuardConfig.authRequest} as RedirectRequest)
    // } else {
      
    // }

    // this.msalService.instance.handleRedirectPromise().then(
    //   res => {
    //     if(res != null && res.account != null)
    //     {
    //       this.msalService.instance.setActiveAccount(res.account)
    //       console.log(res)
    //     }
    //   }
    // )
    
  }

  getProfile() {
    this.http.get(this.GRAPH_ENDPOINT)
      .subscribe((profile: Profile) => {
        //console.log(profile)
        this.profile = profile;
        this.getUser(profile!.mail!)
        this.getName(profile.givenName + ' ' + profile.surname)
        
        //console.log(this.msalService.instance.getAccountByLocalId(profile.id!))
        var account = this.msalService.instance.getAccountByLocalId(profile.id!)
        this.getToken(account!.idToken!)
        this.msalService.instance.setActiveAccount(account)
        this.getTokenMSAL()
        //this.signalRService.startConnection();
      });
  }

  getTokenMSAL(){
    this.msalService.acquireTokenSilent({ scopes: ["User.Read"] }).subscribe(
      response => {
      //console.log(response)

      this.getToken(response.idToken!)
      }
    )
  }

  setLoginDisplay() {
    this.loginDisplay = this.msalService.instance.getAllAccounts().length > 0;
  }

  logout() { // Add log out function here
    this.msalService.logoutRedirect({
      postLogoutRedirectUri: '/login'
    });
  }

  getActiveAccount(): AccountInfo | null {
    return this.msalService.instance.getActiveAccount() || null;
  }

  // getAccessToken(): Observable<string> {

  //   const activeAccount = this.msalService.instance.getActiveAccount();
  //   console.log(activeAccount)
  //   if (activeAccount != undefined) {
  //     return of(activeAccount!.idToken!); // Si idToken es undefined, devuelve una cadena vacía o maneja de otra manera
  //   } else {
  //     console.log(map((authResult: AuthenticationResult) => authResult.accessToken || ''))
  //     // Si no hay una cuenta activa, intenta obtener el token de forma silenciosa
  //     return from(this.msalService.acquireTokenSilent({ scopes: ['api://<58eb92b7-6661-4642-8409-420f059fb6d3>/RetrieveClothesOrder'] })).pipe(
  //       // Puedes manejar el token adquirido silenciosamente aquí
  //       map((authResult: AuthenticationResult) => authResult.accessToken || '')
  //     );

      
  //   }
  
  // }

  

  

  // initializeAuthState():void{
  //   //this.msalService.initialize();
  //   this.login().subscribe((result) => {
  //   console.log('Inicio de sesión exitoso', result);
  //   this.getAccount(result)
  //   this.getToken(result.idToken!)
  //   this.getUser(result.account.username!)
  //   //return this.msalService.instance.getActiveAccount()
  //   })
  // }

  // initializeAuthState() {
  //   this.msalService.handleRedirectCallback((authError, response) => {
  //     if (authError) {
  //       console.error('Error de autenticación:', authError.errorMessage);
  //     } else if (response) {
  //       // Lógica adicional si es necesario al manejar la respuesta de redirección
  //       this.verificarCuentaActiva();
  //     }
  //   });

  
  // login(): Observable<AuthenticationResult> {
  //  //from(this.msalInstance.loginPopup());
  //  return this.msalService.loginPopup()
  // }

  // logout(): Observable<void> {
  //   return from(this.msalService.logout());
  // }

  // getUser(): string {
  //   return this.msalService.instance.getActiveAccount()!.username;
  // }

  isLoggedIn(): boolean {
    console.log(this.msalService.instance.getActiveAccount())
    return this.msalService.instance.getActiveAccount() != null;
  }

  // isLoggedInUpdate(newLogIn:boolean): void {
  //   this.logAzure.next(newLogIn);
  // }

  // initializeAuthState(): void {
  //   // Recuperar el estado de la autenticación al inicializar el servicio
  //   const account = this.msalService.instance.getActiveAccount();
  //   if (account) {
  //     this.getToken(account.idToken!)
  //     this.getUser(account.username)
  //     //this.isLoggedInUpdate(true);
  //   }
  // }
  

}
