import { Injectable } from '@angular/core';
// importar librerías necesarias
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { INResponse } from '../models/INResponse';
import { Observable, mergeMap } from 'rxjs';
import { BusinessPartner } from '../models/customer';
import { Order } from '../models/car';
import { AuthService } from './auth.service';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
// code to use an api 
export class ServiceService {
  myappurlcetos = "https://functionhandlecosmosdb.azurewebsites.net/"; 
  myappurlsap = "https://orderpadfunctions.azurewebsites.net/";
   myappurlcosmos = "https://sonafunctions01.azurewebsites.net/";

  myapiurl = "api/"

  constructor(private myhttp: HttpClient, private auth: AuthService, private router: Router) { 
    //this.msalService.initialize();
  }


  // this.dataSharing.statusWifi$.subscribe((newWifi) => {
  //   console.log('llego el cambio a '+newWifi)
  //   this.isOnline = newWifi;
  // });\

  reloadComponent(): void {
    // Navegar a la misma ruta recargará el componente
    const currentUrl = this.router.url;
    this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
      this.router.navigate([currentUrl]);
    });
  }

  private getHeaders(): Observable<HttpHeaders> {
    return new Observable<HttpHeaders>((observer) => {
      this.auth.tokenAzure$.subscribe(
        (token:string) => {
          //console.log(this.auth.userAzure$)
          //console.log(token)
          if (token) {
            const headers = new HttpHeaders({
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`
            });
            //console.log(headers)
            observer.next(headers);
          } else {
            observer.next(new HttpHeaders());
          }
        },
        (error) => {
          observer.error(error);
        }
      );
    });
  }

  getOrders(): Observable<INResponse> {
    //console.log(this.auth.getAccessToken())
    return this.getHeaders().pipe(
      mergeMap((headers) => this.myhttp.get<INResponse>(
        this.myappurlcosmos + this.myapiurl + 'GetSalesOrder',
        { headers }
      ))
    );
  }

  GetOldSalesOrders(Order: string): Observable<INResponse> {
    //console.log(this.auth.getAccessToken())
    return this.getHeaders().pipe(
      mergeMap((headers) => this.myhttp.get<INResponse>(
        this.myappurlcosmos + this.myapiurl + 'GetOldSalesOrders?DocNum=' + Order,
        { headers }
      ))
    );
  }

  getOrderByDocNum(DocNum:string): Observable<INResponse> {
    //console.log(this.auth.getAccessToken())
    return this.getHeaders().pipe(
      mergeMap((headers) => this.myhttp.post<INResponse>(
        this.myappurlcosmos + this.myapiurl + 'GetSpecificSalesOrder',
        DocNum,
        { headers }
      ))
    );
  }

  getCustomer(): Observable<INResponse> {
    //console.log(this.auth.getAccessToken())
    return this.getHeaders().pipe(
      mergeMap((headers) => this.myhttp.get<INResponse>(
        this.myappurlcosmos + this.myapiurl + 'SearchBusinessPartners',
        { headers }
      ))
    );
  }

  getItems(): Observable<INResponse> {
    //console.log(this.auth.getAccessToken())
    return this.getHeaders().pipe(
      mergeMap((headers) => this.myhttp.get<INResponse>(
        this.myappurlcosmos + this.myapiurl + 'RetrieveItems',
        { headers }
      ))
    );
  }

  getStates(): Observable<INResponse> {
    //console.log(this.auth.getAccessToken())
    return this.getHeaders().pipe(
      mergeMap((headers) => this.myhttp.get<INResponse>(
        this.myappurlcosmos + this.myapiurl + 'RetrieveSAPStates',
        { headers }
      ))
    );
  }

  PostCustomer(Customer: any): Observable<INResponse> {
    //console.log(this.auth.getAccessToken())
    return this.getHeaders().pipe(
      mergeMap((headers) => this.myhttp.post<INResponse>(
        this.myappurlcosmos + this.myapiurl + 'CreateBusinessPartner',
        Customer,
        { headers }
      ))
    );
  }

  UpdateCustomer(Customer: any): Observable<INResponse> {
    //console.log(this.auth.getAccessToken())
    return this.getHeaders().pipe(
      mergeMap((headers) => this.myhttp.post<INResponse>(
        this.myappurlcosmos + this.myapiurl + 'UpdateBusinessPartner',
        Customer,
        { headers }
      ))
    );
  }

  PostOrder(Order: Order): Observable<INResponse> {
    //console.log(this.auth.getAccessToken())
    return this.getHeaders().pipe(
      mergeMap((headers) => this.myhttp.post<INResponse>(
        this.myappurlcosmos + this.myapiurl + 'CreateSalesOrder',
        Order,
        { headers }
      ))
    );
  }

  UpdateOrder(Order: Order): Observable<INResponse> {
    //console.log(this.auth.getAccessToken())
    return this.getHeaders().pipe(
      mergeMap((headers) => this.myhttp.post<INResponse>(
        this.myappurlcosmos + this.myapiurl + 'UpdateHeaderOrder',
        Order,
        { headers }
      ))
    );
  }

  DeleteAddresBP(Customer: any): Observable<INResponse> {
    //console.log(this.auth.getAccessToken())
    return this.getHeaders().pipe(
      mergeMap((headers) => this.myhttp.post<INResponse>(
        this.myappurlcosmos + this.myapiurl + 'UpdateBPAddress',
        Customer,
        { headers }
      ))
    );
  }

  GetTokenSignal(): Observable<{url:string, accessToken: string}> {
    //console.log(this.auth.getAccessToken())
    return this.getHeaders().pipe(
      mergeMap((headers) => this.myhttp.get<{url:string, accessToken: string}>(
        this.myappurlcosmos + this.myapiurl + 'negotiate',
        { headers }
      ))
    );
  }

  getOrderLogDataComparation(): Observable<INResponse> {
    //console.log(this.auth.getAccessToken())
    return this.getHeaders().pipe(
      mergeMap((headers) => this.myhttp.get<INResponse>(
        this.myappurlcosmos + this.myapiurl + 'OrderLogDataComparation',
        { headers }
      ))
    );
  }

  // sendSignal(): Observable<any> {
  //   return this.myhttp.post<any>(`${this.myappurlcetos}/api/SignalRTest`, {});
  // }

  sendSignalR(user: string, type: string, message: string): Observable<any> {
    //console.log(this.auth.getAccessToken())
    const body = { user, type, message };
    return this.getHeaders().pipe(
      mergeMap((headers) => this.myhttp.post<any>(
        `${this.myappurlcosmos}api/SignalRTest`,
        body,
        { headers }
      ))
    );
  }

  sendUserSignalR(email:string, name:string, docnum:string | number, docentry:string | number): Observable<any> {
    //console.log(this.auth.getAccessToken())
    const body = {email, name, docnum, docentry};
    return this.getHeaders().pipe(
      mergeMap((headers) => this.myhttp.post<any>(
        `${this.myappurlcosmos}api/SignalRUsers`,
        body,
        { headers }
      ))
    );
  }

  removeUserSignalR(email:string, name:string, docnum:string | number, docentry:string | number): Observable<any> {
    //console.log(this.auth.getAccessToken())
    const body = {email, name, docnum, docentry};
    return this.getHeaders().pipe(
      mergeMap((headers) => this.myhttp.post<any>(
        `${this.myappurlcosmos}api/SignalRRemoveUser`,
        body,
        { headers }
      ))
    );
  }
  GetSpecificItem(BarCode:string){
    return this.getHeaders().pipe(
      mergeMap((headers) => this.myhttp.get<INResponse>(
        this.myappurlcosmos + this.myapiurl + 'GetSpecificItem',
        { headers }
      ))
    );
  }
}