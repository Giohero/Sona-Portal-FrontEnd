import { Injectable } from '@angular/core';
import { MsalService } from '@azure/msal-angular';
import Dexie from 'dexie';
import { DataSharingService } from './data-sharing.service';
import { v4 as uuidv4 } from 'uuid';
import { AuthService } from './auth.service';
import { BPAddresses } from '../models/customer';

@Injectable({
  providedIn: 'root'
})
export class TransactionCostumerService {

  private Db?: Dexie;

  constructor(private authService: MsalService,private dataSharing: DataSharingService,private auth: AuthService) { 
    this.Db = new Dexie('customer_transactions');
    this.Db.version(2).stores({
      costumers: '++id, user, CardCode, CardName, CardType, BPAddresses, Action ',
    });

  }

  async addTransactionToIndex(CardCode: string, CardName: string, CardType: string, BPAddresses: BPAddresses[] , Action:string,Email:string,Notes:string) {
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
      BPAddresses : BPAddresses
      
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

  obtainUser() {
    const activeAccount= this.auth.userAzure$;
    if (activeAccount) {
      (activeAccount: string) => {
      return activeAccount;
      }
      return '';
    } else {
      return '';
    }
    
  }
}
