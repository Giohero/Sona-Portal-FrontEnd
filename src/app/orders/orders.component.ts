import { ChangeDetectorRef, Component, HostListener } from '@angular/core';
import { Value } from '../models/items';
import { ServiceService } from '../service/service.service';
import { BPAddresses, BusinessPartner } from '../models/customer';
import { MatDialog } from '@angular/material/dialog';
import { DialogAddressComponent } from '../dialog-address/dialog-address.component';
import { ActivatedRoute, Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AddressExtension, DocumentLines, Order } from '../models/car';
import { SnackbarsComponent } from '../snackbars/snackbars.component';
import { DataSharingService } from '../service/data-sharing.service';
import { IndexDbService } from '../service/index-db.service';
import { FormControl } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { webWorker } from '../app.component';
import { MsalService } from '@azure/msal-angular';
import { EditToCosmosDB, PublishToCosmosDB, editToCosmosDB, publishToCosmosDB } from '../service/cosmosdb.service';
import { AuthService } from '../service/auth.service';
import { catchError, mergeMap, retryWhen, throwError, timer } from 'rxjs';
import { IndexCustomersService } from '../service/index-customers.service';
import { IndexItemsService } from '../service/index-items.service';
import { AfterViewInit } from '@angular/core';

@Component({
  selector: 'app-orders',
  templateUrl: './orders.component.html',
  styleUrls: ['./orders.component.css'],
  providers: [DatePipe]
})

export class OrdersComponent {

  tax!: FormControl;
  delivery!: FormControl;
  DocNumPublish? = 0;
  ShowEdit = false;
  showEditInputs = true;
  saveUpdates = false;
  showAddButton = true;
  isLoading=true;
  minDate?: Date;
  maxDate?: Date;
  idIndex: number = 0;
  
  ////Customer Data///////
  ListCustomers!: BusinessPartner[] ;
  idcustomer = '';
  inputSearchCutomer = false;
  searchText = '';
  phone1?: string | undefined;
  email?: string | undefined;
  AddressData: any;
  option!:number;

  CurrentSellsBP?: BusinessPartner | undefined;
  billingAddress?: string | undefined;
  notes?: string | undefined;
  shippingAddress?: string | undefined;
  shippingType?: string | undefined;
  taxId?: string | undefined;
  Address: any;
  customerBack: any;
  rowShip=0;
  rowBill=0;
  
  /////Cart Data///////
  CartOld: DocumentLines[] | undefined;
  elementCart:any;
  ListItems!: Value[] ;
  CurrentSellsItem: Value | undefined;
  searchTextItem = '';
  ItemName = "";
  Quantity = 0;
  Price = "";
  Cart: DocumentLines[] | undefined;
  OrderReview: Order = new Order();
  OrderIndexDB?:any;
  DocEntryPublish? = '';
  actualicon : string ='cloud_queue';
  OrderReviewCopy: any;
  idCosmos = '';
  LineNumber=0;
  isOnline=true;

  tokenAzure='';

  //Add status: index, cloud, complete

  constructor(private router: Router, private orderService: ServiceService, private route: ActivatedRoute, private dialog: MatDialog,private myRouter: Router, private _snackBar: MatSnackBar, private dataSharing: DataSharingService, private indexDB:IndexDbService, private pipe: DatePipe, private msalService: MsalService, private auth: AuthService, private custService:IndexCustomersService, private itemsService:IndexItemsService, private cdr: ChangeDetectorRef) 
  {
    const currentYear = new Date();
    this.minDate = new Date(currentYear);
    this.minDate.setDate(currentYear.getDate() + 1)
    this.tax = new FormControl({ value: new Date(), disabled: true });
    this.delivery = new FormControl(new Date());

    this.Cart = []
    this.dataSharing.updateIdsOrder(0, 0)
    this.dataSharing.updateCart([])
    //this.customerBack = this.dataSharing.getCustomerData();
    //this.Cart = this.dataSharing.getCartData();

    //console.log(this.OrderReview)
    // const routeParams = this.route.snapshot.paramMap;
    // const pageUrl = routeParams.get('type');

    //this.Cart = dataSharing.getCartData();
    //this.OrderIndexDB = dataSharing.getOrderIndexDB();
    this.LineNumber=0;
    // if(this.Cart === undefined)
    //     this.getDataIndex();
    
    /*
    if(this.Cart == undefined)
      this.Cart = []
    else
      this.CartOld = JSON.parse(JSON.stringify(this.Cart));
    */

    // if(pageUrl === 'new-order')
    // {
    //   this.title = "New Order";
    //   this.ShowEdit = false
    // }
    // else  
    // {
    //   this.title = "Edit Customer";
    //   this.ShowEdit = true
    // }
    var orderSave = localStorage.getItem('OrderNewSave');
    console.log(orderSave)
    if(orderSave != null)
    {
      const orderSaveCache = JSON.parse(orderSave);

      if("IdIndex" in orderSaveCache)
      {
        this.idCosmos = orderSaveCache.IdCosmos;
        this.idIndex = orderSaveCache.IdIndex;
        this.OrderIndexDB = JSON.parse(orderSaveCache.Index);
        //console.log(this.OrderIndexDB)
      }

      const DeliveryDate = new Date(orderSaveCache.DocDueDate);
      DeliveryDate.setMinutes(DeliveryDate.getMinutes() + DeliveryDate.getTimezoneOffset());
      this.delivery = new FormControl(DeliveryDate);
      this.searchText = orderSaveCache.CardName;
      this.idcustomer = orderSaveCache.CardCode;
      this.DocNumPublish = orderSaveCache.DocNum;
      this.DocEntryPublish = orderSaveCache.DocEntry;
      this.Cart = orderSaveCache.DocumentLines;
      this.dataSharing.updateIdsOrder(orderSaveCache.DocNum, orderSaveCache.DocEntry)
      this.dataSharing.updateCart(orderSaveCache.DocumentLines)
      //console.log(this.Cart)

      if(orderSaveCache.CardCode != '')
      {
       this.trySelectCustomer(orderSaveCache)
      }


      ///Inside of OrderReview
      this.OrderReview.DocNum = orderSaveCache.DocNum;
      this.OrderReview.DocEntry = orderSaveCache.DocEntry;
      this.OrderReview!.CardName = orderSaveCache.CardName;
      this.OrderReview!.CardCode = orderSaveCache.CardCode;
      this.OrderReview!.DocumentLines = this.Cart;
      var DocumentLinesP: DocumentLines[];
      DocumentLinesP = [];
      this.OrderReview!.DocumentLines!.forEach(element => {
        DocumentLinesP.push({
          ItemCode: element.ItemCode,
          Quantity: element.Quantity,
          TaxCode: 'EX',
          U_Comments: element.U_Comments,
          LineNum:element.LineNum
        })
      });

      this.OrderReview!.DocumentLines = DocumentLinesP;
      this.isLoading = false;

    }
    else
      this.isLoading = false;
  }
  trySelectCustomer(orderSaveCache: any): void {
      setTimeout(() => {
          //console.log(orderSaveCache)
          if (this.ListCustomers != undefined) {
            if(this.ListCustomers.length === 0 )
            {
              console.log("Try to select the customer...");
              this.trySelectCustomer(orderSaveCache);
            }
            else
            {
              this.option = orderSaveCache.OptionAddress
              this.onSelectCustomer(orderSaveCache.CardCode, true);

              if(orderSaveCache.OptionAddress != undefined)
              {
                const selectedAddress = this.AddressData[orderSaveCache.OptionAddress];
                //console.log(selectedAddress)

                var AddressSelect: AddressExtension = {
                  ShipToStreet: selectedAddress.AddressName,
                  ShipToStreetNo: selectedAddress.Street,
                  ShipToBlock: selectedAddress.Block,
                  ShipToZipCode: selectedAddress.ZipCode,
                  ShipToCity: selectedAddress.City,
                  ShipToCountry: selectedAddress.Country,
                  ShipToState: selectedAddress.State
                }

                this.OrderReview!.AddressExtension = {}
                this.OrderReview!.AddressExtension! = AddressSelect;
              }
            }

          } else {
            console.log("Reintentando seleccionar cliente...");
            this.trySelectCustomer(orderSaveCache); 
          }
        }, 5000);
  }
  ////////////// Methods Undefindeds ////////////
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

  nextWindow()
  { 
    var customer ={
      CardCode: this.idcustomer,
      CardName: this.searchText,
      Notes: this.notes,
      Email: this.email,
      ShipType: this.shippingType,
      Addresses:  this.CurrentSellsBP?.BPAddresses.filter(x => x.AddressType != 'bo_BillTo')
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
 //////////////////////////////////////////////////

  ngAfterViewInit(): void {
    this.adjustImageVisibility();
  }
  private adjustImageVisibility() {
    const element = document.getElementById('Cart');
    if (element) {
      if (this.Cart && this.Cart.length === 0) {
        element.classList.add('image-card');
      } else {
        element.classList.remove('image-card');
      }
    }
  }

  ngOnInit(): void {
    //this.ShowEdit = "none"
    this.elementCart = "info-card image-card";

    this.dataSharing.statusWifi$.subscribe((newWifi) => {
      //console.log('llego el cambio a '+newWifi)
      this.isOnline = newWifi;
    });

    this.auth.tokenAzure$.subscribe((newToken) => {
      //console.log('llego el cambio a '+newWifi)
      this.tokenAzure = newToken;
    });

    //console.log(this.isOnline)
    if(this.isOnline == true)
    {
      this.orderService.getItems()
      .pipe(
        retryWhen(errors =>
          errors.pipe(
            mergeMap((error, attemptNumber) => (attemptNumber < 3) ? timer(5000) : throwError(error))
          )
        ),
        catchError(error => {
          this.openSnackBar('Cannot retrieve information, try again', 'error', 'Error', 'red');
          this.isLoading = false;
          return throwError(error);
        })
      )
      .subscribe(
        (retData) => {
          if (parseInt(retData.statusCode!) >= 200 && parseInt(retData.statusCode!) < 300) {

            this.ListItems = JSON.parse(retData.response!);
            //console.log(this.ListItems)
            this.adjustImageVisibility();
          }
        }
      );

      this.orderService.getCustomer()
      .pipe(
        retryWhen(errors =>
          errors.pipe(
            mergeMap((error, attemptNumber) => (attemptNumber < 3) ? timer(5000) : throwError(error))
          )
        ),
        catchError(error => {
          this.openSnackBar('Cannot retrieve information, try again', 'error', 'Error', 'red');
          this.isLoading = false;
          return throwError(error);
        })
      )
      .subscribe(
        (retData) => {

          if (parseInt(retData.statusCode!) >= 200 && parseInt(retData.statusCode!) < 300) {
    
            this.ListCustomers = JSON.parse(retData.response!);
            //console.log(this.ListCustomers)
            if(this.customerBack != undefined)
            {
              if(this.customerBack.CardName === undefined)
              {
                this.onSelectCustomer(this.customerBack, false)
                //this.searchText = this.customerBack.CardName
              }
              else
              {
                this.searchText = this.customerBack.CardName
                this.onSelectCustomer(this.customerBack.CardName, false)
              }
            }
        }}
      );
    }
    else
    {
      this.getInformationByIndex();
      this.adjustImageVisibility();
    }

    this.dataSharing.cartData$.subscribe((newCart) => {
      this.Cart = newCart;
    });

    this.dataSharing.docNum$.subscribe((newDocNum) => {
      this.DocNumPublish = newDocNum;
    });

    this.dataSharing.docEntry$.subscribe((newDocEntry) => {
      this.DocEntryPublish = newDocEntry.toString();
    });
  }

  async getInformationByIndex()
  {
    try
    {
      this.ListCustomers = await this.custService.RetrieveCustomersIndex();
      //console.log(this.ListCustomers)
      this.ListItems = await this.itemsService.RetrieveItemsIndex();
      //console.log(this.ListItems)
    } catch (error) {
      console.error('Error get index:', error);
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

  finishOrder(){
    if(this.DocNumPublish === 0)
    {
      this.openSnackBar("Id Index: "+ this.OrderIndexDB.id, "check_circle", "Order Storage Locally", "blue");
      this.myRouter.navigate(['dashboard/order-index'])

    }
    else{
      this.openSnackBar("DocNum: "+ this.OrderReview!.DocNum, "check_circle", "Order Completed!", "green");
      this.myRouter.navigate(['dashboard/order-index'])
    }
    localStorage.removeItem('OrderNewSave');
  }


  //////////////// Methods Customer /////////////////////////
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
    this.AddressData = []
  }

  onSelectCustomer(selectedData:any, bringCache : boolean){
    //console.log(this.customerBack.CardName)
    this.CurrentSellsBP = this.ListCustomers.find(x => x.CardName === selectedData || x.CardCode === selectedData);
    //console.log(this.CurrentSellsItem);
    this.inputSearchCutomer = true;
    this.showAddButton = false;
    if(this.CurrentSellsBP!.BPAddresses.length > 0)
    {
      var GetBill = this.CurrentSellsBP?.BPAddresses.find(x => x.AddressType == 'bo_BillTo');
      var GetShip = this.CurrentSellsBP?.BPAddresses.find(x => x.AddressType == 'bo_ShipTo');
      this.AddressData = this.CurrentSellsBP?.BPAddresses.filter(x => x.AddressType == 'bo_ShipTo');
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

    this.searchText = this.CurrentSellsBP!.CardName;
    this.notes = this.CurrentSellsBP?.Notes;
    this.shippingType = this.CurrentSellsBP?.ShippingType;
    this.phone1 = this.CurrentSellsBP?.Phone1;
    this.email = this.CurrentSellsBP?.EmailAddress;
    this.taxId = this.CurrentSellsBP?.FederalTaxId;
    this.idcustomer = this.CurrentSellsBP!.CardCode;
    this.isLoading=false

    if(bringCache == false)
      this.changeOrder(undefined, undefined, 'customer')
    
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

  UpdateAddress(type:string, row:number){
    //console.log(this.CurrentSellsItem?.BPAddresses)
    //console.log(type)
    //console.log(row)
    var GetBill = this.CurrentSellsBP?.BPAddresses.find(x => x.RowNum == row.toString());
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

            const indexAddress = this.CurrentSellsBP!.BPAddresses!.findIndex(x => x.AddressType == type && x.RowNum == row.toString());
            this.CurrentSellsBP!.BPAddresses[indexAddress] = CustomerAdd.BPAddresses[0];
            
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
        const addressNew = this.ListCustomers.find(x=> x.CardCode == cardcode)!.BPAddresses.filter(x => !this.CurrentSellsBP!.BPAddresses.some(y => x.RowNum === y.RowNum));
        //console.log(addressNew)

        if(type == 'bo_ShipTo')
          this.rowShip = parseFloat(addressNew[0].RowNum)
        else
          this.rowBill = parseFloat(addressNew[0].RowNum)

        //console.log(this.rowBill)
        //console.log(this.rowShip)
        this.CurrentSellsBP!.BPAddresses = this.ListCustomers.find(x=> x.CardCode == cardcode)!.BPAddresses
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
        addressesList: this.CurrentSellsBP?.BPAddresses.filter(x => x.AddressType == type)
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
    const BPAddresses = this.CurrentSellsBP!.BPAddresses.filter(x => x.RowNum !== row.toString())

    var Customer = {
      BPAddresses
    }
    //console.log(Customer);

    this.orderService.DeleteAddresBP(Customer).subscribe((retData) => {
      if (parseInt(retData.statusCode!) >= 200 && parseInt(retData.statusCode!) < 300) {

        //this.ListCustomers = JSON.parse(retData.response!);
        this.CurrentSellsBP!.BPAddresses = this.CurrentSellsBP!.BPAddresses.filter(x => x.RowNum !== row.toString())

        if(type == 'bo_ShipTo')
        {
          this.rowShip = parseFloat(this.CurrentSellsBP!.BPAddresses.find(x => x.AddressType == 'bo_ShipTo')!.RowNum);
          this.shippingAddress = this.CurrentSellsBP!.BPAddresses[0]!.AddressName +' '+ this.CurrentSellsBP!.BPAddresses[0]!.Street  +' '+ this.CurrentSellsBP!.BPAddresses[0]!.City +' '+ this.CurrentSellsBP!.BPAddresses[0]!.State +' '+ this.CurrentSellsBP!.BPAddresses[0]!.Country +' '+ this.CurrentSellsBP!.BPAddresses[0]!.ZipCode;  
        }
        else
        {
          this.rowBill = parseFloat(this.CurrentSellsBP!.BPAddresses.find(x => x.AddressType == 'bo_BillTo')!.RowNum);
          this.billingAddress = this.CurrentSellsBP!.BPAddresses[0]!.AddressName +' '+ this.CurrentSellsBP!.BPAddresses[0]!.Street  +' '+ this.CurrentSellsBP!.BPAddresses[0]!.City +' '+ this.CurrentSellsBP!.BPAddresses[0]!.State +' '+ this.CurrentSellsBP!.BPAddresses[0]!.Country +' '+ this.CurrentSellsBP!.BPAddresses[0]!.ZipCode;
        }
            
        this.openSnackBar("", "check_circle", "Address Deleted!", "green");
          
      } else {
        this.openSnackBar(retData.response!, "error", "Error", "red");
      }

    });
  }
  
  ///////////////////////////////////////////////////////////////

  //////////////////////// Methods Cart /////////////////////////
  cleanSearching()
  {
    this.ItemName = "";
    this.Quantity = 0;
    this.Price = "";
    this.searchTextItem = "";
  }

  subTotal()
  {
    //return this.Cart.getSumLineTotals();
    return this.Cart!.length > 0 ? this.Cart!.reduce((acum: number, elemento: any) => acum + elemento.LineTotal, 0) : 0;
    //return 0;;
  }

  updateTotal(index:number,item: DocumentLines) {
    if(item.UnitPrice)
    {
      //this.Cart.updateItem(index, item);
      this.changeOrder(index, this.Cart!, '');
      item.LineTotal = item.UnitPrice * item.Quantity!;
    }
      
  }

  updateComment(index: number) {
      this.changeOrder(index,this.Cart!,'');
  }

  addToCart(){
    if(this.ItemName != "")
    {
      if(this.Quantity > 0)
      {
        const element = document.getElementById('Cart');
        element!.classList.remove('image-card');
        
        const newDocumentLine: DocumentLines = {
          ItemCode: this.searchTextItem,
          ItemDescription: this.ItemName,
          Quantity: this.Quantity,
          TaxCode: "EX",
          UnitPrice: Number(this.Price),
          LineTotal: Number(this.Price) * this.Quantity,
          U_Comments: "",
          DiscountPercent: '0.0',
          Icon: 'cloud_queue'
        };
        
        this.Cart?.push(newDocumentLine);
        this.changeOrder(this.Cart!.length - 1, this.Cart!, '');

        this.cleanSearching()
      }
      else
      {
        this.openSnackBar("You must add Quantity more than zero", "warning", "Warning", "darkorange");
      }
    }
    else
    {
      this.openSnackBar("You must select an Item", "error", "Error", "red");
    }

    
  }

  onSelectItem(selectedData: any){
    //console.log(selectedData);
    //console.log('pasa por aqui');
    if (selectedData != undefined)
    {
      this.CurrentSellsItem = this.ListItems.find(x => x.ItemCode === selectedData);
      this.ItemName = this.CurrentSellsItem!.ItemName;
      //console.log(this.CurrentSellsItem?.ItemPrices)
      this.Price = this.CurrentSellsItem!.ItemPrices[0].Price.toString();
    }
  }

  RemoveToCart(index: number){
    this.Cart!.splice(index, 1);
    ////////this.Cart.removeItem(index);
    this.changeOrder(undefined,this.Cart!, '');
    this.cleanSearching();

    if(this.Cart!.length === 0)
    {
      const miDiv = document.getElementById('Cart');
      miDiv!.classList.add('image-card');
    }  
  }

  /////////////////////////////////////////////////////////////


  ////////////////// Sincronize the order in Index DB, Cosmos and SAP ////////////////////
  obtainUser() {
    const activeAccount= this.auth.userAzure$;
    if (activeAccount) {
      (activeAccount: string) => {
        return activeAccount;
      }
      return ''
    } else {
      return '';
    }
  }
  async SaveOrderCache()
  {
    let OrderNewCache:any = {};

    const today = new Date();
    const dateDefault = this.pipe.transform(today, 'yyyy-MM-dd');
    OrderNewCache.DocDate = dateDefault?.toString();
    OrderNewCache.TaxDate = dateDefault?.toString();
    const dateDelivery = this.pipe.transform(this.delivery.value, 'yyyy-MM-dd');
    OrderNewCache.DocDueDate = dateDelivery?.toString();
    OrderNewCache.CardName = this.searchText;
    OrderNewCache.CardCode = this.idcustomer;

    OrderNewCache.DocNum = this.DocNumPublish;
    OrderNewCache.DocEntry = this.DocEntryPublish;
    OrderNewCache.DocumentLines = this.Cart;

    if(this.option != undefined)
    {
      OrderNewCache.OptionAddress = this.option;
    //   const selectedAddress = this.AddressData[this.option];
    // //console.log(selectedAddress)

    // var AddressSelect: AddressExtension = {
    //   ShipToStreet: selectedAddress.AddressName,
    //   ShipToStreetNo: selectedAddress.Street,
    //   ShipToBlock: selectedAddress.Block,
    //   ShipToZipCode: selectedAddress.ZipCode,
    //   ShipToCity: selectedAddress.City,
    //   ShipToCountry: selectedAddress.Country,
    //   ShipToState: selectedAddress.State
    // }

    // this.OrderReview!.AddressExtension = {}
    // this.OrderReview!.AddressExtension! = AddressSelect;
    }

    if(this.OrderIndexDB != undefined)
    {
      OrderNewCache.IdIndex = this.idIndex;
      OrderNewCache.Index = JSON.stringify(this.OrderIndexDB);
      OrderNewCache.IdCosmos = this.idCosmos
    }

    var orderNewString = JSON.stringify(OrderNewCache)
    localStorage.setItem('OrderNewSave', orderNewString);
  }

  async changeOrder(index:number | undefined,order:DocumentLines[] | undefined, action : string)
  {
    //console.log( this.idCosmos)
    const today = new Date();
    const dateDefault = this.pipe.transform(today, 'yyyy-MM-dd');
    this.OrderReview!.DocDate = dateDefault?.toString();
    this.OrderReview!.TaxDate = dateDefault?.toString();
    this.OrderReview.DiscountPercent = 0.0;
    //Add Ddefault delivery date
    const dateDelivery = this.pipe.transform(this.delivery.value, 'yyyy-MM-dd');
    this.OrderReview!.DocDueDate = dateDelivery?.toString();
    
    if(order === undefined && action)
    {
      if(action === 'customer')
      {
        this.OrderReview!.CardName = this.searchText;
        this.OrderReview!.CardCode = this.idcustomer;
        //console.log("Paso en customer")
      }
      else if (action === 'delivery')
      {
        const dateDelivery = this.pipe.transform(this.delivery.value, 'yyyy-MM-dd');
        this.OrderReview!.DocDueDate = dateDelivery?.toString();
        //console.log("Paso en delivery")
      }
      else if (action === 'address')
      {
        const selectedAddress = this.AddressData[this.option];
        //console.log(selectedAddress)

        var AddressSelect: AddressExtension = {
          ShipToStreet: selectedAddress.AddressName,
          ShipToStreetNo: selectedAddress.Street,
          ShipToBlock: selectedAddress.Block,
          ShipToZipCode: selectedAddress.ZipCode,
          ShipToCity: selectedAddress.City,
          ShipToCountry: selectedAddress.Country,
          ShipToState: selectedAddress.State
        }
        
        this.OrderReview!.AddressExtension = {}
        this.OrderReview!.AddressExtension! = AddressSelect;
        //console.log("Paso en address")
      }

      ///Update the index db////
      if(this.OrderIndexDB === undefined)
      {
        //console.log('agregamos solo index db y Cosmos')
        this.OrderIndexDB = await this.indexDB.addOrderIndex(this.OrderReview, 'index')
        this.idIndex = this.OrderIndexDB.id;
        //console.log(this.OrderReview)
        //console.log(this.OrderIndexDB.id)

        //JSON.parse(JSON.stringify(this.OrderReview))
        this.OrderReviewCopy = {};
        this.OrderReviewCopy.IdIndex = this.OrderIndexDB.id;
        this.OrderReviewCopy.Action = "Create_Order"; //Aqui se agrega la accion
        this.OrderReviewCopy.User = this.obtainUser();
        this.OrderReviewCopy.Timestamp =  new Date().toISOString();
        //this.OrderReview!.DocumentLines![0].DiscountPercent = '0.0';
        this.OrderReviewCopy.Order = JSON.parse(JSON.stringify(this.OrderReview));
        
        if(this.isOnline == true)
        {
          //console.error('Se debe crear el documento:');
          if(this.Cart!.length > 0)
            this.updateOrderCloud('publish', undefined, this.Cart!)
          else
            this.idCosmos = await PublishToCosmosDB(this.OrderReviewCopy, 'transaction_log')
            if(this.idCosmos != undefined)
              this.indexDB.editOrderIndex(this.OrderIndexDB.id,Number(this.OrderReview!.DocNum!), Number(this.OrderReview!.DocEntry!), this.OrderReview!, 'cosmos', '')
        }

        //console.log(this.idCosmos)
      }
      else
      {
        //console.log('editamos solo index db')
        this.indexDB.editOrderIndex(this.OrderIndexDB.id,Number(this.OrderReview!.DocNum!), Number(this.OrderReview!.DocEntry!), this.OrderReview!, 'index', '')
        this.OrderReviewCopy = {};
        this.OrderReviewCopy.id = this.idCosmos;
        this.OrderReviewCopy.IdIndex = this.OrderIndexDB.id;
        this.OrderReviewCopy.Action = "Create_Order"; //Aqui se agrega la accion
        this.OrderReviewCopy.User = this.obtainUser();
        this.OrderReviewCopy.Timestamp =  new Date().toISOString();
        this.OrderReviewCopy.DocNum = Number(this.OrderReview!.DocNum!);
        this.OrderReviewCopy.DocEntry = Number(this.OrderReview!.DocEntry!);
        this.OrderReviewCopy.Order = JSON.parse(JSON.stringify(this.OrderReview));

        //console.log( this.idCosmos)
        //console.log(this.OrderIndexDB)

        //console.log('deberia de editarlo a SAP y Cosmos')
        if(this.isOnline == true)
        {
          if(this.Cart!.length > 0 && this.idcustomer !== '')
          this.updateOrderCloud('', undefined, this.Cart!)
          else
          {
            var publishCosmos = await EditToCosmosDB(this.OrderReviewCopy, 'transaction_log')
            if(publishCosmos == true)
              this.indexDB.editOrderIndex(this.OrderIndexDB.id,Number(this.OrderReview!.DocNum!), Number(this.OrderReview!.DocEntry!), this.OrderReview!, 'cosmos', '')
          }
        }
      }
    }
    else
    {
      //console.log("paso por el carrito")
      if(this.idcustomer === '')  
          this.openSnackBar("You must select a customer for make the order in SAP", "warning", "Warning", "darkorange");

      if(index != undefined)
        order![index].Icon = 'cloud_queue'

      this.OrderReview!.DocumentLines = this.Cart;
      this.dataSharing.setCartData(this.Cart);

      if(this.Cart!.length! === 1 && this.OrderIndexDB === undefined)
      {
        //this.OrderReview!.DocumentLines![0].DiscountPercent = '0.0';
        //console.log('agregamos index db, SAP y Cosmos')
        this.OrderIndexDB = await this.indexDB.addOrderIndex(this.OrderReview, 'index')

        this.idIndex = this.OrderIndexDB.id;
        this.OrderReview!.NumAtCard = this.OrderIndexDB.id;

        this.OrderReviewCopy = {};
        this.OrderReviewCopy.IdIndex = this.OrderIndexDB.id;
        this.OrderReviewCopy.Action = "Create_Order"; //Aqui se agrega la accion
        this.OrderReviewCopy.User = this.obtainUser();
        this.OrderReviewCopy.Timestamp =  new Date().toISOString();
        this.OrderReviewCopy.Order = JSON.parse(JSON.stringify(this.OrderReview));
        
        if(this.isOnline == true)
        {
          if(this.idcustomer !== '')
          this.updateOrderCloud('publish', index, order!);
          else
          {
            this.idCosmos = await PublishToCosmosDB(this.OrderReviewCopy, 'transaction_log')
            if(this.idCosmos != undefined)
              this.indexDB.editOrderIndex(this.OrderIndexDB.id,Number(this.OrderReview!.DocNum!), Number(this.OrderReview!.DocEntry!), this.OrderReview!, 'cosmos', '')
          }
        }
        ////there was the procces to publish order in cosmos and SAP

        // this.OrderReviewCopy = this.OrderReview;
        // this.OrderReviewCopy.id = this.idCosmos;
        // this.OrderReview!.DocNum = '12345'
        // editToCosmosDB(this.OrderReviewCopy)
        // this.indexDB.editToDB(this.OrderIndexDB.id,this.OrderReview!.DocNum!.toString(), this.OrderReview!, this.customer.CardCode, this.Cart!)
            
        //console.log(this.OrderIndexDB)
        //console.log(this.OrderIndexDB.id)
      }
      else
      {
        //console.log('editamos index db, SAP y Cosmos')
        this.OrderReview.DocNum = this.DocNumPublish;
        this.OrderReview.DocEntry = this.DocEntryPublish;
        this.OrderReview!.DocumentLines = this.Cart;
        this.OrderIndexDB.DocumentLines = this.Cart;
        //console.log(this.OrderIndexDB)

        var DocumentLinesP: DocumentLines[];
        DocumentLinesP = [];
        
        this.OrderReview!.DocumentLines!.forEach(element => {
          DocumentLinesP.push({
            ItemCode: element.ItemCode,
            Quantity: element.Quantity,
            TaxCode: 'EX',
            LineTotal: element.LineTotal,
            UnitPrice: element.UnitPrice,
            U_Comments: element.U_Comments,
            LineNum:element.LineNum,
            DiscountPercent: element.DiscountPercent
          })
        });

        this.OrderReview!.DocumentLines = DocumentLinesP;
        
        this.indexDB.editOrderIndex(this.OrderIndexDB.id,Number(this.OrderReview!.DocNum!), Number(this.OrderReview!.DocEntry!), this.OrderReview!, 'index', '')
        this.OrderReviewCopy = {};
        this.OrderReviewCopy.id = this.idCosmos;
        this.OrderReviewCopy.IdIndex = this.OrderIndexDB.id;
        this.OrderReviewCopy.Action = "Create_Order"; //Aqui se agrega la accion
        this.OrderReviewCopy.User = this.obtainUser();
        this.OrderReviewCopy.Timestamp =  new Date().toISOString();
        this.OrderReviewCopy.DocNum = Number(this.OrderReview!.DocNum!);
        this.OrderReviewCopy.DocEntry = Number(this.OrderReview!.DocEntry!);
        this.OrderReviewCopy.Order = JSON.parse(JSON.stringify(this.OrderReview));
        
        //console.log(this.OrderReviewCopy)
        //this.transactionService.editOrderLog(this.OrderReview,this.OrderReviewCopy.id, this.OrderReviewCopy.IdIndex);
        
        ////there was the procces to publish order in cosmos and SAP
        if(this.isOnline == true)
        {
          if(this.idcustomer !== '')
          this.updateOrderCloud('', index, order!);
          else
          {
            publishCosmos = await EditToCosmosDB(this.OrderReviewCopy, 'transaction_log')
            if(publishCosmos == true)
              this.indexDB.editOrderIndex(this.OrderIndexDB.id,Number(this.OrderReview!.DocNum!), Number(this.OrderReview!.DocEntry!), this.OrderReview!, 'cosmos', '')
          }
        }
        //console.log(this.OrderIndexDB)
        //console.log(this.OrderIndexDB.id)
        //Cuando pase el webworker, agregue el docnum
        //console.log(this.DocNumPublish)
      }

      this.dataSharing.setOrderReview(this.OrderReview)
      this.dataSharing.setCartData(this.Cart);
      this.dataSharing.setOrderIndexDB(this.OrderIndexDB)

    }
  }
  

  async updateOrderCloud(type: string, index:number | undefined,order:DocumentLines[])
  {
    if(this.DocNumPublish === 0)
      type = 'publish';
    else
      type = '';

    if(type == 'publish')
    {
      console.log(this.OrderReview)
      //editToCosmosDB(this.OrderReviewCopy)
      if(this.idCosmos !== undefined)
      {
        var publishCosmos = await EditToCosmosDB(this.OrderReviewCopy, 'transaction_log')
        if(publishCosmos == true)
          this.indexDB.editOrderIndex(this.OrderIndexDB.id,Number(this.OrderReview!.DocNum!), Number(this.OrderReview!.DocEntry!), this.OrderReview!, 'cosmos', '')
      }
      else
      {
        this.idCosmos = await PublishToCosmosDB(this.OrderReviewCopy, 'transaction_log')
      }
        console.log(this.OrderReview)
        
        webWorker('postOrder',this.OrderReview!, this.tokenAzure).then((data) => {
          //console.log('Valor devuelto por el Web Worker:', data);
          if(parseInt(data.statusCode!) >= 200 && parseInt(data.statusCode!) < 300)
          {
            const orderPublish: Order = JSON.parse(data.response);
            this.DocNumPublish = orderPublish!.DocNum;
            this.DocEntryPublish = orderPublish!.DocEntry

            this.OrderReview!.DocNum = this.DocNumPublish;
            this.OrderReview!.DocEntry = this.DocEntryPublish;

            this.OrderReviewCopy = {};
            this.OrderReviewCopy.id = this.idCosmos;
            this.OrderReviewCopy.IdIndex = this.OrderIndexDB.id;
            this.OrderReviewCopy.Action = "Create_Order"; //Aqui se agrega la accion
            this.OrderReviewCopy.User = this.obtainUser();
            this.OrderReviewCopy.Timestamp =  new Date().toISOString();
            this.OrderReviewCopy.DocNum = Number(this.OrderReview!.DocNum!);
            this.OrderReviewCopy.DocEntry = Number(this.OrderReview!.DocEntry!);
            this.OrderReviewCopy.Order = JSON.parse(JSON.stringify(this.OrderReview));
            this.OrderReviewCopy.ErrorSAP = '';

            EditToCosmosDB(this.OrderReviewCopy, 'transaction_log')
            ///editToCosmosDB(this.OrderReviewCopy)
            //this.transactionService.editOrderLog(this.OrderReviewCopy,this.OrderReviewCopy.id, this.OrderReviewCopy.IdIndex);
            this.indexDB.editOrderIndex(this.OrderIndexDB.id,Number(this.OrderReview!.DocNum!), Number(this.OrderReview!.DocEntry!), this.OrderReview!, 'complete', '')
            //this.actualicon = 'cloud_done';
            this.Cart![0].Icon= 'cloud_done';
          }
          else{
            //this.actualicon = 'cloud_off';
            this.Cart![0].Icon = 'cloud_off';
            this.OrderReviewCopy.ErrorSAP =  data.response;
            this.indexDB.editOrderIndex(this.OrderIndexDB.id,Number(this.OrderReview!.DocNum!), Number(this.OrderReview!.DocEntry!), this.OrderReview!, 'cosmos', data.response)
            EditToCosmosDB(this.OrderReviewCopy, 'transaction_log')
            console.error('Error:', data.response)
          }
        })
        .catch((error) => {
          //this.actualicon = 'cloud_off';
          this.Cart![0].Icon = 'cloud_off';
          console.error('Error:', error);
        });
    }
    else
    {
        //console.log('Este es el del index en editar')
        //console.log(this.OrderIndexDB)

       // this.indexDB.editToDB(this.OrderIndexDB.id,this.OrderReview!.DocNum!.toString(), this.OrderReview!, this.customer.CardCode, this.Cart!)
        webWorker('editOrder',this.OrderReview!, this.tokenAzure).then((data) => {
          //console.log('Valor devuelto por el Web Worker edit:', data);
          if(parseInt(data.statusCode!) >= 200 && parseInt(data.statusCode!) < 300)
          {
            // const orderEdit: Order = JSON.parse(data.response);
            // console.log(orderEdit)
            //this.DocNumPublish = orderPublish!.DocNum;
            //this.actualicon = 'cloud_done';
            this.OrderReviewCopy.ErrorSAP = '';
            if(index != undefined)
              order[index].Icon = 'cloud_done';
            this.indexDB.editOrderIndex(this.OrderIndexDB.id,Number(this.OrderReview!.DocNum!), Number(this.OrderReview!.DocEntry!), this.OrderReview!, 'complete', '')
            EditToCosmosDB(this.OrderReviewCopy, 'transaction_log')
          }
          else{
            if(index != undefined)
              order[index].Icon = 'cloud_off';
            //this.actualicon = 'cloud_off';
            this.indexDB.editOrderIndex(this.OrderIndexDB.id,Number(this.OrderReview!.DocNum!), Number(this.OrderReview!.DocEntry!), this.OrderReview!, 'cosmos', '')
            this.OrderReviewCopy.ErrorSAP =  data.response;
            EditToCosmosDB(this.OrderReviewCopy, 'transaction_log')
            console.error('Error:', data.response)
          }
        })
        .catch((error) => {
          //this.actualicon = 'cloud_off';
          if(index != undefined)
            order[index].Icon = 'cloud_off';
          console.error('Error:', error);
        });
    }
  }
  @HostListener('window:beforeunload', ['$event'])
  unloadNotification($event: any): void {
    //localStorage.removeItem('OrderNewSave');
    if(this.idIndex != 0)
    {
      localStorage.removeItem('OrderNewSave');
      this.SaveOrderCache()
    }
  }
}

