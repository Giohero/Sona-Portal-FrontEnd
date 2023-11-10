import { Component, Renderer2 } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MsalService } from '@azure/msal-angular';
import { IndexDbService } from '../service/index-db.service';
import { DataSharingService } from '../service/data-sharing.service';
import { TransactionlogService } from '../service/transactionlog.service';
import { SnackbarsComponent } from '../snackbars/snackbars.component';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent {
  isOnline = true;
  TransactionIndexDB: any;
  OrderIndexDB: any;

  constructor(private msalService: MsalService, private dialog: MatDialog,private renderer: Renderer2, private indexDB: IndexDbService,private dataSharing: DataSharingService,private transLog: TransactionlogService,){
    window.addEventListener('online', async () => {
      this.renderer.removeClass(document.body, 'offline');
      this.isOnline = true;
      dataSharing.updateWifi(this.isOnline)

      this.openSnackBar('You\'re online.', "wifi", "Connected!", "green");
      
      var orderIndex = dataSharing.getOrderIndexDB();
      var orderIndexLastVersion = orderIndex.transaction_order[orderIndex.transaction_order.length - 1].order;
      console.log('Este es el de Index que trajimos del servicio')
      console.log(orderIndex)
      if(orderIndex ===  null)
         orderIndex = this.OrderIndexDB;
      // if(orderIndex == null)
      // {
      //   orderIndex = await indexDB.getLastOneDB();
      //   orderIndexLastVersion = orderIndex.transaction_order[orderIndex.transaction_order.length - 1].order;
      //   dataSharing.setOrderIndexDB(orderIndex)
      //   console.log('Este es el de Cosmos')
      //   console.log(orderIndex)
      // }

      
      /*if(orderIndex != null)
      {
        console.log(orderIndex.id)
        var orderCosmos = await getFromCosmosDBByIndexId(orderIndex.id, 'order_log');
        // console.log('este es el index')
        // console.log(orderIndex)
        console.log('este es el cosmos')
        console.log(orderCosmos)

        if(orderCosmos != null)
        {
          orderCosmos.DocDate = orderIndexLastVersion.DocDate;
          orderCosmos.DocDueDate = orderIndexLastVersion.DocDueDate;
          orderCosmos.TaxDate = orderIndexLastVersion.TaxDate;
          orderCosmos.CardCode = orderIndexLastVersion.CardCode;
          orderCosmos.DocumentLines = orderIndexLastVersion.DocumentLines;
          orderCosmos.NumAtCard = orderIndexLastVersion.id;
          orderCosmos.transaction_order  = orderIndexLastVersion.transaction_order ;
          //orderCosmos.DocNum = orderIndex.DocNum;
          //orderCosmos.DocEntry = orderIndex.DocEntry;

          this.TransactionIndexDB.id = '';
          transLog.AddTransactionLogDirectToCosmos(this.TransactionIndexDB)
          indexDB.EditOrderLogDirectToCosmos(orderIndex.id, orderIndex);
          console.log(orderCosmos)
          console.log(orderCopyIndex)
          if(orderCosmos.DocumentLines != null)
          { //falta hacer pruebas con la orden 
            console.log('Deberia editar la orden ')
            webWorker("editOrder", orderCosmos).then((data) => {
              //console.log('Valor devuelto por el Web Worker:', data);
              if(parseInt(data.statusCode!) >= 200 && parseInt(data.statusCode!) < 300)
              {
                //this.Cart![0].Icon= 'cloud_done';
                //const orderPublish: Order = JSON.parse(data.response);
                orderIndexLastVersion.DocumentLines.forEach((x:any) => x.Icon = "cloud_done")
                
                dataSharing.updateCart(orderIndexLastVersion.DocumentLines);
                dataSharing.updateIdsOrder(orderCosmos.DocNum, orderCosmos.DocEntry)
                dataSharing.setCartData(orderIndexLastVersion.DocumentLines);
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
        }
        else
        {
          console.log('No se encontro en cosmos, publicaremos la orden en Cosmos y SAP')
          var orderCopyIndex = JSON.parse(JSON.stringify(orderIndex));
          orderCopyIndex.User = this.obtainUser();
          orderCopyIndex.NumAtCard = orderIndex.id;
          orderCopyIndex.IdIndex = orderIndex.id;
          orderCopyIndex.transaction_order = orderCopyIndex.transaction_order;
          orderCopyIndex.id  = await indexDB.EditOrderLogDirectToCosmos( orderCopyIndex.IdIndex,orderCopyIndex);

          this.TransactionIndexDB.id = '';
          //this.TransactionIndexDB.DocNum checar
          transLog.AddTransactionLogDirectToCosmos(this.TransactionIndexDB)
          //console.log(orderIndexLastVersion)
          //console.log(orderCopyIndex)
          if(orderCopyIndex.DocumentLines != null)
          { //poner un metodo donde verifique que exista la orden y solo se actualice, sino que se publique
            console.log('Deberia publicar la orden')
            webWorker("postOrder", orderIndexLastVersion).then((data) => {
              //console.log('Valor devuelto por el Web Worker:', data);
              if(parseInt(data.statusCode!) >= 200 && parseInt(data.statusCode!) < 300)
              {
                //this.Cart![0].Icon= 'cloud_done';
                const orderPublish: Order = JSON.parse(data.response);
                orderIndexLastVersion.DocumentLines.forEach((x:any) => x.Icon = "cloud_done")
                
                console.log(orderPublish.DocEntry)
                dataSharing.setCartData(orderIndexLastVersion.DocumentLines);
                dataSharing.updateIdsOrder(orderPublish.DocNum, orderPublish.DocEntry)
                dataSharing.updateCart(orderIndexLastVersion.DocumentLines);
                orderCopyIndex.DocNum = orderPublish.DocNum;
                orderCopyIndex.DocEntry = orderPublish.DocEntry;
                //orderCopyIndex.id = idCosmos;

                if(orderCopyIndex.id != null || orderCopyIndex.id != undefined)
                  EditToCosmosDB(orderCopyIndex, 'order_log')
                //this.transactionService.editOrderLog(this.OrderReviewCopy,this.OrderReviewCopy.id, this.OrderReviewCopy.IdIndex);
                this.indexDB.editOrderIndex(orderIndex.id,orderCopyIndex!.DocNum!, orderCopyIndex.DocEntry, orderCopyIndex!, orderIndexLastVersion.CardCode, orderIndexLastVersion.DocumentLines, [])
                orderIndex = dataSharing.getOrderIndexDB();
                dataSharing.updateIndexOrder(orderIndex)
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
            
          //webWorker("editOrder", orderIndex)
        }
      }*/

      

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


  ngOnInit(): void {
    this.dataSharing.TransactionIndexDB$.subscribe((newTransIndex) => {
      this.TransactionIndexDB = newTransIndex;
    });

    this.dataSharing.OrderIndexDB$.subscribe((newOrderIndex) => {
      this.OrderIndexDB = newOrderIndex;
    });
  }
}
