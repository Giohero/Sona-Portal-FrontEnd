import { Component, HostListener, Renderer2 } from '@angular/core';
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
import { SignalRService } from '../service/signalr.service';
import { IndexItemsService } from '../service/index-items.service';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs';
import { UsersAzure, UsersSR } from '../models/userSignalR';
import { DialogRechargeComponent } from '../dialog-recharge/dialog-recharge.component';
import { GeolocationService } from '../service/geolocation.service';
import {getTradeshowLogs, publishTradeshowToCosmosDB } from '../service/cosmosdb.service';

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
  tokenAzure= '';
  UsersAzure: UsersAzure = {};
  usernameAzure = '';
  nameAzure = '';
  location: GeolocationPosition | null = null;
  tradeshow = '';
  previousURL = '';
  dialogStyle={
    'margin': '3px'
  }

  //checar los estados de orders, sacar los que no tengan complete, y publicarlos
  //si hay una transaccion activa, no subirlo y primero checar si existe la orden en sap para actualizarlo
  constructor(private msalService: MsalService, private dialog: MatDialog,private renderer: Renderer2, private indexDB: IndexDbService,private dataSharing: DataSharingService,private transLog: TransactionlogService, private auth: AuthService,private signalRService: SignalRService, private serviceItem:IndexItemsService, private router: Router, private signalr: SignalRService, private geoService: GeolocationService){
    //auth.getProfile()
    //auth.getTokenMSAL()
    //console.log("Rectificando si existe los items")
    //serviceItem.getItemsIndesxDB(serviceItem);

    //console.log(signalRService.getConnectionState())

    // const dialogRef = this.dialog.open(DialogRechargeComponent, {
    //   //height:'60px',
    //   //width:"60px",
    //   //panelClass: 'fixWindow',
    //   position: {
    //     bottom: '50px',
    //     right: '60px',
    //   },
    //   data: {NumberOrders: 3},
    //   hasBackdrop: false,
    //   //panelClass: 'fixWindow'
    // });

    //This ejecuted when is get back the online web
    window.addEventListener('online', async () => {
      this.renderer.removeClass(document.body, 'offline');
      this.isOnline = true;
      dataSharing.updateWifi(this.isOnline)

      console.log(msalService.instance.getActiveAccount())
      console.log(this.usernameAzure)
      //restart the connection of Signal 
      if(this.usernameAzure != undefined)
        this.signalRService.startConnection();

      this.openSnackBar('You\'re online.', "wifi", "Connected!", "green");
      
      //console.log('Update Orders in Offline')

      var getOrdersNotUpdated = await indexDB.getAllOrdersWithoutUpdate(); //obtain since index db

      //console.log(getOrdersNotUpdated)
      if(getOrdersNotUpdated != undefined)
      {
        //Create the dialog
        const dialogRef = this.dialog.closeAll();
        if(getOrdersNotUpdated.length > 0)
        {
          this.dialog.open(DialogRechargeComponent, {
            //width: '400px',
            //height: "auto",
            position: {
              bottom: '50px',
              right: '60px'
            },
            data: {NumberOrders: getOrdersNotUpdated.length},
            hasBackdrop: false,
            panelClass: 'fixWindow'
          });
        }

        for (const orderIndex of getOrdersNotUpdated) {

          //console.log(orderIndex)
          //console.log(orderIndex.Order.DocumentLines)
          dataSharing.updateOrderRecharge(orderIndex)

          if(orderIndex.Order.DocumentLines != undefined && orderIndex.Order.CardCode != undefined)
          {
            //console.log(orderIndex.status)
            if(orderIndex.status === 'cosmos')
            {
              //console.log(orderIndex.id)
              var orderCosmos = await getFromCosmosDBByIndexId(orderIndex.id, 'transaction_log');
              //console.log('este es el cosmos')
              //console.log(orderCosmos)
      
              if(orderCosmos != null)
              {
                dataSharing.updateMessageRecharge({idIndex: orderIndex.id, message: 'Update Cosmos'})
                orderCosmos.IdIndex = orderIndex.id;
                orderCosmos.Action = 'Create_Order';
                orderCosmos.User = this.obtainUser()
                orderCosmos.Timestamp = orderIndex.Timestamp;
                orderCosmos.DocNum = orderIndex.DocNum;
                orderCosmos.DocEntry = orderIndex.DocEntry;
                orderCosmos.Order = orderIndex.Order;
                
                indexDB.EditOrderLogDirectToCosmos(orderIndex.id, orderCosmos);
                //console.log(orderCosmos)
                
                if(orderCosmos.DocEntry === undefined || orderCosmos.DocEntry === 0 || Number.isNaN(orderCosmos.DocEntry))
                {
                  dataSharing.updateMessageRecharge({idIndex: orderIndex.id, message: 'Publish in SAP'})
                  delete orderIndex.Order.DocNum;
                  delete orderIndex.Order.DocEntry;
                  //console.log(orderIndex.Order)
                  this.PublishOrderSAP(orderIndex.Order,orderCosmos,orderIndex)
                }
                else
                {
                  dataSharing.updateMessageRecharge({idIndex: orderIndex.id, message: 'Update in SAP'})
                  this.EditOrderSAP(orderCosmos,orderIndex.Order, orderIndex)
                }  
              }
              else 
              {
                var orderCopyIndex: any;
                orderCopyIndex = {};
                orderCopyIndex.IdIndex = orderIndex.id;
                orderCopyIndex.Action = 'Create_Order';
                orderCopyIndex.User = this.obtainUser();
                orderCopyIndex.Timestamp = orderIndex.Timestamp;
                orderCopyIndex.Order = JSON.parse(JSON.stringify(orderIndex.Order));
                
                dataSharing.updateMessageRecharge({idIndex: orderIndex.id, message: 'Publish in Cosmos'})
                orderCopyIndex.id  = await indexDB.EditOrderLogDirectToCosmos(orderCopyIndex.IdIndex,orderCopyIndex);
                if(orderCopyIndex.id != undefined)
                    this.indexDB.editOrderIndex(orderIndex.id,Number(orderIndex.DocNum), Number(orderIndex.DocEntry!), orderIndex.Order, 'cosmos', '')
                
                if(orderIndex.DocEntry === undefined || orderIndex.DocEntry === 0 || Number.isNaN(orderCosmos.DocEntry))
                {
                  delete orderIndex.Order.DocNum;
                  delete orderIndex.Order.DocEntry;
                  dataSharing.updateMessageRecharge({idIndex: orderIndex.id, message: 'Publish in SAP'})
                  this.PublishOrderSAP(orderIndex.Order,orderCopyIndex,orderIndex)
                }
                else
                {
                  dataSharing.updateMessageRecharge({idIndex: orderIndex.id, message: 'Update in SAP'})
                  this.EditOrderSAP(orderIndex,orderIndex.Order, orderIndex)
                }
              }
            }
            else if(orderIndex.status === 'index')
            {
              //console.log('Publish in Cosmos and SAP')
              dataSharing.updateMessageRecharge({idIndex: orderIndex.id, message: 'Publish in Cosmos'})
              orderCopyIndex = {};
              orderCopyIndex.IdIndex = orderIndex.id;
              orderCopyIndex.Action = 'Create_Order';
              orderCopyIndex.User = this.obtainUser();
              orderCopyIndex.Timestamp = orderIndex.Timestamp;
              orderCopyIndex.Order = JSON.parse(JSON.stringify(orderIndex.Order));
              
              orderCopyIndex.id  = await indexDB.EditOrderLogDirectToCosmos(orderCopyIndex.IdIndex,orderCopyIndex);
              if(orderCopyIndex.id != undefined)
                  this.indexDB.editOrderIndex(orderIndex.id,Number(orderIndex.DocNum), Number(orderIndex.DocEntry!), orderIndex.Order, 'cosmos', '')
              
              if(orderIndex.DocEntry === undefined || orderIndex.DocEntry === 0 || Number.isNaN(orderCosmos.DocEntry))
              {
                this.PublishOrderSAP(orderIndex.Order,orderCopyIndex,orderIndex)
                dataSharing.updateMessageRecharge({idIndex: orderIndex.id, message: 'Publish in SAP'})
              }
              else
              {
                this.EditOrderSAP(orderIndex,orderIndex.Order, orderIndex)
                dataSharing.updateMessageRecharge({idIndex: orderIndex.id, message: 'Update in SAP'})
              }
            }
          }
          else
          {
            //console.log('Publish only Cosmos, doesnt have the requirents for publish in SAP')
            dataSharing.updateMessageRecharge({idIndex: orderIndex.id, message: 'Publish only Cosmos, doesnt have the requirents for publish in SAP'})
            orderCopyIndex = {};
            orderCopyIndex.IdIndex = orderIndex.id;
            orderCopyIndex.Action = 'Create_Order';
            orderCopyIndex.User = this.obtainUser(); [ ]
            orderCopyIndex.Timestamp = orderIndex.Timestamp;
            orderCopyIndex.Order = JSON.parse(JSON.stringify(orderIndex.Order));
            
            orderCopyIndex.id  = await indexDB.EditOrderLogDirectToCosmos(orderCopyIndex.IdIndex,orderCopyIndex);
            if(orderCopyIndex.id != undefined)
                this.indexDB.editOrderIndex(orderIndex.id,Number(orderIndex.DocNum), Number(orderIndex.DocEntry!), orderIndex.Order, 'cosmos', '')
          }
        }
      }
      else
        this.openSnackBar('Orders updated.', "wifi", "Update!", "green");
      
  });

    window.addEventListener('offline', () => {
      this.renderer.addClass(document.body, 'offline');
      this.isOnline = false;
      //console.log(this.isOnline)
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
    webWorker("postOrder", orderIndexLastVersion, this.tokenAzure).then((data) => {
      console.log('Publish to SAP')

      console.log(orderIndex)
      //console.log('Valor devuelto por el Web Worker:', data);
      if(parseInt(data.statusCode!) >= 200 && parseInt(data.statusCode!) < 300)
      {
        //this.Cart![0].Icon= 'cloud_done';
        const orderPublish: Order = JSON.parse(data.response);
        orderIndexLastVersion.DocumentLines.forEach((x:any) => x.Icon = "cloud_done")
        
        //console.log(orderPublish.DocEntry)
        this.dataSharing.setCartData(orderIndexLastVersion.DocumentLines);
        this.dataSharing.updateIdsOrder(orderPublish.DocNum, orderPublish.DocEntry)
        this.dataSharing.updateCart(orderIndexLastVersion.DocumentLines);
        orderCopyIndex.DocNum = orderPublish.DocNum;
        orderCopyIndex.DocEntry = orderPublish.DocEntry;
        //orderCopyIndex.id = idCosmos;

        if(orderCopyIndex.id != null || orderCopyIndex.id != undefined)
          EditToCosmosDB(orderCopyIndex, 'transaction_log')
        //this.transactionService.editOrderLog(this.OrderReviewCopy,this.OrderReviewCopy.id, this.OrderReviewCopy.IdIndex);
        this.indexDB.editOrderIndex(orderIndex.id,orderPublish!.DocNum!, orderPublish.DocEntry, orderCopyIndex.Order, 'complete', '')
        //orderIndex = this.dataSharing.getOrderIndexDB();
        this.dataSharing.updateIndexOrder(orderIndex)
        //dataSharing.setOrderReview(orderPublish)
        // console.log("Pasan los document del cloud")
        console.log(data.response)
        console.log({idIndex: orderIndex.id, orderSAP: orderPublish ,message: 'Complete: DocNum - ' +  orderPublish.DocNum + ' DocEntry - ' + orderPublish.DocEntry})
        this.dataSharing.updateMessageRecharge({idIndex: orderIndex.id, orderSAP: orderPublish ,message: 'Complete: DocNum - ' +  orderPublish.DocNum + ' DocEntry - ' + orderPublish.DocEntry})
      }
      else{
        orderCopyIndex.ErrorSap = data.response;
        EditToCosmosDB(orderCopyIndex, 'transaction_log')
        this.indexDB.editOrderIndex(orderIndex.id,0, 0, orderCopyIndex.Order, 'cosmos', data.response)
        //this.openSnackBar(data.response!, "error", "Error", "red");
        var errorMessage = JSON.parse(data.response)
        this.dataSharing.updateMessageRecharge({idIndex: orderIndex.id, message: 'Incomplete: '+ errorMessage.error.message.value})
        console.error('Error:', data.response)
      }
    })
    .catch((error) => {
      this.openSnackBar(error!, "error", "Error", "red");
    });
  }

  EditOrderSAP(orderCosmos: any, orderIndexLastVersion:any, indexRecord:any){
    webWorker("editOrder", orderCosmos, this.tokenAzure).then((data) => {
      console.log('Edit Order in SAP')
      //console.log('Valor devuelto por el Web Worker:', data);
      if(parseInt(data.statusCode!) >= 200 && parseInt(data.statusCode!) < 300)
      {
        //this.Cart![0].Icon= 'cloud_done';
        //const orderPublish: Order = JSON.parse(data.response);
        orderIndexLastVersion.DocumentLines.forEach((x:any) => x.Icon = "cloud_done")
        
        this.dataSharing.updateCart(orderIndexLastVersion.DocumentLines);
        this.dataSharing.updateIdsOrder(orderCosmos.DocNum, orderCosmos.DocEntry)
        this.dataSharing.setCartData(orderIndexLastVersion.DocumentLines);
        this.dataSharing.updateMessageRecharge({idIndex: indexRecord.id, orderSAP: orderCosmos.DocNum ,message: '- Update Complete -'})

        //dataSharing.setOrderReview(orderPublish)
        // console.log("Pasan los document del cloud")
        // console.log(orderIndex.DocumentLines)

      }
      else{
        //this.indexDB.editOrderIndex(this.OrderIndexDB.id,Number(orderCosmos.DocNum), Number(orderCosmos.DocEntry), this.OrderReview!, 'cosmos', '')
        orderCosmos.ErrorSap =  data.response;
        this.transLog.addTransactionToIndex(orderCosmos.Action, indexRecord.id,orderCosmos.DocNum,orderCosmos.DocEntry, orderIndexLastVersion, "cosmos", this.usernameAzure, data.response)
        EditToCosmosDB(orderCosmos, 'transaction_log')
        var ErrorStatus = JSON.parse(data.response)
        this.dataSharing.updateMessageRecharge({idIndex: indexRecord.id, orderSAP: orderCosmos.DocNum ,message: 'Error: '+ ErrorStatus.error.message.value})
        //this.openSnackBar(data.response!, "error", "Error", "red");
        //console.error('Error:', data.response)
      }
    })
    .catch((error) => {
      this.openSnackBar(error!, "error", "Error", "red");
    });
  }

  ngOnInit(): void {
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

    this.dataSharing.TransactionIndexDB$.subscribe((newTransIndex) => {
      this.TransactionIndexDB = newTransIndex;
    });

    this.dataSharing.OrderIndexDB$.subscribe((newOrderIndex) => {
      this.OrderIndexDB = newOrderIndex;
    });

    this.auth.tokenAzure$.subscribe((newToken) => {
      this.tokenAzure = newToken;
    });

    this.dataSharing.usersSignal$.subscribe((newUsers) => {
      if(newUsers != null)
        this.UsersAzure = newUsers;
    });

    this.tradeShowChecking();

    this.router.events
    .pipe(filter(event => event instanceof NavigationEnd))
    .subscribe((event: any) => {
      //console.log('La ruta activa es:', event.url);
      //console.log(this.previousURL)
      if(this.previousURL == '/dashboard/order-edit')
      {
        //console.log(this.usernameAzure, this.nameAzure)
        localStorage.removeItem('OrderSave');
        if(JSON.stringify(this.UsersAzure) != "{}")
          this.signalr.removeSignalRMessageUser(this.usernameAzure, this.nameAzure, this.UsersAzure!.DocNum!.toString(), this.UsersAzure!.DocEntry!.toString())
        else
          this.signalr.removeSignalRMessageUser(this.usernameAzure, this.nameAzure, '0', '0')

        this.dataSharing.updateUsersSignal({});
        this.previousURL = event.url;
      }
      else if(this.previousURL == '/dashboard/order-customer/new-order' && this.isOnline == true)
      {
        localStorage.removeItem('OrderNewSave');
        // console.log('ya quedo')
      }
      else
        this.previousURL = event.url
    });
    //this.auth.initializeAuthState()
  }

  async tradeShowChecking(){
    try {
      this.location = await this.geoService.getLocation();
      const { latitude, longitude } = this.location.coords;
      const address = await this.geoService.getAddress(latitude, longitude).toPromise();
      //console.log('Location:', address.display_name);
      console.log(address)
      //console.log(address.address.country + ', ' + address.address.state)
      this.tradeshow = address.address.country + ', ' + address.address.city
      
      if (this.tradeshow.trim() !== '') {
        publishTradeshowToCosmosDB({ 
          name: this.tradeshow, 
          created_date: new Date(),
          email: this.usernameAzure,  
          type: 'tradeshow_log'
        }).then(() => {
          console.log('ready')
          this.geoService.getTradeshowLocation(this.tradeshow)
        }).catch(error => {
          console.error('Failed to publish tradeshow to Cosmos DB:', error);
        });
      }

    } catch (error) {
      console.error('Error obtaining location or address', error);
    }
  }

  @HostListener('window:beforeunload', ['$event'])
  unloadNotification($event: any): void {
    this.signalr.removeSignalRMessageUser(this.usernameAzure, this.nameAzure, '0', '0')
  }
}