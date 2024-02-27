import { Injectable, Type } from '@angular/core';//Type para que reconozca el tipo
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class OrderWindowService {
  private componentRef: Type<any> | undefined;

  private windowsSubject = new BehaviorSubject<any[]>([]); // CREO QUE HAY Q CAambiar el tipo a any[]
  windows$ = this.windowsSubject.asObservable();

  constructor() { }//configurar los metodos para gestionar la info
  setComponent(component: Type<any>) {
    this.componentRef = component; 
  }

  getComponent(): Type<any> {
    return this.componentRef!; 
  }
  openWindow(window: any) { // Aqui tamb cambiar a any 
    const windows = this.windowsSubject.value;
    this.windowsSubject.next([...windows, window]);
  }
}