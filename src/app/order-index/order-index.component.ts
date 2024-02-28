import { Component, Renderer2,ViewChild, ViewContainerRef } from '@angular/core';
import { ServiceService } from '../service/service.service';
import { ActivatedRoute, Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { Order } from '../models/order';
import { SnackbarsComponent } from '../snackbars/snackbars.component';
import { DataSharingService } from '../service/data-sharing.service';
import { IndexDbService } from '../service/index-db.service';
import { AuthService } from '../service/auth.service';
import { catchError, mergeMap, retryWhen, throwError, timer } from 'rxjs';
import { error } from 'jquery';
import { OrderWindowService } from '../service/order-window.service';
import { OrderEditComponent } from '../order-edit/order-edit.component';

@Component({
  selector: 'app-order-index',
  templateUrl: './order-index.component.html',
  styleUrls: ['./order-index.component.css']
})
export class OrderIndexComponent {
  isWindowMaximized: any;
  toggleWindow() {
  throw new Error('Method not implemented.');
}

  displayedColumns: string[] = ['docNum', 'dueDate', 'total', 'numAtCard', 'cardInfo'];
  displayedColumnsDrafts: string[] = ['Id', 'PostingDate', 'DeliveryDate', 'TaxDate', 'CardCode'];
  ListOrders: Order[] = []; 
  ListOrdersDrafts: any;
  ListOrdersFound: Order [] = [];
  isOnline!:boolean;
  isLoading=true;
  searchOrder: number | undefined;
  searchedOrder: any; // Variable para almacenar la orden encontrada
  statusIcon ='indexdb';
  constructor(private orderService: ServiceService, 
    private renderer: Renderer2,
    private myRouter: Router, 
    private route: ActivatedRoute, 
    private dialog: MatDialog, 
    private dataSharing: DataSharingService,
    private indexDB: IndexDbService, 
    private auth:AuthService, 
    private service:ServiceService,
    private orderWindowService: OrderWindowService)
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
  sortOrders() {
    this.ListOrders.sort((a, b) => b.DocNum - a.DocNum);
  }
  // ...

  private updateIconsBasedOnSource() {
    this.ListOrders.forEach(order => {
      // Asume que `order` tiene una propiedad `source`
      order.icon = order.source === 'indexdb' ? 'indexdb' : 'cosmosdb';
    });
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
    //icons index and cosmos
    this.dataSharing.statusWifi$.subscribe((isOnline) => {
      this.isOnline = isOnline;
      if (this.isOnline) {
        Promise.all([this.reloadDrafts(), this.reload()])
      .then(() => {
        this.isLoading = false;
      })
      .catch((error) => {
        console.error('Error charge the data: ', error);
        this.isLoading = false;
      });
      } else {
        this.reloadDrafts().then(() => {
          this.isLoading = false;
        }).catch((error) => {
          console.error('Error charge drafts: ', error);
          this.isLoading = false;
        });
      }
    });
    this.getSearchFilter();
    
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
          //console.log('ListOrders:', this.ListOrders);
          this.sortOrders();
          // this.ListOrders.forEach(order => {
          //   //console.log(`Order ${order.DocNum}: Total - ${order.DocTotal}`);
          // });
          resolve();
        },
        error => {
          reject(error);
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


  getSearchFilter()
  {
    let timeoutId:any = null;
    const element = document.getElementById('search-input');

    element!.addEventListener('input', (e) => {
      const target = e.target as HTMLInputElement; // Casting a HTMLInputElement
      const searchText = target.value;
      console.log(searchText)
      // Debouncing
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {       
          this.service.GetOldSalesOrders(searchText).subscribe(retData => {
            if (parseInt(retData.statusCode!) >= 200 && parseInt(retData.statusCode!) < 300) {
              this.searchedOrder = retData.response; 
              console.log(this.searchedOrder); 
              this.ListOrdersFound=JSON.parse(retData.response!)
            } else {
              this.openSnackBar(retData.response!, "error", "Error", "red");
            }
          });
      }, 3000); 
  });
  }

  selectMatCard(order:any)
  {
   
    console.log(order)
    if(order.DocNum === undefined || order.DocNum == 0 || Number.isNaN(order.DocNum))
      this.dataSharing.setOrderIndexDB(order)
    else
    {
      
      this.dataSharing.setOrderCReview(order)
    }
      
    
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
