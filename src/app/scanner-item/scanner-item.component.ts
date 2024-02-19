import { ChangeDetectorRef, Component, Inject, OnInit } from '@angular/core';
import { IndexItemsService } from '../service/index-items.service';
import { Value } from '../models/items';
import { DataSharingService } from '../service/data-sharing.service';
import { catchError, mergeMap, retryWhen, throwError, timer } from 'rxjs';
import { ServiceService } from '../service/service.service';
import { SnackbarsComponent } from '../snackbars/snackbars.component';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { DocumentLines, Order } from '../models/car';
import { Pipe, PipeTransform } from '@angular/core';
import { MatInput } from '@angular/material/input';

@Component({
  selector: 'app-scanner-item',
  templateUrl: './scanner-item.component.html',
  styleUrls: ['./scanner-item.component.css']
})
export class ScannerItemComponent implements OnInit {
  Item!: Value;
  isOnline!: boolean;
  dialog: any;
  order: any;
  QuantityItem = 0;
  
  constructor (private cdr: ChangeDetectorRef, private itemsService: IndexItemsService, private dataSharing: DataSharingService, private orderService: ServiceService,
    public ScanneReference: MatDialogRef<ScannerItemComponent>,
    @Inject(MAT_DIALOG_DATA) public data: Value){
      console.log(data);
      this.Item = data;
      this.QuantityItem = Number(this.Item.U_InnerPackQty);
      console.log(this.Item);
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
    var ItemAdd = {ItemInfo : this.Item, Quantity : this.QuantityItem}
    this.ScanneReference.close(ItemAdd);
  }
  CancelInfo(){
    this.ScanneReference.close();
  }
}
