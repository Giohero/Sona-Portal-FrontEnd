import { Injectable } from '@angular/core';
import { MsalService } from '@azure/msal-angular';
import { PublicClientApplication, AuthenticationResult, AccountInfo, ITokenCache } from '@azure/msal-browser';
import { BehaviorSubject, Observable, from, map, of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  //private msalService: PublicClientApplication;
  private tokenAzure: BehaviorSubject<string> = new BehaviorSubject<string>('');
  tokenAzure$: Observable<string> = this.tokenAzure.asObservable();
  private userAzure: BehaviorSubject<string> = new BehaviorSubject<string>('');
  userAzure$: Observable<string> = this.userAzure.asObservable();
  private accountAzure: BehaviorSubject<any> = new BehaviorSubject<any>({});
  accountAzure$: Observable<any> = this.accountAzure.asObservable();

  constructor(private msalService: MsalService,) {
    //msalService = new PublicClientApplication(this.msalConfig);
    this.msalService.initialize();
  }

  getToken(newToken:string): void {
    this.tokenAzure.next(newToken);
  }

  getUser(newUser:string): void {
    console.log(newUser)
    this.userAzure.next(newUser);
  }

  getAccount(newAccount:any): void {
    console.log(newAccount)
    this.userAzure.next(newAccount);
  }

  login(): Observable<AuthenticationResult> {
    return from(this.msalService.loginPopup());
  }

  logout(): Observable<void> {
    return from(this.msalService.logout());
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
