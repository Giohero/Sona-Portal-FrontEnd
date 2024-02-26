import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class OrderManagementService {
  private order: any;
  private itemDeletedSource = new Subject<number>();

  itemDeleted$ = this.itemDeletedSource.asObservable();

  constructor() { }

  setOrder(order: any){
    this.order = order;
  }

  deleteItem(index: number): void {
    console.log(`Intentando eliminar el ítem en el índice ${index}`);
    if (this.order && this.order.DocumentLines && this.order.DocumentLines.length > index) {
      var itemDelete = this.order.DocumentLines[index];
      this.order.DocTotal -= itemDelete.LineTotal;
      this.order.DocumentLines.splice(index, 1);
      console.log('se elimino el item', index);
      this.itemDeletedSource.next(index);
    }
  }
  
}
