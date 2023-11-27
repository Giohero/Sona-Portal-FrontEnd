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
import { IndexDbService } from '../service/index-db.service';
import { TransactionCostumerService } from '../service/transaction-costumer.service';


@Component({
  selector: 'app-customers-edit',
  templateUrl: './customers-edit.component.html',
  styleUrls: ['./customers-edit.component.css']
})

export class CustomersEditComponent {
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
  rowShip=0;
  rowBill=0;
  ShowEdit = false;
  title=""
  // cloudChange = 'cloud_done'

  constructor(private router: Router,
     private orderService: ServiceService,
     private route: ActivatedRoute, 
     private dialog: MatDialog,
     private myRouter: Router, 
     private _snackBar: MatSnackBar,
     private dataSharing: DataSharingService, 
     private indexDB:IndexDbService,
     private transactionCustomer: TransactionCostumerService,) 
  {
    this.customerBack = this.dataSharing.getCustomerData();
    this.Cart = this.dataSharing.getCartData();

    // if(this.customerBack === undefined)
    //   this.getDataIndex();

    const routeParams = this.route.snapshot.paramMap;
    const pageUrl = routeParams.get('type');

    if(pageUrl === 'new-order')
    {
      this.title = "New Order";
      this.ShowEdit = false
    }
    else  
    {
      this.title = "Edit Customer";
      this.ShowEdit = true
    }

  }

  async getDataIndex(){
    const orderComplete = await this.indexDB.getLastOneDB();
    // console.log("pasa aqui")
    // console.log(orderComplete)

    if (window.confirm("You have an Order. \nDo you would continue editing this Order?")) {
      this.customerBack = orderComplete.CardCode;
      this.Cart = orderComplete.DocumentLines;
      this.dataSharing.setOrderCReview(orderComplete);
      this.dataSharing.setOrderIndexDB(orderComplete);
      this.dataSharing.setOrderReview(orderComplete);
      //console.log(this.Cart)
    } else {
      this.customerBack == undefined;
    }
  }

  ngOnInit(): void {
    //this.ShowEdit = "none"
    
    this.orderService.getCustomer().subscribe((retData) => {

      if (parseInt(retData.statusCode!) >= 200 && parseInt(retData.statusCode!) < 300) {

        this.ListCustomers = JSON.parse(retData.response!);
        //console.log(this.ListCustomers)
        if(this.customerBack != undefined)
        {
          if(this.customerBack.CardName === undefined)
          {
            this.onSelectCustomer(this.customerBack)
            //this.searchText = this.customerBack.CardName
          }
          else
          {
            this.searchText = this.customerBack.CardName
            this.onSelectCustomer(this.customerBack.CardName)
          }
          
        }
          
      } else {
        this.openSnackBar(retData.response!, "error", "Error", "red");
      }

    });

    const element = document.getElementById('NextB');
    //console.log(this.title)
    if(this.title == "New Order")
    {
      setTimeout(() => {
        const element = document.getElementById('NextB');
        if (element) {
          element.classList.add('right-button');
        }
      }, 100);
    }
    

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

  backWindow()
  {
    this.myRouter.navigate(['dashboard/costumers']);
  }

  onSelectCustomer(selectedData:any){
    //console.log(this.customerBack.CardName)
    this.CurrentSellsItem = this.ListCustomers.find(x => x.CardName === selectedData || x.CardCode === selectedData);
    //console.log(this.CurrentSellsItem);
    this.inputSearchCutomer = true;
    this.showAddButton = false;
    if(this.CurrentSellsItem!.BPAddresses.length > 0)
    {
      var GetBill = this.CurrentSellsItem?.BPAddresses.find(x => x.AddressType == 'bo_BillTo');
      var GetShip = this.CurrentSellsItem?.BPAddresses.find(x => x.AddressType == 'bo_ShipTo');
      this.rowBill = parseFloat(GetBill!.RowNum)
      this.rowShip = parseFloat(GetShip!.RowNum)

      //console.log(this.rowBill)
      //console.log(this.rowShip)

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

    this.searchText = this.CurrentSellsItem!.CardName;
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
    this.transactionCustomer.addTransactionToIndex(this.idcustomer,this.searchText,'C',this.CurrentSellsItem!.BPAddresses,"Customer Updated",this.email!,this.notes!);
    
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

  UpdateAddress(type:string, row:number){
    //console.log(this.CurrentSellsItem?.BPAddresses)
    //console.log(type)
    //console.log(row)
    var GetBill = this.CurrentSellsItem?.BPAddresses.find(x => x.RowNum == row.toString());
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

            const indexAddress = this.CurrentSellsItem!.BPAddresses!.findIndex(x => x.AddressType == type && x.RowNum == row.toString());
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
            this.UpdateList(this.idcustomer, type)
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

  UpdateList(cardcode:string, type: string)
  {
    this.orderService.getCustomer().subscribe((retData) => {

      if (parseInt(retData.statusCode!) >= 200 && parseInt(retData.statusCode!) < 300) {

        this.ListCustomers = JSON.parse(retData.response!);
        //console.log(this.CurrentSellsItem!.BPAddresses)
        //console.log(this.ListCustomers.find(x=> x.CardCode == cardcode)!.BPAddresses)
        const addressNew = this.ListCustomers.find(x=> x.CardCode == cardcode)!.BPAddresses.filter(x => !this.CurrentSellsItem!.BPAddresses.some(y => x.RowNum === y.RowNum));
        //console.log(addressNew)

        if(type == 'bo_ShipTo')
          this.rowShip = parseFloat(addressNew[0].RowNum)
        else
          this.rowBill = parseFloat(addressNew[0].RowNum)

        //console.log(this.rowBill)
        //console.log(this.rowShip)
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
        //console.log(this.row)
        if(type == "bo_BillTo")
        {
          this.rowBill = parseFloat(result.RowNum);
          this.billingAddress = result?.AddressName! +' '+ result?.Street +' '+ result?.City +' '+ result?.State+' '+ result?.Country +' '+ result?.ZipCode ;
        }
        else
        {
          this.rowShip = parseFloat(result.RowNum);
          this.shippingAddress = result?.AddressName! +' '+ result?.Street +' '+ result?.City +' '+ result?.State +' '+ result?.Country +' '+ result?.ZipCode; 
        }
        
      }
    });
  }

  DeleteAddress(type:string, row:number)
  {
    const BPAddresses = this.CurrentSellsItem!.BPAddresses.filter(x => x.RowNum !== row.toString())

    var Customer = {
      BPAddresses
    }
    //console.log(Customer);

    this.orderService.DeleteAddresBP(Customer).subscribe((retData) => {
      if (parseInt(retData.statusCode!) >= 200 && parseInt(retData.statusCode!) < 300) {

        //this.ListCustomers = JSON.parse(retData.response!);
        this.CurrentSellsItem!.BPAddresses = this.CurrentSellsItem!.BPAddresses.filter(x => x.RowNum !== row.toString())

        if(type == 'bo_ShipTo')
        {
          this.rowShip = parseFloat(this.CurrentSellsItem!.BPAddresses.find(x => x.AddressType == 'bo_ShipTo')!.RowNum);
          this.shippingAddress = this.CurrentSellsItem!.BPAddresses[0]!.AddressName +' '+ this.CurrentSellsItem!.BPAddresses[0]!.Street  +' '+ this.CurrentSellsItem!.BPAddresses[0]!.City +' '+ this.CurrentSellsItem!.BPAddresses[0]!.State +' '+ this.CurrentSellsItem!.BPAddresses[0]!.Country +' '+ this.CurrentSellsItem!.BPAddresses[0]!.ZipCode;  
        }
        else
        {
          this.rowBill = parseFloat(this.CurrentSellsItem!.BPAddresses.find(x => x.AddressType == 'bo_BillTo')!.RowNum);
          this.billingAddress = this.CurrentSellsItem!.BPAddresses[0]!.AddressName +' '+ this.CurrentSellsItem!.BPAddresses[0]!.Street  +' '+ this.CurrentSellsItem!.BPAddresses[0]!.City +' '+ this.CurrentSellsItem!.BPAddresses[0]!.State +' '+ this.CurrentSellsItem!.BPAddresses[0]!.Country +' '+ this.CurrentSellsItem!.BPAddresses[0]!.ZipCode;
        }
            
        this.openSnackBar("", "check_circle", "Address Deleted!", "green");
          
      } else {
        this.openSnackBar(retData.response!, "error", "Error", "red");
      }

    });
  }
  
}
