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
import { PublishToCosmosDB } from '../service/cosmosdb.service';
import { AuthService } from '../service/auth.service';


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
  title="Edit Customer";
  isOnline!:boolean;
  usernameAzure=''
  // cloudChange = 'cloud_done'

  constructor(private router: Router,
     private orderService: ServiceService,
     private route: ActivatedRoute, 
     private dialog: MatDialog,
     private myRouter: Router, 
     private _snackBar: MatSnackBar,
     private dataSharing: DataSharingService, 
     private indexDB:IndexDbService,
     private transactionCustomer: TransactionCostumerService,
     private auth: AuthService) 
  {
    this.customerBack = this.dataSharing.getCustomerData();
    this.Cart = this.dataSharing.getCartData();

    // if(this.customerBack === undefined)
    //   this.getDataIndex();

    const currentRoute = this.router.url;
    console.log('Ruta actual:', currentRoute);

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

  obtainUser() {
    this.auth.userAzure$.subscribe(
      (username: string) => {
        this.usernameAzure =  username;
      },
      (error: any) => {
        this.usernameAzure =''
      }
    );
  }

  ngOnInit(): void {
    //this.ShowEdit = "none"
    
    // this.orderService.getCustomer().subscribe((retData) => {

    //   if (parseInt(retData.statusCode!) >= 200 && parseInt(retData.statusCode!) < 300) {

    //     this.ListCustomers = JSON.parse(retData.response!);
    //     //console.log(this.ListCustomers)
    //     if(this.customerBack != undefined)
    //     {
    //       if(this.customerBack.CardName === undefined)
    //       {
    //         this.onSelectCustomer(this.customerBack)
    //         //this.searchText = this.customerBack.CardName
    //       }
    //       else
    //       {
    //         this.searchText = this.customerBack.CardName
    //         this.onSelectCustomer(this.customerBack.CardName)
    //       }
          
    //     }
    //     else
    //       this.isLoading = false;
          
    //   } else {
    //     this.openSnackBar(retData.response!, "error", "Error", "red");
    //   }

    // });


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
    else
      this.isLoading = false;

      this.ShowEdit = true;
    
    this.dataSharing.statusWifi$.subscribe((newWifi) => {
      console.log('llego el cambio a '+newWifi)
      this.isOnline = newWifi;
    });

    this.auth.userAzure$.subscribe((username: string) => {
        this.usernameAzure =  username;
      },
      (error: any) => {
        this.usernameAzure =''
      }
    );

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

  backWindow()
  {
    this.myRouter.navigate(['dashboard/costumers']);
  }

  onSelectCustomer(selectedData:any){
    //console.log(this.customerBack.CardName)
    //checar que straiga del datasharing
    //this.CurrentSellsItem = this.ListCustomers.find(x => x.CardName === selectedData || x.CardCode === selectedData);
    //console.log(this.CurrentSellsItem);
    this.inputSearchCutomer = true;
    this.showAddButton = false;
    if(this.customerBack!.BPAddresses.length > 0)
    {
      var GetBill = this.customerBack!.BPAddresses.find((x:any) => x.AddressType == 'bo_BillTo');
      var GetShip = this.customerBack!.BPAddresses.find((x:any) => x.AddressType == 'bo_ShipTo');

      if(GetBill != undefined)
        this.rowBill = parseFloat(GetBill!.RowNum)

      if(GetShip != undefined)
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

      this.isLoading=false
    }
    else
    {
      this.billingAddress = '';
      this.shippingAddress = '';
    }

    this.searchText = this.customerBack!.CardName;
    this.notes = this.customerBack!.Notes;
    this.shippingType = this.customerBack!.ShippingType;
    this.phone1 = this.customerBack!.Phone1;
    this.email = this.customerBack!.EmailAddress;
    this.taxId = this.customerBack!.FederalTaxId;
    this.idcustomer = this.customerBack!.CardCode;
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

  async CreateCustomer()
  {
    let Customer:any = {
      CardCode: this.idcustomer,
      CardName: this.searchText,
      CardType: 'C'
    };
    
    let idTransaction = await this.transactionCustomer.addTransactionCustomerToIndex(this.idcustomer,this.searchText,'C',[],"Customer Created",'','', 'index');

    if(this.isOnline == true)
    {
      let transactionCustomer =  {
        IdIndex: idTransaction,
        user: this.usernameAzure,
        action: 'Customer Created',
        timestamp: new Date().toISOString(),
        ...Customer
      };
      
      var idCosmos = await PublishToCosmosDB(transactionCustomer, 'transactionCustomer_log')
        if(idCosmos != undefined) //Change the status in index 
              this.transactionCustomer.editTransactionCustomerToIndex(idTransaction!, Customer, 'cosmos')

      this.orderService.PostCustomer(Customer).subscribe(retData => {
        //console.log(Customer);
        if (parseInt(retData.statusCode!) >= 200 && parseInt(retData.statusCode!) < 300)
        {
          //console.log("Customer created")
          this.openSnackBar("", "check_circle", "Customer Created!", "green");
          this.inputSearchCutomer = true;
          this.showAddButton = false;

          this.transactionCustomer.editTransactionCustomerToIndex(idTransaction!, Customer, 'complete')
          this.billingAddress = '';
          this.shippingAddress = '';
          console.log(retData.response!)
          
          Customer.ContactPerson = undefined;
          Customer.EmailAddress = undefined;
          Customer.Phone1 = undefined;
          Customer.VatLiable = undefined;
          Customer.BankCountry = undefined;
          Customer.ShippingType = undefined;
          Customer.GTSBillingAddrTel = undefined;
          Customer.FederalTaxId = undefined;
          Customer.Notes = undefined;
          Customer.ValidRemarks = undefined;
          Customer.BPAddresses = [];
          Customer.ContactEmployees = [];
          
          this.CurrentSellsItem = Customer;
        }
        else
        {
          this.openSnackBar(retData.response!, "error", "Error", "red");
        }
      });
    }
    else
    {
      this.openSnackBar("", "check_circle", "Customer Created in Offline!", "blue");
    }
  }

  async UpdateCustomer()
  {
    var Customer = {
      CardCode: this.idcustomer,
      CardName: this.searchText ?? "",
      EmailAddress: this.email ?? "",
      Phone1: this.phone1 ?? "",
      //ShippingType: this.shippingType ?? "",
      FederalTaxId: this.taxId ?? "",
      Notes: this.notes ?? "",
      CardType: 'C',
    };
    
    let idTransaction = await this.transactionCustomer.addTransactionCustomerToIndex(this.idcustomer,this.searchText,'C',this.customerBack!.BPAddresses,"Customer Updated",this.email!,this.notes!, 'index');
    
    if(this.isOnline == true)
    {
      let transactionCustomer =  {
        IdIndex: idTransaction,
        user: this.usernameAzure,
        action: 'Customer Updated',
        timestamp: new Date().toISOString(),
        ...Customer
      };
      
      var idCosmos = await PublishToCosmosDB(transactionCustomer, 'transactionCustomer_log')
        if(idCosmos != undefined) //Change the status in index 
              this.transactionCustomer.editTransactionCustomerToIndex(idTransaction!, transactionCustomer, 'cosmos')

      this.orderService.UpdateCustomer(Customer).subscribe(retData => {
        //console.log(Customer);
        if (parseInt(retData.statusCode!) >= 200 && parseInt(retData.statusCode!) < 300)
        {
          //console.log("Customer created")

          this.openSnackBar("", "check_circle", "Customer Updated!", "green");
          this.transactionCustomer.editTransactionCustomerToIndex(idTransaction!, transactionCustomer, 'complete')
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
    }
    else
    {
      this.openSnackBar("", "check_circle", "Customer Updated in Offline!", "blue");
    }


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

  async UpdateAddress(type:string, row:number){
    //console.log(this.CurrentSellsItem?.BPAddresses)
    //console.log(type)
    //console.log(row)
    var GetBill = this.customerBack?.BPAddresses.find((x:any) => x.RowNum == row.toString());
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

    var result = await dialogRef.afterClosed().toPromise();
     
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
      let idTransaction = await this.transactionCustomer.addTransactionCustomerToIndex(this.idcustomer,this.searchText,'C',this.customerBack!.BPAddresses,"Address Updated",this.email!,this.notes!, 'index');
      
      if(this.isOnline == true)
      {
        let transactionCustomer =  {
          IdIndex: idTransaction,
          user: this.usernameAzure,
          action: 'Address Updated',
          timestamp: new Date().toISOString(),
          ...CustomerAdd
        };
        
        var idCosmos = await PublishToCosmosDB(transactionCustomer, 'transactionCustomer_log')
          if(idCosmos != undefined) //Change the status in index 
                this.transactionCustomer.editTransactionCustomerToIndex(idTransaction!, transactionCustomer, 'cosmos')

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

            const indexAddress = this.customerBack!.BPAddresses!.findIndex((x:any) => x.AddressType == type && x.RowNum == row.toString());
            this.customerBack!.BPAddresses[indexAddress] = CustomerAdd.BPAddresses[0];
            
            this.transactionCustomer.editTransactionCustomerToIndex(idTransaction!, transactionCustomer, 'complete')
            }
          else
          {
            this.openSnackBar(retData.response!, "error", "Error", "red");
            //console.log(retData.response)
          }
        });
      }
      else
      {
        this.openSnackBar("", "check_circle", "Customer Updated in Offline!", "blue");
      }
    }
    
      //console.log(this.AddressBill);
  }

  async AddAddress(type:string){
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

    var result = await dialogRef.afterClosed().toPromise();
     
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
        let idTransaction = await this.transactionCustomer.addTransactionCustomerToIndex(this.idcustomer,this.searchText,'C',this.customerBack!.BPAddresses,"Address Added",this.email!,this.notes!, 'index');

        if(this.isOnline == true)
        {
          let transactionCustomer =  {
            IdIndex: idTransaction,
            user: this.usernameAzure,
            action: 'Address Added',
            timestamp: new Date().toISOString(),
            ...CustomerAdd
          };
          
          var idCosmos = await PublishToCosmosDB(transactionCustomer, 'transactionCustomer_log')
            if(idCosmos != undefined) //Change the status in index 
                  this.transactionCustomer.editTransactionCustomerToIndex(idTransaction!, transactionCustomer, 'cosmos')
                  
          this.orderService.UpdateCustomer(CustomerAdd).subscribe(retData => {
            //console.log(CustomerAdd);
            if (parseInt(retData.statusCode!) >= 200 && parseInt(retData.statusCode!) < 300)
            {
              this.transactionCustomer.editTransactionCustomerToIndex(idTransaction!, transactionCustomer, 'complete')

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
    }
        //console.log(this.AddressBill);
  }

  UpdateList(cardcode:string, type: string)
  {
    this.orderService.getCustomer().subscribe((retData) => {

      if (parseInt(retData.statusCode!) >= 200 && parseInt(retData.statusCode!) < 300) {

        this.ListCustomers = JSON.parse(retData.response!);
        //console.log(this.CurrentSellsItem!.BPAddresses)
        //console.log(this.ListCustomers.find(x=> x.CardCode == cardcode)!.BPAddresses)
        const addressNew = this.ListCustomers.find(x=> x.CardCode == cardcode)!.BPAddresses.filter(x => !this.customerBack!.BPAddresses.some((y:any) => x.RowNum === y.RowNum));
        //console.log(addressNew)

        if(type == 'bo_ShipTo')
          this.rowShip = parseFloat(addressNew[0].RowNum)
        else
          this.rowBill = parseFloat(addressNew[0].RowNum)

        //console.log(this.rowBill)
        //console.log(this.rowShip)
        this.customerBack!.BPAddresses = this.ListCustomers.find((x:any)=> x.CardCode == cardcode)!.BPAddresses
      } else {
        this.openSnackBar(retData.response!, "error", "Error", "red");
      }

    });
  }

  CheckList(type:string)
  {
    console.log(this.customerBack?.BPAddresses)
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
        addressesList: this.customerBack?.BPAddresses.filter((x:any) => x.AddressType == type)
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

  async DeleteAddress(type:string, row:number)
  {
    const BPAddresses = this.customerBack!.BPAddresses.filter((x:any) => x.RowNum !== row.toString())

    var Customer = {
      BPAddresses
    }

    console.log('es el objeto que mandamos');
    console.log(Customer);
    let idTransaction = await this.transactionCustomer.addTransactionCustomerToIndex(this.idcustomer,this.searchText,'C',this.customerBack!.BPAddresses,"Delete Address",this.email!,this.notes!, 'index');

    if(this.isOnline == true)
    {
      let transactionCustomer =  {
        IdIndex: idTransaction,
        user: this.usernameAzure,
        action: 'Delete Address',
        timestamp: new Date().toISOString(),
        ...Customer
      };
      
      var idCosmos = await PublishToCosmosDB(transactionCustomer, 'transactionCustomer_log')
        if(idCosmos != undefined) //Change the status in index 
              this.transactionCustomer.editTransactionCustomerToIndex(idTransaction!, transactionCustomer, 'cosmos')


      this.orderService.DeleteAddresBP(Customer).subscribe((retData) => {
        console.log(retData)
        if (parseInt(retData.statusCode!) >= 200 && parseInt(retData.statusCode!) < 300) {

          //this.ListCustomers = JSON.parse(retData.response!);
          this.customerBack!.BPAddresses = this.customerBack!.BPAddresses.filter((x:any) => x.RowNum !== row.toString())
          this.transactionCustomer.editTransactionCustomerToIndex(idTransaction!, transactionCustomer, 'complete')

          if(type == 'bo_ShipTo')
          {
            this.rowShip = parseFloat(this.customerBack!.BPAddresses.find((x:any) => x.AddressType == 'bo_ShipTo')!.RowNum);
            this.shippingAddress = this.customerBack!.BPAddresses[0]!.AddressName +' '+ this.customerBack!.BPAddresses[0]!.Street  +' '+ this.customerBack!.BPAddresses[0]!.City +' '+ this.customerBack!.BPAddresses[0]!.State +' '+ this.customerBack!.BPAddresses[0]!.Country +' '+ this.customerBack!.BPAddresses[0]!.ZipCode;  
          }
          else
          {
            this.rowBill = parseFloat(this.customerBack!.BPAddresses.find((x:any) => x.AddressType == 'bo_BillTo')!.RowNum);
            this.billingAddress = this.customerBack!.BPAddresses[0]!.AddressName +' '+ this.customerBack!.BPAddresses[0]!.Street  +' '+ this.customerBack!.BPAddresses[0]!.City +' '+ this.customerBack!.BPAddresses[0]!.State +' '+ this.customerBack!.BPAddresses[0]!.Country +' '+ this.customerBack!.BPAddresses[0]!.ZipCode;
          }
              
          this.openSnackBar("", "check_circle", "Address Deleted!", "green");
            
        } else {
          this.openSnackBar(retData.response!, "error", "Error", "red");
        }

      });
    }
    
  }
  
}
