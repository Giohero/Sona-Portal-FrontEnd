import { Injectable } from '@angular/core';
// importar librerías necesarias
import { HttpClient } from '@angular/common/http';
import { INResponse } from '../models/INResponse';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
// code to use an api 
export class ServiceService {
  myappurlcosmos = "https://functionhandlecosmosdb.azurewebsites.net/"; 

  myapiurl = "api/"

  constructor(private myhttp: HttpClient) { }
  getCustomer(): Observable<INResponse> {
    
    return this.myhttp.get<INResponse>(this.myappurlcosmos + this.myapiurl + 'RetrieveCustomer')
  }
}