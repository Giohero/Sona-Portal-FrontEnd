import { Component } from '@angular/core';
import { ServiceService } from '../service/service.service';
import { BusinessPartner } from '../models/customer';
import { MatDialog } from '@angular/material/dialog';
import { DialogAddressComponent } from '../dialog-address/dialog-address.component';
import { ActivatedRoute, Router } from '@angular/router';
import { Order } from '../models/car';
import { MatSnackBar } from '@angular/material/snack-bar';



@Component({
  selector: 'app-order-review',
  templateUrl: './order-review.component.html',
  styleUrls: ['./order-review.component.css']
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

  constructor(private orderService: ServiceService, private myRouter: Router, private dialog: MatDialog,  private route: ActivatedRoute, private _snackBar: MatSnackBar) {
    this.route.queryParams.subscribe(params => {
      let datosComoTexto = params['orderR'];
      this.OrderReview = JSON.parse(datosComoTexto);
      datosComoTexto = params['customer'];
      this.CustomerData = JSON.parse(datosComoTexto);
    console.log(this.CustomerData);
    });


    this.cardcode = this.CustomerData.CardCode;
    this.notes = this.CustomerData.notes;
    this.email = this.CustomerData.Email;
    this.shippingType = this.CustomerData.ShipType;
    this.selectedOption = 'option1'; 
  }

  ngOnInit(): void {

    this.orderService.getCustomer().subscribe((retData) => {

      if (parseInt(retData.statusCode!) >= 200 && parseInt(retData.statusCode!) < 300) {

        this.ListCustomers = JSON.parse(retData.response!);

      
      } else {

        console.log(retData.response);

        console.log('Error');

      }

    });

  }

  openSnackBar(message: string, action: string) {
    this._snackBar.open(message, action,  {
      horizontalPosition: 'center',
      verticalPosition: 'top',
      duration: 5000,
      panelClass: ['custom-snackbar'], 
    });
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

  performActionForOption(option: string): void {
    // Aquí puedes realizar las acciones relacionadas con cada opción seleccionada
    switch (option) {
      case 'Option1':
        // Realiza acciones para la opción 1
        break;
      case 'option2':
        // Realiza acciones para la opción 2
        break;
      case 'option3':
        // Realiza acciones para la opción 3
        break;
      case 'option4':
        // Realiza acciones para la opción 4
        break;
      default:
        break;
    }
  }

  backWindow()
  {
    this.myRouter.navigate(['dashboard/cart'], {queryParams: {customer: JSON.stringify(this.CustomerData)}});
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
    console.log(this.CurrentSellsItem);
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

    //console.log(option1);
    const selectedAddress = this.CustomerData.Addresses[this.option];
    //console.log(selectedAddress);

    //Agregar la direccion en la Orden
    //this.OrderReview?.AddressExtension?.BillToCity = selectedAddress.

    this.orderService.PostCustomer(this.OrderReview).subscribe(retData => {
      console.log(this.OrderReview);
      if (parseInt(retData.statusCode!) >= 200 && parseInt(retData.statusCode!) < 300)
      {
        //console.log("Order created")
        this.openSnackBar('Order created', '');
      }
      else
      {
        this.openSnackBar('Error: '+ retData.response, '');
        //console.log(retData.response)
      }
    });
  }
  
}
