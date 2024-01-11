import { Component, OnInit } from '@angular/core';
import { BusinessPartner } from './models/customer';
import { INResponse } from './models/INResponse';
import { Order } from './models/car';
import { AuthService } from './service/auth.service';
import { SignalRService } from './service/signalr.service';
import { ServiceService } from './service/service.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})

export class AppComponent implements OnInit {
  ListCustomers!: BusinessPartner[] ;
  response!: INResponse;
  title = 'SonaPortal';
  user ='Usuario';
  message='';
  messages:string[] = [];
  tokenSignalR='';

  constructor(private auth: AuthService,private signalRService: SignalRService, private service: ServiceService){}

  ngOnInit(): void {
    this.auth.getProfile()
    this.signalRService.startConnection();

    //Subscribe to receive message
    // this.signalRService.getMessageStream().subscribe(
    //   (message: string) => {
    //     console.log('Mensaje recibido:', message);
    //     this.messages.push(message);
    //   },
    //   (error) => console.error('Error al recibir mensajes desde SignalR:', error)
    // );

   //this.signalRService.getMessages();
  }

  ngOnDestroy(): void {
    this.signalRService.stopConnection(); // Ensure SignalR connection is stopped
  }

  sendMessage()
  {
    this.signalRService.sendSignalRMessage(this.message, 'example',this.user)
  }

}

// export function webWorker(pType: string, pOrder: Order): Promise<any>  
// return new Promise((resolve, reject) =>
//   {
//     if (typeof Worker !== 'undefined') {
//       // Create a new
//       const worker = new Worker(new URL('./app.worker', import.meta.url));
//       worker.onmessage = ({ data }) => {
//         console.log('este es el on mesaage:')
//         console.log(data)
//         resolve(data); 
//       };
//       worker.onerror = (error) => {
//         console.error('Error en el Web Worker:', error);
//         reject(error); // Rechaza la promesa en caso de error
//       };
//       worker.postMessage({type:pType, order:pOrder});
//     } else {
//       // Web Workers are not supported in this environment.
//       // You should add a fallback so that your program still executes correctly.
//       reject(new Error('Los Web Workers no son compatibles en este entorno.'));
//     }
//   });
// }

export function webWorker(pType: string, pOrder: Order, pToken: string): Promise<any> {
  return new Promise((resolve, reject) => {
    if (typeof Worker !== 'undefined') {
      const worker = new Worker(new URL('./app.worker', import.meta.url));

      worker.onmessage = ({ data }) => {
        console.log('Mensaje recibido del Web Worker:');
        console.log(data);
        resolve(data); 
      };

      worker.onerror = (error) => {
        console.error('Error en el Web Worker:', error);
        reject(error); 
      };

      worker.postMessage({ type: pType, order: pOrder, tokenAzure: pToken});
    } else {
      reject(new Error('Los Web Workers no son compatibles en este entorno.'));
    }
  });
}

  
