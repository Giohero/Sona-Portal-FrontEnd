import { Component, Renderer2 } from '@angular/core';
import { ServiceService } from '../service/service.service';
import { ActivatedRoute, Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { Order } from '../models/order';
import { SnackbarsComponent } from '../snackbars/snackbars.component';
import { DataSharingService } from '../service/data-sharing.service';
import { IndexDbService } from '../service/index-db.service';
import { AuthService } from '../service/auth.service';
import { catchError, mergeMap, retryWhen, throwError, timer } from 'rxjs';

@Component({
  selector: 'app-order-index',
  templateUrl: './order-index.component.html',
  styleUrls: ['./order-index.component.css']
})
export class OrderIndexComponent {
  
  displayedColumns: string[] = ['docNum', 'dueDate', 'total', 'numAtCard', 'cardInfo'];
  displayedColumnsDrafts: string[] = ['Id', 'PostingDate', 'DeliveryDate', 'TaxDate', 'CardCode'];
  ListOrders: Order[] = []; 
  ListOrdersDrafts: any;
  //ListOrdersDrafts: any; 
  isOnline!:boolean;
  isLoading=true;
  searchOrder: number | undefined;
  constructor(private orderService: ServiceService, 
    private renderer: Renderer2,
    private myRouter: Router, 
    private route: ActivatedRoute, 
    private dialog: MatDialog, 
    private dataSharing: DataSharingService,
    private indexDB: IndexDbService, 
    private auth:AuthService, 
    private service:ServiceService)
  {
    window.addEventListener('online', async () => {
      this.renderer.removeClass(document.body, 'offline');
      this.isLoading = true;
      Promise.all([this.reloadDrafts(), this.reload()])
      .then(() => {
        this.isLoading = false;
      })
      .catch((error) => {
        console.error('Error al cargar datos: ', error);
        this.isLoading = false;
      });
    })
    window.addEventListener('offline', () => {
      this.renderer.addClass(document.body, 'offline');
      //console.log("ESTAS EN FUERA DE LINEA")
      this.openSnackBar('You\'re offline.', "wifi_off", "Disconnected", "darkorange");
    });

  }
  showRealOrdersFlag: boolean = true; // Bandera para mostrar órdenes normales o de borrador

  // Métodos
  showRealOrders() {
    this.showRealOrdersFlag = true;
  }

  showDraftOrders() {
    this.showRealOrdersFlag = false;
  }

  // ngOnInit(): void {
  //     Promise.all([this.reloadDrafts(), this.reload()])
  //     .then(() => {
  //       this.isLoading = false;
  //     })
  //     .catch((error) => {
  //       console.error('Error al cargar datos: ', error);
  //       this.isLoading = false;
  //     });
    
  //     // this.auth.tokenAzure$.subscribe((newToken) => {
  //     //   this.service.reloadComponent()
  //     // }
  //     // );
  // }
  ngOnInit(): void {
    this.dataSharing.statusWifi$.subscribe((isOnline) => {
      this.isOnline = isOnline;
      if (this.isOnline) {
        this.reload().then(() => {
          this.isLoading = false;
        }).catch((error) => {
          console.error('Error al cargar datos: ', error);
          this.isLoading = false;
        });
      } else {
        this.reloadDrafts().then(() => {
          this.isLoading = false;
        }).catch((error) => {
          console.error('Error al cargar drafts: ', error);
          this.isLoading = false;
        });
      }
    });
  }
  
  
  reloadAll()
  {
    this.searchOrder = undefined;
    this.isLoading = true;
    Promise.all([this.reloadDrafts(), this.reload()])
      .then(() => {
        this.isLoading = false;
      })
      .catch((error) => {
        console.error('Error al cargar datos: ', error);
        this.isLoading = false;
      });
  }
  
  async reload() {
    return new Promise<void>((resolve, reject) => {
      this.orderService.getOrders()
      .pipe(
        retryWhen(errors =>
          errors.pipe(
            mergeMap((error, attemptNumber) => (attemptNumber < 3) ? timer(5000) : throwError(error))
          )
        ),
        catchError(error => {
          this.openSnackBar('Cannot retrieve information, try again', 'error', 'Error', 'red');
          this.isLoading = false;
          return throwError(error);
        })
      )
      .subscribe(
        retData => {
          this.ListOrders = JSON.parse(retData.response!);
          resolve(); // Resuelve la promesa cuando se completan las órdenes de la API
        }
      );
    });
    
  }
  
  async reloadDrafts() {
    return new Promise<void>((resolve, reject) => {
      setTimeout(async () => {
        this.ListOrdersDrafts = await this.indexDB.getAllIndexWDocNumDB();
        resolve(); // Resuelve la promesa cuando se completan las órdenes de IndexedDB
      }, 2000);
    });
  }
  

  searchingOrder(){
    if(this.searchOrder){
      //var OrderFound = this.ListOrders?.filter(x => x.DocNum == this.searchOrder )
      const OrderFound = this.ListOrders?.filter(x => {
        return x?.DocNum?.toString().includes(this.searchOrder!.toString());
      });
      console.log(OrderFound)
      if(OrderFound.length > 0)
      {
        console.log(OrderFound)
        this.ListOrders = [];
        this.ListOrders = OrderFound; 
      }
      else
        this.openSnackBar("Don't Found any document", 'warning', "Don't Found", 'darkorange');
    }
    else
    this.openSnackBar("You should put Document Order", 'error', 'Error', 'red');
  }

  selectMatCard(order:any)
  {
    console.log(order)
    if(order.DocNum === undefined || order.DocNum == 0)
      this.dataSharing.setOrderIndexDB(order)
    else
      this.dataSharing.setOrderCReview(order)
    
    //console.log(order)
    this.myRouter.navigate(['dashboard/order-edit']);
  }

  openSnackBar(message: string, icon: string, type: string, color: string) {
    // this._snackBar.open(message, action,  {
    //   horizontalPosition: 'center',
    //   verticalPosition: 'top',
    //   duration: 5000,
    //   panelClass: ['custom-snackbar'], 
    // });

    const dialogRef = this.dialog.open(SnackbarsComponent, {
      hasBackdrop: false,
      width: '300px',
      position: {
        top: '10px',   
        right: '20px', 
      },
      data: { 
        message: message,
        icon: icon,
        type: type,
        color: color
      },
    })
    setTimeout(() => {
      dialogRef.close();
    }, 5000); 
  }
}
