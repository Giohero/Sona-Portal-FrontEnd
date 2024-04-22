import { Injectable } from '@angular/core';
import * as signalR from '@microsoft/signalr';
import { BehaviorSubject, Observable, Subject, catchError, mergeMap, retryWhen, switchMap, throwError, timer } from 'rxjs';
import { AuthService } from './auth.service';
import { ServiceService } from './service.service';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { OrderEditComponent } from '../order-edit/order-edit.component';
import { DataSharingService } from './data-sharing.service';
import { IndexItemsService } from './index-items.service';
import { IndexCustomersService } from './index-customers.service';

@Injectable({
  providedIn: 'root'
})
export class SignalRService {
  private hubConnection?: signalR.HubConnection;
  private messageSubject: Subject<string> = new Subject<string>();
  private tokenSignal: BehaviorSubject<string> = new BehaviorSubject<string>('');
  tokenSignal$: Observable<string> = this.tokenSignal.asObservable();
  tokenSignalR='';
  tokenAzure='';

  constructor(private authService: AuthService, private service: ServiceService, private myhttp: HttpClient, private router: Router, private dataSharing: DataSharingService, private itemsIndex: IndexItemsService, private customerindex: IndexCustomersService) {

    this.tokenSignal$.subscribe((tokenR:string) => {
      //console.log('ya paso por aqui el token '+ tokenR)
      this.tokenSignalR = tokenR;
    } )
    this.authService.tokenAzure$.subscribe((newToken) => {
      //console.log(newToken);
      this.tokenAzure = newToken;
    });
  
    console.log('Pasa por aqui')
    this.startConnection();
    //this.getMessageStream();
  }

  updateToken(newtoken: string): void {
    this.tokenSignal.next(newtoken);
  }

 async getMessages(){
    //  Este es mtodo del server es el que manejara los mensajes entrantes
    // Después de recibir un mensaje
    //console.log(this.hubConnection?.state)
    this.hubConnection?.on('SendMessage', (user: string, message: string, type: string) => {
      const fullMessage = `${type} - ${user}: ${message}`;
      //console.log('Mensaje recibido:', fullMessage);

      const currentRoute = this.router.url;
      //console.log('Ruta actual:', currentRoute);
      
      if(currentRoute === '/dashboard/order-edit' && type === 'order')
      {
        //console.log('Lo enviaremos a orden edit');
        this.dataSharing.updateOrderSignal(JSON.parse(message));
      }
      else if(currentRoute === '/dashboard/customers-edit'&& type === 'customer')
      {

      }
      //this.messageSubject.next(fullMessage);
    });

    this.hubConnection?.on('GetUsers', (DocNum: string, DocEntry: string, users: string) => {
      const fullMessage = `${DocNum} - ${DocEntry}: ${users}`;
      //console.log('Mensaje recibido:', fullMessage);
      var usersC = JSON.parse(users);
      var signalR = {DocNum, DocEntry, usersC}
      const currentRoute = this.router.url;
      //console.log('Ruta actual:', currentRoute);
      
      if(currentRoute === '/dashboard/order-edit')
      {
        //console.log('Lo enviaremos a orden edit');
        this.dataSharing.updateUsersSignal(signalR);
      }
      //this.messageSubject.next(fullMessage);
    });
  }

  //metodo para inicializar la conexion 
  startConnection = () => {

  this.service.GetTokenSignal()
    .pipe(
      retryWhen(errors =>
        errors.pipe(
          //tap(val => console.log(`Value ${val} was too high!`)), // Para depurar
          switchMap((error, index) =>
            index < 3 ? timer(index * 5000) : throwError(() => new Error('Retry limit reached'))
          )
        )
      ),
      catchError(error => {
        return throwError(error);
      })
    )
    .subscribe((token:any) => {
      //console.log(token.accessToken)
      this.updateToken(token.accessToken)
      this.initializeSignalRConnection(token);

      this.itemsIndex.getItemsIndesxDB(this.itemsIndex,this.tokenAzure);
      this.customerindex.getCustomersIndesxDB(this.customerindex,this.tokenAzure);
  
      this.hubConnection = new signalR.HubConnectionBuilder()
      .withUrl(token.url, {
        accessTokenFactory: () => token.accessToken
      })
      .build();
  
      this.hubConnection
      .start()
      .then(async () => 
      {console.log('Connection SignalR started')
      //this.getMessageStream()
      await this.getMessages()
      //await this.sendMessage()
      })
      .catch(err => 
        console.error('Error inicialize connection SignalR:', err)
        );
     
    })

  }

  initializeSignalRConnection(token: any) {
    this.hubConnection = new signalR.HubConnectionBuilder()
      .withUrl(token.url, {
        accessTokenFactory: () => token.accessToken
      })
      .build();
  
    this.hubConnection
      .start()
      .then(async () => {
        console.log('Connection SignalR started');
        // Lógica adicional después de establecer la conexión
        await this.getMessages();
      })
      .catch(err => {
        console.error('Error to connect SignalR:', err);
        // Reintentar la conexión después de un retraso
        setTimeout(() => this.startConnection(), 5000);
      });
  
    // Manejar la reconexión automática en caso de desconexión
    this.hubConnection.onclose(error => {
      console.error('Close connection SignalR:', error);
      // Reintentar la conexión inmediatamente o después de un retraso
      setTimeout(() => this.startConnection(), 5000);
    });
  }

  sendMessageAPI(message:string, type:string, user:string): void {
    //console.log(user)
    //console.log(message)
    //console.log(type)
    if (message && user) {
      
      //console.log('Status of connection befor the send message:', this.getConnectionState());
  
      //this.sendMessage();
      this.sendSignalRMessage(message,type,user)
    } else {
      console.error('User and the menssagge are required');
    }
  }

  sendUserAPI(email:string, name:string, docnum:string, docentry:string): void {
    //console.log(email)
    //console.log(name)
    //console.log(docnum)
    if (name && docnum) {
      console.log('Status of connection befor the send message:', this.getConnectionState());
  
      //this.sendMessage();
      this.sendSignalRMessageUser(email,name,docnum,docentry)
    } else {
      console.error('User and the menssagge are required');
    }
  }

  removeUserAPI(email:string, name:string, docnum:string, docentry:string): void {
    //console.log(email)
    //console.log(name)
    //console.log(docnum)
    if (name && docnum) {
      console.log('Status of connection befor the send message:', this.getConnectionState());
  
      //this.sendMessage();
      this.removeSignalRMessageUser(email,name,docnum,docentry)
    } else {
      console.error('User and the menssagge are required');
    }
  }

  sendSignalRMessage(message:string, type:string, user:string) {
    this.service.sendSignalR(user, type, message)
     .subscribe(response => {
       console.log("Send the User");
     });
 }

 sendSignalRMessageUser(email:string, name:string, docnum:string | number, docentry:string | number) {
    this.service.sendUserSignalR(email, name, docnum, docentry)
     .subscribe(response => {
       console.log("Send the User");
     });
 }

 removeSignalRMessageUser(email:string, name:string, docnum:string | number, docentry:string | number) {
  this.service.removeUserSignalR(email, name, docnum, docentry)
   .subscribe(response => {
     console.log("Clean the user");
   });
}

  // Method for enviar mensajes
  public sendMessage(): void {
    console.log(this.hubConnection?.state)
    if (this.hubConnection?.state === signalR.HubConnectionState.Connected) {
      var info = {user: 'Karla',message: "holaaaa"}
      this.hubConnection.invoke('SendMessage', info)
        .then(() => console.log('Mensaje enviado exitosamente'))
        .catch(err => console.error('Error al enviar el mensaje:', err));
    } else {
      // Si la conexión no está establecida, intenta iniciarla antes de enviar el mensaje
      this.startConnection();
    }
  }
  //Verificar estado de la conexion
  public getConnectionState(): string {
    return this.hubConnection?.state ?? 'No connection';
  }
  

  public stopConnection(): void {//stop conexion
    this.hubConnection?.stop()
      .then(() => console.log('Stop Conection SignalR'))
      .catch(error => console.error('Error al detener la conexión SignalR:', error));
  }

  public getMessageStream(): Observable<string> {//Metodo para recibir messages 
    return this.messageSubject.asObservable();
  }
  
}