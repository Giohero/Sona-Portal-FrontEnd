import { ChangeDetectorRef, Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { DataSharingService } from '../service/data-sharing.service';
import { indexOrder } from '../models/indexDB';
import { IndexDbService } from '../service/index-db.service';

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

  constructor(
    public dialogRef: MatDialogRef<DialogRechargeComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private dataSharing : DataSharingService,
    private cdr:ChangeDetectorRef,
    private indexDB: IndexDbService
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
      }
    })
  }

  async searchIndex(index:number){
    const indexFound = await this.indexDB.getOrderLogByIdIndex(index);
    console.log(indexFound)
    if(indexFound != null)
      console.log(indexFound)
    else
      console.log('Not Found')

  }

  
}
