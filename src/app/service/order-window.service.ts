import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class OrderWindowService {
  private windowsSubject = new BehaviorSubject<OrderWindowService[]>([]);
  windows$ = this.windowsSubject.asObservable();
  constructor() { }

  openWindow(window: OrderWindowService) {
    const windows = this.windowsSubject.value;
    this.windowsSubject.next([...windows, window]);
  }
}
