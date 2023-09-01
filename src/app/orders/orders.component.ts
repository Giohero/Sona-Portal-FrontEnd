import { Component } from '@angular/core';
import { Value } from '../models/items';
import { ServiceService } from '../service/service.service';
import { BPAddresses, BusinessPartner } from '../models/customer';
import { MatDialog } from '@angular/material/dialog';
import { DialogAddressComponent } from '../dialog-address/dialog-address.component';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-orders',
  templateUrl: './orders.component.html',
  styleUrls: ['./orders.component.css']
})

export class OrdersComponent {
  ListCustomers!: BusinessPartner[] ;
  searchText = '';
  idcustomer = '';
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
  saveUpdates = false;
  showAddButton = true;
  showEditInputs = true;
  AddressShip: any;
  AddressBill: any;

  constructor(private orderService: ServiceService,private dialog: MatDialog,private myRouter: Router, private _snackBar: MatSnackBar) {}

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


  nextWindow()
  {
    if(this.idcustomer)
    {
      this.myRouter.navigate(['dashboard/cart', this.idcustomer]);
    }
    else
    {
      this.openSnackBar("Error: You Need Add a Customer", "");
    }
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
    
  //   this.orderService.UpdateCustomer(Customer).subscribe(retData => {
  //     console.log(Customer);
  //     if (parseInt(retData.statusCode!) >= 200 && parseInt(retData.statusCode!) < 300)
  //     {
  //       console.log("Customer created")
  //     }
  //     else
  //     {
  //       console.log(retData.response)
  //     }
  // });
  }

  CreateCustomer()
  {
    var Customer = {
      CardCode: this.idcustomer,
      CardName: this.searchText,
      CardType: 'C'
    };
    
    this.orderService.PostCustomer(Customer).subscribe(retData => {
      console.log(Customer);
      if (parseInt(retData.statusCode!) >= 200 && parseInt(retData.statusCode!) < 300)
      {
        console.log("Customer created")
      }
      else
      {
        console.log(retData.response)
      }
  });
  }

  UpdateCustomer()
  {
    var Customer = {
      CardCode: this.idcustomer,
      CardName: this.searchText,
      EmailAddress: this.email,
      Phone1: this.phone1,
      ShippingType: this.shippingType,
      FederalTaxId: this.taxId,
      Notes: this.notes
    };

    this.orderService.UpdateCustomer(Customer).subscribe(retData => {
      console.log(Customer);
      if (parseInt(retData.statusCode!) >= 200 && parseInt(retData.statusCode!) < 300)
      {
        console.log("Customer created")
        
      }
      else
      {
        console.log(retData.response)
      }
  });

  this.showEditInputs = true;
  this.saveUpdates = false;
  }

  EditInputs()
  {
    this.showEditInputs = false;
    this.saveUpdates = true;
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
     
      if(result != undefined)
      {

        this.AddressBill = {
          AddressName : result!.AddressName ?? " ",
          AddressName2 : result.AddressName2 ?? " ",
          AddressType : 'bo_BillTo',
          Block : result?.Block ?? "",
          Country : result?.Country ?? "",
          City : result?.City ?? "",
          State : result?.State ?? "",
          Street : result?.Street ?? "",
          ZipCode : result?.ZipCode ?? ""
        }

        var CustomerAdd={
          CardCode: this.idcustomer,
          BPAddresses: [
            this.AddressBill
          ]
        }

        this.orderService.UpdateCustomer(CustomerAdd).subscribe(retData => {
          console.log(CustomerAdd);
          if (parseInt(retData.statusCode!) >= 200 && parseInt(retData.statusCode!) < 300)
          {
            console.log("Address Updated")
            this.billingAddress = this.AddressBill!.AddressName +' '+ this.AddressBill!.Street  +' '+ this.AddressBill!.City +' '+ this.AddressBill!.State +' '+ this.AddressBill!.Country +' '+ this.AddressBill!.ZipCode;
          }
          else
          {
            console.log(retData.response)
          }
        });

      }
      
        //console.log(this.AddressBill);
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
      {
        this.AddressShip = {
          AddressName : result!.AddressName ?? "",
          AddressName2 : result.AddressName2 ?? "",
          AddressType : 'bo_ShipTo',
          Block : result?.Block ?? "",
          Country : result?.Country ?? "",
          City : result?.City ?? "",
          State : result?.State ?? "",
          Street : result?.Street ?? "",
          ZipCode : result?.ZipCode ?? ""
        }

        var CustomerAdd={
          CardCode: this.idcustomer,
          BPAddresses: [
            this.AddressBill
          ]
        }

        this.orderService.UpdateCustomer(CustomerAdd).subscribe(retData => {
          console.log(CustomerAdd);
          if (parseInt(retData.statusCode!) >= 200 && parseInt(retData.statusCode!) < 300)
          {
            console.log("Address Updated")
            this.shippingAddress = this.AddressShip!.AddressName +' '+ this.AddressShip!.Street  +' '+ this.AddressShip!.City +' '+ this.AddressShip!.State +' '+ this.AddressShip!.Country +' '+ this.AddressShip!.ZipCode;  
          }
          else
          {
            console.log(retData.response)
          }
        });
      }
      
     });
  }
}
