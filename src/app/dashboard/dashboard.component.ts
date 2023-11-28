import { Component, Renderer2 } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MsalService } from '@azure/msal-angular';
import { IndexDbService } from '../service/index-db.service';
import { DataSharingService } from '../service/data-sharing.service';
import { TransactionlogService } from '../service/transactionlog.service';
import { SnackbarsComponent } from '../snackbars/snackbars.component';
import { EditToCosmosDB, getFromCosmosDBByIndexId } from '../service/cosmosdb.service';
import { webWorker } from '../app.component';
import { Order } from '../models/order';
import { AuthService } from '../service/auth.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})

//Checar el paso de la cart porque lo pone indefinido (cuando actualizamos una orden)


export class DashboardComponent {
  isOnline = true;
  TransactionIndexDB: any;
  OrderIndexDB: any;


  //checar los estados de orders, sacar los que no tengan complete, y publicarlos
  //si hay una transaccion activa, no subirlo y primero checar si existe la orden en sap para actualizarlo
  constructor(private msalService: MsalService, private dialog: MatDialog,private renderer: Renderer2, private indexDB: IndexDbService,private dataSharing: DataSharingService,private transLog: TransactionlogService, private auth: AuthService){
    //auth.getProfile()
    //auth.getTokenMSAL()
    
    window.addEventListener('online', async () => {
      this.renderer.removeClass(document.body, 'offline');
      this.isOnline = true;
      dataSharing.updateWifi(this.isOnline)

      this.openSnackBar('You\'re online.', "wifi", "Connected!", "green");
      
      console.log('Este es el de Index que trajimos del servicio')

      var getOrdersNotUpdated = await indexDB.getAllOrdersWithoutUpdate(); //obtain since index db

      if(getOrdersNotUpdated != undefined)
      {
        for (const orderIndex of getOrdersNotUpdated) {

          console.log(orderIndex)
          //console.log(orderIndex.Order.DocumentLines)

          if(orderIndex.Order.DocumentLines != undefined && orderIndex.Order.CardCode != undefined)
          {
            console.log(orderIndex.status)
            if(orderIndex.status === 'cosmos')
            {
              console.log(orderIndex.id)
              var orderCosmos = await getFromCosmosDBByIndexId(orderIndex.id, 'transaction_log');
              console.log('este es el cosmos')
              console.log(orderCosmos)
      
              if(orderCosmos != null)
              {
                orderCosmos.IdIndex = orderIndex.id;
                orderCosmos.Action = 'Create_Order';
                orderCosmos.User = this.obtainUser()
                orderCosmos.Timestamp = orderIndex.Timestamp;
                orderCosmos.DocNum = orderIndex.DocNum;
                orderCosmos.DocEntry = orderIndex.DocEntry;
                orderCosmos.Order = orderIndex.Order;
                
                indexDB.EditOrderLogDirectToCosmos(orderIndex.id, orderCosmos);
                console.log(orderCosmos)
                
                if(orderCosmos.DocEntry === undefined)
                  this.PublishOrderSAP(orderIndex.Order,orderCosmos,orderIndex)
                else
                  this.EditOrderSAP(orderCosmos,orderIndex.Order)
              }
              else 
              {
                console.log('No se encontro en cosmos, publicaremos la orden en Cosmos y SAP')
                var orderCopyIndex: any;
                orderCopyIndex = {};
                orderCopyIndex.IdIndex = orderIndex.id;
                orderCopyIndex.Action = 'Create_Order';
                orderCopyIndex.User = this.obtainUser();
                orderCopyIndex.Timestamp = orderIndex.Timestamp;
                orderCopyIndex.Order = JSON.parse(JSON.stringify(orderIndex.Order));
                
                orderCopyIndex.id  = await indexDB.EditOrderLogDirectToCosmos(orderCopyIndex.IdIndex,orderCopyIndex);
                if(orderCopyIndex.id != undefined)
                    this.indexDB.editOrderIndex(orderIndex.id,Number(orderIndex.DocNum), Number(orderIndex.DocEntry!), orderIndex.Order, 'cosmos')
                
                if(orderIndex.DocEntry === undefined || orderIndex.DocEntry === 0)
                  this.PublishOrderSAP(orderIndex.Order,orderCopyIndex,orderIndex)
                else
                  this.EditOrderSAP(orderIndex,orderIndex.Order)
              }
            }
            else if(orderIndex.status === 'index')
            {
              console.log('No se encontro en cosmos, publicaremos la orden en Cosmos y SAP')
              orderCopyIndex = {};
              orderCopyIndex.IdIndex = orderIndex.id;
              orderCopyIndex.Action = 'Create_Order';
              orderCopyIndex.User = this.obtainUser();
              orderCopyIndex.Timestamp = orderIndex.Timestamp;
              orderCopyIndex.Order = JSON.parse(JSON.stringify(orderIndex.Order));
              
              orderCopyIndex.id  = await indexDB.EditOrderLogDirectToCosmos(orderCopyIndex.IdIndex,orderCopyIndex);
              if(orderCopyIndex.id != undefined)
                  this.indexDB.editOrderIndex(orderIndex.id,Number(orderIndex.DocNum), Number(orderIndex.DocEntry!), orderIndex.Order, 'cosmos')
              
            if(orderIndex.DocEntry === undefined || orderIndex.DocEntry === 0)
              this.PublishOrderSAP(orderIndex.Order,orderCopyIndex,orderIndex)
            else
              this.EditOrderSAP(orderIndex,orderIndex.Order)
            }
          }
          else
          {
            console.log('No se encontro en cosmos, la publicaremos, porque no cumple con los requisitos para sap')
              orderCopyIndex = {};
              orderCopyIndex.IdIndex = orderIndex.id;
              orderCopyIndex.Action = 'Create_Order';
              orderCopyIndex.User = this.obtainUser(); [ ]
              orderCopyIndex.Timestamp = orderIndex.Timestamp;
              orderCopyIndex.Order = JSON.parse(JSON.stringify(orderIndex.Order));
              
              orderCopyIndex.id  = await indexDB.EditOrderLogDirectToCosmos(orderCopyIndex.IdIndex,orderCopyIndex);
              if(orderCopyIndex.id != undefined)
                  this.indexDB.editOrderIndex(orderIndex.id,Number(orderIndex.DocNum), Number(orderIndex.DocEntry!), orderIndex.Order, 'cosmos')
          }
        }
      }
      else
        this.openSnackBar('Orders updated.', "wifi", "Update!", "green");
      
  });

    window.addEventListener('offline', () => {
      this.renderer.addClass(document.body, 'offline');
      this.isOnline = false;
      console.log(this.isOnline)
      dataSharing.updateWifi(this.isOnline)
      //console.log("ESTAS EN FUERA DE LINEA")
      this.openSnackBar('You\'re offline.', "wifi_off", "Disconnected", "darkorange");
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

  PublishOrderSAP(orderIndexLastVersion:any, orderCopyIndex:any, orderIndex:any){
    webWorker("postOrder", orderIndexLastVersion).then((data) => {
      console.log('Deberia publicar la orden')
      //console.log('Valor devuelto por el Web Worker:', data);
      if(parseInt(data.statusCode!) >= 200 && parseInt(data.statusCode!) < 300)
      {
        //this.Cart![0].Icon= 'cloud_done';
        const orderPublish: Order = JSON.parse(data.response);
        orderIndexLastVersion.DocumentLines.forEach((x:any) => x.Icon = "cloud_done")
        
        console.log(orderPublish.DocEntry)
        this.dataSharing.setCartData(orderIndexLastVersion.DocumentLines);
        this.dataSharing.updateIdsOrder(orderPublish.DocNum, orderPublish.DocEntry)
        this.dataSharing.updateCart(orderIndexLastVersion.DocumentLines);
        orderCopyIndex.DocNum = orderPublish.DocNum;
        orderCopyIndex.DocEntry = orderPublish.DocEntry;
        //orderCopyIndex.id = idCosmos;

        if(orderCopyIndex.id != null || orderCopyIndex.id != undefined)
          EditToCosmosDB(orderCopyIndex, 'transaction_log')
        //this.transactionService.editOrderLog(this.OrderReviewCopy,this.OrderReviewCopy.id, this.OrderReviewCopy.IdIndex);
        this.indexDB.editOrderIndex(orderIndex.id,orderPublish!.DocNum!, orderPublish.DocEntry, orderCopyIndex.Order, 'complete')
        orderIndex = this.dataSharing.getOrderIndexDB();
        this.dataSharing.updateIndexOrder(orderIndex)
        //dataSharing.setOrderReview(orderPublish)
        // console.log("Pasan los document del cloud")
        console.log(orderIndex)

      }
      else{
        this.openSnackBar(data.response!, "error", "Error", "red");
        //console.error('Error:', data.response)
      }
    })
    .catch((error) => {
      this.openSnackBar(error!, "error", "Error", "red");
    });
  }

  EditOrderSAP(orderCosmos: any, orderIndexLastVersion:any){
    webWorker("editOrder", orderCosmos).then((data) => {
      console.log('Deberia editar la orden ')
      //console.log('Valor devuelto por el Web Worker:', data);
      if(parseInt(data.statusCode!) >= 200 && parseInt(data.statusCode!) < 300)
      {
        //this.Cart![0].Icon= 'cloud_done';
        //const orderPublish: Order = JSON.parse(data.response);
        orderIndexLastVersion.DocumentLines.forEach((x:any) => x.Icon = "cloud_done")
        
        this.dataSharing.updateCart(orderIndexLastVersion.DocumentLines);
        this.dataSharing.updateIdsOrder(orderCosmos.DocNum, orderCosmos.DocEntry)
        this.dataSharing.setCartData(orderIndexLastVersion.DocumentLines);

        //dataSharing.setOrderReview(orderPublish)
        // console.log("Pasan los document del cloud")
        // console.log(orderIndex.DocumentLines)

      }
      else{
        this.openSnackBar(data.response!, "error", "Error", "red");
        //console.error('Error:', data.response)
      }
    })
    .catch((error) => {
      this.openSnackBar(error!, "error", "Error", "red");
    });
  }

  ngOnInit(): void {
    this.dataSharing.TransactionIndexDB$.subscribe((newTransIndex) => {
      this.TransactionIndexDB = newTransIndex;
    });

    this.dataSharing.OrderIndexDB$.subscribe((newOrderIndex) => {
      this.OrderIndexDB = newOrderIndex;
    });


    //this.auth.initializeAuthState()
  }
}



