import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class GeolocationService {

  private Tradeshow: BehaviorSubject<string> = new BehaviorSubject<string>("");
  tradeshow$: Observable<string> = this.Tradeshow.asObservable();
  
  constructor(private http: HttpClient) { }
  getLocation(): Promise<GeolocationPosition> {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject('Geolocation is not supported by your browser.');
      } else {
        navigator.geolocation.getCurrentPosition(resolve, reject);
      }
    });
  }

  getAddress(latitude: number, longitude: number) {
    const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`;
    return this.http.get<any>(url);
  }

  getTradeshowLocation(newTradeshowLocation:string): void {
    //console.log(newToken)
    //console.log(newTradeshowLocation)
    this.Tradeshow.next(newTradeshowLocation);
  }

}
