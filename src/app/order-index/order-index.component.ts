import { Component } from '@angular/core';
import { ServiceService } from '../service/service.service';
import { ActivatedRoute, Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { Order } from '../models/order';
import { SnackbarsComponent } from '../snackbars/snackbars.component';

@Component({
  selector: 'app-order-index',
  templateUrl: './order-index.component.html',
  styleUrls: ['./order-index.component.css']
})
export class OrderIndexComponent {

ListOrders: Order[] | undefined;
isLoading=true;
searchOrder: number | undefined;
  constructor(private orderService: ServiceService, private myRouter: Router, private route: ActivatedRoute, private dialog: MatDialog)
  {}

  ngOnInit(): void {

    this.orderService.getOrders().subscribe((retData) => {

      if (parseInt(retData.statusCode!) >= 200 && parseInt(retData.statusCode!) < 300) {

        this.ListOrders = JSON.parse(retData.response!);
        //console.log(this.ListOrders)
      } else {
        this.openSnackBar(retData.response!, "error", "Error", "red");
      }

      this.isLoading = false
    });
  }

  reload()
  {
    this.orderService.getOrders().subscribe((retData) => {

      if (parseInt(retData.statusCode!) >= 200 && parseInt(retData.statusCode!) < 300) {

        this.ListOrders = JSON.parse(retData.response!);
        //console.log(this.ListOrders)
      } else {
        this.openSnackBar(retData.response!, "error", "Error", "red");
      }

      this.isLoading = false
    });
  }

  searchingOrder(){
    if(this.searchOrder){
      var OrderFound = this.ListOrders?.find(x => x.DocNum == this.searchOrder )
      this.ListOrders = [];
      this.ListOrders.push(OrderFound!); 
    }
    else
    this.openSnackBar("You should put Document Order", 'error', 'Error', 'red');
  }

  selectMatCard(order:Order)
  {
    this.myRouter.navigate(['dashboard/order-edit'], {queryParams: {order: JSON.stringify(order)}});
  }

  openSnackBar(message: string, icon: string, type: string, color: string) {
    // this._snackBar.open(message, action,  {
    //   horizontalPosition: 'center',
    //   verticalPosition: 'top',
    //   duration: 5000,
    //   panelClass: ['custom-snackbar'], 
    // });

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
    }, 5000); 
  }
}
