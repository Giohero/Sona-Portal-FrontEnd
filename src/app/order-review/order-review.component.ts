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
  CustomerData: any;
  option!:number;
  minDate?: Date;
  maxDate?: Date;
  tax!: FormControl;
  delivery!: FormControl;
  sumLines?: number;

  constructor(private orderService: ServiceService, private myRouter: Router, private dialog: MatDialog,  private route: ActivatedRoute, private _snackBar: MatSnackBar, private pipe: DatePipe, private dataSharing:DataSharingService) {
    this.OrderReview = dataSharing.getOrderReview();
    this.CustomerData = dataSharing.getCustomerData();

    this.sumLines = this.OrderReview!.DocumentLines!.reduce((acumulador:number, elemento:any) => acumulador + elemento.LineTotal, 0);
    this.cardcode = this.CustomerData.CardCode;
    this.notes = this.CustomerData.notes;
    this.email = this.CustomerData.Email;
    this.shippingType = this.CustomerData.ShipType;
    this.selectedOption = 'option1'; 
    const currentYear = new Date();
    this.minDate = new Date(currentYear);
    this.tax = new FormControl({value: new Date(), disabled: true});
    this.delivery = new FormControl(new Date());
  }

  ngOnInit(): void {

    this.orderService.getCustomer().subscribe((retData) => {

      if (parseInt(retData.statusCode!) >= 200 && parseInt(retData.statusCode!) < 300) {
        this.ListCustomers = JSON.parse(retData.response!);
      } else {
        this.openSnackBar(retData.response!, "error", "Error", "red");
      }
    });
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


  backWindow()
  {
    this.dataSharing.setCustomerData(this.CustomerData);
    this.dataSharing.setCartData(this.OrderReview?.DocumentLines)
    this.dataSharing.setOrderReview(this.OrderReview);
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
    this.CurrentSellsItem = this.ListCustomers.find(x => x.CardName === selectedData);
    //console.log(this.CurrentSellsItem);
    this.inputSearchCutomer = true;
    this.showAddButton = false;
    var GetBill = this.CurrentSellsItem?.BPAddresses.find(x => x.AddressType == 'bo_BillTo');
    var GetShip = this.CurrentSellsItem?.BPAddresses.find(x => x.AddressType == 'bo_ShipTo');
    this.billingAddress = GetBill?.AddressName! +' '+ GetBill?.Street +' '+ GetBill?.City +' '+ GetBill?.State+' '+ GetBill?.Country +' '+ GetBill?.ZipCode ;
    this.shippingAddress = GetShip?.AddressName! +' '+ GetShip?.Street +' '+ GetShip?.City +' '+ GetShip?.State +' '+ GetShip?.Country +' '+ GetShip?.ZipCode; 
    this.notes = this.CurrentSellsItem?.Notes;
    this.shippingType = this.CurrentSellsItem?.ShippingType;
    this.phone1 = this.CurrentSellsItem?.Phone1;
    this.email = this.CurrentSellsItem?.EmailAddress;
    this.taxId = this.CurrentSellsItem?.FederalTaxId;
    this.idcustomer = this.CurrentSellsItem!.CardCode;
  }

  createOrder(option1:number){

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

      this.orderService.PostOrder(this.OrderReview!).subscribe(retData => {
        //console.log(this.OrderReview);
        if (parseInt(retData.statusCode!) >= 200 && parseInt(retData.statusCode!) < 300)
        {
           var OrderCreate: Order;
           OrderCreate = JSON.parse(retData.response!);
          this.openSnackBar("DocNum: "+ OrderCreate.DocNum, "check_circle", "Order Created!", "green");
          this.myRouter.navigate(['dashboard/order-index'])
        }
        else
        {
          this.openSnackBar(retData.response!, "error", "Error", "red");
          //console.log(retData.response)
        }
      });
    }
    else{
      this.openSnackBar("You must select an Address", "warning", "Warning", "darkorange");
    }

  }
  
}
