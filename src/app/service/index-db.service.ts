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
    this.Db.version(3).stores({
      orders: '++id, DocNum, DocEntry, DocDate, DocDueDate, TaxDate, CardCode, DocumentLines, AddressExtension, transaction_order'
    });

    this.dataSharing.OrderIndexDB$.subscribe((newOrderIndex) => {
      this.OrderIndexDB = newOrderIndex;
    });
    
  }

  
  //async editToDB(id: number, DocNum: string = '12345', DocDate: string = '0001-01-01', DocDueDate: string = '0001-01-01', TaxDate: string = '0001-01-01', CardCode: string, DocumentLines: DocumentLines[], AddressExtension: AddressExtension = {}): Promise<void> {
  async editOrderIndex(id: number, DocNum: number, DocEntry: number, OrderComplete: Order | OrderComplete, CardCode: string, DocumentLines: DocumentLines[],transaction_order: any): Promise<void> {
    try {

      const DocDate = OrderComplete.DocDate;
      const DocDueDate = OrderComplete.DocDueDate;
      const TaxDate = OrderComplete.TaxDate;
      const AddressExtension = OrderComplete.AddressExtension;

      const orderId = await  this.Db!.table('orders').put({ id, DocNum, DocEntry, DocDate, DocDueDate, TaxDate, CardCode, DocumentLines, AddressExtension, transaction_order });
      console.log(orderId)
      const retrievedOrder = await this.Db!.table('orders').get(orderId);
      console.log(retrievedOrder)
      this.dataSharing.setOrderIndexDB(retrievedOrder)
      this.dataSharing.updateIndexOrder(retrievedOrder)
      console.log("Edit Record with ID" +id+" in the table.");
    } catch (error) {
      console.error('Error:', error);
    }
  }


  async addOrderIndex(data: Order, transaction_order: any): Promise<any> {
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

    const CardCode = data.CardCode;
    const DocumentLines = data.DocumentLines;
    const DocNum = data.DocNum;
    const DocEntry = data.DocEntry;
    const DocDate = data.DocDate;
    const DocDueDate = data.DocDueDate;
    const TaxDate = data.TaxDate;

    try {
      const orderId = await this.Db!.table('orders').add({ id, DocNum, DocEntry, DocDate, DocDueDate, TaxDate, CardCode, DocumentLines, transaction_order});
      const retrievedOrder = await this.Db!.table('orders').get(orderId);
      console.log("Agregando a Order Index DB");
      console.log(retrievedOrder);
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
        console.log('si pasa por aqui en obtener el ultimo')
        console.log(getLastOneVersion)
        return getLastOneVersion;
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
        console.log(record);
        if(record)
        {
          if(record.transaction_order.length! > 0)
            record.transaction_order.push(transaction);
          else
            record.transaction_order = transaction_order;
            
          const id = record.id;
          //const transaction_order = record.transaction_order;

          console.log('estamos editando la orden para agregar el cambio '+ idIndex)
          this.editOrderIndex(id, order.DocNum!, Number(order.DocEntry!), orderOrigin, order.CardCode!, order.DocumentLines!, record.transaction_order);
        }
        else
        {
          console.log('estamos agregando la orden desde cero para agregar el cambio '+ idIndex)
          this.addOrderIndex(order, transaction_order)
          
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

    console.log(orderIndexDB)

    const getCosmos = await getFromCosmosDBByIndexId(idIndex,'order_log')
    if(getCosmos == null)
    {
      var orderPublishCosmos = JSON.parse(JSON.stringify(orderIndexDB));
      //No quita el id, por eso hicimos copia
      orderPublishCosmos.IdIndex = orderIndexDB.id;
      PublishToCosmosDB(orderPublishCosmos,'order_log');
      console.log('Estoy obteniendo null en el editOrderLog');
    }
    else
    {
      getCosmos.transaction_order = this.OrderIndexDB.transaction_order;
      EditToCosmosDB(getCosmos,'order_log');
    }

  }


  async getOrderLogByIdIndex(idIndex: number) {
    //console.log(this.logs);
    // const serializedLogs = JSON.stringify(this.logs);
    // console.log(serializedLogs);

    this.Db!.table('orders').where('id').equals(idIndex).first().then(async (record) => {

      console.log(record);
      if(record)
        return record.transaction_order;
      else
        return null;
      
      
    })
    //const allOrders = await this.Db!.table('transactions').toArray();
    return null;
  }

  async getOrderLogByDocNum(DocNum: number) {

    this.Db!.table('orders').where('DocNum').equals(DocNum).first().then(async (record) => {
      console.log("record encontrado en Index");
      console.log(record);
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
