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
import { DataSharingService } from '../service/data-sharing.service';

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
  Address: any;
  Cart: DocumentLines[] | undefined;
  customerBack: any;
  isLoading=true;
  row=0;

  constructor(private orderService: ServiceService, private route: ActivatedRoute, private dialog: MatDialog,private myRouter: Router, private _snackBar: MatSnackBar, private dataSharing: DataSharingService) 
  {
    this.customerBack = this.dataSharing.getCustomerData();
    this.Cart = this.dataSharing.getCartData();

    // this.route.queryParams.subscribe(params => {
    //   let datosComoTexto = params['customer'];
    //   this.customerBack = JSON.parse(datosComoTexto);
    //   console.log(this.customerBack)
    //   datosComoTexto = params['cart'];
    //   this.Cart = JSON.parse(datosComoTexto);
    // });

  }

  ngOnInit(): void {

    this.orderService.getCustomer().subscribe((retData) => {

      if (parseInt(retData.statusCode!) >= 200 && parseInt(retData.statusCode!) < 300) {

        this.ListCustomers = JSON.parse(retData.response!);
        
        //console.log(this.customerBack)
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
      this.dataSharing.setCartData(this.Cart);
      this.dataSharing.setCustomerData(customer);

      //console.log(customer)
      this.myRouter.navigate(['dashboard/cart']);
    }
    else
    {
      this.openSnackBar("You Need Add a Customer", "error", "Error", "red");
    }
  }

  onSelectCustomer(selectedData:any){
    //console.log(this.customerBack.CardName)
    this.CurrentSellsItem = this.ListCustomers.find(x => x.CardName === selectedData);
    //console.log(this.CurrentSellsItem);
    this.inputSearchCutomer = true;
    this.showAddButton = false;
    if(this.CurrentSellsItem!.BPAddresses.length > 0)
    {
      var GetBill = this.CurrentSellsItem?.BPAddresses.find(x => x.AddressType == 'bo_BillTo');
      var GetShip = this.CurrentSellsItem?.BPAddresses.find(x => x.AddressType == 'bo_ShipTo');

      if(GetBill != undefined)
      {
        this.billingAddress = 
        (GetBill?.AddressName ?? '') +
        (GetBill?.Street ? ' ' + GetBill.Street : '') +
        (GetBill?.City ? ' ' + GetBill.City : '') +
        (GetBill?.State ? ' ' + GetBill.State : '') +
        (GetBill?.Country ? ' ' + GetBill.Country : '') +
        (GetBill?.ZipCode ? ' ' + GetBill.ZipCode : '');
      }
      
      
      if(GetShip != undefined)
      {
        this.shippingAddress =
        (GetShip?.AddressName ?? '') +
        (GetShip?.Street ? ' ' + GetShip.Street : '') +
        (GetShip?.City ? ' ' + GetShip.City : '') +
        (GetShip?.State ? ' ' + GetShip.State : '') +
        (GetShip?.Country ? ' ' + GetShip.Country : '') +
        (GetShip?.ZipCode ? ' ' + GetShip.ZipCode : '');
      }
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
    this.showEditInputs = true;
    this.saveUpdates = false;
    
  }

  CreateCustomer()
  {
    var Customer = {
      CardCode: this.idcustomer,
      CardName: this.searchText,
      CardType: 'C'
    };
    
    this.orderService.PostCustomer(Customer).subscribe(retData => {
      //console.log(Customer);
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
      //console.log(Customer);
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

  UpdateAddress(type:string){
    var GetBill = this.CurrentSellsItem?.BPAddresses.find(x => x.AddressType == type && x.RowNum == this.row.toString());
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

        this.Address = {
          AddressName : result!.AddressName || " ",
          AddressName2 : result.AddressName2 || " ",
          AddressType : type,
          Block : result?.Block || "",
          Country : GetBill!.Country || "",
          City : result?.City || "",
          State : result?.State || "",
          Street : result?.Street || "",
          ZipCode : result?.ZipCode || "",
          RowNum : GetBill?.RowNum,
          BPCode: this.idcustomer
        }

        var CustomerAdd={
          CardCode: this.idcustomer,
          CardType: 'C',
          CardName: this.searchText,
          BPAddresses: [
            this.Address
          ]
        }

        //console.log(CustomerAdd)

        this.orderService.UpdateCustomer(CustomerAdd).subscribe(retData => {
          //console.log(CustomerAdd);
          if (parseInt(retData.statusCode!) >= 200 && parseInt(retData.statusCode!) < 300)
          {
            //console.log("Address Updated")
            this.openSnackBar("", "check_circle", "Address Updated!", "green");
            
            if(type == 'bo_ShipTo')
              this.shippingAddress = this.Address!.AddressName +' '+ this.Address!.Street  +' '+ this.Address!.City +' '+ this.Address!.State +' '+ this.Address!.Country +' '+ this.Address!.ZipCode;  
            else
              this.billingAddress = this.Address!.AddressName +' '+ this.Address!.Street  +' '+ this.Address!.City +' '+ this.Address!.State +' '+ this.Address!.Country +' '+ this.Address!.ZipCode;

            const indexAddress = this.CurrentSellsItem!.BPAddresses!.findIndex(x => x.AddressType == type && x.RowNum == this.row.toString());
            this.CurrentSellsItem!.BPAddresses[indexAddress] = CustomerAdd.BPAddresses[0];
            
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

  AddAddress(type:string){
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
        this.Address = {};

        this.Address = {
          AddressName : result!.AddressName ?? " ",
          AddressName2 : result.AddressName2 ?? " ",
          AddressType : type,
          Block : result?.Block ?? "",
          //Country : result?.Country ?? "",
          Country: 'US',
          City : result?.City ?? "",
          State : result?.State ?? "",
          Street : result?.Street ?? "",
          ZipCode : result?.ZipCode ?? "",
        }

        var CustomerAdd={
          CardCode: this.idcustomer,
          CardName: this.searchText,
          CardType: 'C',
          BPAddresses: [
            this.Address
          ]
        }

        //console.log(CustomerAdd)

        this.orderService.UpdateCustomer(CustomerAdd).subscribe(retData => {
          //console.log(CustomerAdd);
          if (parseInt(retData.statusCode!) >= 200 && parseInt(retData.statusCode!) < 300)
          {

            this.openSnackBar("", "check_circle", "Address Add!", "green");
            if(type == 'bo_ShipTo')
            this.shippingAddress = this.Address!.AddressName +' '+ this.Address!.Street  +' '+ this.Address!.City +' '+ this.Address!.State +' '+ this.Address!.Country +' '+ this.Address!.ZipCode;  
          else
            this.billingAddress = this.Address!.AddressName +' '+ this.Address!.Street  +' '+ this.Address!.City +' '+ this.Address!.State +' '+ this.Address!.Country +' '+ this.Address!.ZipCode;

            // console.log(AddressReq)
            // this.CurrentSellsItem?.BPAddresses.push(this.Address)
            this.UpdateList(this.idcustomer)
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

  UpdateList(cardcode:string)
  {
    this.orderService.getCustomer().subscribe((retData) => {

      if (parseInt(retData.statusCode!) >= 200 && parseInt(retData.statusCode!) < 300) {

        this.ListCustomers = JSON.parse(retData.response!);
        this.CurrentSellsItem!.BPAddresses = this.ListCustomers.find(x=> x.CardCode == cardcode)!.BPAddresses
          
      } else {
        this.openSnackBar(retData.response!, "error", "Error", "red");
      }

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
        this.row = parseFloat(result.RowNum);
        //console.log(this.row)
        if(type == "bo_BillTo")
          this.billingAddress = result?.AddressName! +' '+ result?.Street +' '+ result?.City +' '+ result?.State+' '+ result?.Country +' '+ result?.ZipCode ;
        else
        this.shippingAddress = result?.AddressName! +' '+ result?.Street +' '+ result?.City +' '+ result?.State +' '+ result?.Country +' '+ result?.ZipCode; 
      }
    });
  }

  DeleteAddress(type:string)
  {
    const BPAddresses = this.CurrentSellsItem!.BPAddresses.filter(x => x.RowNum !== this.row.toString())

    var Customer = {
      BPAddresses
    }
    console.log(Customer);

    this.orderService.DeleteAddresBP(Customer).subscribe((retData) => {
      if (parseInt(retData.statusCode!) >= 200 && parseInt(retData.statusCode!) < 300) {

        //this.ListCustomers = JSON.parse(retData.response!);
        this.CurrentSellsItem!.BPAddresses = this.CurrentSellsItem!.BPAddresses.filter(x => x.RowNum !== this.row.toString())
        this.row = 0

        if(type == 'bo_ShipTo')
            this.shippingAddress = this.CurrentSellsItem!.BPAddresses[0]!.AddressName +' '+ this.CurrentSellsItem!.BPAddresses[0]!.Street  +' '+ this.CurrentSellsItem!.BPAddresses[0]!.City +' '+ this.CurrentSellsItem!.BPAddresses[0]!.State +' '+ this.CurrentSellsItem!.BPAddresses[0]!.Country +' '+ this.CurrentSellsItem!.BPAddresses[0]!.ZipCode;  
        else
            this.billingAddress = this.CurrentSellsItem!.BPAddresses[0]!.AddressName +' '+ this.CurrentSellsItem!.BPAddresses[0]!.Street  +' '+ this.CurrentSellsItem!.BPAddresses[0]!.City +' '+ this.CurrentSellsItem!.BPAddresses[0]!.State +' '+ this.CurrentSellsItem!.BPAddresses[0]!.Country +' '+ this.CurrentSellsItem!.BPAddresses[0]!.ZipCode;

        this.openSnackBar("", "check_circle", "Address Deleted!", "green");
          
      } else {
        this.openSnackBar(retData.response!, "error", "Error", "red");
      }

    });
  }
  
}
