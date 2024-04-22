import { Injectable } from '@angular/core';
import { ServiceService } from './service.service';
import Dexie from 'dexie';
import { BehaviorSubject, catchError, mergeMap, retryWhen, switchMap, throwError, timer } from 'rxjs';
import { BusinessPartner } from '../models/customer';
import { webWorker } from '../app.component';
import { Value } from '../models/items';

@Injectable({
  providedIn: 'root'
})
export class IndexCustomersService {
  private Db?: Dexie;
  
  constructor(private service: ServiceService) { 
    this.Db = new Dexie('customers');
    this.Db.version(3).stores({
      items: '++id, CardCode,CardName,CardType,ContactPerson,EmailAddress,Phone1,VatLiable,BankCountry,ShippingType,GTSBillingAddrTel,FederalTaxId,Notes,ValidRemarks,BPAddresses,ContactEmployees'
    });
  }

  async getCustomersIndesxDB(itemService:IndexCustomersService, tokenAzure:string) {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('customers', 3);
      console.log("Check the index db customers")
      //console.log(request)
      request.onupgradeneeded = function(event) {
        //console.log(event)

        //Get the database of index
        const db = (event.target as IDBOpenDBRequest).result;
        //console.log(db)
        if (!db.objectStoreNames.contains('customers')) {
          ///Create the index Db

          db.createObjectStore('customers', { keyPath: 'CardCode' });

          console.log('Add the customers to Index DB')
          itemService.getCustomersToIndexDB(tokenAzure,db)
        }
      };
  
      request.onsuccess = function(event) {
        //Update the index db
        // const db = (event.target as IDBOpenDBRequest).result;
        // //console.log('Update the customers to Index DB')
        // itemService.getCustomersToIndexDB(tokenAzure,db)
        // resolve(db);

        const db = (event.target as IDBOpenDBRequest).result;
        const transaction = db.transaction(['customers'], 'readonly');
        const store = transaction.objectStore('customers');
        const request = store.openCursor();

        request.onsuccess = function(event) {
          const cursor = (event.target as IDBRequest<IDBCursorWithValue>).result;
      
          if (cursor) {
              console.log('There are records in Customers Database');
              var passTime = checkTime()
              const now = new Date();
              localStorage.setItem('savedTime', now.toISOString());  
              console.log('Current time saved:', now.toISOString());
              if(passTime == true)
                itemService.getCustomersToIndexDB(tokenAzure,db)
          }
          else
          {
            console.log('Update Database');
            itemService.getCustomersToIndexDB(tokenAzure,db)
          }
      };
      };
  
      request.onerror = function(event) {
        reject(`Error to open the database: ${event!.target!}`);
      };
    });
  }

  getCustomersToIndexDB(tokenAzure: string, db: IDBDatabase){
    webWorker('customers',null,tokenAzure).then((data) => {
      //console.log(data)
      if(parseInt(data.statusCode!) >= 200 && parseInt(data.statusCode!) < 300)
      {
        //Initialize the transaction
        const transaction = db.transaction('customers', 'readwrite');
        const itemsStore = transaction.objectStore('customers');

        let itemsData : BusinessPartner[] = JSON.parse(data.response);
        
        // Add element to Index DB 
        itemsData.forEach((CustomNew) => {
          itemsStore.add({
            CardCode: CustomNew.CardCode,
            CardName: CustomNew.CardName,
            CardType: CustomNew.CardType,
            ContactPerson: CustomNew.ContactPerson,
            EmailAddress: CustomNew.EmailAddress,
            Phone1: CustomNew.Phone1,
            VatLiable: CustomNew.VatLiable,
            BankCountry: CustomNew.BankCountry,
            ShippingType: CustomNew.ShippingType,
            GTSBillingAddrTel: CustomNew.GTSBillingAddrTel,
            FederalTaxId: CustomNew.FederalTaxId,
            Notes: CustomNew.Notes,
            ValidRemarks: CustomNew.ValidRemarks,
            BPAddresses: CustomNew.BPAddresses,
            ContactEmployees: CustomNew.ContactEmployees,
          });
        });

        this.UpdateDatabase('customers',itemsData)

        console.log('Finish the process of customers');
       
      }
      else
      {
        console.error('Error:', data.response)
      }
         
    })
    .catch((error) => {
      //this.cloudChange = "cloud_off";
      console.error('Error:', error);
    });
    
    
    this.service.getCustomer().pipe(
      retryWhen(errors =>
        errors.pipe(
          //tap(val => console.log(`Value ${val} was too high!`)), // Para depurar
          switchMap((error, index) =>
            index < 3 ? timer(index * 5000) : throwError(() => new Error('Retry limit reached'))
          )
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
        const transaction = db.transaction('customers', 'readwrite');
        const itemsStore = transaction.objectStore('customers');
        
        let itemsData : BusinessPartner[] = JSON.parse(response.response!);
        
        // Add element to Index DB 
        itemsData.forEach((CustomNew) => {
          itemsStore.add({
            CardCode: CustomNew.CardCode,
            CardName: CustomNew.CardName,
            CardType: CustomNew.CardType,
            ContactPerson: CustomNew.ContactPerson,
            EmailAddress: CustomNew.EmailAddress,
            Phone1: CustomNew.Phone1,
            VatLiable: CustomNew.VatLiable,
            BankCountry: CustomNew.BankCountry,
            ShippingType: CustomNew.ShippingType,
            GTSBillingAddrTel: CustomNew.GTSBillingAddrTel,
            FederalTaxId: CustomNew.FederalTaxId,
            Notes: CustomNew.Notes,
            ValidRemarks: CustomNew.ValidRemarks,
            BPAddresses: CustomNew.BPAddresses,
            ContactEmployees: CustomNew.ContactEmployees,
          });
        });

        this.UpdateDatabase('customers',itemsData)

        console.log('Finish the process of customers');
      },
      (error:any) => {
        console.error('Error:', error);
      }
    );
  }

  UpdateDatabase(database:string, itemListAPI:BusinessPartner[]){
    const request = indexedDB.open(database);
    request.onsuccess = function (event) {
      const db = (event.target as IDBOpenDBRequest).result;
    
      const transaction = db.transaction(database, 'readwrite');
      const objectStore = transaction.objectStore(database);
    
      const getAllRequest = objectStore.getAll();
    
      getAllRequest.onsuccess = function () {
        const allItems = getAllRequest.result;
        //console.log('Update the Customers...');
    
        allItems.forEach((existingId) => {
          if (!itemListAPI.find((item) => item.CardCode === existingId.CardCode)) {
            //console.log(existingId)
            objectStore.delete(existingId.CardCode);
          }
        });
      };
    },
    (error:any) => {
      console.error('Error:', error);
    }
  }

  async RetrieveCustomersIndex(): Promise<BusinessPartner[]> {
    return new Promise((resolve, reject) => {
      try {
        const request = indexedDB.open('customers');
  
        request.onsuccess = function (event) {
          const db = (event.target as IDBOpenDBRequest).result;
  
          const transaction = db.transaction('customers', 'readonly');
          const objectStore = transaction.objectStore('customers');
  
          const getAllRequest = objectStore.getAll();
  
          getAllRequest.onsuccess = function () {
            const listItems: BusinessPartner[] = getAllRequest.result;
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


function checkTime() {
  const savedTime = localStorage.getItem('savedTime');  
  if (!savedTime) {
      console.log('No time saved.');
      //localStorage.setItem('savedTime', orderString);
      return;
  }

  const savedDate = new Date(savedTime).getTime();  
  const now = new Date().getTime();                
  const difference = now - savedDate;              

  const hoursPassed = difference / (1000 * 60 * 60); 

  if (hoursPassed >= 24) {
    console.log('24 hours have passed.');
    return true; 
  } else {
      console.log(`Only ${hoursPassed.toFixed(2)} hours have passed. Not yet 24 hours.`);
      return false; 
  }
}
