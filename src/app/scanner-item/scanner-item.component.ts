import { ChangeDetectorRef, Component, Inject, OnInit } from '@angular/core';
import { IndexItemsService } from '../service/index-items.service';
import { Value as ItemValue} from '../models/items';
import { DataSharingService } from '../service/data-sharing.service';
import { catchError, mergeMap, retryWhen, throwError, timer } from 'rxjs';
import { ServiceService } from '../service/service.service';
import { SnackbarsComponent } from '../snackbars/snackbars.component';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { DocumentLines, Order } from '../models/car';
import { Pipe, PipeTransform } from '@angular/core';
import { MatInput } from '@angular/material/input';
import { OrderEditComponent } from '../order-edit/order-edit.component';
import { OrderManagementService } from '../service/order-management.service';

@Component({
  selector: 'app-scanner-item',
  templateUrl: './scanner-item.component.html',
  styleUrls: ['./scanner-item.component.css']
})
export class ScannerItemComponent implements OnInit {
  Item!: ItemValue;
  isOnline!: boolean;
  dialog: any;
  order: Order | undefined; 
  QuantityItem = 0;
  blockStatus = false;
  udfComments: string = '';
  inStock: number = 0;
  itemSelect : DocumentLines | undefined;
  

  constructor (private cdr: ChangeDetectorRef, private itemsService: IndexItemsService, private dataSharing: DataSharingService, private orderService: ServiceService, private orderManagementService : OrderManagementService,
    public ScannerReference: MatDialogRef<ScannerItemComponent>, 
    @Inject(MAT_DIALOG_DATA) public data: ItemValue){
      console.log(data);
      this.Item = data;
        this.QuantityItem = Number(this.Item.U_InnerPackQty);
        console.log(this.Item);
        
        this.Item = data;
        if (this.Item.ItemWarehouseInfoCollection && this.Item.ItemWarehouseInfoCollection.length > 0) {
        this.inStock = this.Item.ItemWarehouseInfoCollection[0].InStock;
      }
  }
  ngOnInit(): void {
    this.dataSharing.statusWifi$.subscribe((newWifi) => {
      //console.log('llego el cambio a '+newWifi)
      this.isOnline = newWifi;
    });
  }
  AddInner(){
    this.QuantityItem += Number(this.Item.U_InnerPackQty);
  }
  AddMaster(){
    this.QuantityItem += Number(this.Item.U_InnerPackQty);
  }

  UpdateScanner(){
    this.Item.LineNum=-1;
    var ItemAdd = {ItemInfo : this.Item, Quantity : this.QuantityItem, FreeText: this.udfComments}
    this.ScannerReference.close(ItemAdd);
  }
  CancelInfo(){
    this.ScannerReference.close();
  }
  // removeItem(index: number): void {
  //   if (this.order && this.order.DocumentLines && this.order.DocumentLines.length > index) {
  //     var itemDelete = this.order.DocumentLines[index];
  //     this.order.DocTotal -= itemDelete.LineTotal;
  //     this.order.DocumentLines.splice(index, 1);
  //     // this.updateOrder('Remove_LineNum_'+itemDelete.LineNum)
  //   }
  // }
  // DeleteScanner(): void {
  //   if (this.order && this.order.DocumentLines) {
  //     const index = this.order.DocumentLines.findIndex((line: any) => line === this.Item);
  //     if (index !== -1) {
  //       const itemDelete = this.order.DocumentLines[index];
  //       this.order.DocTotal -= itemDelete.LineTotal;
  //       this.order.DocumentLines.splice(index, 1);
  //       // Actualizar el pedido 
  //       // this.updateOrder('Remove_LineNum_' + itemDelete.LineNum)
  //     }
  //   }
  //   this.ScanneReference.close(); 
  // }
  DeleteScanner(): void {
    var ItemAdd = {ItemInfo : this.Item, Quantity : this.QuantityItem}
    this.ScannerReference.close(ItemAdd);
}

  Available(){
    return this.inStock;
  }
}
