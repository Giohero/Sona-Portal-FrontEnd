import { Injectable } from '@angular/core';
import { Order, DocumentLines, AddressExtension } from '../models/car';
import { Order as OrderComplete } from '../models/order';
import Dexie from 'dexie';
import { DataSharingService } from './data-sharing.service';
import { EditToCosmosDB, PublishToCosmosDB, getFromCosmosDBByDocNum, getFromCosmosDBByIndexId } from './cosmosdb.service';
import { TransactionlogService } from './transactionlog.service';

@Injectable({
  providedIn: 'root'
})
export class IndexDbService {

  private Db?: Dexie;
  private OrderIndexDB:any;

  constructor(private dataSharing: DataSharingService) 
  { 
    this.Db = new Dexie('order');
    this.Db.version(4).stores({ //Actualizar Numero 
      orders: '++id, DocNum, DocEntry, DocDate, DocDueDate, TaxDate, CardCode, DocumentLines, AddressExtension, transaction_order'
    });

    this.dataSharing.OrderIndexDB$.subscribe((newOrderIndex) => {
      this.OrderIndexDB = newOrderIndex;
    });
    
  }

  
  //async editToDB(id: number, DocNum: string = '12345', DocDate: string = '0001-01-01', DocDueDate: string = '0001-01-01', TaxDate: string = '0001-01-01', CardCode: string, DocumentLines: DocumentLines[], AddressExtension: AddressExtension = {}): Promise<void> {
  async editOrderIndex(id: number, DocNum: number, DocEntry: number, OrderComplete: Order | OrderComplete, status: string, error: string): Promise<void> {
    try {

      //console.log(OrderComplete)
      // const DocDate = OrderComplete.DocDate;
      // const DocDueDate = OrderComplete.DocDueDate;
      // const TaxDate = OrderComplete.TaxDate;
      // const AddressExtension = OrderComplete.AddressExtension;
      const Action = "Create_Order";
      const Timestamp = new Date().toISOString();
      const Order = OrderComplete;

      const orderId = await  this.Db!.table('orders').put({ id, Action, Timestamp, DocNum, DocEntry, Order, status, error});
      //console.log(orderId)
      const retrievedOrder = await this.Db!.table('orders').get(orderId);
      //console.log(retrievedOrder)
      this.dataSharing.setOrderIndexDB(retrievedOrder)
      this.dataSharing.updateIndexOrder(retrievedOrder)
      console.log("Edit Record with ID" +id+" in the table.");
    } catch (error) {
      console.error('Error:', error);
    }
  }


  async addOrderIndex(data: Order, status: string): Promise<any> {
    //const DocNum = data.DocNum;
    // 
    const currentDate = new Date();
    const [dia, mes, año, hora, minutos, milisegundos] = [
      currentDate.getDate(),
      currentDate.getMonth() + 1,
      currentDate.getFullYear(),
      currentDate.getHours(),
      currentDate.getMinutes(),
      currentDate.getMilliseconds(),];
      const lastTwoDigitsOfYear = año % 100;
      const lastoneMil = milisegundos - 1;
      const formattedTime = `${dia}${mes}${lastTwoDigitsOfYear}${hora}${minutos}${lastoneMil}`;
      const id = parseInt(formattedTime);

    // const CardCode = data.CardCode;
    // const DocumentLines = data.DocumentLines;
    const DocNum = data.DocNum;
    const DocEntry = data.DocEntry;
    const Action = "Create_Order";
    const Order = data;
    const Timestamp = new Date().toISOString();
    // const DocDate = data.DocDate;
    // const DocDueDate = data.DocDueDate;
    // const TaxDate = data.TaxDate;

    try {
      const orderId = await this.Db!.table('orders').add({ id, Action, Timestamp, DocNum, DocEntry, Order, status});
      const retrievedOrder = await this.Db!.table('orders').get(orderId);
      console.log("Add transaction");
      //console.log(retrievedOrder);
      this.dataSharing.setOrderIndexDB(retrievedOrder)
      this.dataSharing.updateIndexOrder(retrievedOrder)
      return retrievedOrder;
    } catch (error) {
      console.error('Error:', error);
      return null;
    }
  }

  async getLastOneDB(): Promise<any> {
    try {
      //Verificar si existe un docnum, para que se vaya con la siguiente
      const allOrders = await this.Db!.table('orders').toArray();
      if (allOrders.length > 0) {
        const lastRecord = allOrders[allOrders.length - 1];


        const getLastOneVersion = lastRecord.transaction_order[lastRecord.transaction_order.length - 1].order;
       // console.log('si pasa por aqui en obtener el ultimo')
        //console.log(getLastOneVersion)
        return getLastOneVersion;
      }
      else
        return null;
    } catch (error) {
      console.error('Error:', error);
      return null;
    }
  }

  async getLastOneIndexCompleteDB(): Promise<any> {
    try {
      //Verificar si existe un docnum, para que se vaya con la siguiente
      const allOrders = await this.Db!.table('orders').toArray();
      if (allOrders.length > 0) {
        const lastRecord = allOrders[allOrders.length - 1];

        //console.log(lastRecord)
        return lastRecord;
      }
      else
        return null;
    } catch (error) {
      console.error('Error:', error);
      return null;
    }
  }

  async getAllOrdersWithoutUpdate(): Promise<any> {
    try {
      const allOrders = await this.Db!.table('orders').toArray();
      if (allOrders.length > 0) {
        const lastRecords = allOrders.filter(x => x.status != "complete");

        //console.log(lastRecords)
        return lastRecords;
      }
      else
        return null;
    } catch (error) {
      console.error('Error:', error);
      return null;
    }
  }

  async getAllIndexWDocNumDB(): Promise<any> {
    try {
      // Verificar si existe un docnum, para que se vaya con la siguiente
      const allOrders = await this.Db!.table('orders').toArray();
      const ordersWithoutDocnum = allOrders.filter(order => !order.DocNum || order.DocNum == "0");
      return ordersWithoutDocnum;
    } catch (error) {
      console.error('Error:', error);
      return null;
    }
  }

  async editOrderLogToIndex(order:Order, orderOrigin: OrderComplete | Order, idTransaction: string, idIndex:number) {
    try {
      
      const transaction ={
        id: idTransaction,
        order:order
      }

      const transaction_order = [ {
        id: idTransaction,
        order:order
      }];

      // const transactionNew = {
      //   ...orderOrigin,
      //   transaction_order: transaction_order
      // }

      this.Db!.table('orders').where('id').equals(idIndex).first().then(async (record) => {
        //console.log(record);
        if(record)
        {
          if(record.transaction_order === null)
            record.transaction_order = transaction_order;
          else
            record.transaction_order.push(transaction);
            
          const id = record.id;
          //const transaction_order = record.transaction_order;

          console.log('estamos editando la orden para agregar el cambio '+ idIndex)
          this.editOrderIndex(id, order.DocNum!, Number(order.DocEntry!), orderOrigin, '', '');
        }
        else
        {
          console.log('estamos agregando la orden desde cero para agregar el cambio '+ idIndex)
          this.addOrderIndex(order, 'index')
          
        }
      })
    } catch (error) {
      console.error('Error:', error);
    }
  }

  async editOrderLogToCosmos(orderOrigin:Order,order: Order, idChange: string, idIndex: number) {
    const transaction_order = [ {
      id: idChange,
      order:order
    }];

    const transactionNew = {
      ...orderOrigin,
      IdIndex: idIndex,
      transaction_order: transaction_order
    }

    console.log(this.OrderIndexDB)

    const getCosmos = await getFromCosmosDBByIndexId(idIndex,'order_log')
    if(getCosmos == null)
    {
      PublishToCosmosDB(transactionNew,'order_log');
      //editToCosmosDB(transaction);
      console.log('Estoy obteniendo null en el editOrderLog');
    }
    else
    {
      getCosmos.transaction_order = this.OrderIndexDB.transaction_order;
      EditToCosmosDB(getCosmos,'order_log');
    }

  }

  async EditOrderLogDirectToCosmos(idIndex:number, orderIndexDB: any) {

    //console.log(orderIndexDB)

    const getCosmos = await getFromCosmosDBByIndexId(idIndex,'transaction_log')
    if(getCosmos == null)
    {
      var orderPublishCosmos = JSON.parse(JSON.stringify(orderIndexDB));
      //No quita el id, por eso hicimos copia
      orderPublishCosmos.IdIndex = idIndex;
      var idCosmos = await PublishToCosmosDB(orderPublishCosmos,'transaction_log');
      //console.log('Estoy obteniendo null en el editOrderLog');
      return idCosmos;
    }
    else
    {
      getCosmos.Order = orderIndexDB.Order;
      var trueCosmos = EditToCosmosDB(getCosmos,'transaction_log');
      return trueCosmos;
    }

  }


  async getOrderLogByIdIndex(idIndex: number) {
    try {
      const record = await this.Db!.table('orders').where('id').equals(idIndex).first();
      console.log(record);
      return record ? record : null;
    } catch (error) {
      console.error('Error:', error);
      return null;
    }
  }

  async getOrderLogByDocNum(DocNum: number) {

    this.Db!.table('orders').where('DocNum').equals(DocNum).first().then(async (record) => {
      //console.log("record encontrado en Index");
      //console.log(record);
      if(record)
        return record;
      else
        return null;
      
      
    })
    //const allOrders = await this.Db!.table('transactions').toArray();
  }

  async getOrderLogByDocNum2(DocNum: number) {

    // this.Db!.table('orders').where('DocNum').equals(DocNum).first().then(async (record) => {
    //   console.log("record encontrado en Index");
    //   console.log(record);
    //   if(record)
    //     return record;
    //   else
    //     return null;
      
      
    // })

    try {
      // Verificar si existe un docnum, para que se vaya con la siguiente
      const allOrders = await this.Db!.table('orders').toArray();
      const ordersWithoutDocnum = allOrders.find(order => order.DocNum === DocNum);
      this.dataSharing.updateIndexOrder(ordersWithoutDocnum)
      return ordersWithoutDocnum;
    } catch (error) {
      console.error('Error:', error);
      return null;
    }
    //const allOrders = await this.Db!.table('transactions').toArray();
  }
}
