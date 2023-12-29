import { Component, OnInit } from '@angular/core';
import { DocumentLines, Order } from '../models/order';
import { ActivatedRoute, Router } from '@angular/router';
import { FormControl } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { DataSharingService } from '../service/data-sharing.service';
import { ServiceService } from '../service/service.service';
import { Value } from '../models/items';
import { SnackbarsComponent } from '../snackbars/snackbars.component';
import { MatDialog } from '@angular/material/dialog';
import { Order as OrderPost, DocumentLines as DocLinePost } from '../models/car';
import { webWorker } from '../app.component';
import { IndexDbService } from '../service/index-db.service';
import { TransactionlogService } from '../service/transactionlog.service';
import { PublishToCosmosDB, editToCosmosDB } from '../service/cosmosdb.service';
import { AuthService } from '../service/auth.service';
import { SignalRService } from '../service/signalr.service';
import { BehaviorSubject, Observable } from 'rxjs';

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
  colorStatus=""
  OrderIndexDB?:any;
  TransactionIndexDB?:any;
  isOnline!:boolean;
  cloudChange = 'cloud_done'
  minDate?: Date;

  constructor( private route: ActivatedRoute,private pipe: DatePipe, private dataSharing:DataSharingService, private orderService: ServiceService, private dialog: MatDialog, private indexDB: IndexDbService, private transLog: TransactionlogService, private myRouter: Router, private auth: AuthService, private signalr:SignalRService,  private router: Router) {
    this.order = dataSharing.getOrderCReview();
    this.OrderIndexDB = dataSharing.getOrderIndexDB();

    // const currentRoute = this.router.url;
    // console.log('Ruta actual:', currentRoute);
    // console.log("esta es la orden")
    console.log(this.order)
    const currentYear = new Date();
    this.minDate = new Date(currentYear);

    if(this.order != undefined)
    {
      console.log(this.OrderIndexDB)
      this.orderOld = JSON.parse(JSON.stringify(this.order));
      
      const DocDate = new Date(this.order.DocDate);
      DocDate.setMinutes(DocDate.getMinutes() + DocDate.getTimezoneOffset());
      this.post = new FormControl({value: DocDate, disabled: true});
      //console.log(this.orderOld)
      const DocDueDate = new Date(this.order.DocDueDate);
      DocDueDate.setMinutes(DocDueDate.getMinutes() + DocDueDate.getTimezoneOffset());
      this.delivery = new FormControl(DocDueDate);
      //console.log(this.delivery)
    }
    // else
    // {
    //   this.post = new FormControl({value: new Date(), disabled: true});
    //   this.delivery = new FormControl(new Date());
      
    //   let lastVersionIndex;
    //   if(this.OrderIndexDB.transaction_order !== null )
    //     lastVersionIndex = this.OrderIndexDB.transaction_order[this.OrderIndexDB.transaction_order.length - 1].order
    //   else
    //     lastVersionIndex = this.OrderIndexDB;
      
    //   console.log(lastVersionIndex)
    //   this.order! = lastVersionIndex;
    //   this.orderOld = JSON.parse(JSON.stringify(lastVersionIndex));

    //   if(this.order!.DocumentLines === undefined)
    //     this.order!.DocumentLines = [];

    //   console.log(this.order!.DocumentLines)

    //   this.cloudChange = "cloud_queue";
    // }
  }

  async getOrderIndex(){
    console.log(this.order!.DocNum)
    //this.OrderIndexDB = this.dataSharing.getOrderIndexDB();
    //if(this.OrderIndexDB === undefined)
    this.OrderIndexDB = await this.indexDB.getOrderLogByDocNum2(this.order!.DocNum);
    console.log(this.OrderIndexDB)
  }

  ngOnInit(): void {
    this.orderService.getItems().subscribe((retData) => {
      if (parseInt(retData.statusCode!) >= 200 && parseInt(retData.statusCode!) < 300) {
        this.ListItems = JSON.parse(retData.response!);
      } else {
        this.openSnackBar(retData.response!, "error", "Error", "red");
      }
    });

    this.dataSharing.statusWifi$.subscribe((newWifi) => {
      console.log('llego el cambio a '+newWifi)
      this.isOnline = newWifi;
    });


    this.getOrderIndex()

    this.dataSharing.OrderIndexDB$.subscribe((newOrderIndex) => {
      this.OrderIndexDB = newOrderIndex;
    });

    this.dataSharing.TransactionIndexDB$.subscribe((newTransIndex) => {
      this.TransactionIndexDB = newTransIndex;
    });

    this.dataSharing.statusWifi$.subscribe((newWifi) => {
      console.log('llego el cambio a '+newWifi)
      this.isOnline = newWifi;
    });

    this.dataSharing.orderSignal$.subscribe((newOrder) => {
      console.log(newOrder)
      
      console.log('pasa por el cambio')
      if(JSON.stringify(newOrder) != "{}")
      {
        if(newOrder.DocNum === this.order?.DocNum)
        {
          this.order = newOrder;

          const DocDueDate = new Date(newOrder.DocDueDate);
          console.log(newOrder.DocDueDate)
          DocDueDate.setMinutes(DocDueDate.getMinutes() + DocDueDate.getTimezoneOffset());
          this.delivery = new FormControl(DocDueDate);
        }
      }
    });

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
  console.log(item);
  console.log(this.orderOld);

  var itemOld: DocumentLines | undefined;

  if (this.orderOld.DocumentLines === undefined) { // when the order doesn't have doclines (Index)
    itemOld = undefined;
  } else {
    itemOld = this.orderOld?.DocumentLines.find((x: any) => x.ItemCode === item.ItemCode);
  }

  var unitPriceOld = itemOld !== undefined ? parseFloat(itemOld.LineTotal.toString()) / itemOld.Quantity : 0;

  if (itemOld === undefined) {
    var totalItem = parseFloat(item.UnitPrice.toString()) * item.Quantity;
    console.log(totalItem);
    item.LineTotal = totalItem;
    this.updateOrder('Add_New_Item_' + item.ItemCode);
  } else {
    console.log(unitPriceOld);

    if (item.UnitPrice.toString() === unitPriceOld.toString()) {
      var totalItem = parseFloat(item.UnitPrice.toString()) * item.Quantity;
      console.log(totalItem);
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

  totalOrder()
  {
    let sumLines = this.order!.DocumentLines.length > 0 ? this.order!.DocumentLines!.reduce((acum: number, elemento: any) => acum + elemento.LineTotal, 0) : 0;
    
    if(sumLines == this.order?.DocTotal)
      return this.order?.DocTotal
    else
      return sumLines;
    
  }

  addItem()
  {
    const Item : DocumentLines = {
      ItemCode: "",
      FixedItemCode: "",
      ItemDescription: "",
      Quantity: 0,
      UnitPrice: 0,
      LineTotal: 0.0,
      Dummie: "",
      TaxRate: "",
      TaxCode: "",
      U_Comments: "",
      ItemPrices: "",
      LineNum:0
    }

    this.order!.DocumentLines.push(Item)
  }

  removeItem(index: number): void {
    if (this.order && this.order.DocumentLines && this.order.DocumentLines.length > index) {
      var itemDelete = this.order.DocumentLines[index];
      this.order.DocTotal -= itemDelete.LineTotal;
      this.order.DocumentLines.splice(index, 1);
      this.updateOrder('Remove_LineNum_'+itemDelete.LineNum)
    }
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
          U_Comments: element.U_Comments,
          LineNum:count
        })
        count++;
      });

      // const docDueDate = this.pipe.transform(this.order?.DocDueDate, 'yyyy-MM-dd');
      // const docDate = this.pipe.transform(this.order?.DocDate, 'yyyy-MM-dd');

      const docDueDate = this.pipe.transform(this.delivery.value, 'yyyy-MM-dd');
      console.log(docDueDate)
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
      }


      if(this.order?.DocNum)
      {
        OrderPost.DocEntry = this.order?.DocEntry.toString()
        OrderPost.DocNum = this.order?.DocNum
      }
      console.log(OrderPost)

      ////Add Index DB/////
      // console.log("Index antes de hacer cambios")
      console.log(this.OrderIndexDB)
      if(this.OrderIndexDB == undefined)
      {
        //Add the new order in index 
        this.OrderIndexDB = await this.indexDB.addOrderIndex(this.orderOld, 'index')

        var OrderReviewCopy: any;
        OrderReviewCopy = {};
        OrderReviewCopy.IdIndex = this.OrderIndexDB.id;
        OrderReviewCopy.Action = "Create_Order"; //Aqui se agrega la accion
        OrderReviewCopy.User = this.obtainUser();
        OrderReviewCopy.Timestamp =  new Date().toISOString();
        OrderReviewCopy.Order = JSON.parse(JSON.stringify(this.orderOld));

        //Add in Cosmos the Create Order 
        var idCosmos = await PublishToCosmosDB(OrderReviewCopy, 'transaction_log')
        if(idCosmos != undefined) //Change the status in index 
              this.indexDB.editOrderIndex(this.OrderIndexDB.id,Number(this.orderOld!.DocNum!), Number(this.orderOld!.DocEntry!), this.orderOld!, 'cosmos')
      }
          
      OrderPost.NumAtCard = this.OrderIndexDB.id;
      let idTransaction;

      if(this.order?.DocNum)
        idTransaction = await this.transLog.addTransactionToIndex(action, this.OrderIndexDB.id,this.order?.DocNum, this.order?.DocEntry, OrderPost, "index")
      else
        idTransaction = await this.transLog.addTransactionToIndex(action, this.OrderIndexDB.id,0,0, OrderPost, "index")
      
      //Add the change for the change in Index status
      this.transLog.addTransactionLogToCosmos(OrderPost!.DocNum!,Number(OrderPost!.DocEntry!), idTransaction!, this.OrderIndexDB.id, action, OrderPost)
      this.transLog.editTransactionToIndex(this.OrderIndexDB.id, idTransaction!, action, OrderPost!.DocNum!,Number(OrderPost!.DocEntry!),'cosmos',OrderPost)
      //const idTransaction = "0";
      //console.log(JSON.stringify(this.orderOld, null, 3));
      console.log('aqui pasa el id transaction '+ idTransaction)

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

            // webWorker('editOrder',OrderPost).then((data) => {
            //   if(parseInt(data.statusCode!) >= 200 && parseInt(data.statusCode!) < 300)
            //   {
            //     console.log(data)
            //     this.cloudChange = "cloud_done";
            //     this.transLog.editTransactionToIndex(this.OrderIndexDB.id, idTransaction!, action, OrderPost!.DocNum!,Number(OrderPost!.DocEntry!),'complete',OrderPost)
            //     // const orderEdit: Order = JSON.parse(data.response);
            //     // console.log(orderEdit)
            //     //this.DocNumPublish = orderPublish!.DocNum;
            //     this.signalr.sendMessageAPI(JSON.stringify(OrderPost),'order', this.usernameAzure)
            //   }
            //   else
            //   {
            //     this.cloudChange = "cloud_off";
            //     console.error('Error:', data.response)
            //   }
            // })
            // .catch((error) => {
            //   this.cloudChange = "cloud_off";
            //   console.error('Error:', error);
            // });
          }
          else
          {
            this.cloudChange = 'cloud_done';

            // webWorker('postOrder',OrderPost).then((data) => {
            //   //console.log('Valor devuelto por el Web Worker:', data);
            //   if(parseInt(data.statusCode!) >= 200 && parseInt(data.statusCode!) < 300)
            //   {
            //     const orderPublish: Order = JSON.parse(data.response);
            //     this.order!.DocNum = orderPublish!.DocNum;
            //     this.order!.DocEntry = orderPublish!.DocEntry
    
            //     OrderPost.DocNum = orderPublish!.DocNum;
            //     OrderPost.DocEntry = orderPublish!.DocEntry.toString()

            //     this.indexDB.editOrderIndex(this.OrderIndexDB.id,Number(this.orderOld!.DocNum!), Number(this.orderOld!.DocEntry!), this.orderOld!, 'complete')
            //     this.transLog.editTransactionToIndex(this.OrderIndexDB.id, idTransaction!, action, OrderPost!.DocNum!,Number(OrderPost!.DocEntry!),'complete',OrderPost)
            //      //this.transactionService.editOrderLog(this.OrderReviewCopy,this.OrderReviewCopy.id, this.OrderReviewCopy.IdIndex);
            //     //this.indexDB.editOrderIndex(this.OrderIndexDB.id, orderPublish!.DocNum, orderPublish!.DocEntry, OrderPost, this.order!.CardCode, this.order!.DocumentLines, [])
            //      //this.actualicon = 'cloud_done';
            //     this.cloudChange = 'cloud_done';
            //   }
            //   else{
            //     //this.actualicon = 'cloud_off';
            //     this.cloudChange = 'cloud_off';
            //     console.error('Error:', data.response)
            //   }
            // })
            // .catch((error) => {
            //   //this.actualicon = 'cloud_off';
            //   this.cloudChange = 'cloud_off';
            //   console.error('Error:', error);
            // });
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
    this.dataSharing.setOrderCReview(undefined);
    this.dataSharing.setOrderIndexDB(undefined);
    this.myRouter.navigate(['dashboard/order-index']);
  }
  
  usernameAzure=''
  obtainUser() {
    this.auth.userAzure$.subscribe(
      (username: string) => {
        this.usernameAzure= username;
      },
      (error: any) => {
        this.usernameAzure= ''
      }
    );
  }


}

