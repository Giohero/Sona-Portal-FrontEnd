import { Injectable } from '@angular/core';
// importar librerías necesarias
import { HttpClient } from '@angular/common/http';
import { INResponse } from '../models/INResponse';
import { Observable } from 'rxjs';
import { BusinessPartner } from '../models/customer';
import { Order } from '../models/car';

@Injectable({
  providedIn: 'root'
})
// code to use an api 
export class ServiceService {
  myappurlcosmos = "https://functionhandlecosmosdb.azurewebsites.net/"; 
  myappurlsap = "https://orderpadfunctions.azurewebsites.net/";

  myapiurl = "api/"

  constructor(private myhttp: HttpClient) { }
  getCustomer(): Observable<INResponse> {
    
    return this.myhttp.get<INResponse>(this.myappurlsap + this.myapiurl + 'SearchBusinessPartners')
  }
  getItems(): Observable<INResponse> {

    return this.myhttp.get<INResponse>(this.myappurlsap + this.myapiurl + 'RetrieveItems')
  }
  getStates(): Observable<INResponse> {

    return this.myhttp.get<INResponse>(this.myappurlsap + this.myapiurl + 'RetrieveSAPStates')
  }

  PostCustomer(Customer: any): Observable<INResponse> {
    return this.myhttp.post<INResponse>(this.myappurlsap + this.myapiurl + 'CreateBusinessPartner', Customer)
  }

  UpdateCustomer(Customer:any): Observable<INResponse> {
    return this.myhttp.post<INResponse>(this.myappurlsap + this.myapiurl + 'UpdateBusinessPartner', Customer)
  }

  PostOrder(Order: Order):Observable<INResponse> {
    return this.myhttp.post<INResponse>(this.myappurlsap + this.myapiurl + 'CreateSalesOrder', Order)
  }
}