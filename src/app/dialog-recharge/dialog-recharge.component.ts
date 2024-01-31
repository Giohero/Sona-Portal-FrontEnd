import { ChangeDetectorRef, Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { DataSharingService } from '../service/data-sharing.service';
import { indexOrder } from '../models/indexDB';
import { IndexDbService } from '../service/index-db.service';
import { tick } from '@angular/core/testing';
import {MatBadgeModule} from '@angular/material/badge';
import { SnackbarsComponent } from '../snackbars/snackbars.component';
import { Router } from '@angular/router';

@Component({
  selector: 'app-dialog-recharge',
  templateUrl: './dialog-recharge.component.html',
  styleUrls: ['./dialog-recharge.component.css']
})
export class DialogRechargeComponent {

  indexList : indexOrder[] =[]
  private indexOrder?: indexOrder ;
  displayedColumns: string[] = ['id'];
  spinnerShow = true;
  expandWindow = true;
  showPopUp = false;
  Notifications = 0;

  togglePopUp(): void{
    this.showPopUp = !this.showPopUp;
  }

  constructor(
    public dialogRef: MatDialogRef<DialogRechargeComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private dataSharing : DataSharingService,
    private cdr:ChangeDetectorRef,
    private indexDB: IndexDbService,
    private dialog:MatDialog,
    private myRouter: Router
    ) {}

  onNoClick(): void {
    this.dialogRef.close();
  }

  onMinClick(): void {
    this.expandWindow = false;

    // const element = document.getElementById('dialog');
    // if (element) {
    //   element.classList.remove('custom-dialog');
    //   element.classList.add('customMin-dialog');
    // }
      
  }

  onMaxClick(): void {
    this.expandWindow = true;

    // const element = document.getElementById('dialog');
    // if (element) {
    //   element.classList.remove('customMin-dialog');
    //   element.classList.add('custom-dialog');
    // }
  }

  ngOnDestroy() {
    //this.dataSubscription.unsubscribe();
  }

  ngOnInit() {

    this.dataSharing.updateOrder$.subscribe((data:indexOrder) => {
      this.indexOrder = data;
      console.log(data)

      const OrderIndexFound =  this.indexList.find(x => x.id == data.id)
      if(OrderIndexFound == undefined)
      {
        data.message = [];
        this.indexList.push(data);
        this.Notifications++;
      }
      this.cdr.detectChanges()
      //console.log(this.indexList)
    });

    this.dataSharing.updateRecharge$.subscribe((data:any) =>{
      console.log(data)

      if(data != undefined)
      {
        const OrderIndexFound =  this.indexList.find(x => x.id == data.idIndex)
        if(OrderIndexFound != undefined)
          OrderIndexFound.message?.push(data.message);
        this.Notifications++;
      }
    })
  }

  async searchIndex(index:number, indexComplete:indexOrder ){
    const indexFound = await this.indexDB.getOrderLogByIdIndex(index);
    //console.log(indexFound)
    if(indexFound != null)
    {
      console.log(indexComplete)
      if(indexFound.DocNum != undefined && indexFound.DocNum != 0 && !Number.isNaN(indexFound.DocNum))
      {
        this.dataSharing.setOrderIndexDB(undefined)
        this.dataSharing.setOrderCReview(indexComplete.orderSAP)
      }
      else
      {
        this.dataSharing.setOrderCReview(undefined)
        this.dataSharing.setOrderIndexDB(indexFound)
      }
      this.myRouter.navigateByUrl('/', { skipLocationChange: true }).then(() => {
        this.myRouter.navigate(['dashboard/order-edit']);
      });
      //this.myRouter.navigate(['dashboard/order-edit']);
    }
    else
      this.openSnackBar("Not found, try again.", "warning", "Warning", "darkorange");

  }

  openSnackBar(message: string, icon: string, type: string, color: string) {
    const dialogRef = this.dialog.open(SnackbarsComponent, {
      hasBackdrop: false,
      width: '300px',
      position: {
        top: '10px',   
        right: '20px',
      },
      data: { 
        message: message,
        icon: icon,
        type: type,
        color: color
      },
    })
    setTimeout(() => {
      dialogRef.close();
    })
  }

  
}