import { Injectable } from '@angular/core';
import { ServiceService } from './service.service';
import Dexie from 'dexie';
import { catchError, mergeMap, retryWhen, throwError, timer } from 'rxjs';
import { BusinessPartner } from '../models/customer';

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

  async getCustomersIndesxDB(itemService:IndexCustomersService) {
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

          db.createObjectStore('customers', { keyPath: 'id' });

          console.log('Add the customers to Index DB')
          itemService.getCustomersToIndexDB(db)
        }
      };
  
      request.onsuccess = function(event) {
        //Update the index db
        const db = (event.target as IDBOpenDBRequest).result;
        //console.log('Update the customers to Index DB')

        itemService.getCustomersToIndexDB(db)
        resolve(db);
      };
  
      request.onerror = function(event) {
        reject(`Error to open the database: ${event!.target!}`);
      };
    });
  }

  getCustomersToIndexDB(db: IDBDatabase){
    this.service.getCustomer().pipe(
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
        const transaction = db.transaction('customers', 'readwrite');
        const itemsStore = transaction.objectStore('customers');
        
        let itemsData : BusinessPartner[] = JSON.parse(response.response!);
        
        // Add element to Index DB 
        itemsData.forEach((CustomNew) => {
          itemsStore.add({
            id:CustomNew.CardCode,
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
