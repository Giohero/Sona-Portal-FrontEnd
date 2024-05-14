import { Component, Renderer2 } from '@angular/core';
import { ServiceService } from '../service/service.service';
import { ActivatedRoute, Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { Order } from '../models/order';
import { SnackbarsComponent } from '../snackbars/snackbars.component';
import { DataSharingService } from '../service/data-sharing.service';
import { IndexDbService } from '../service/index-db.service';
import { AuthService } from '../service/auth.service';
import { catchError, mergeMap, retryWhen, throwError, timer,retry, of, switchMap } from 'rxjs';//retrywhen is deprecated retry is better from v10
import { error } from 'jquery';
import { OrderEditComponent } from '../order-edit/order-edit.component';
import { getTradeshowLogs } from '../service/cosmosdb.service';
import { ConsoleLogger } from '@microsoft/signalr/dist/esm/Utils';


@Component({
  selector: 'app-order-index',
  templateUrl: './order-index.component.html',
  styleUrls: ['./order-index.component.css']
})
export class OrderIndexComponent {
  isWindowMaximized: any;
  isMenuOpen: boolean = false;
  toggleWindow() {
  throw new Error('Method not implemented.');
}

  displayedColumns: string[] = ['docNum', 'dueDate', 'total', 'numAtCard', 'cardInfo'];
  displayedColumnsDrafts: string[] = ['Id', 'PostingDate', 'DeliveryDate', 'TaxDate', 'CardCode'];
  ListOrders: Order[] = []; 
  ListOrdersDrafts: any[] = [];
  ListOrdersFound: Order [] = [];
  isOnline!:boolean;
  isLoading=true;
  searchOrder: string | undefined;
  searchedOrder: any; // Variable para almacenar la orden encontrada
  statusIcon ='indexdb';
  isSmallScreen = false;
  pagedItems: Order[] = [];
  pagedDraft: any[] = [];
  tradeshowList: any[] = [];
  titleloaded : boolean = false;

  constructor(private orderService: ServiceService, 
    private renderer: Renderer2,
    private myRouter: Router, 
    private route: ActivatedRoute, 
    private dialog: MatDialog, 
    private dataSharing: DataSharingService,
    private indexDB: IndexDbService, 
    private auth:AuthService, 
    private service:ServiceService,
    )
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
      this.renderer.listen('window', 'resize', () => {
        this.isSmallScreen = window.innerWidth < 268; // Puedes ajustar este valor según tus necesidades
      });
    
      //console.log("ESTAS EN FUERA DE LINEA")
      this.openSnackBar('You\'re offline.', "wifi_off", "Disconnected", "darkorange");
    });

  }
  showRealOrdersFlag: boolean = true; // Bandera para mostrar órdenes normales o de borrador

  // Métodos
  showRealOrders() {
    this.showRealOrdersFlag = true;
    this.searchOrder = undefined
    this.pagedItems = this.ListOrders
    this.reloadAll();
  }
  
  showDraftOrders() {
    this.showRealOrdersFlag = false;
    this.searchOrder = ""
    this.pagedDraft = this.ListOrdersDrafts
  }

  dropDownList(){
    this.isMenuOpen = !this.isMenuOpen;
  }

  // optionSelected(option: string) {
  //   console.log('Option selected:', option);
  //   if(option === 'Option1'){
  //     this.sortOrders();
  //   }
  // }

  sortOrders() {
    this.ListOrders.sort((a, b) => b.DocNum - a.DocNum);
  }

  private updateIconsBasedOnSource() {
    this.ListOrders.forEach(order => {
      // Asume que `order` tiene una propiedad `source`
      order.icon = order.source === 'indexdb' ? 'indexdb' : 'cosmosdb';
    });
  }
  
  // Método para calcular el total de los line total y mostrarlos en los Matcards
  calculateOrderTotal(order: Order) {
    let orderTotal = 0;
    if (order && order.DocumentLines) {
      orderTotal = order.DocumentLines.reduce((total, line) => {
        if (typeof line.LineTotal === 'string') {
          const lineTotalNumber: number = parseFloat(line.LineTotal);
          if (!isNaN(lineTotalNumber)) {
            return total + lineTotalNumber;
          } else {
            console.error('LineTotal is not a valid number:', line.LineTotal);
            return total; // Si LineTotal no es un número válido, no sumamos nada
          }
        } else {
          console.error('LineTotal is not a string:', line.LineTotal);
          return total; // Si LineTotal no es una cadena, no sumamos nada
        }
      }, 0);
    }
    return orderTotal.toFixed(2);
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
  async ngOnInit(){
    setTimeout(() =>{
      this.titleloaded = true;
      //console.log("cargó");
    }, 1000);
    this.tradeshowList = await getTradeshowLogs();
    console.log(this.tradeshowList);
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
    //this.getSearchFilter();
    
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
  
  // async reload() {
  //   return new Promise<void>((resolve, reject) => {
  //     this.orderService.getOrders()
  //     .pipe(
  //       retryWhen(errors =>
  //         errors.pipe(
  //           mergeMap((error, attemptNumber) => (attemptNumber < 3) ? timer(5000) : throwError(error))
  //         )
  //       ),
  //       catchError(error => {
  //         this.openSnackBar('Cannot retrieve information, try again', 'error', 'Error', 'red');
  //         this.isLoading = false;
  //         return throwError(error);
  //       })
  //     )
  //     .subscribe(
  //       retData => {
  //         this.ListOrders = JSON.parse(retData.response!);
  //         //console.log('ListOrders:', this.ListOrders);
  //         this.sortOrders();
  //         // this.ListOrders.forEach(order => {
  //         //   //console.log(`Order ${order.DocNum}: Total - ${order.DocTotal}`);
  //         // });
  //         resolve();
  //       },
  //       error => {
  //         reject(error);
  //       }
  //     );      
  //   });
  // }

  async reload() {
    return new Promise<void>((resolve, reject) => {
      this.orderService.getOrders()
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
            console.error('An error occurred', error);
            return throwError(() => new Error('An error occurred')); // Aquí puedes manejar cómo finalmente emitir el error
          })
        )
        .subscribe({
          next: retData => {
            this.ListOrders = JSON.parse(retData.response!);
            this.pagedItems = this.ListOrders
             //console.log('ListOrders:', this.ListOrders);
              this.sortOrders();
             // this.ListOrders.forEach(order => {
             //   //console.log(`Order ${order.DocNum}: Total - ${order.DocTotal}`);
             // });
            resolve();
          },
          error: error => reject(error)
        });
    });
  }
  
  async reloadDrafts() {
    return new Promise<void>((resolve, reject) => {
      setTimeout(async () => {
        this.ListOrdersDrafts = await this.indexDB.getAllIndexWDocNumDB();
        this.pagedDraft = this.ListOrdersDrafts;
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
      //console.log(searchText)
      // Debouncing
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {       
          this.service.GetOldSalesOrders(searchText).subscribe(retData => {
            if (parseInt(retData.statusCode!) >= 200 && parseInt(retData.statusCode!) < 300) {
              this.searchedOrder = retData.response; 
              //console.log(this.searchedOrder); 
              this.ListOrdersFound=JSON.parse(retData.response!)
            } else {
              this.openSnackBar(retData.response!, "error", "Error", "red");
            }
          });
      }, 3000); 
  });
  }

  applyCodeFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value.trim().toLowerCase();
  
    console.log('Filter value:', filterValue);
  
    if (filterValue) {

      if(this.showRealOrdersFlag == true)
      {
        this.pagedItems = this.ListOrders.filter(item =>
          (item.CardCode && item.CardCode.toLowerCase().includes(filterValue)) ||
          (item.DocNum && item.DocNum.toString().includes(filterValue)) ||
          (item.CardName && item.CardName.toLowerCase().includes(filterValue)) ||
          (item.DocDate && item.DocDate.toLowerCase().includes(filterValue))
        );
      }
      else
      {
        this.pagedDraft = this.ListOrdersDrafts.filter(item =>
          (item.id && item.id.toString().toLowerCase().includes(filterValue)) ||
          (item.Order.CardCode && item.Order.CardCode.toLowerCase().includes(filterValue)) ||
          (item.Order.CardName && item.Order.CardName.toLowerCase().includes(filterValue)) ||
          (item.Order.DocDate && item.Order.DocDate.toLowerCase().includes(filterValue))
        );

        //console.log(this.ListOrdersDrafts)
        //console.log(this.pagedDraft)
      }
  
      //console.log('Filtered items:', this.pagedItems); 
    } else {
      this.pagedItems = this.ListOrders.slice(); 
      this.pagedDraft = this.ListOrdersDrafts.slice();
    }
    //this.setPage(0);
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

  GetTradeshow(tradeshowName: string) {
    console.log('Tradeshow seleccionado:', tradeshowName);
    this.service.GetTradeshowByOrders(tradeshowName).subscribe(
      retData => {
        if(parseInt(retData.statusCode!) >= 200 && parseInt(retData.statusCode!) <= 300){
          this.ListOrders = JSON.parse(retData.response!);
            this.pagedItems = this.ListOrders
             //console.log('ListOrders:', this.ListOrders);
              this.sortOrders();
        }else{
          console.log(retData.response)
        }
        console.log(retData)
      }
    );
  }

}
