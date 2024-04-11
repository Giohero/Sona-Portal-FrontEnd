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
  AddItem = false;
  action : 'add' | 'delete';
  
  constructor (private cdr: ChangeDetectorRef, private itemsService: IndexItemsService, private dataSharing: DataSharingService, private orderService: ServiceService, 
    public ScannerReference: MatDialogRef<ScannerItemComponent>, 
    @Inject(MAT_DIALOG_DATA) public data: any){
      console.log(data);
      this.Item = data.Item;
      console.log(this.Item);
      this.udfComments =data.FreeText;
      this.action = data.Action;
      if (this.Item.ItemWarehouseInfoCollection && this.Item.ItemWarehouseInfoCollection.length > 0) {
        this.inStock = this.Item.ItemWarehouseInfoCollection[0].InStock;
      }

      if('LineNum' in data.Item)
      {
        this.QuantityItem = Number(data.Quantity);
        this.AddItem = false
      }
      else 
      {
        this.QuantityItem = Number(data.Item.U_InnerPackQty);
        this.AddItem = true;
      }
  }
  ngOnInit(): void {
    this.dataSharing.statusWifi$.subscribe((newWifi) => {
      //console.log('llego el cambio a '+newWifi)
      this.isOnline = newWifi;
    });
  }

  AddInner(){
    if (this.QuantityItem < 0) {
      this.QuantityItem = 0;
    }
    this.QuantityItem = Number(this.QuantityItem) + Number(this.Item.U_InnerPackQty);
  }

  AddMaster(){
    if (this.QuantityItem < 0) {
      this.QuantityItem = 0;
    }
    this.QuantityItem *= Number(this.Item.U_InnerPackQty);
  }
  
  AddScanner(){
    this.Item.LineNum=-1;
    console.log(this.QuantityItem)   
    var ItemAdd = {ItemInfo : this.Item, Quantity : this.QuantityItem, FreeText: this.udfComments}
    this.ScannerReference.close(ItemAdd);
  }

  UpdateScanner(){
    this.Item.LineNum=-1;
    console.log(this.QuantityItem)   
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
    var itemDelete = {ItemInfo : this.Item, Quantity : this.QuantityItem}
    this.ScannerReference.close(itemDelete);
  }

  Available(){
    return this.inStock;
  }
}
