import { Injectable } from '@angular/core';
import { MsalService } from '@azure/msal-angular';
import Dexie from 'dexie';
import { DataSharingService } from './data-sharing.service';
import { v4 as uuidv4 } from 'uuid';
import { AuthService } from './auth.service';
import { BPAddresses } from '../models/customer';
import { PublishToCosmosDB } from './cosmosdb.service';

@Injectable({
  providedIn: 'root'
})
export class TransactionCostumerService {

  private Db?: Dexie;
  private usernameAzure ='';

  constructor(private authService: MsalService,private dataSharing: DataSharingService,private auth: AuthService) { 
    this.Db = new Dexie('customer_transactions');
    this.Db.version(2).stores({
      costumers: '++id, user, CardCode, CardName, CardType, BPAddresses, Action ',
    });

    this.obtainUser()
  }

  async addTransactionCustomerToIndex(CardCode: string, CardName: string, CardType: string, BPAddresses: BPAddresses[] , Action:string,Email:string,Notes:string, Status: string) {
    const idChange = uuidv4()
    let log =  {
      user: this.obtainUser(),
      action: Action,
      id: idChange,
      timestamp: new Date().toISOString(),
      CardCode:CardCode,
      CardName:CardName,
      CardType: CardType,
      Email: Email,
      Notes:Notes,
      BPAddresses : BPAddresses,
      status: Status
    };

      try {
        let Logid = await this.Db!.table('costumers').add(log);
        console.log('Agregamos el customer_transactions')
        console.log(Logid)
        const retrievedCostumerTransaction = await this.Db!.table('costumers').get(Logid);
        console.log(retrievedCostumerTransaction)
        this.dataSharing.updateIndexTransaction(retrievedCostumerTransaction)
        return idChange;
      } catch (error) {
        console.error('Error:', error);
        return null;
      }
      return idChange;
  }

  async editTransactionCustomerToIndex(IdIndex:string, Customer: any, Status: string) {

    let log =  {
      user: this.usernameAzure,
      action: Customer.action,
      id: IdIndex,
      timestamp: new Date().toISOString(),
      CardCode: Customer.CardCode,
      CardName: Customer.CardName,
      CardType: Customer.CardType,
      Email: Customer.EmailAddress,
      Notes: Customer.Notes,
      BPAddresses : Customer.BPAddresses,
      status: Status
    };
    
    try {
      let Logid = await this.Db!.table('costumers').put(log);
      console.log('Editamos la transaction de customer')
      console.log(Logid)
      const retrievedOrder = await this.Db!.table('costumers').get(Logid);
      console.log(retrievedOrder)
      //this.dataSharing.setOrderIndexDB(retrievedOrder)
      this.dataSharing.updateIndexTransaction(retrievedOrder)

      return IdIndex;
    } catch (error) {
      console.error('Error:', error);
      return null;
    }
    return IdIndex;

  }

  obtainUser() {
    this.auth.userAzure$.subscribe(
      (username: string) => {
        this.usernameAzure =  username;
      },
      (error: any) => {
        this.usernameAzure =''
      }
    );
  }
}
