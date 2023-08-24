import { Component } from '@angular/core';
import { Value } from '../models/items';
import { ServiceService } from '../service/service.service';
import { BusinessPartner } from '../models/customer';
import { MatDialog } from '@angular/material/dialog';
import { DialogAddressComponent } from '../dialog-address/dialog-address.component';

@Component({
  selector: 'app-orders',
  templateUrl: './orders.component.html',
  styleUrls: ['./orders.component.css']
})

export class OrdersComponent {
  ListCustomers!: BusinessPartner[] ;
  searchText = '';
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

  constructor(private orderService: ServiceService,private dialog: MatDialog) {}

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

  CreateCustomer()
  {
    var Customer = {
      CardCode: this.searchText,
      CardName: this.searchText,
      CardType: 'C'
    };
    
    this.orderService.PostCustomer(Customer).subscribe(retData => {
      //console.log(retData.statusCode!);
      if (parseInt(retData.statusCode!) >= 200 && parseInt(retData.statusCode!) < 300)
      {
        
      }
      else
      {
      }
  });
  }

  UpdateBillingAddress(){
    var GetBill = this.CurrentSellsItem?.BPAddresses.find(x => x.AddressType == 'bo_BillTo');
    const dialogRef = this.dialog.open(DialogAddressComponent, {
      height: 'auto',
      width: '90%',
      autoFocus: false,
      maxHeight: '90vh', //you can adjust the value as per your view
      maxWidth: '140vh',
      data: GetBill,
    });

    dialogRef.afterClosed().subscribe(result => {
      // console.log(result);
      if(result != undefined)
        this.billingAddress = result?.AddressName! +' '+ result?.Street +' '+ result?.City +' '+ result?.State+' '+ result?.Country +' '+ result?.ZipCode ;
    });

  }

  UpdateShippingAddress(){
    var GetShip = this.CurrentSellsItem?.BPAddresses.find(x => x.AddressType == 'bo_ShipTo');
    const dialogRef = this.dialog.open(DialogAddressComponent, {
      height: 'auto',
      width: '90%',
      autoFocus: false,
      maxHeight: '90vh', //you can adjust the value as per your view
      maxWidth: '140vh',
      data: GetShip,
    });

    dialogRef.afterClosed().subscribe(result => {
      // console.log(result);
      if(result != undefined)
        this.shippingAddress = result?.AddressName! +' '+ result?.Street +' '+ result?.City +' '+ result?.State+' '+ result?.Country +' '+ result?.ZipCode ;
    });
  }
}
