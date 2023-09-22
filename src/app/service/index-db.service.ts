import { Injectable } from '@angular/core';
import { Order, DocumentLines, AddressExtension } from '../models/car';
import Dexie from 'dexie';

@Injectable({
  providedIn: 'root'
})
export class IndexDbService {

  private Db?: Dexie;
  
  constructor() 
  { 
    this.Db = new Dexie('order');
    this.Db.version(1).stores({
      orders: '++id, DocNum, DocDate, DocDueDate, TaxDate, CardCode, DocumentLines, AddressExtension',
    });
  }

  //async editToDB(id: number, DocNum: string = '12345', DocDate: string = '0001-01-01', DocDueDate: string = '0001-01-01', TaxDate: string = '0001-01-01', CardCode: string, DocumentLines: DocumentLines[], AddressExtension: AddressExtension = {}): Promise<void> {
  async editToDB(id: number, DocNum: string, OrderComplete: Order, CardCode: string, DocumentLines: DocumentLines[]): Promise<void> {
    try {
      const DocDate = OrderComplete.DocDate;
      const DocDueDate = OrderComplete.DocDueDate;
      const TaxDate = OrderComplete.TaxDate;
      const AddressExtension = OrderComplete.AddressExtension;

      await  this.Db!.table('orders').put({ id, DocNum, DocDate, DocDueDate, TaxDate, CardCode, DocumentLines, AddressExtension });
      console.log("Edit Record with ID" +id+" in the table.");

    } catch (error) {
      console.error('Error:', error);
    }
  }


  async addToDB(data: Order): Promise<any> {
    //const DocNum = data.DocNum;
    const CardCode = data.CardCode;
    const DocumentLines = data.DocumentLines;
    const DocNum = data.DocNum

    try {
      const orderId = await this.Db!.table('orders').add({ DocNum, CardCode, DocumentLines });
      const retrievedOrder = await this.Db!.table('orders').get(orderId);
      //console.log(retrievedOrder);
      return retrievedOrder;
    } catch (error) {
      console.error('Error:', error);
      return null;
    }
  }

  async getLastOneDB(): Promise<any> {
    try {
      const allOrders = await this.Db!.table('orders').toArray();
      if (allOrders.length > 0) {
        const lastRecord = allOrders[allOrders.length - 1];
        return lastRecord;
      }
      else
        return null;
    } catch (error) {
      console.error('Error:', error);
      return null;
    }
  }


}
