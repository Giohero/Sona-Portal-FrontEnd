import { Injectable } from '@angular/core';
import Dexie from 'dexie';
import { Value } from '../models/items';
import { ServiceService } from './service.service';
import { Observable, catchError, map, mergeMap, retryWhen, throwError, timer } from 'rxjs';
import { Item } from '@azure/cosmos';

@Injectable({
  providedIn: 'root'
})
export class IndexItemsService {

  private Db?: Dexie;
  
  constructor(private service: ServiceService) {
    this.Db = new Dexie('items');
    this.Db.version(3).stores({
      items: '++id, ItemCode,ItemName'
    });
   }

  async addItemIndex(data: Value) {
    
    const id = data.ItemCode;

      const ItemCode = data.ItemCode;
      const ItemName = data.ItemName;


    try {
      const itemId = await this.Db!.table('items').add({ id, ItemCode,ItemName});
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

  async getItemsIndesxDB(itemService:IndexItemsService) {
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

          db.createObjectStore('items', { keyPath: 'id' });

          console.log('Add the items to Index DB')
          itemService.getItemsToIndexDB(db)
        }
      };
  
      request.onsuccess = function(event) {
        //Update the index db
        const db = (event.target as IDBOpenDBRequest).result;
        //console.log('Update the items to Index DB')

        itemService.getItemsToIndexDB(db)
        resolve(db);
      };
  
      request.onerror = function(event) {
        reject(`Error to open the database: ${event!.target!}`);
      };
    });
  }

  getItemsToIndexDB(db: IDBDatabase){
    this.service.getItems().pipe(
      retryWhen(errors =>
        errors.pipe(
          mergeMap((error, attemptNumber) => (attemptNumber < 3) ? timer(5000) : throwError(error))
        )
      ),
      catchError(error => {
        console.log(error)
        return throwError(error);
      })
    ).subscribe(
      (response) => {
        //console.log("Carga los datos", response.response);
  
        //Initialize the transaction
        const transaction = db.transaction('items', 'readwrite');
        const itemsStore = transaction.objectStore('items');
        
        let itemsData : Value[] = JSON.parse(response.response!);
        
        // Add element to Index DB 
        itemsData.forEach((itemNew) => {
          //console.log(itemNew)
          itemsStore.add({
            id:itemNew.ItemCode,
            ItemCode: itemNew.ItemCode,
            ItemName: itemNew.ItemName,
          });
        });

        this.UpdateDatabase('items', itemsData)
        console.log('Finish the process the items');
    }
    );
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

}

