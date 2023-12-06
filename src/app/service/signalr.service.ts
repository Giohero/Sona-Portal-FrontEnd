import { Injectable } from '@angular/core';
import * as signalR from '@microsoft/signalr';
import { BehaviorSubject, Observable, Subject, catchError, throwError } from 'rxjs';
import { AuthService } from './auth.service';
import { ServiceService } from './service.service';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { OrderEditComponent } from '../order-edit/order-edit.component';
import { DataSharingService } from './data-sharing.service';

@Injectable({
  providedIn: 'root'
})
export class SignalRService {
  private hubConnection?: signalR.HubConnection;
  private messageSubject: Subject<string> = new Subject<string>();
  private tokenSignal: BehaviorSubject<string> = new BehaviorSubject<string>('');
  tokenSignal$: Observable<string> = this.tokenSignal.asObservable();
  tokenSignalR='';

  constructor(private authService: AuthService, private service: ServiceService, private myhttp: HttpClient, private router: Router, private dataSharing: DataSharingService) {

    this.tokenSignal$.subscribe((tokenR:string) => {
      console.log('ya paso por aqui el token '+ tokenR)
      this.tokenSignalR = tokenR;
    } )

    this.startConnection();
    //this.getMessageStream();
  }

  updateToken(newtoken: string): void {
    this.tokenSignal.next(newtoken);
  }

 async getMessages(){
    //  Este es mtodo del server es el que manejara los mensajes entrantes
    // Después de recibir un mensaje
    console.log(this.hubConnection?.state)
    this.hubConnection?.on('SendMessage', (user: string, message: string, type: string) => {
      const fullMessage = `${type} - ${user}: ${message}`;
      console.log('Mensaje recibido:', fullMessage);

      const currentRoute = this.router.url;
      console.log('Ruta actual:', currentRoute);
      
      if(currentRoute === '/dashboard/order-edit' && type === 'order')
      {
        console.log('Lo enviaremos a orden edit');
        this.dataSharing.updateOrderSignal(JSON.parse(message));
      }
      else if(currentRoute === '/dashboard/customers-edit'&& type === 'customer')
      {

      }
      //this.messageSubject.next(fullMessage);
    });
  }

  //metodo para inicializar la conexion 
  startConnection = () => {
    this.service.GetTokenSignal()
    .subscribe(token => {
      
    this.updateToken(token.accessToken)

    this.hubConnection = new signalR.HubConnectionBuilder()
    .withUrl(token.url, {
      accessTokenFactory: () => token.accessToken
    })
    .build();

    this.hubConnection
    .start()
    .then(async () => 
    {console.log('Conexión SignalR iniciada')
    //this.getMessageStream()
    await this.getMessages()
    //await this.sendMessage()
    })
    .catch(err => console.error('Error al iniciar la conexión SignalR:', err));
  })
  }

  sendMessageAPI(message:string, type:string, user:string): void {
    console.log(user)
    console.log(message)
    if (message && user) {
      
      console.log('Estado de la conexion antes de enviar un mensaje:', this.getConnectionState());
  
      //this.sendMessage();
      this.sendSignalRMessage(message,type,user)
    } else {
      console.error('El usuario y el mensaje son obligatorios.');
    }
  }

  sendSignalRMessage(message:string, type:string, user:string) {
    this.service.sendSignalR(user, type, message)
     .subscribe(response => {
       console.log("Ya se envio");
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
    return this.hubConnection?.state ?? 'No hay conexión';
  }
  

  public stopConnection(): void {//stop conexion
    this.hubConnection?.stop()
      .then(() => console.log('Conexión SignalR detenida'))
      .catch(error => console.error('Error al detener la conexión SignalR:', error));
  }

  public getMessageStream(): Observable<string> {//Metodo para recibir messages 
    return this.messageSubject.asObservable();
  }
  
}