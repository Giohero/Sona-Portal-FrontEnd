import { Component, OnInit } from '@angular/core';
import { BusinessPartner } from './models/customer';
import { INResponse } from './models/INResponse';
import { Order } from './models/car';
import { AuthService } from './service/auth.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})

export class AppComponent implements OnInit {
  ListCustomers!: BusinessPartner[] ;
  response!: INResponse;
  title = 'SonaPortal';

  constructor(private auth: AuthService,){}

  ngOnInit(): void {
    //webWorker()
    //this.auth.initializeAuthState()
    
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

export function webWorker(pType: string, pOrder: Order): Promise<any> {
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

      worker.postMessage({ type: pType, order: pOrder });
    } else {
      reject(new Error('Los Web Workers no son compatibles en este entorno.'));
    }
  });
}

  
