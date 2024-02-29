import { Injectable } from '@angular/core';
import Dexie from 'dexie';
import { Value } from '../models/items';
import { ServiceService } from './service.service';
import { Observable, catchError, map, mergeMap, retryWhen, throwError, timer } from 'rxjs';
import { Item } from '@azure/cosmos';
import { webWorker } from '../app.component';

@Injectable({
  providedIn: 'root'
})
export class IndexItemsService {

  private Db?: Dexie;
  
  constructor(private service: ServiceService) {
    this.Db = new Dexie('items');
    this.Db.version(3).stores({
      items: '++id, ItemCode,ItemName,ItemPrices'
    });
   }

  async addItemIndex(data: Value) {
    
    const id = data.ItemCode;

      const ItemCode = data.ItemCode;
      const ItemName = data.ItemName;
      const ItemPrices = data.ItemPrices;

    try {
      const itemId = await this.Db!.table('items').add({ id, ItemCode,ItemName, ItemPrices});
      const retrievedOrder = await this.Db!.table('items').get(itemId);
      console.log("Agregando a Item Index DB");
      console.log(retrievedOrder);
      return retrievedOrder;
    } catch (error) {
      console.error('Error:', error);
      //this.isLoading = false;
      return null;
    }
  }

  async getItemsIndesxDB(itemService:IndexItemsService,tokenAzure: string) {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('items', 3);
      console.log("Check the index db items")
      //console.log(request)
      request.onupgradeneeded = function(event) {
        //console.log(event)

        //Get the database of index
        const db = (event.target as IDBOpenDBRequest).result;
        //console.log(db)
        if (!db.objectStoreNames.contains('items')) {
          ///Create the index Db

          db.createObjectStore('items', { keyPath: 'ItemCode' });

          console.log('Add the items to Index DB')
          itemService.getItemsToIndexDB(db,tokenAzure)
        }
      };
  
      request.onsuccess = function(event) {
        //Update the index db
        const db = (event.target as IDBOpenDBRequest).result;
        //console.log('Update the items to Index DB')

        itemService.getItemsToIndexDB(db,tokenAzure)
        resolve(db);
      };
  
      request.onerror = function(event) {
        reject(`Error to open the database: ${event!.target!}`);
      };
    });
  }

  getItemsToIndexDB(db: IDBDatabase,tokenAzure:string){
    webWorker('items',null,tokenAzure).then((data) => {
      //console.log(data)
      if(parseInt(data.statusCode!) >= 200 && parseInt(data.statusCode!) < 300)
      {
       //Initialize the transaction
       const transaction = db.transaction('items', 'readwrite');
       const itemsStore = transaction.objectStore('items');

       let itemsData : Value[] = JSON.parse(data.response);
       //console.log(itemsData)
       
       // Add element to Index DB 
       itemsData.forEach((itemNew) => {
         //console.log(itemNew)
         itemsStore.add({
           ItemCode: itemNew.ItemCode,
           ItemName: itemNew.ItemName,
           ItemPrices: itemNew.ItemPrices,
           BarCode : itemNew.BarCode,
           U_MasterPackQty : itemNew.U_InnerPackQty,
           U_InnerPackQty : itemNew.U_InnerPackQty,
           SalesQtyPerPackUnit : itemNew.SalesQtyPerPackUnit
         });
       });

       this.UpdateDatabase('items', itemsData)
       console.log('Finish the process the items');
      }
      else
      {
        console.error('Error:', data.response)
      }}
      ).catch((error) => {
        //this.cloudChange = "cloud_off";
        console.error('Error:', error);
      });
     
  }

  UpdateDatabase(database:string, itemListAPI: Value[]){
    const request = indexedDB.open(database);
    request.onsuccess = function (event) {
      const db = (event.target as IDBOpenDBRequest).result;
    
      const transaction = db.transaction(database, 'readwrite');
      const objectStore = transaction.objectStore(database);
    
      const getAllRequest = objectStore.getAll();
    
      getAllRequest.onsuccess = function () {
        const allItems = getAllRequest.result;
        //console.log('Update the items...');
    
        allItems.forEach((existingId) => {
          if (!itemListAPI.find((item) => item.ItemCode === existingId.ItemCode)) {
            //console.log(existingId)
            objectStore.delete(existingId.ItemCode);
          }
        });
      };
    },
    (error:any) => {
      console.error('Error:', error);
    }
  }

  async RetrieveItemsIndex(): Promise<Value[]> {
    return new Promise((resolve, reject) => {
      try {
        const request = indexedDB.open('items');
  
        request.onsuccess = function (event) {
          const db = (event.target as IDBOpenDBRequest).result;
  
          const transaction = db.transaction('items', 'readonly');
          const objectStore = transaction.objectStore('items');
  
          const getAllRequest = objectStore.getAll();
  
          getAllRequest.onsuccess = function () {
            const listItems: Value[] = getAllRequest.result;
            resolve(listItems);
          };
  
          getAllRequest.onerror = function (event) {
            reject(null);
          };

          transaction.onerror = function (event) {
            reject(null);
          };
        };
        request.onerror = function (event) {
          reject(null);
        };
      } catch (error) {
        console.error('Error:', error);
        reject(null);
      }
    });
  }
  async GetItemIndexbyBarCode(barCode:string): Promise<Value> {
    return new Promise((resolve, reject) => {
      try {
        const request = indexedDB.open('items');
        request.onsuccess = function(event) {
          const db = (event.target as IDBOpenDBRequest).result;
          const transaction = db.transaction("items", "readonly");
          const objectStore = transaction.objectStore("items");
         
          const getAllRequest = objectStore.getAll(); // Obtener todos los objetos
       
          getAllRequest.onsuccess = function() {
            // Filtrar manualmente para encontrar objetos que coincidan con tu criterio
            const resultFilter = getAllRequest.result.find(objeto => objeto.BarCode === barCode.toString() || objeto.ItemCode === barCode);
            // console.log("Objetos filtrados por CodeBars:", resultFilter);
            resolve(resultFilter);
          };
 
          getAllRequest.onerror = function (event) {
            reject(null);
          };
 
          transaction.onerror = function (event) {
            reject(null);
          };
        };
        request.onerror = function (event) {
          reject(null);
        };
      } catch (error) {
        console.error('Error:', error);
        reject(null);
      }
    });
  }

}

