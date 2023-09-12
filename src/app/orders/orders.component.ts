import { Component } from '@angular/core';
import { Value } from '../models/items';
import { ServiceService } from '../service/service.service';
import { BPAddresses, BusinessPartner } from '../models/customer';
import { MatDialog } from '@angular/material/dialog';
import { DialogAddressComponent } from '../dialog-address/dialog-address.component';
import { ActivatedRoute, Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { DocumentLines } from '../models/car';
import { SnackbarsComponent } from '../snackbars/snackbars.component';

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
  Cart: DocumentLines[] | undefined;
  customerBack: any;
  isLoading=true;

  constructor(private orderService: ServiceService, private route: ActivatedRoute, private dialog: MatDialog,private myRouter: Router, private _snackBar: MatSnackBar) 
  {
    this.route.queryParams.subscribe(params => {
      let datosComoTexto = params['customer'];
      this.customerBack = JSON.parse(datosComoTexto);
      console.log(this.customerBack)
      datosComoTexto = params['cart'];
      this.Cart = JSON.parse(datosComoTexto);
    //console.log(this.CustomerData);
    });

  }

  ngOnInit(): void {

    this.orderService.getCustomer().subscribe((retData) => {

      if (parseInt(retData.statusCode!) >= 200 && parseInt(retData.statusCode!) < 300) {

        this.ListCustomers = JSON.parse(retData.response!);
        
        console.log(this.customerBack)
        if(this.customerBack != undefined)
        {
          this.searchText = this.customerBack.CardName
          this.onSelectCustomer(this.customerBack.CardName)
        }
          
      } else {
        this.openSnackBar(retData.response!, "error", "Error", "red");
      }

    });

    

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
        top: '10px',   // Ajusta la posición vertical según sea necesario
        right: '20px', // Ajusta la posición horizontal según sea necesario
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


  nextWindow()
  { 
    var customer ={
      CardCode: this.idcustomer,
      CardName: this.searchText,
      Notes: this.notes,
      Email: this.email,
      ShipType: this.shippingType,
      Addresses:  this.CurrentSellsItem?.BPAddresses.filter(x => x.AddressType != 'bo_BillTo')
    }

    if(this.idcustomer)
    {
      this.myRouter.navigate(['dashboard/cart'], {queryParams: {customer: JSON.stringify(customer), cart: JSON.stringify(this.Cart) }});
    }
    else
    {
      this.openSnackBar("You Need Add a Customer", "error", "Error", "red");
    }
  }

  onSelectCustomer(selectedData:any){
    //console.log(this.customerBack.CardName)
    this.CurrentSellsItem = this.ListCustomers.find(x => x.CardName === selectedData);
    console.log(this.CurrentSellsItem);
    this.inputSearchCutomer = true;
    this.showAddButton = false;
    if(this.CurrentSellsItem!.BPAddresses.length > 0)
    {
      var GetBill = this.CurrentSellsItem?.BPAddresses.find(x => x.AddressType == 'bo_BillTo');
      var GetShip = this.CurrentSellsItem?.BPAddresses.find(x => x.AddressType == 'bo_ShipTo');
      this.billingAddress = GetBill?.AddressName! +' '+ GetBill?.Street +' '+ GetBill?.City +' '+ GetBill?.State+' '+ GetBill?.Country +' '+ GetBill?.ZipCode ;
      this.shippingAddress = GetShip?.AddressName! +' '+ GetShip?.Street +' '+ GetShip?.City +' '+ GetShip?.State +' '+ GetShip?.Country +' '+ GetShip?.ZipCode; 
    }
    else
    {
      this.billingAddress = '';
      this.shippingAddress = '';
    }

    this.notes = this.CurrentSellsItem?.Notes;
    this.shippingType = this.CurrentSellsItem?.ShippingType;
    this.phone1 = this.CurrentSellsItem?.Phone1;
    this.email = this.CurrentSellsItem?.EmailAddress;
    this.taxId = this.CurrentSellsItem?.FederalTaxId;
    this.idcustomer = this.CurrentSellsItem!.CardCode;
    this.isLoading=false
    
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
    this.idcustomer= '';
    
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
        //console.log("Customer created")
        this.openSnackBar("", "check_circle", "Customer Created!", "green");
        this.inputSearchCutomer = true;
        this.showAddButton = false;

      }
      else
      {
        this.openSnackBar(retData.response!, "error", "Error", "red");
      }
  });
  }

  UpdateCustomer()
  {
    var Customer = {
      CardCode: this.idcustomer,
      CardName: this.searchText ?? "",
      EmailAddress: this.email ?? "",
      Phone1: this.phone1 ?? "",
      //ShippingType: this.shippingType ?? "",
      FederalTaxId: this.taxId ?? "",
      Notes: this.notes ?? "",
      CardType: 'C'
    };

    this.orderService.UpdateCustomer(Customer).subscribe(retData => {
      console.log(Customer);
      if (parseInt(retData.statusCode!) >= 200 && parseInt(retData.statusCode!) < 300)
      {
        //console.log("Customer created")
        this.openSnackBar("", "check_circle", "Customer Updated!", "green");
      }
      else
      {
        this.openSnackBar(retData.response!, "error", "Error", "red");
        this.notes = this.notes ?? "";
        this.shippingType = this.shippingType ?? "";
        this.phone1 = this.phone1 ?? "";
        this.email = this.email ?? "";
        this.taxId = this.taxId ?? "";
        //console.log(retData.response)
      }
  });

  this.showEditInputs = true;
  this.saveUpdates = false;
  }

  Cancel()
  {
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
      data: { 
        viewEdit: true,
        viewAdd: false,
        viewList: false,
        addresses: GetBill!
      },
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
          ZipCode : result?.ZipCode ?? "",
          RowNum : GetBill?.RowNum
        }

        var CustomerAdd={
          CardCode: this.idcustomer,
          CardType: 'C',
          BPAddresses: [
            this.AddressBill
          ]
        }

        console.log(CustomerAdd)

        this.orderService.UpdateCustomer(CustomerAdd).subscribe(retData => {
          console.log(CustomerAdd);
          if (parseInt(retData.statusCode!) >= 200 && parseInt(retData.statusCode!) < 300)
          {
            //console.log("Address Updated")
            this.openSnackBar("", "check_circle", "Address Updated!", "green");
            this.billingAddress = this.AddressBill!.AddressName +' '+ this.AddressBill!.Street  +' '+ this.AddressBill!.City +' '+ this.AddressBill!.State +' '+ this.AddressBill!.Country +' '+ this.AddressBill!.ZipCode;
          }
          else
          {
            this.openSnackBar(retData.response!, "error", "Error", "red");
            //console.log(retData.response)
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
      data: { 
        viewEdit: true,
        viewAdd: false,
        viewList: false,
        addresses: GetShip!
      },
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
          ZipCode : result?.ZipCode ?? "",
          RowNum : GetShip?.RowNum
        }

        var CustomerAdd={
          CardCode: this.idcustomer,
          CardType: 'C',
          BPAddresses: [
            this.AddressBill
          ]
        }

        this.orderService.UpdateCustomer(CustomerAdd).subscribe(retData => {
          console.log(CustomerAdd);
          if (parseInt(retData.statusCode!) >= 200 && parseInt(retData.statusCode!) < 300)
          {
            //console.log("Address Updated")
            this.openSnackBar("", "check_circle", "Address Updated!", "green");
            this.shippingAddress = this.AddressShip!.AddressName +' '+ this.AddressShip!.Street  +' '+ this.AddressShip!.City +' '+ this.AddressShip!.State +' '+ this.AddressShip!.Country +' '+ this.AddressShip!.ZipCode;  
          }
          else
          {
            this.openSnackBar(retData.response!, "error", "Error", "red");
            //console.log(retData.response)
          }
        });
      }
     });
  }

  AddShippingAddress(){
    //var GetShip = this.CurrentSellsItem?.BPAddresses.find(x => x.AddressType == 'bo_ShipTo');
    const dialogRef = this.dialog.open(DialogAddressComponent, {
      height: 'auto',
      width: '90%',
      autoFocus: false,
      maxHeight: '90vh', //you can adjust the value as per your view
      maxWidth: '140vh',
      data: { 
        viewEdit: false,
        viewAdd: true,
        viewList: false,
        addresses: undefined!,
        addressesList: undefined
      },
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
          ZipCode : result?.ZipCode ?? "",
        }

        var CustomerAdd={
          CardCode: this.idcustomer,
          CardType: 'C',
          BPAddresses: [
            this.AddressBill
          ]
        }

        this.orderService.UpdateCustomer(CustomerAdd).subscribe(retData => {
          console.log(CustomerAdd);
          if (parseInt(retData.statusCode!) >= 200 && parseInt(retData.statusCode!) < 300)
          {
            //console.log("Address Updated")
            this.openSnackBar("", "check_circle", "Address Added!", "green");
            this.shippingAddress = this.AddressShip!.AddressName +' '+ this.AddressShip!.Street  +' '+ this.AddressShip!.City +' '+ this.AddressShip!.State +' '+ this.AddressShip!.Country +' '+ this.AddressShip!.ZipCode;  
          }
          else
          {
            this.openSnackBar(retData.response!, "error", "Error", "red");
            //console.log(retData.response)
          }
        });
      }
     });
  }

  AddBillingAddress(){
    //var GetBill = this.CurrentSellsItem?.BPAddresses.find(x => x.AddressType == 'bo_BillTo');
    const dialogRef = this.dialog.open(DialogAddressComponent, {
      height: 'auto',
      width: '90%',
      autoFocus: false,
      maxHeight: '90vh', //you can adjust the value as per your view
      maxWidth: '140vh',
      data: { 
        viewEdit: false,
        viewAdd: true,
        viewList: false,
        addresses: undefined,
        addressesList: undefined
      },
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
          ZipCode : result?.ZipCode ?? "",
        }

        var CustomerAdd={
          CardCode: this.idcustomer,
          CardType: 'C',
          BPAddresses: [
            this.AddressBill
          ]
        }

        console.log(CustomerAdd)

        this.orderService.UpdateCustomer(CustomerAdd).subscribe(retData => {
          console.log(CustomerAdd);
          if (parseInt(retData.statusCode!) >= 200 && parseInt(retData.statusCode!) < 300)
          {
            //console.log("Address Updated")
            this.openSnackBar("", "check_circle", "Address Add!", "green");
            this.billingAddress = this.AddressBill!.AddressName +' '+ this.AddressBill!.Street  +' '+ this.AddressBill!.City +' '+ this.AddressBill!.State +' '+ this.AddressBill!.Country +' '+ this.AddressBill!.ZipCode;
          }
          else
          {
            this.openSnackBar(retData.response!, "error", "Error", "red");
            //console.log(retData.response)
          }
        });
      }
        //console.log(this.AddressBill);
    });
  }

  CheckList(type:string)
  {
    const dialogRef = this.dialog.open(DialogAddressComponent, {
      height: 'auto',
      width: '90%',
      autoFocus: false,
      maxHeight: '90vh', //you can adjust the value as per your view
      maxWidth: '140vh',
      data: { 
        viewEdit: false,
        viewAdd: false,
        viewList: true,
        addresses: undefined,
        addressesList: this.CurrentSellsItem?.BPAddresses.filter(x => x.AddressType == type)
      },
    });

    dialogRef.afterClosed().subscribe(result => {
     
      if(result != undefined)
      {
        console.log(result)
        if(type == "bo_BillTo")
          this.billingAddress = result?.AddressName! +' '+ result?.Street +' '+ result?.City +' '+ result?.State+' '+ result?.Country +' '+ result?.ZipCode ;
        else
        this.shippingAddress = result?.AddressName! +' '+ result?.Street +' '+ result?.City +' '+ result?.State +' '+ result?.Country +' '+ result?.ZipCode; 
      }
    });
  }
  
}
