import { Injectable } from '@angular/core';
import { MsalService } from '@azure/msal-angular';
import { Order } from '../models/car';
import { Order as OrderComplete } from '../models/order';
import { v4 as uuidv4 } from 'uuid';
import { Log } from '../models/log';
import { EditToCosmosDB, PublishToCosmosDB, editToCosmosDB, getFromCosmosDBByDocNum, getFromCosmosDBByIndexId } from './cosmosdb.service';
import { Dexie } from 'dexie';
import { IndexDbService } from './index-db.service';
import { DataSharingService } from './data-sharing.service';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class TransactionlogService {

  //private logs: Log[] = [];
  private Db?: Dexie;
  //private DbOrders?: Dexie;
  OrderIndexDB: any;
  TransactionIndexDB: any;
  usernameAzure='';

  constructor(private authService: MsalService, private indexDB: IndexDbService, private dataSharing: DataSharingService, private auth: AuthService) { 
    this.Db = new Dexie('order_transactions');
    this.Db.version(2).stores({
      orders: '++id, IdIndex, user, DocNum, transactions',
    });

    // this.DbOrders = new Dexie('order');

    // this.DbOrders!.version(2).stores({
    //   orders: '++id, DocNum, DocDate, DocDueDate, TaxDate, CardCode, DocumentLines, AddressExtension',
    // });


    

    this.dataSharing.TransactionIndexDB$.subscribe((newTransIndex) => {
      this.TransactionIndexDB = newTransIndex;
    });
  }


  async addTransactionLogToCosmos(docNum: number, docEntry: number, idTransaction: string, idIndex: number, action:string, orderChange:string, userAzure:string) {
    // let log =  {
    //   IdIndex:idIndex,
    //   user: this.obtainUser(),
    //   DocNum: docNum,
    //   DocEntry: docEntry,
    //   transaction_orders: [
    //     // {
    //     //   id: idTransaction,
    //     //   action: action,
    //     //   timestamp: new Date().toISOString(),
    //     // }
    //   ]
    // };

    const log =  {
      IdIndex: idIndex,
      user: userAzure,
      id: idTransaction,
      action: action,
      timestamp: new Date().toISOString(),
      DocNum: docNum,
      DocEntry: docEntry,
      //DocNum: parseInt(DocNum),
      order: orderChange
      
    };

    //console.log('Objeto que agregaremos a cosmos')
    //console.log(this.TransactionIndexDB)
    
    log.IdIndex = idIndex;
    //console.log("Aqui publicaremos las transaction a cosmos")
    //console.log(this.TransactionIndexDB)
    //log.transactions = this.TransactionIndexDB.transactions;
    PublishToCosmosDB(log,'transaction_log');
    return idTransaction;
  }

  async AddTransactionLogDirectToCosmos(transIndexDB: any) {

    console.log(transIndexDB)

    delete transIndexDB.id;

    const getCosmos = await getFromCosmosDBByIndexId(transIndexDB.IdIndex,'transaction_log')
    if(getCosmos != null)
    {
      console.log("Aqui pasan las transaction")
      console.log(this.TransactionIndexDB)
      getCosmos.transactions = this.TransactionIndexDB.transactions;
      EditToCosmosDB(getCosmos,'transaction_log')
    }
    else
    {
      PublishToCosmosDB(transIndexDB,'transaction_log');
    }
    

  }

  async addTransactionToIndex(action: string, id: number, docNum:number, docEntry:number, orderChange:Order, status: string, userAzure:string, error:string) {
    const idChange = uuidv4()

    const log =  {
      IdIndex: id,
      user: userAzure,
      id: idChange,
      action: action,
      timestamp: new Date().toISOString(),
      DocNum: docNum,
      DocEntry: docEntry,
      Status: status,
      error: error,
      order:  
      {
        ...orderChange
      }
      
    };
      try {
        let Logid = await this.Db!.table('orders').add(log);
        console.log('Add transaction')
        //console.log(Logid)
        const retrievedOrder = await this.Db!.table('orders').get(Logid);
        //console.log(retrievedOrder)
        //this.dataSharing.setOrderIndexDB(retrievedOrder)
        this.dataSharing.updateIndexTransaction(retrievedOrder)

        return idChange;
      } catch (error) {
        console.error('Error:', error);
        return null;
      }
      return idChange;
  }

  async editTransactionToIndex(id: string, idChange: string, action: string, docNum: number, docEntry: number, status:string, orderChange:Order, userAzure:string, error:string) {
    
    const log =  {
      IdIndex: id,
      user: userAzure,
      id: idChange,
      action: action,
      timestamp: new Date().toISOString(),
      DocNum: docNum,
      DocEntry: docEntry,
      Status: status,
      ErrorSap: error,
      order:  
      {
        ...orderChange
      }
      
    };
    
    try {
      let Logid = await this.Db!.table('orders').put(log);
      //console.log('Editamos la transaction')
      //console.log(Logid)
      const retrievedOrder = await this.Db!.table('orders').get(Logid);
      //console.log(retrievedOrder)
      //this.dataSharing.setOrderIndexDB(retrievedOrder)
      this.dataSharing.updateIndexTransaction(retrievedOrder)

      return idChange;
    } catch (error) {
      console.error('Error:', error);
      return null;
    }
    return idChange;

  }

  async getLogs() {
    //console.log(this.logs);
    const allOrders = await this.Db!.table('orders').toArray();
    return allOrders.length;
  }

  async getLog() {
    //console.log(this.logs);
    // const serializedLogs = JSON.stringify(this.logs);
    // console.log(serializedLogs);

    const allOrders = await this.Db!.table('orders').toArray();
    return allOrders;
  }

  async getTransactionLogByIdIndex(idIndex: number) {
    //console.log(this.logs);
    // const serializedLogs = JSON.stringify(this.logs);
    // console.log(serializedLogs);

    // this.Db!.table('transactions').where('IdIndex').equals(idIndex).first().then(async (record) => {

    //   console.log(record);
    //   if(record)
    //     return record.transactions;
    //   else
    //     return null;
      
      
    // })

    try {
      // Verificar si existe un docnum, para que se vaya con la siguiente
      const allOrders = await this.Db!.table('orders').toArray();
      const ordersWithoutDocnum = allOrders.find(order => order.IdIndex === idIndex);
      return ordersWithoutDocnum;
    } catch (error) {
      console.error('Error:', error);
      return null;
    }
    //const allOrders = await this.Db!.table('transactions').toArray();
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

  // async editOrderLog(orderOrigin:Order,order: Order, idChange: string, idIndex:number) {
  //   const transaction_order = [ {
  //     id: idChange,
  //     order:order
  //   }];

  //   const transaction ={
  //     id: idChange,
  //     order:order
  //   }
  //   const transactionNew = {
  //     ...orderOrigin,
  //     transaction_order: transaction_order
  //   }
  //   //const Logid = await this.Db!.table('transactions').add(transaction);
  //   const Logid = this.addTransactionToIndex(action,IdIndex)
  //   console.log(order.DocNum);
  //   const getCosmos = await getFromCosmosDBByDocNum(order.DocNum,'order_log')
  //   if(getCosmos == null)
  //   {
  //     PublishToCosmosDB(transactionNew,'order_log');
  //     //editToCosmosDB(transaction);
  //     console.log('Estoy obteniendo null en el editOrderLog');
  //   }
  //   else
  //   {
  //     if ('transaction_order' in getCosmos) 
  //     {
  //       getCosmos.transaction_order.push(transaction);
  //       EditToCosmosDB(getCosmos,'order_log');
  //     } 
  //     else 
  //     {
  //       getCosmos.transaction_order = transaction_order;
  //       EditToCosmosDB(getCosmos,'order_log');
  //       // El objeto no tiene el parámetro 'nombreDelParametro'
  //     }
     
  //   }

  // }

  // async editOrderIndexLog(order: OrderComplete, id: string) {
  //   try {
  //     const transaction ={
  //       id: id,
  //       order:order
  //     }
  //     const Logid = await this.Db!.table('transactions').add(transaction);
  //   } catch (error) {
  //     console.error('Error:', error);
  //   }
  // }

  // async editOrderIndexLogDC(order:Order, orderOrigin: OrderComplete, idTransaction: number, DocNum:number) {
  //   try {
      
  //     const transaction ={
  //       id: idTransaction,
  //       order:order
  //     }
  //     // const transactionNew = {
  //     //   ...orderOrigin,
  //     //   transaction_order: transaction_order
  //     // }

  //     this.DbOrders!.table('orders').where('DocNum').equals(DocNum).first().then(async (record) => {
  //       console.log(record);
  //       if(record)
  //       {
  //         record.transaction_order.push(transaction);

  //           const DocDate = orderOrigin.DocDate;
  //           const DocDueDate = orderOrigin.DocDueDate;
  //           const TaxDate = orderOrigin.TaxDate;
  //           const CardCode = orderOrigin.CardCode;
  //           const DocumentLines = orderOrigin.DocumentLines;
  //           const AddressExtension = orderOrigin.AddressExtension;
  //           const id = record.id;
  //           const transaction_order = record.transaction_order;

  //           const orderId = await  this.DbOrders!.table('orders').put({ id, DocNum, DocDate, DocDueDate, TaxDate, CardCode, DocumentLines, AddressExtension, transaction_order});
  //           console.log(orderId)
  //           const retrievedOrder = await this.DbOrders!.table('orders').get(orderId);
  //           console.log(retrievedOrder)
  //           this.dataSharing.setOrderIndexDB(retrievedOrder)
  //         //this.indexDB.editToDB(id, DocNum.toString(), orderOrigin, order.CardCode!, order.DocumentLines!, record.transaction_order);
  //       }
  //       else
  //       {
  //         //this.indexDB.addToDB(order, transaction_order)
  //         const currentDate = new Date();
  //         const [dia, mes, año, hora, minutos, milisegundos] = [
  //           currentDate.getDate(),
  //           currentDate.getMonth() + 1,
  //           currentDate.getFullYear(),
  //           currentDate.getHours(),
  //           currentDate.getMinutes(),
  //           currentDate.getMilliseconds(),];
  //           const lastTwoDigitsOfYear = año % 100;
  //           const lastoneMil = milisegundos - 1;
  //           const formattedTime = `${dia}${mes}${lastTwoDigitsOfYear}${hora}${minutos}${lastoneMil}`;
  //           const id = parseInt(formattedTime);

  //         const CardCode = orderOrigin.CardCode;
  //         const DocumentLines = orderOrigin.DocumentLines;
  //         const DocDate = orderOrigin.DocDate;
  //         const DocDueDate = orderOrigin.DocDueDate;
  //         const TaxDate = orderOrigin.TaxDate;

  //         const transaction_order = [ {
  //           id: idTransaction,
  //           order:order
  //         }];
  
          
  //         try {
  //           const orderId = await this.DbOrders!.table('orders').add({ id, DocNum,  DocDate, DocDueDate, TaxDate, CardCode, DocumentLines, transaction_order});
  //           const retrievedOrder = await this.DbOrders!.table('orders').get(orderId);
  //           console.log(retrievedOrder);
  //           return retrievedOrder;
  //         } catch (error) {
  //           console.error('Error:', error);
  //           return null;
  //         }}
  //     })
  //   } catch (error) {
  //     console.error('Error:', error);
  //   }
  // }

  // async addTransactionToIndex(action: string, id: number, docNum:number, docEntry:number) {
  //   const idChange = uuidv4()

  //   const log =  {
  //     IdIndex: id,
  //     user: this.obtainUser(),
  //     DocNum: docNum,
  //     DocEntry: docEntry,
  //     //DocNum: parseInt(DocNum),
  //     transactions: [
  //       {
  //         id: idChange,
  //         action: action,
  //         timestamp: new Date().toISOString(),
  //       }
  //     ]
  //   };

  //   const transaction ={
  //     id: idChange,
  //     action: action,
  //     timestamp: new Date().toISOString(),
  //   }

  //     try {
  //       this.Db!.table('transactions').where('IdIndex').equals(id).first().then(async (record) => {
  //         if(record)
  //         {
  //           record.transactions.push(transaction);
  //           const transId = await  this.Db!.table('transactions').put(record);
  //           console.log('Editamos el transaction')
  //           console.log(transId)
  //           const retrievedOrder = await this.Db!.table('transactions').get(transId);
  //           console.log(retrievedOrder)
  //           //this.dataSharing.setOrderIndexDB(retrievedOrder)
  //           this.dataSharing.updateIndexTransaction(retrievedOrder)

  //           return idChange;
  //         }
  //         else
  //         {
  //           let Logid = await this.Db!.table('transactions').add(log);
  //           console.log('Agregamos el transaction')
  //           console.log(Logid)
  //           const retrievedOrder = await this.Db!.table('transactions').get(Logid);
  //           console.log(retrievedOrder)
  //           //this.dataSharing.setOrderIndexDB(retrievedOrder)
  //           this.dataSharing.updateIndexTransaction(retrievedOrder)

  //           return idChange;
  //         }

  //       })
  //     } catch (error) {
  //       console.error('Error:', error);
  //       return null;
  //     }

  //     return idChange;
  // }


  // async addTransactionLogToCosmos(docNum: number, docEntry: number, idTransaction: string, idIndex: number) {
  //   let log =  {
  //     IdIndex:idIndex,
  //     user: this.obtainUser(),
  //     DocNum: docNum,
  //     DocEntry: docEntry,
  //     transactions: [
  //       // {
  //       //   id: idTransaction,
  //       //   action: action,
  //       //   timestamp: new Date().toISOString(),
  //       // }
  //     ]
  //   };

  //   console.log('Objeto que agregaremos a cosmos')
  //   console.log(this.TransactionIndexDB)
  //   const getCosmos = await getFromCosmosDBByIndexId(idIndex,'transaction_log')
  //   if(getCosmos != null)
  //   {

  //     console.log("Aqui encontramos las transaction en cosmos")
  //     console.log(this.TransactionIndexDB)
  //     getCosmos.transactions = this.TransactionIndexDB.transactions;
  //     EditToCosmosDB(getCosmos,'transaction_log')
  //     return idTransaction;
  //   }
  //   else
  //   {
  //     log.IdIndex = idIndex;
  //     console.log("Aqui publicaremos las transaction a cosmos")
  //     console.log(this.TransactionIndexDB)
  //     log.transactions = this.TransactionIndexDB.transactions;
  //     PublishToCosmosDB(log,'transaction_log');
  //     return idTransaction;
  //   }
  // }
}
