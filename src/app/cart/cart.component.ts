import { Component, Renderer2 } from '@angular/core';
import { Value } from '../models/items';
import { ServiceService } from '../service/service.service';
import { ActivatedRoute, Router } from '@angular/router';
import { DocumentLines, Order } from '../models/car';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SnackbarsComponent } from '../snackbars/snackbars.component';
import { MatDialog } from '@angular/material/dialog';
import { DataSharingService } from '../service/data-sharing.service';
import Dexie from 'dexie';
import { IndexDbService } from '../service/index-db.service';
import { AppComponent, webWorker } from '../app.component';
import { DatePipe } from '@angular/common';
import { editToCosmosDB, publishToCosmosDB } from '../service/cosmosdb.service';
import { MsalService } from '@azure/msal-angular';
import { TransactionlogService } from '../service/transactionlog.service'

@Component({
  selector: 'app-cart',
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.css'],
  providers: [DatePipe]
})
export class CartComponent {

  ListItems!: Value[] ;
  searchText = '';
  CurrentSellsItem: Value | undefined;
  ItemName = "";
  Quantity = 0;
  Price = "";
  //Cart = new DocumentLinesList(onListChange);
  public Cart: DocumentLines[] | undefined;
  CartOld: DocumentLines[] | undefined;
  elementCart:any;
  OrderReview: Order | undefined;
  customer:any;
  private Db?: Dexie;
  OrderIndexDB?:any;
  DocNumPublish? = 0;
  DocEntryPublish? = '';
  actualicon : string ='cloud_queue';
  OrderReviewCopy: any;
  idCosmos = '';
  LineNumber=0;
  isOnline=true;

constructor(private renderer: Renderer2,private orderService: ServiceService, private dialog: MatDialog, private route: ActivatedRoute, private _snackBar: MatSnackBar, private myRouter: Router, private dataSharing: DataSharingService, private indexDB: IndexDbService, private pipe: DatePipe, private msalService: MsalService, private transactionService:TransactionlogService) {    
  this.Cart = dataSharing.getCartData();
  this.OrderIndexDB = dataSharing.getOrderIndexDB();
  this.LineNumber=0;
  // if(this.Cart === undefined)
  //     this.getDataIndex();
  if(this.Cart == undefined)
    this.Cart = []
  else
    this.CartOld = JSON.parse(JSON.stringify(this.Cart));

  // this.Db = new Dexie('order');
  // this.Db.version(1).stores({
  //   orders: '++id, DocNum, CardCode, DocumentLines',
  // });

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

obtainUser() {
  const activeAccount= this.msalService.instance.getActiveAccount();
  if (activeAccount) {
    return activeAccount.username;
  } else {
    return '';
  }
}

  ngOnInit(): void {
    //console.log(this.Cart)
    this.elementCart = "info-card image-card";
    this.orderService.getItems().subscribe((retData) => {

      if (parseInt(retData.statusCode!) >= 200 && parseInt(retData.statusCode!) < 300) {

        this.ListItems = JSON.parse(retData.response!);
        //console.log(this.ListItems)
      } else {

        this.openSnackBar(retData.response!, "error", "Error", "red");

      }

    });
    
    if(this.Cart!.length! > 0)
    {
      const element = document.getElementById('Cart');
        element!.classList.remove('image-card');
    }

    this.dataSharing.cartData$.subscribe((newCart) => {
      this.Cart = newCart;
      //console.log('actualizando carrito')
      //console.log(this.Cart)
    });

    this.dataSharing.docNum$.subscribe((newDocNum) => {
      this.DocNumPublish = newDocNum;
    });

    this.dataSharing.docEntry$.subscribe((newDocEntry) => {
      this.DocEntryPublish = newDocEntry.toString();
    });

    

    // this.dataSharing.OrderIndexDB$.subscribe((newIndex) => {

    //   if(this.OrderIndexDB != newIndex)
    //     this.OrderIndexDB = newIndex;
    // });


  }

  // async addToDB(data: Order): Promise<void> {
  //   //const DocNum = data.DocNum;
  //   const CardCode = data.CardCode;
  //   const DocumentLines = data.DocumentLines;

  //   try {
  //     const orderId = await this.Db!.table('orders').add({ CardCode, DocumentLines });
  //     const retrievedOrder = await this.Db!.table('orders').get(orderId);
  //     this.OrderIndexDB = retrievedOrder;
  //     console.log(retrievedOrder);

  //   } catch (error) {
  //     console.error('Error al añadir datos a la tabla1:', error);
  //   }
  // }

  // async editToDB(id: number, DocNum: string, CardCode: string, DocumentLines: DocumentLines[]): Promise<void> {
  //   try {
  //     await  this.Db!.table('orders').put({ id, DocNum, CardCode, DocumentLines });
  //     console.log("Se editó el registro con ID" +id+" en la tabla1.");

  //   } catch (error) {
  //     console.error('Error al editar datos en la tabla1:', error);
  //   }
  // }

  async getDataIndex(){
    const orderComplete = await this.indexDB.getLastOneDB();
    // console.log("pasa aqui")
    // console.log(orderComplete)

    if (window.confirm("You have an Order. \nDo you would continue editing this Order?")) {
      this.Cart = orderComplete.DocumentLines;
      this.dataSharing.setOrderCReview(orderComplete);
      this.dataSharing.setOrderIndexDB(orderComplete);
      this.dataSharing.setOrderReview(orderComplete);
      this.dataSharing.setCustomerData(orderComplete.CardCode)
      //console.log(this.Cart)

      const element = document.getElementById('Cart');
      element!.classList.remove('image-card');
    } else {
      this.Cart == undefined;
    }
  }

  addToCart(){
    
    if(this.ItemName != "")
    {
      if(this.Quantity > 0)
      {
        const element = document.getElementById('Cart');
        element!.classList.remove('image-card');
        
        const newDocumentLine: DocumentLines = {
          ItemCode: this.searchText,
          ItemDescription: this.ItemName,
          Quantity: this.Quantity,
          TaxCode: "EX",
          //UnitPrice: this.Price,
          LineTotal: parseFloat(this.Price) * this.Quantity,
          U_Comments: "",
          Icon: 'cloud_queue',
          LineNum:this.LineNumber
        };
        
        this.Cart?.push(newDocumentLine);
        this.LineNumber++; 
        this.changeOrder(this.Cart!.length - 1, this.Cart!);

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

  updateTotal(index:number,item: DocumentLines) {
    if(item.UnitPrice)
    {
      //this.Cart.updateItem(index, item);
      this.changeOrder(index, this.Cart!);
      item.LineTotal = item.UnitPrice * item.Quantity!;
    }
      
  }

  updateComment(index: number) {
      this.changeOrder(index,this.Cart!);
      
  }

  subTotal()
  {
    //return this.Cart.getSumLineTotals();
    return this.Cart!.reduce((acum:number, elemento:any) => acum + elemento.LineTotal, 0);
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

  RemoveToCart(index: number){
    this.Cart!.splice(index, 1);
    //this.Cart.removeItem(index);
    this.changeOrder(index,this.Cart!);
    this.cleanSearching();

    if(this.Cart!.length === 0)
    {
      const miDiv = document.getElementById('Cart');
      miDiv!.classList.add('image-card');
    }
      
  }

  cleanSearching()
  {
    this.ItemName = "";
    this.Quantity = 0;
    this.Price = "";
    this.searchText = "";
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

  nextWindow()
  {
    // this.OrderReview = new Order();
    // this.customer = this.dataSharing.getCustomerData();
    //  this.OrderReview!.CardCode = this.customer.CardCode;
    //this.OrderReview!.DocumentLines = this.Cart!;
    if(this.Cart!.length != 0)
    {
      this.dataSharing.setCartData(this.Cart);
      if(this.OrderReview === undefined)
        this.OrderReview = this.dataSharing.getOrderReview()
      else
        this.dataSharing.setOrderReview(this.OrderReview)

      console.log(this.OrderReview)
      this.myRouter.navigate(['dashboard/order-review']);
      //this.router.navigate(['dashboard/allocation/info/'+index.DocNum], { queryParams: { dataOrder: OrderText } });
    }
    else
    {
      this.openSnackBar("You Need Add Items to Cart", "error", "Error", "red");
    }
  }

  backWindow()
  {
    this.dataSharing.setCartData(this.Cart);
    this.myRouter.navigate(['dashboard/order-customer/new-order']);
  }

  getDocNum()
  {
    if(this.DocNumPublish != 0)
    {
      this.OrderReview!.DocNum! = this.DocNumPublish!;
      this.OrderReview!.DocEntry = this.DocEntryPublish;
    return this.DocNumPublish;
    }
    else
      return '...';
  }

  async changeOrder(index:number | undefined,order:DocumentLines[])
  {
    if(order !== this.CartOld)
    {
      //this.actualicon = 'cloud_queue'
      if(index != undefined)
        order[index].Icon = 'cloud_queue'

      this.OrderReview = new Order();
      const today = new Date();
      const dateDelivery = this.pipe.transform(today, 'yyyy-MM-dd');
      //console.log(dateDelivery)
      this.OrderReview!.DocDate = dateDelivery?.toString();
      this.OrderReview!.DocDueDate = dateDelivery?.toString();
      this.OrderReview!.TaxDate = dateDelivery?.toString();
      this.customer = this.dataSharing.getCustomerData();
      this.OrderReview!.CardCode = this.customer.CardCode;
      this.OrderReview!.DocumentLines = this.Cart;

      this.dataSharing.setCartData(this.Cart);
      //console.log(this.OrderIndexDB)
      if(this.Cart!.length! === 1 && this.OrderIndexDB === undefined)
      {
        this.OrderIndexDB = await this.indexDB.addOrderIndex(this.OrderReview, 'index')
        //this.dataSharing.updateIndexOrder(this.OrderIndexDB)
        this.OrderReview!.NumAtCard = this.OrderIndexDB.id;
        this.OrderReviewCopy = JSON.parse(JSON.stringify(this.OrderReview));
        this.OrderReviewCopy.User = this.obtainUser();
        this.OrderReviewCopy.IdIndex = String(this.OrderIndexDB.id);

        if(this.isOnline == true)
          this.updateOrderCloud('publish', index,order);
        ////there was the procces to publish order in cosmos and SAP

        // this.OrderReviewCopy = this.OrderReview;
        // this.OrderReviewCopy.id = this.idCosmos;
        // this.OrderReview!.DocNum = '12345'
        // editToCosmosDB(this.OrderReviewCopy)
        // this.indexDB.editToDB(this.OrderIndexDB.id,this.OrderReview!.DocNum!.toString(), this.OrderReview!, this.customer.CardCode, this.Cart!)
            
        console.log(this.OrderIndexDB)
        console.log(this.OrderIndexDB.id)
      }
      else
      {
        this.OrderReview.DocNum = this.DocNumPublish;
        this.OrderReview.DocEntry = this.DocEntryPublish;
        this.OrderReview!.DocumentLines = this.Cart;
        this.OrderIndexDB.DocumentLines = this.Cart;
        console.log('pasa en el index db')
        console.log(this.OrderIndexDB)

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
        
        this.indexDB.editOrderIndex(this.OrderIndexDB.id,Number(this.OrderReview!.DocNum!), Number(this.OrderReview!.DocEntry!), this.OrderReview!, 'index')
        this.OrderReviewCopy = JSON.parse(JSON.stringify(this.OrderReview));
        this.OrderReviewCopy.id = this.idCosmos;
        this.OrderReviewCopy.User = this.obtainUser();
        this.OrderReviewCopy.IdIndex = String(this.OrderIndexDB.id);
        //this.transactionService.editOrderLog(this.OrderReview,this.OrderReviewCopy.id, this.OrderReviewCopy.IdIndex);
        
        ////there was the procces to publish order in cosmos and SAP
        if(this.isOnline == true)
          this.updateOrderCloud('', index,order);

        //console.log(this.OrderIndexDB)
        //console.log(this.OrderIndexDB.id)
        //Cuando pase el webworker, agregue el docnum
        //console.log(this.DocNumPublish)
        //webWorker('postOrder',this.OrderReview)
        
      }

      this.dataSharing.setOrderReview(this.OrderReview)
      this.dataSharing.setCartData(this.Cart);
      this.dataSharing.setOrderIndexDB(this.OrderIndexDB)
      

      //console.log(order)
    }
  }

  
  async updateOrderCloud(type: string, index:number | undefined,order:DocumentLines[])
  {
    if(type == 'publish')
    {
      this.idCosmos = await publishToCosmosDB(this.OrderReviewCopy)
        console.log(this.idCosmos)
        
        webWorker('postOrder',this.OrderReview!, 'token1').then((data) => {
          //console.log('Valor devuelto por el Web Worker:', data);
          if(parseInt(data.statusCode!) >= 200 && parseInt(data.statusCode!) < 300)
          {
            const orderPublish: Order = JSON.parse(data.response);
            this.DocNumPublish = orderPublish!.DocNum;
            this.DocEntryPublish = orderPublish!.DocEntry

            this.OrderReview!.DocNum = this.DocNumPublish;
            this.OrderReview!.DocEntry = this.DocEntryPublish;

            this.OrderReviewCopy = this.OrderReview;
            this.OrderReviewCopy.id = this.idCosmos;
            editToCosmosDB(this.OrderReviewCopy)
            //this.transactionService.editOrderLog(this.OrderReviewCopy,this.OrderReviewCopy.id, this.OrderReviewCopy.IdIndex);
            this.indexDB.editOrderIndex(this.OrderIndexDB.id,Number(this.OrderReview!.DocNum!), Number(this.OrderReview!.DocEntry!), this.OrderReview!, "complete")
            //this.actualicon = 'cloud_done';
            this.Cart![0].Icon= 'cloud_done';
          }
          else{
            //this.actualicon = 'cloud_off';
            this.Cart![0].Icon = 'cloud_off';
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
      editToCosmosDB(this.OrderReviewCopy)
        console.log('Este es el del index en editar')
        console.log(this.OrderIndexDB)

       // this.indexDB.editToDB(this.OrderIndexDB.id,this.OrderReview!.DocNum!.toString(), this.OrderReview!, this.customer.CardCode, this.Cart!)
        webWorker('editOrder',this.OrderReview!, 'token1').then((data) => {
          //console.log('Valor devuelto por el Web Worker edit:', data);
          if(parseInt(data.statusCode!) >= 200 && parseInt(data.statusCode!) < 300)
          {
            // const orderEdit: Order = JSON.parse(data.response);
            // console.log(orderEdit)
            //this.DocNumPublish = orderPublish!.DocNum;
            //this.actualicon = 'cloud_done';
            if(index != undefined)
              order[index].Icon = 'cloud_done';
            this.indexDB.editOrderIndex(this.OrderIndexDB.id,Number(this.OrderReview!.DocNum!), Number(this.OrderReview!.DocEntry!), this.OrderReview!, 'complete')
          }
          else{
            if(index != undefined)
              order[index].Icon = 'cloud_off';
            //this.actualicon = 'cloud_off';
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

}


