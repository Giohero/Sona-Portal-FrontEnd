import { Component } from '@angular/core';
import { ServiceService } from '../service/service.service';
import { BusinessPartner } from '../models/customer';
import { MatDialog } from '@angular/material/dialog';
import { DialogAddressComponent } from '../dialog-address/dialog-address.component';
import { ActivatedRoute, Router } from '@angular/router';
import { DocumentLines, Order } from '../models/car';
import { MatSnackBar } from '@angular/material/snack-bar';
import { FormControl } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { SnackbarsComponent } from '../snackbars/snackbars.component';
import { DataSharingService } from '../service/data-sharing.service';
import { data } from 'jquery';
import { IndexDbService } from '../service/index-db.service';



@Component({
  selector: 'app-order-review',
  templateUrl: './order-review.component.html',
  styleUrls: ['./order-review.component.css'],
  providers: [DatePipe]
})
export class OrderReviewComponent {

  selectedOption: string = ''; // Asigna un valor inicial aquí
  ListCustomers!: BusinessPartner[] ;
  searchText = '';
  idcustomer = '';
  cardcode = '';
  ActiveAddButton= true;
  CurrentSellsItem?: BusinessPartner | undefined;
  billingAddress?: string | undefined;
  notes?: string | undefined;
  shippingAddress?: string | undefined;
  phone1?: string | undefined;
  email?: string | undefined;
  shippingType?: string | undefined;
  taxId?: string | undefined;
  inputSearchCutomer = false;
  showAddButton = true;
  OrderReview: Order | undefined;
  OrderReviewOld: Order | undefined;
  OrderIndexDB: any;
  CustomerData: any;
  option!:number;
  minDate?: Date;
  maxDate?: Date;
  tax!: FormControl;
  delivery!: FormControl;
  sumLines?: number;

  constructor(private orderService: ServiceService, private myRouter: Router, private dialog: MatDialog,  private route: ActivatedRoute, private _snackBar: MatSnackBar, private pipe: DatePipe, private dataSharing:DataSharingService, private indexDB:IndexDbService) {
    this.OrderReview = dataSharing.getOrderReview();
    this.CustomerData = dataSharing.getCustomerData();
    this.OrderIndexDB = dataSharing.getOrderIndexDB();
    
    if(this.OrderReview != undefined)
    {
      this.OrderReviewOld = JSON.parse(JSON.stringify(this.OrderReview));
      this.fillDataOrder()
    }
    // else if(this.OrderReview === undefined)
    //   this.getDataIndex();


    this.selectedOption = 'option1'; 
    const currentYear = new Date();
    this.minDate = new Date(currentYear);
    this.tax = new FormControl({value: new Date(), disabled: true});
    this.delivery = new FormControl(new Date());
  }

  ngOnInit(): void {

    
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
    }, 5000); 
  }

  typeAddress(type:string)
  {
    if(type === 'bo_ShipTo')
      return 'SHIP TO'
    else if(type === 'bo_BillTo')
      return 'BILL TO'
    else
     return type;
  }

  fillDataOrder()
  {
    this.sumLines = this.OrderReview!.DocumentLines!.reduce((acumulador:number, elemento:any) => acumulador + elemento.LineTotal, 0);
    this.cardcode = this.CustomerData.CardCode;
    this.notes = this.CustomerData.notes;
    this.email = this.CustomerData.Email;
    this.shippingType = this.CustomerData.ShipType;
  }

  async getDataIndex(){
    const orderComplete = await this.indexDB.getLastOneDB();
    console.log(orderComplete)
    if (window.confirm("You have an Order. \nDo you would continue editing this Order?")) {
      this.OrderReview = orderComplete;
      this.OrderIndexDB = orderComplete;
      this.dataSharing.setOrderCReview(orderComplete);
      this.dataSharing.setOrderIndexDB(orderComplete);
      this.dataSharing.setOrderReview(orderComplete);
      //console.log(this.Cart)
      this.onSelectCustomer(orderComplete.CardCode)
    } else {
      this.OrderReview == undefined;
      this.openSnackBar("You need create an Order", "warning", "Warning", "darkorange")
      this.myRouter.navigate(['dashboard/order-customer/new-order']);
    }
  }

  backWindow()
  {
    this.dataSharing.setCustomerData(this.CustomerData);
    this.dataSharing.setCartData(this.OrderReview?.DocumentLines)
    this.dataSharing.setOrderReview(this.OrderReview);
    this.dataSharing.setOrderIndexDB(this.OrderIndexDB)
    this.myRouter.navigate(['dashboard/cart']);
  }

  changeCustomer()
  {
    this.inputSearchCutomer = false;
    this.showAddButton = true;
    this.billingAddress = '';
    this.shippingAddress = '';
    this.searchText = '';
    this.notes = '';
    this.shippingType = '';
    this.phone1 = '';
    this.email = '';
    this.taxId = '';
    this.CurrentSellsItem = undefined;
  }

  
  onSelectCustomer(selectedData:any){
    this.orderService.getCustomer().subscribe((retData) => {
      if (parseInt(retData.statusCode!) >= 200 && parseInt(retData.statusCode!) < 300) {
        this.ListCustomers = JSON.parse(retData.response!);
        this.CurrentSellsItem = this.ListCustomers.find(x => x.CardCode === selectedData);
        this.sumLines = this.OrderReview!.DocumentLines!.reduce((acumulador:number, elemento:any) => acumulador + elemento.LineTotal, 0);
        this.notes = this.CurrentSellsItem?.Notes;
        this.shippingType = this.CurrentSellsItem?.ShippingType;
        this.email = this.CurrentSellsItem?.EmailAddress;
        this.cardcode = this.CurrentSellsItem!.CardCode;

        var customer ={
          CardCode: this.CurrentSellsItem!.CardCode,
          CardName: this.CurrentSellsItem!.CardName,
          Notes: this.notes,
          Email: this.email,
          ShipType: this.shippingType,
          Addresses:  this.CurrentSellsItem?.BPAddresses.filter(x => x.AddressType != 'bo_BillTo')
        }

        this.CustomerData = customer
      } else {
        this.openSnackBar(retData.response!, "error", "Error", "red");
      }
    });
  }

  createOrder(){

    const selectedAddress = this.CustomerData.Addresses[this.option];
    //console.log(selectedAddress);

    if(selectedAddress)
    {
      const dateToday = this.pipe.transform(this.tax.value, 'yyyy-MM-dd');
      const dateDelivery = this.pipe.transform(this.delivery.value, 'yyyy-MM-dd');
      this.OrderReview!.DocDate = dateToday?.toString();
      this.OrderReview!.DocDueDate = dateToday?.toString();
      this.OrderReview!.TaxDate = dateDelivery?.toString();
      //console.log(this.OrderReview);

      this.OrderReview!.AddressExtension = {}
      this.OrderReview!.AddressExtension! = selectedAddress;

      // if (this.OrderReview && this.OrderReview.DocumentLines) 
      // {
      //   for (let i = 0; i < this.OrderReview.DocumentLines.length; i++) {
      //     delete this.OrderReview.DocumentLines[i].LineTotal;
      //   }
      //   for (let i = 0; i < this.OrderReview.DocumentLines.length; i++) {
      //     delete this.OrderReview.DocumentLines[i].UnitPrice;
      //   }
      // }
      
      console.log(this.OrderReview);

      // this.orderService.PostOrder(this.OrderReview!).subscribe(retData => {
      //   //console.log(this.OrderReview);
      //   if (parseInt(retData.statusCode!) >= 200 && parseInt(retData.statusCode!) < 300)
      //   {
      //      var OrderCreate: Order;
      //      OrderCreate = JSON.parse(retData.response!);
      //     this.openSnackBar("DocNum: "+ OrderCreate.DocNum, "check_circle", "Order Created!", "green");
      //     this.myRouter.navigate(['dashboard/order-index'])
      //   }
      //   else
      //   {
      //     this.openSnackBar(retData.response!, "error", "Error", "red");
      //     //console.log(retData.response)
      //   }
      // });
    }
    else{
      this.openSnackBar("You must select an Address", "warning", "Warning", "darkorange");
    }

  }

  async changeOrder()
  {
    const selectedAddress = this.CustomerData.Addresses[this.option];
    const dateToday = this.pipe.transform(this.tax.value, 'yyyy-MM-dd');
    const dateDelivery = this.pipe.transform(this.delivery.value, 'yyyy-MM-dd');
    this.OrderReview!.DocDate = dateToday?.toString();
    this.OrderReview!.DocDueDate = dateToday?.toString();
    this.OrderReview!.TaxDate = dateDelivery?.toString();

    if(selectedAddress)
    {
      this.OrderReview!.AddressExtension = {}
      this.OrderReview!.AddressExtension! = selectedAddress;
    }

    if(this.OrderReview !== this.OrderReviewOld)
    {
      console.log(this.OrderReview)
      this.indexDB.editToDB(this.OrderIndexDB.id, '1234', this.OrderReview!, this.OrderReview!.CardCode!, this.OrderReview!.DocumentLines!)

      this.dataSharing.setOrderReview(this.OrderReview)
      //this.dataSharing.setCartData(this.Cart);
      this.dataSharing.setOrderIndexDB(this.OrderIndexDB)

      //console.log(order)
    }
  }
  
}
