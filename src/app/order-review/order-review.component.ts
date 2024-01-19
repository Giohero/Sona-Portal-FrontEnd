import { Component, Renderer2 } from '@angular/core';
import { ServiceService } from '../service/service.service';
import { BusinessPartner } from '../models/customer';
import { MatDialog } from '@angular/material/dialog';
import { DialogAddressComponent } from '../dialog-address/dialog-address.component';
import { ActivatedRoute, Router } from '@angular/router';
import { AddressExtension, DocumentLines, Order } from '../models/car';
import { MatSnackBar } from '@angular/material/snack-bar';
import { FormControl } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { SnackbarsComponent } from '../snackbars/snackbars.component';
import { DataSharingService } from '../service/data-sharing.service';
import { data } from 'jquery';
import { IndexDbService } from '../service/index-db.service';
import { webWorker } from '../app.component';
import { AuthService } from '../service/auth.service';



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
  Cart!: DocumentLines[];
  isOnline=true;
  tokenAzure=''
  nameAzure='';
  usernameAzure = '';

  constructor(private orderService: ServiceService, private myRouter: Router, private dialog: MatDialog,  private route: ActivatedRoute, private _snackBar: MatSnackBar, private pipe: DatePipe, private dataSharing:DataSharingService, private indexDB:IndexDbService,private renderer: Renderer2, private auth:AuthService) {
    this.OrderReview = dataSharing.getOrderReview();
    this.CustomerData = dataSharing.getCustomerData();
    this.OrderIndexDB = dataSharing.getOrderIndexDB();
    this.Cart = dataSharing.getCartData()!;
    
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

    addEventListener('online', async () => {
      this.renderer.removeClass(document.body, 'offline');
      this.isOnline = true;
      this.OrderIndexDB = dataSharing.getOrderIndexDB();
    });
  
    window.addEventListener('offline', () => {
      this.renderer.addClass(document.body, 'offline');
      this.isOnline = false
    });
  }

  ngOnInit(): void {

    this.auth.tokenAzure$.subscribe((newToken) => {
      //console.log('llego el cambio a '+newWifi)
      this.tokenAzure = newToken;
    });
    
    this.auth.nameAzure$.subscribe(
      (username: string) => {
        this.nameAzure = username
      },
      (error: any) => {
        this.nameAzure = ''
      }
    );

    this.auth.userAzure$.subscribe(
      (username: string) => {
        this.usernameAzure = username
      },
      (error: any) => {
        this.usernameAzure = ''
      }
    );

    
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
    //console.log(this.OrderReview!.DocumentLines!)
    this.sumLines = this.Cart!.reduce((acumulador:number, elemento:any) => acumulador + elemento.LineTotal, 0);
    this.cardcode = this.CustomerData.CardCode;
    this.notes = this.CustomerData.notes;
    this.email = this.CustomerData.Email;
    this.shippingType = this.CustomerData.ShipType;
  }

  async getDataIndex(){
    const orderComplete = await this.indexDB.getLastOneDB();
    //console.log(orderComplete)
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
    this.dataSharing.setCartData(this.Cart)
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
      if(this.OrderReview!.DocNum === undefined || this.OrderReview!.DocNum === 0 )
      {
        this.openSnackBar("Id Index: "+ this.OrderIndexDB.id, "check_circle", "Order Storage Locally", "blue");
        this.myRouter.navigate(['dashboard/order-index'])
        this.Cart = [];

      }
      else{
        this.openSnackBar("DocNum: "+ this.OrderReview!.DocNum, "check_circle", "Order Completed!", "green");
        this.myRouter.navigate(['dashboard/order-index'])
        this.Cart = [];
      }

    }
    else{
      this.openSnackBar("You must select an Address", "warning", "Warning", "darkorange");
    }

  }

  async changeOrder()
  {
    const selectedAddress = this.CustomerData.Addresses[this.option];
    //console.log(selectedAddress)
    const dateToday = this.pipe.transform(this.tax.value, 'yyyy-MM-dd');
    const dateDelivery = this.pipe.transform(this.delivery.value, 'yyyy-MM-dd');
    this.OrderReview!.DocDate = dateToday?.toString();
    this.OrderReview!.DocDueDate = dateDelivery?.toString();
    this.OrderReview!.TaxDate = dateToday?.toString();

    if(selectedAddress)
    {
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

    if(this.OrderReview !== this.OrderReviewOld)
    {
      //console.log(this.OrderReview)
      
      if(this.isOnline == true)
        this.updateOrderCloud(this.OrderReview!);

      this.indexDB.editOrderIndex(this.OrderIndexDB.id, Number(this.OrderReview?.DocNum!), Number(this.OrderReview!.DocEntry!), this.OrderReview!, 'cloud')
      this.dataSharing.setOrderReview(this.OrderReview)
      //this.dataSharing.setCartData(this.Cart);
      this.dataSharing.setOrderIndexDB(this.OrderIndexDB)
    }
  }

  async updateOrderCloud(order: Order)
  {
    webWorker('editOrder',order, this.tokenAzure).then((data) => {
      //console.log('Valor devuelto por el Web Worker edit:', data);
      if(parseInt(data.statusCode!) >= 200 && parseInt(data.statusCode!) < 300)
      {
        // const orderEdit: Order = JSON.parse(data.response);
        // console.log(orderEdit)
        //this.DocNumPublish = orderPublish!.DocNum;

      }
      else
        console.error('Error:', data.response)
    })
    .catch((error) => {
      console.error('Error:', error);
    });
  }
  
}
