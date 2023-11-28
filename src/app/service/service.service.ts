import { Injectable } from '@angular/core';
// importar librerías necesarias
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { INResponse } from '../models/INResponse';
import { Observable, mergeMap } from 'rxjs';
import { BusinessPartner } from '../models/customer';
import { Order } from '../models/car';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
// code to use an api 
export class ServiceService {
  myappurlcosmos = "https://functionhandlecosmosdb.azurewebsites.net/"; 
  myappurlsap = "https://orderpadfunctions.azurewebsites.net/";
  myappurlcetos = "https://sonafunctions01.azurewebsites.net/";

  myapiurl = "api/"

  constructor(private myhttp: HttpClient, private auth: AuthService) { 
    //this.msalService.initialize();
  }


  // this.dataSharing.statusWifi$.subscribe((newWifi) => {
  //   console.log('llego el cambio a '+newWifi)
  //   this.isOnline = newWifi;
  // });

  private getHeaders(): Observable<HttpHeaders> {
    return new Observable<HttpHeaders>((observer) => {
      this.auth.tokenAzure$.subscribe(
        (token:string) => {
          console.log(this.auth.userAzure$)
          console.log(token)
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
  
  getRetrieveItemsC(): Observable<INResponse> {
    //console.log(this.auth.getAccessToken())
    return this.getHeaders().pipe(
      mergeMap((headers) => this.myhttp.get<INResponse>(
        this.myappurlcosmos + this.myapiurl + 'RetrieveClothesOrder',
        { headers }
      ))
    );
  }

  getOrders(): Observable<INResponse> {
    return this.myhttp.get<INResponse>(this.myappurlcetos + this.myapiurl + 'GetSalesOrder')
  }

  getOrderByDocNum(DocNum:string): Observable<INResponse> {
    return this.myhttp.post<INResponse>(this.myappurlcetos + this.myapiurl + 'GetSpecificSalesOrder', DocNum)
  }

  getCustomer(): Observable<INResponse> {
    return this.myhttp.get<INResponse>(this.myappurlcetos + this.myapiurl + 'SearchBusinessPartners')
  }

  getItems(): Observable<INResponse> {
    return this.myhttp.get<INResponse>(this.myappurlcetos + this.myapiurl + 'RetrieveItems')
  }

  getStates(): Observable<INResponse> {
    return this.myhttp.get<INResponse>(this.myappurlcetos + this.myapiurl + 'RetrieveSAPStates')
  }

  PostCustomer(Customer: any): Observable<INResponse> {
    return this.myhttp.post<INResponse>(this.myappurlcetos + this.myapiurl + 'CreateBusinessPartner', Customer)
  }

  UpdateCustomer(Customer:any): Observable<INResponse> {
    return this.myhttp.post<INResponse>(this.myappurlcetos + this.myapiurl + 'UpdateBusinessPartner', Customer)
  }

  GetTokenSignal(): Observable<{url:string, accesToken: string}> {
    return this.myhttp.get<{url:string, accesToken: string}>(this.myappurlcetos + this.myapiurl + 'negotiate')
  }

  PostOrder(Order: Order):Observable<INResponse> {
    return this.myhttp.post<INResponse>(this.myappurlcetos + this.myapiurl + 'CreateSalesOrder', Order)
  }

  UpdateOrder(Order: Order):Observable<INResponse> {
    return this.myhttp.post<INResponse>(this.myappurlcetos + this.myapiurl + 'UpdateHeaderOrder', Order)
  }

  DeleteAddresBP(Customer:any):Observable<INResponse> {
    return this.myhttp.post<INResponse>(this.myappurlcetos + this.myapiurl + 'DeleteAddressBP', Customer)
  }
  getOrderLogDataComparation(): Observable<INResponse> {
    return this.myhttp.get<INResponse>(this.myappurlcetos + this.myapiurl + 'OrderLogDataComparation')
  }
}