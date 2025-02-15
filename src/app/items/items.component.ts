import { Component } from '@angular/core';
import { Value } from '../models/items';
import { ServiceService } from '../service/service.service';
import { MatTableDataSource } from '@angular/material/table';
import Dexie from 'dexie';
import { v4 as uuidv4 } from 'uuid';
import { IndexItemsService } from '../service/index-items.service';
import { DataSharingService } from '../service/data-sharing.service';
import { catchError, mergeMap, retryWhen, switchMap, throwError, timer } from 'rxjs';
import { SnackbarsComponent } from '../snackbars/snackbars.component';
import { MatDialog } from '@angular/material/dialog';


@Component({
  selector: 'app-items',
  templateUrl: './items.component.html',
  styleUrls: ['./items.component.css'],
  
})
export class ItemsComponent {
  ListItems: Value[] = [];
  // dataSource = new MatTableDataSource(this.ListItems);
  isLoading = false;
  isOnline = true;
  showTable = 'none';
  pagedItems: Value[] = [];
  totalItems = 0;
  currentPage = 0;
  itemsPerPage = 10;

  private Db?: Dexie;
  //private OrderIndexDB:any;

  // applyFilter(event: Event) {
  //   const filterValue = (event.target as HTMLInputElement).value.toLowerCase();
    
  //   this.pagedItems = this.ListItems.filter(item =>
  //     item.ItemName.toLowerCase().includes(filterValue) ||
  //     item.ItemCode.toLowerCase().includes(filterValue) ||
  //     item.BarCode.toLowerCase().includes(filterValue)
  //   );
  //   this.setPage(0);
  // }
  applyCodeFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value.trim().toLowerCase();
  
    console.log('Filter value:', filterValue); // Verificar el valor del filtro
  
    if (filterValue) {
      this.pagedItems = this.ListItems.filter(item =>
        item.ItemCode.toLowerCase().includes(filterValue)
      );
  
      console.log('Filtered items:', this.pagedItems); // Verificar los elementos filtrados
    } else {
      this.pagedItems = this.ListItems.slice(); // Si el filtro está vacío, mostrar todos los elementos
    }
    this.setPage(0);
  }
  

  constructor(
    private orderService: ServiceService,
    private itemsService:IndexItemsService,
    private dataSharing: DataSharingService,
    private dialog: MatDialog,
  ) 
  {

  }

  ngOnInit(): void {
    this.getItemsC();
    this.dataSharing.statusWifi$.subscribe((newWifi) => {
      //console.log('llego el cambio a '+newWifi)
      this.isOnline = newWifi;
    });

    if(this.isOnline == true)
      this.getItemsC();
    else
      this.getInformationIndex();
  }
  
  async getInformationIndex()
  {
    this.isLoading = true;
    try
    {
      this.ListItems = await this.itemsService.RetrieveItemsIndex();
      
      //console.log(this.ListItems)
      this.isLoading = false;
      this.showTable = 'inline';
    } catch (error) {
      console.error('Error get index:', error);
      this.isLoading = false;
      this.showTable = 'inline';
    }
  }

  getItemsC() {
    this.isLoading = true;
    this.orderService.getItems()
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
        this.openSnackBar('Cannot retrieve information, try again', 'error', 'Error', 'red');
        this.isLoading = false;
        return throwError(error);
      })
    )
    .subscribe(
      (retData) => {
        if (parseInt(retData.statusCode!) >= 200 && parseInt(retData.statusCode!) < 300) {
          this.ListItems = JSON.parse(retData.response!);
          this.totalItems = this.ListItems.length;
          this.setPage(0);
          this.isLoading = false;
          this.showTable = 'inline';
        } else {
          console.log(retData.response);
          //console.log('Error de la API');
          this.isLoading = false;
          this.showTable = 'inline';
        }
      },
      (error) => {
        console.log('Error:', error);
        this.isLoading = false; 
        this.showTable = 'inline';
      }
    );
  }
  // async addItemIndex(data: Value): Promise<any> {
    
  //   const id = uuidv4();

  //     const ItemCode = data.ItemCode;
  //     const ItemName = data.ItemName;


  //   try {
  //     const itemId = await this.Db!.table('items').add({ id, ItemCode,ItemName});
  //     const retrievedOrder = await this.Db!.table('items').get(itemId);
  //     console.log("Agregando a Item Index DB");
  //     console.log(retrievedOrder);
  //     return retrievedOrder;
  //   } catch (error) {
  //     console.error('Error:', error);
  //     this.isLoading = false;
  //     return null;
  //   }
  // }
  importOrder(customer: any) {
    // Logic to import one order for the costumer selected
  }

  editCustomer(customer: any) {
    // Logic to change the costumer selected
    //console.log('Editar cliente:', customer);
  }

  showMoreInfo(customer: any) {
    // Logic to show more information about costumer selected
  }

  removeCustomer(customer: any) {
    // Logic to delete costumer selected
  }
  setPage(page: number) {
    this.currentPage = page;
    const startIndex = this.currentPage * this.itemsPerPage;
    this.pagedItems = this.ListItems.slice(startIndex, startIndex + this.itemsPerPage);
  }

  pageChanged(event: any) {
    this.setPage(event.pageIndex);
  }

  openSnackBar(message: string, icon: string, type: string, color: string) {
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