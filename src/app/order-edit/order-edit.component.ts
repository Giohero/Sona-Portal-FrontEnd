import { ChangeDetectorRef, Component, HostListener, Inject, OnInit, ViewChild } from '@angular/core';
import { DocumentLines, Order } from '../models/order';
import { ActivatedRoute, Router } from '@angular/router';
import { FormControl } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { DataSharingService } from '../service/data-sharing.service';
import { ServiceService } from '../service/service.service';
import { Value } from '../models/items';
import { SnackbarsComponent } from '../snackbars/snackbars.component';
import { MAT_DIALOG_DATA, MatDialog } from '@angular/material/dialog';
import { Order as OrderPost, DocumentLines as DocLinePost } from '../models/car';
import { webWorker } from '../app.component';
import { IndexDbService } from '../service/index-db.service';
import { TransactionlogService } from '../service/transactionlog.service';
import { PublishToCosmosDB, editToCosmosDB } from '../service/cosmosdb.service';
import { AuthService } from '../service/auth.service';
import { SignalRService } from '../service/signalr.service';
import { BehaviorSubject, Observable, catchError, mergeMap, retryWhen, throwError, timer } from 'rxjs';
import { UsersSR } from '../models/userSignalR';
import { IndexCustomersService } from '../service/index-customers.service';
import { IndexItemsService } from '../service/index-items.service';
import { BusinessPartner } from '../models/customer';
import { ScannerItemComponent } from '../scanner-item/scanner-item.component';


declare var bootstrap: any; 

@Component({
  selector: 'app-order-edit',
  templateUrl: './order-edit.component.html',
  styleUrls: ['./order-edit.component.css'],
  providers: [DatePipe]
})
export class OrderEditComponent implements OnInit {
  order: Order | undefined; 
  orderOld: any | undefined; 
  post!: FormControl;
  delivery!: FormControl;
  selectedItemIndex: number | null = null;
  ListItems!: Value[];
  colorStatus="2px solid green"
  OrderIndexDB?:any;
  TransactionIndexDB?:any;
  isOnline!:boolean;
  cloudChange = 'cloud_done'
  minDate?: Date;
  usernameAzure='';
  nameAzure='';
  UsersConnection : UsersSR[] = [];
  time : any;
  counter = 0;
  connectedUsers: string[] = [];
  errorStatus: string = ''
  tokenAzure: string = ''
  indexDBNumber: string | number = ''
  blockStatus = false;
  ListCustomers?: BusinessPartner[] ;
  inputSearchCutomer = false
  searchText = '';
  captureActive= false;
  textConcatenaded= '';
  ItemBar:Value | undefined;


  @ViewChild('Scanner-item') modal: any;

  constructor( private route: ActivatedRoute,
    private pipe: DatePipe, 
    private dataSharing:DataSharingService, 
    private orderService: ServiceService, 
    public dialog: MatDialog, 
    private indexDB: IndexDbService, 
    private transLog: TransactionlogService, 
    private myRouter: Router, 
    private auth: AuthService, 
    private signalr:SignalRService,  
    private router: Router,
    private custService:IndexCustomersService,
    private itemsService:IndexItemsService,
    private cdr: ChangeDetectorRef
    ) {
    this.order = dataSharing.getOrderCReview();
    this.OrderIndexDB = dataSharing.getOrderIndexDB();
    // const currentRoute = this.router.url;
    // console.log('Ruta actual:', currentRoute);
    //console.log(this.order)
    const currentYear = new Date();
    this.minDate = new Date(currentYear);

    //console.log('Esta es mi order', this.order)
    //console.log('esta es mi indexDB',this.OrderIndexDB)
    //console.log(this.OrderIndexDB)
    if(this.order != undefined)
    {
      //console.log(this.OrderIndexDB)
      this.orderOld = JSON.parse(JSON.stringify(this.order));
      
      const DocDate = new Date(this.order.DocDate);
      DocDate.setMinutes(DocDate.getMinutes() + DocDate.getTimezoneOffset());
      this.post = new FormControl({value: DocDate, disabled: true});
      //console.log(this.orderOld)
      const DocDueDate = new Date(this.order.DocDueDate);
      DocDueDate.setMinutes(DocDueDate.getMinutes() + DocDueDate.getTimezoneOffset());
      this.delivery = new FormControl(DocDueDate);
      //console.log(this.delivery)
      if(this.order.DocumentStatus == 'bost_Close')
        this.blockStatus = true
    }
    else if(this.OrderIndexDB != undefined)
    {
      //console.log(this.OrderIndexDB)
      this.order = this.OrderIndexDB.Order
      dataSharing.updateIndexOrder(this.OrderIndexDB)
      this.orderOld = JSON.parse(JSON.stringify(this.order));
      const DocDate = new Date(this.order!.DocDate);
      DocDate.setMinutes(DocDate.getMinutes() + DocDate.getTimezoneOffset());
      this.post = new FormControl({value: DocDate, disabled: true});
        //console.log(this.orderOld)
      const DocDueDate = new Date(this.order!.DocDueDate);
      DocDueDate.setMinutes(DocDueDate.getMinutes() + DocDueDate.getTimezoneOffset());
      this.delivery = new FormControl(DocDueDate);
        //console.log(this.delivery)
      if(this.OrderIndexDB.error != '')
      {
        const ErrorString =  JSON.parse(this.OrderIndexDB.error);
        this.errorStatus = ErrorString.error.message.value
      }

      if(this.order!.DocumentLines === undefined)
      this.order!.DocumentLines = [];

      //console.log(this.order!.DocumentLines)

      this.cloudChange = "cloud_queue";

      //console.log('esta es mi indexDB',this.OrderIndexDB)
    }
    else
    {
      var orderSave = localStorage.getItem('OrderSave');
      //console.log(orderSave)
      if(orderSave != null)
      {
        const OrderComplete = JSON.parse(orderSave)

        if(OrderComplete.error != '')
        {
          if (typeof OrderComplete.error === 'string') 
            this.errorStatus = OrderComplete.error
          else
          {
            const ErrorString =  JSON.parse(OrderComplete.error);
          this.errorStatus = ErrorString.error.message.value
          }
        }

        if('indexDB' in OrderComplete)
        {
          //console.log(OrderComplete.indexDB)
          this.OrderIndexDB = JSON.parse(OrderComplete.indexDB)
          this.indexDBNumber = this.OrderIndexDB.id
          //console.log(this.OrderIndexDB)
          //console.log(this.OrderIndexDB.id)
        }

        this.order = JSON.parse(OrderComplete.order)
        this.orderOld = JSON.parse(JSON.stringify(this.order));
        const DocDate = new Date(this.order!.DocDate);
        DocDate.setMinutes(DocDate.getMinutes() + DocDate.getTimezoneOffset());
        this.post = new FormControl({value: DocDate, disabled: true});
        //console.log(this.orderOld)
        const DocDueDate = new Date(this.order!.DocDueDate);
        DocDueDate.setMinutes(DocDueDate.getMinutes() + DocDueDate.getTimezoneOffset());
        
        //console.log(this.delivery)

        if(this.order?.DocNum == 0 || this.order?.DocNum == undefined || Number.isNaN(this.order?.DocNum))
          this.cloudChange = "cloud_queue";

        if(this.order?.DocumentStatus == 'bost_Close')
        {
          this.blockStatus = true
          this.delivery.disable();
          this.delivery = new FormControl({value:DocDueDate, disabled: true});
        }
        else
        this.delivery = new FormControl(DocDueDate);
        
      }
      else
      {
        this.returnPage();
      }
    }
  }

  async getOrderIndex(){
    //console.log(this.order!.DocNum)
    //this.OrderIndexDB = this.dataSharing.getOrderIndexDB();
    //if(this.OrderIndexDB === undefined)
    //console.log('pasa por getOrderIndex')
    this.OrderIndexDB = await this.indexDB.getOrderLogByDocNum2(this.order!.DocNum);
    //console.log(this.OrderIndexDB)
  }

  validateOrderDraft()
  {
    //console.log(this.order?.DocNum)
    if(this.order?.DocNum != 0 && this.order?.DocEntry != 0 && !Number.isNaN(this.order?.DocNum) && this.order?.DocNum != undefined)
      return true;
    else
      return false;
  }

  ngOnInit(): void {
    // const modalElement = document.getElementById('modal');
    // this.modalInstance = new bootstrap.Modal(modalElement,{
    //   keyboard: false; 
    // })
    // openModal(): void {
    //   this.modalInstance.show();
    // }
  
    // closeModal(): void {
    //   this.modalInstance.hide();
    // }

    this.dataSharing.statusWifi$.subscribe((newWifi) => {
      console.log('Is Online: '+newWifi)
      this.isOnline = newWifi;
    });

    this.auth.tokenAzure$.subscribe((newToken) => {
      //console.log('llego el cambio a '+newWifi)
      this.tokenAzure = newToken;
    });

    this.auth.userAzure$.subscribe(
      (username: string) => {
        this.usernameAzure = username
      },
      (error: any) => {
        this.usernameAzure = ''
      }
    );

    this.auth.nameAzure$.subscribe(
      (username: string) => {
        this.nameAzure = username
      },
      (error: any) => {
        this.nameAzure = ''
      }
    );

    //console.log(this.OrderIndexDB)
    if(this.OrderIndexDB == undefined || this.indexDBNumber == undefined)
      this.getOrderIndex()

    if(this.isOnline == true)
    {

      if(this.order?.DocNum != 0 && this.order?.DocEntry != 0 && !Number.isNaN(this.order?.DocNum) )
        this.getSignalR(this.nameAzure, this.usernameAzure)

      this.dataSharing.usersSignal$.subscribe((newUsers) => {
        //console.log(newUsers)
        const newUsersString = JSON.stringify(newUsers)
        //console.log('pasa por el cambio')
        if(newUsers != undefined && newUsers.DocNum != '0' && newUsersString != '{}')
        {
          if(this.order != undefined && this.order.DocNum != undefined  && !Number.isNaN(this.order?.DocNum))
          {
            if(newUsers.DocNum === this.order?.DocNum.toString() && newUsers.DocEntry === this.order?.DocEntry.toString())
            {
              this.UsersConnection = newUsers.usersC!;
              // console.log("si pasa los usuarios")
              this.connectedUsers = (newUsers.usersC || []).filter(user => !!user?.Name).map(user => user!.Name || '');
              this.cdr.detectChanges()
            }
          }
        }
      });

      this.orderService.getItems()
      .pipe(
      retryWhen(errors =>
        errors.pipe(
          mergeMap((error, attemptNumber) => (attemptNumber < 3) ? timer(5000) : throwError(error))
        )
      ),
      catchError(error => {
        this.openSnackBar('Cannot retrieve information, try again', 'error', 'Error', 'red');
        return throwError(error);
        })
      )
      .subscribe((retData) => {
        if (parseInt(retData.statusCode!) >= 200 && parseInt(retData.statusCode!) < 300) {
          this.ListItems = JSON.parse(retData.response!);
        } else {
          this.openSnackBar(retData.response!, "error", "Error", "red");
        }
       });

       this.orderService.getCustomer()
       .pipe(
         retryWhen(errors =>
           errors.pipe(
             mergeMap((error, attemptNumber) => (attemptNumber < 3) ? timer(5000) : throwError(error))
           )
         ),
         catchError(error => {
           this.openSnackBar('Cannot retrieve information, try again', 'error', 'Error', 'red');
           //this.isLoading = false;
           return throwError(error);
         })
       )
       .subscribe(
         (retData) => {
 
           if (parseInt(retData.statusCode!) >= 200 && parseInt(retData.statusCode!) < 300) {
     
             this.ListCustomers = JSON.parse(retData.response!);
             //console.log(this.ListCustomers)
         }}
       );

      this.dataSharing.orderSignal$.subscribe((newOrder) => {
        //console.log(newOrder)
        
        if(JSON.stringify(newOrder) != "{}")
        {
          if(newOrder.DocNum === this.order?.DocNum)
          {
            this.order = newOrder;

            const DocDueDate = new Date(newOrder.DocDueDate);
            //console.log(newOrder.DocDueDate)
            DocDueDate.setMinutes(DocDueDate.getMinutes() + DocDueDate.getTimezoneOffset());
            this.delivery = new FormControl(DocDueDate);
            
            //clean the signal R
            this.dataSharing.updateOrderSignal({});
          }
        }
       });
     }
     else
     {
        this.getInformationByIndex();
     }

     this.dataSharing.OrderIndexDB$.subscribe((newOrderIndex) => {
      //console.log(newOrderIndex)
      const newOrderString = JSON.stringify(newOrderIndex)
      if(newOrderIndex != undefined && newOrderString != '{}')
        this.OrderIndexDB = newOrderIndex;

      //console.log(this.OrderIndexDB)
    });

    this.dataSharing.TransactionIndexDB$.subscribe((newTransIndex) => {
      this.TransactionIndexDB = newTransIndex;
    });

    //console.log(this.OrderIndexDB)

  }

  getSignalR(name: string, email: string): void {
    this.time = setInterval(() => {
      if (name !== ' ' && email !== ' ') {
        this.counter++;
        console.log(this.UsersConnection)

        if (this.counter >= 3) {
          if(this.UsersConnection == undefined || this.UsersConnection.length == 0)
          {
            if(this.order != undefined && this.order!.DocNum != 0 && this.order!.DocNum != undefined)
              this.signalr.sendSignalRMessageUser(this.usernameAzure, this.nameAzure, this.order!.DocNum, this.order!.DocEntry)
            // else 
            //   this.signalr.sendSignalRMessageUser(this.usernameAzure, this.nameAzure, '0', '0')
            
            clearInterval(this.time);
          }
        }
      } else {
        // Resetear el contador si alguna variable es ' '
        this.counter = 0;
      }
    }, 5000);
  }

  async getInformationByIndex()
  {
    try
    {
      //this.ListCustomers = await this.custService.RetrieveCustomersIndex();
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

  onSelectItem(selectedData: any, item: DocumentLines)
  {
    if (selectedData != undefined)
    {
      var itemFound = this.ListItems.find(x => x.ItemCode === selectedData);
      item.ItemDescription = itemFound!.ItemName;
      // item.UnitPrice = itemFound!.ItemPrices[0].Price.toString();
      item.UnitPrice = parseFloat(itemFound!.ItemPrices[0].Price.toString());
    }
  }

  onSelectCustomer(selectedData:any, order : Order){
    console.log(selectedData)
    var CurrentCustomer = this.ListCustomers!.find(x => x.CardName === selectedData || x.CardCode === selectedData);
    //console.log(this.CurrentSellsItem);
    if(CurrentCustomer != undefined)
      order.CardCode = CurrentCustomer!.CardCode;
      this.inputSearchCutomer = true;
   
    this.updateOrder('Change_Customer')
    //this.changeOrder(undefined, undefined, 'customer')
  }

  status(status:string)
  {
    if(status === 'bost_Close')
    {
      this.colorStatus = "2px solid #e15567";
      return 'Closed'
    }
    else
      this.colorStatus = "2px solid green";
      return 'Open'
  }

  statusCircle(status:string)
  {
    if(status === 'bost_Close')
      return 'red'
    else
      return 'green'
  }

  changeQuantity(item: DocumentLines) {
  //console.log(item);
  //console.log(this.orderOld);

  var itemOld: DocumentLines | undefined;

  if (this.orderOld.DocumentLines === undefined) { // when the order doesn't have doclines (Index)
    itemOld = undefined;
  } else {
    itemOld = this.orderOld?.DocumentLines.find((x: any) => x.ItemCode === item.ItemCode);
  }

  var unitPriceOld = itemOld !== undefined ? parseFloat(itemOld.LineTotal.toString()) / itemOld.Quantity : 0;

  if (itemOld === undefined) {
    var totalItem = parseFloat(item.UnitPrice.toString()) * item.Quantity;
    //console.log(totalItem);
    item.LineTotal = totalItem;
    this.updateOrder('Add_New_Item_' + item.ItemCode);
  } else {
    //console.log(unitPriceOld);

    if (item.UnitPrice.toString() === unitPriceOld.toString()) {
      var totalItem = parseFloat(item.UnitPrice.toString()) * item.Quantity;
      //console.log(totalItem);
      item.LineTotal = totalItem;
    } else {
      var difference = Math.abs(itemOld.Quantity - item.Quantity);
      var totalUpdate = parseFloat(item.UnitPrice.toString()) * difference;

      // Calcular el nuevo total
      var totalItem = parseFloat(item.UnitPrice.toString()) * item.Quantity;
      item.LineTotal = totalItem;

      if (itemOld.Quantity > item.Quantity)
        item.LineTotal = parseFloat(itemOld.LineTotal.toString()) - totalUpdate;
      else if (itemOld.Quantity < item.Quantity)
        item.LineTotal = parseFloat(itemOld.LineTotal.toString()) + totalUpdate;
      else
        item.LineTotal = parseFloat(itemOld.LineTotal.toString());
    }

    this.updateOrder('Change_Quantity_LineNum_' + item.LineNum);
  }
   
    

    
    
  }

  totalOrder() {
    let sumLines = this.order && this.order.DocumentLines ? this.order.DocumentLines
      .reduce((acum: number, elemento: any) => {
        const unitPrice = elemento.UnitPrice !== undefined ? parseFloat(elemento.UnitPrice.toString()) : 0;
        const lineTotal = unitPrice > 0 ? parseFloat(elemento.LineTotal.toString()) : 0;
        return acum + lineTotal;
      }, 0) : 0;
  
    // Make sure that sumLines is a valid number, if not, default to 0
    sumLines = Number.isNaN(sumLines) ? 0 : sumLines;
  
    const docTotal = sumLines === parseFloat(this.order?.DocTotal?.toString() || '0') ? parseFloat(this.order?.DocTotal?.toString() || '0') : sumLines;
  
    // console.log('sumLines:', sumLines);
    // console.log('docTotal:', docTotal);
  
    return docTotal;
  }
  addItem(result: any)
  {
    const Item : DocumentLines = {
      ItemCode: result.ItemInfo.ItemCode,
      FixedItemCode: "",
      ItemDescription: result.ItemInfo.ItemName,
      Quantity: parseFloat(result.Quantity),
      UnitPrice: parseFloat(result.ItemInfo.ItemPrices[0].Price.toString()),
      LineTotal: 0,
      Dummie: "",
      TaxRate: "",
      TaxCode: "EX",
      FreeText: "",
      ItemPrices: "",
      LineNum:0
    }

    Item.LineTotal = Item.UnitPrice * Item.Quantity;
    this.order!.DocumentLines.push(Item)
  }

  OpenModal(itemFound: Value): void{
    const dialogRef = this.dialog.open(ScannerItemComponent,{
      width: '550px',
      height: 'auto',
      data: {...itemFound}
    });

    dialogRef.afterClosed().subscribe(result =>  {
      console.log('Window closed', result)
      
      if(result != undefined){
        this.addItem(result);
      }

    })

    // $(this.modal.nativeElement).modal('show');
  }
  removeItem(index: number): void {
    if (this.order && this.order.DocumentLines && this.order.DocumentLines.length > index) {
      var itemDelete = this.order.DocumentLines[index];
      this.order.DocTotal -= itemDelete.LineTotal;
      this.order.DocumentLines.splice(index, 1);
      this.updateOrder('Remove_LineNum_'+itemDelete.LineNum)
    }
  }

  changeCustomer(order:Order){
    order.CardCode = ''
    order.CardName = ''
  }

  // updateOrder()
  // {
  //   console.log(this.order)

  //   var DocumentLinesP: DocLinePost[];
  //   DocumentLinesP = [];
    
  //   this.order?.DocumentLines.forEach(element => {
  //     DocumentLinesP.push({
  //       ItemCode: element.ItemCode,
  //       Quantity: element.Quantity,
  //       TaxCode: 'EX',
  //       U_Comments: element.U_Comments
  //     })

  //     //delete DocumentLinesP[0].ItemName;
  //   });

  //   const docDueDate = this.pipe.transform(this.order?.DocDueDate, 'yyyy-MM-dd');
  //   const docDate = this.pipe.transform(this.order?.DocDate, 'yyyy-MM-dd');
  //   //const taxDate = this.pipe.transform(this.order?.TaxDate, 'yyyy-MM-dd');
    
  //   var OrderPost: OrderPost = {
  //     DocDueDate: docDueDate?.toString(),
  //     DocDate:docDate?.toString(),
  //     TaxDate: docDate?.toString(),
  //     AddressExtension: this.order?.AddressExtension,
  //     DocEntry: this.order?.DocEntry.toString(),
  //     DocNum: this.order?.DocNum.toString(),
  //     DocumentLines: DocumentLinesP!,
  //     CardCode: this.order?.CardCode
  //   }

  //   console.log(OrderPost)
  //   this.orderService.UpdateOrder(OrderPost).subscribe((retData) => {
  //     if (parseInt(retData.statusCode!) >= 200 && parseInt(retData.statusCode!) < 300) {
  //       this.openSnackBar(retData.response!, "check_circle", "Order Updated!", "green");
  //     } else {
  //       this.openSnackBar(retData.response!, "error", "Error", "red");
  //     }
  //   });
  // }

  async updateOrder(action: string)
  {
    //console.log(this.order)

    if(this.order !== this.orderOld)
    {
      this.obtainUser()
      //console.log(this.OrderIndexDB)
      this.errorStatus = '...';
      this.cloudChange = "cloud_queue";

      var DocumentLinesP: DocLinePost[];
      DocumentLinesP = [];
      let count = 0;
      
      this.order?.DocumentLines.forEach(element => {
        DocumentLinesP.push({
          ItemCode: element.ItemCode,
          ItemDescription: element.ItemDescription,
          Quantity: element.Quantity,
          UnitPrice: element.UnitPrice,
          LineTotal: element.LineTotal,
          TaxCode: 'EX',
          FreeText: element.FreeText,
          LineNum:count
        })
        count++;
      });

      // const docDueDate = this.pipe.transform(this.order?.DocDueDate, 'yyyy-MM-dd');
      // const docDate = this.pipe.transform(this.order?.DocDate, 'yyyy-MM-dd');

      const docDueDate = this.pipe.transform(this.delivery.value, 'yyyy-MM-dd');
      //console.log(docDueDate)
      const docDate =  this.pipe.transform(this.post.value, 'yyyy-MM-dd');
      //const taxDate = this.pipe.transform(this.order?.TaxDate, 'yyyy-MM-dd');
      
      var OrderPost: OrderPost = {
        DocDueDate: docDueDate?.toString(),
        DocDate:docDate?.toString(),
        TaxDate: docDate?.toString(),
        AddressExtension: this.order?.AddressExtension,
        DocumentLines: DocumentLinesP!,
        CardCode: this.order?.CardCode,
        CardName: this.order?.CardName,
        DiscountPercent: 0.00
      }


      if(this.order?.DocNum)
      {
        OrderPost.DocEntry = this.order?.DocEntry.toString()
        OrderPost.DocNum = this.order?.DocNum
      }
      //console.log(OrderPost)

      ////Add Index DB/////
      // console.log("Index antes de hacer cambios")
      //console.log(this.OrderIndexDB)
      if(this.OrderIndexDB == undefined)
      {
        //Add the new order in index 
        this.OrderIndexDB = await this.indexDB.addOrderIndex(this.orderOld, 'index')

        var OrderReviewCopy: any;
        OrderReviewCopy = {};
        OrderReviewCopy.IdIndex = this.OrderIndexDB.id;
        OrderReviewCopy.Action = "Create_Order"; //Aqui se agrega la accion
        OrderReviewCopy.User = this.usernameAzure;
        OrderReviewCopy.Timestamp =  new Date().toISOString();
        OrderReviewCopy.Order = JSON.parse(JSON.stringify(this.orderOld));

        //Add in Cosmos the Create Order 
        var idCosmos = await PublishToCosmosDB(OrderReviewCopy, 'transaction_log')
        if(idCosmos != undefined) //Change the status in index 
              this.indexDB.editOrderIndex(this.OrderIndexDB.id,Number(this.orderOld!.DocNum!), Number(this.orderOld!.DocEntry!), this.orderOld!, 'cosmos', '')
      }
          
      // OrderPost.NumAtCard = this.OrderIndexDB.id;
      let idTransaction;

      if(this.order?.DocNum)
        idTransaction = await this.transLog.addTransactionToIndex(action, this.OrderIndexDB.id,this.order?.DocNum, this.order?.DocEntry, OrderPost, "index", this.usernameAzure,'')
      else
        idTransaction = await this.transLog.addTransactionToIndex(action, this.OrderIndexDB.id,0,0, OrderPost, "index", this.usernameAzure, '')
      
      //Add the change for the change in Index status
      this.transLog.addTransactionLogToCosmos(OrderPost!.DocNum!,Number(OrderPost!.DocEntry!), idTransaction!, this.OrderIndexDB.id, action, OrderPost, this.usernameAzure)
      this.transLog.editTransactionToIndex(this.OrderIndexDB.id, idTransaction!, action, OrderPost!.DocNum!,Number(OrderPost!.DocEntry!),'cosmos',OrderPost, this.usernameAzure,'')
      //const idTransaction = "0";
      //console.log(JSON.stringify(this.orderOld, null, 3));
      //console.log('aqui pasa el id transaction '+ idTransaction)

      if(idTransaction != null)
      {
        this.cloudChange = "cloud_upload";
        //this.indexDB.editOrderLogToIndex(OrderPost!, this.orderOld, idTransaction, this.OrderIndexDB.id)
      }

      if(this.isOnline == true)
      {

        if(this.order!.DocumentLines.length > 0)
        {
          if(this.order!.DocNum !== undefined)
          {
            console.log(OrderPost)
            this.cloudChange = "cloud_done";
            this.signalr.sendMessageAPI(JSON.stringify(OrderPost),'order', this.usernameAzure)

            webWorker('editOrder',OrderPost,this.tokenAzure).then((data) => {
              if(parseInt(data.statusCode!) >= 200 && parseInt(data.statusCode!) < 300)
              {
                console.log(data)
                this.cloudChange = "cloud_done";
                this.transLog.editTransactionToIndex(this.OrderIndexDB.id, idTransaction!, action, OrderPost!.DocNum!,Number(OrderPost!.DocEntry!),'complete',OrderPost, this.usernameAzure,'')
                // const orderEdit: Order = JSON.parse(data.response);
                // console.log(orderEdit)
                //this.DocNumPublish = orderPublish!.DocNum;
                this.signalr.sendMessageAPI(JSON.stringify(OrderPost),'order', this.usernameAzure)
              }
              else
              {
                this.cloudChange = "cloud_off";
                this.indexDB.editOrderIndex(this.OrderIndexDB.id,Number(this.orderOld!.DocNum!), Number(this.orderOld!.DocEntry!), this.orderOld!, 'cosmos', data.response)
                this.transLog.editTransactionToIndex(this.OrderIndexDB.id, idTransaction!, action, OrderPost!.DocNum!,Number(OrderPost!.DocEntry!),'cosmos',OrderPost, this.usernameAzure, data.response)
                const ErrorString =  JSON.parse(data.response);
                this.errorStatus = ErrorString.error.message.value
                console.error('Error:', data.response)
              }
            })
            .catch((error) => {
              this.cloudChange = "cloud_off";
              console.error('Error:', error);
            });
          }
          else
          {
            this.cloudChange = 'cloud_done';

            webWorker('postOrder',OrderPost, this.tokenAzure).then((data) => {
              //console.log('Valor devuelto por el Web Worker:', data);
              if(parseInt(data.statusCode!) >= 200 && parseInt(data.statusCode!) < 300)
              {
                const orderPublish: Order = JSON.parse(data.response);
                this.order!.DocNum = orderPublish!.DocNum;
                this.order!.DocEntry = orderPublish!.DocEntry
    
                OrderPost.DocNum = orderPublish!.DocNum;
                OrderPost.DocEntry = orderPublish!.DocEntry.toString()

                this.indexDB.editOrderIndex(this.OrderIndexDB.id,Number(OrderPost!.DocNum!), Number(OrderPost.DocEntry!), this.order!, 'complete', '')
                this.transLog.editTransactionToIndex(this.OrderIndexDB.id, idTransaction!, action, OrderPost!.DocNum!,Number(OrderPost!.DocEntry!),'complete',OrderPost, this.usernameAzure,'')
                 //this.transactionService.editOrderLog(this.OrderReviewCopy,this.OrderReviewCopy.id, this.OrderReviewCopy.IdIndex);
                //this.indexDB.editOrderIndex(this.OrderIndexDB.id, orderPublish!.DocNum, orderPublish!.DocEntry, OrderPost, this.order!.CardCode, this.order!.DocumentLines, [])
                 //this.actualicon = 'cloud_done';
                this.cloudChange = 'cloud_done';
                this.errorStatus = '';
              }
              else{
                //this.actualicon = 'cloud_off';
                this.cloudChange = 'cloud_off';
                this.indexDB.editOrderIndex(this.OrderIndexDB.id,Number(this.orderOld!.DocNum!), Number(this.orderOld!.DocEntry!), this.orderOld!, 'cosmos', data.response)
                this.transLog.editTransactionToIndex(this.OrderIndexDB.id, idTransaction!, action, OrderPost!.DocNum!,Number(OrderPost!.DocEntry!),'cosmos',OrderPost, this.usernameAzure, data.response)
                const ErrorString =  JSON.parse(data.response);
                this.errorStatus = ErrorString.error.message.value
                console.error('Error:', data.response)
              }
            })
            .catch((error) => {
              //this.actualicon = 'cloud_off';
              this.cloudChange = 'cloud_off';
              console.error('Error:', error);
            });
          }
          
        }
        else
        {
          this.openSnackBar("You must add an item for make the order in SAP", "warning", "Warning", "darkorange");
        }
        

        
        ///this.indexDB.editOrderLogToCosmos(this.orderOld,OrderPost,idTransaction!, this.OrderIndexDB.id);
      }
      //this.indexDB.editToDB(this.OrderIndexDB.id,OrderPost!.DocNum!.toString(), OrderPost, OrderPost.CardCode!, DocumentLinesP)

      this.dataSharing.setOrderReview(OrderPost)
      this.dataSharing.setCartData(DocumentLinesP);
      //this.dataSharing.setOrderIndexDB(OrderPost)
    }
  }

  returnPage()
  {
    //console.log(this.order)
    if(this.order != undefined && this.order.DocNum != undefined && !Number.isNaN(this.order?.DocNum))
      this.signalr.removeSignalRMessageUser(this.usernameAzure, this.nameAzure, this.order!.DocNum, this.order!.DocEntry)
    // else
    //   this.signalr.removeSignalRMessageUser(this.usernameAzure, this.nameAzure, '0', '0')

    this.dataSharing.updateUsersSignal({});
    this.dataSharing.setOrderCReview(undefined);
    this.dataSharing.setOrderIndexDB(undefined);
    this.myRouter.navigate(['dashboard/order-index']);
  }
  
  obtainUser() {
    this.auth.userAzure$.subscribe(
      (username: string) => {
        this.usernameAzure = username
      },
      (error: any) => {
        this.usernameAzure = ''
      }
    );
  }

  @HostListener('window:beforeunload', ['$event'])
  unloadNotification($event: any): void {

    //console.log('esta es mi indexDB',this.OrderIndexDB)
    
    localStorage.removeItem('OrderSave');
    var OrderComplete = {order: JSON.stringify(this.order), error: this.errorStatus, indexDB: JSON.stringify(this.OrderIndexDB)}
    var orderString = JSON.stringify(OrderComplete)
    localStorage.setItem('OrderSave', orderString);

    if(this.order != undefined && this.order.DocNum != undefined  && !Number.isNaN(this.order?.DocNum))
      this.signalr.removeSignalRMessageUser(this.usernameAzure, this.nameAzure, this.order!.DocNum, this.order!.DocEntry)
    else
      this.signalr.removeSignalRMessageUser(this.usernameAzure, this.nameAzure, '0', '0')
  }

  timeLastTimePressKey: any;
  textConcatenated = '' 
  
 @HostListener('window:keydown', ['$event'])
  async handleKeyDown(event: KeyboardEvent) {
     this.textConcatenated += event.key;
     if (this.timeLastTimePressKey !== null) {
       clearTimeout(this.timeLastTimePressKey);
     }

     this.timeLastTimePressKey = setTimeout(async () => {
       console.log("El texto ingresado es:", this.textConcatenated);
       
       this.ItemBar = await this.itemsService.GetItemIndexbyBarCode(this.textConcatenated);
        console.log(this.ItemBar);
        if (this.ItemBar != undefined){
          this.OpenModal( this.ItemBar)
        }
        // else{
        //   if(this.textConcatenated!= undefined && this.textConcatenated!=  )
        //     this.openSnackBar("Doesn´t exist Bar Code, try again", "warning", "Warning", "darkorange");
        
       this.textConcatenated = '';
     }, 20);
   }
 
}