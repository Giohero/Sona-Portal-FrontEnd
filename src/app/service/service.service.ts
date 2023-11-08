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
  myappurlcetos = "https://sonafunctions01.azurewebsites.net/";

  myapiurl = "api/"

  constructor(private myhttp: HttpClient) { }

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