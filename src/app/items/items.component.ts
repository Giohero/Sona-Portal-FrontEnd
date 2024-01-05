import { Component } from '@angular/core';
import { Value } from '../models/items';
import { ServiceService } from '../service/service.service';
import { MatTableDataSource } from '@angular/material/table';
import Dexie from 'dexie';
import { v4 as uuidv4 } from 'uuid';


@Component({
  selector: 'app-items',
  templateUrl: './items.component.html',
  styleUrls: ['./items.component.css'],
  
})
export class ItemsComponent {
  ListItems!: Value[] ;
  displayedColumns : string [] = ['selectedCustomer', 'item', 'orderTotal', 'symbol'];
  dataSource = new MatTableDataSource(this.ListItems);
  isLoading = false;

  private Db?: Dexie;
  //private OrderIndexDB:any;

  applyFilter(event: Event){
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  constructor(private orderService: ServiceService) {

    this.Db = new Dexie('items');
    this.Db.version(3).stores({
      items: '++id, ItemCode,ItemName'
    });
  }

  ngOnInit(): void {
    this.getItemsC();
  }
  columnsToDisplay = ['selectedCustomer', 'item', 'orderTotal', 'actions'];
  
  getItemsC() {
    this.isLoading = true;
    this.orderService.getItems().subscribe(
      (retData) => {
        if (parseInt(retData.statusCode!) >= 200 && parseInt(retData.statusCode!) < 300) {
          this.ListItems = JSON.parse(retData.response!);
  
          // Opción 1: Si getItemsC devuelve una lista de Value
          this.ListItems.forEach(item => {
            this.addItemIndex(item);
          });
  
          this.dataSource = new MatTableDataSource(this.ListItems);
          this.isLoading = false;
        } else {
          console.log(retData.response);
          console.log('Error de la API');
          this.isLoading = false;
        }
      },
      (error) => {
        console.log('Error en la solicitud:', error);
        this.isLoading = false; 
      },
      () => {
        console.log('Carga completa');
        this.isLoading = false;
      }
    );
  }
  async addItemIndex(data: Value): Promise<any> {
    
    const id = uuidv4();

      const ItemCode = data.ItemCode;
      const ItemName = data.ItemName;


    try {
      const itemId = await this.Db!.table('items').add({ id, ItemCode,ItemName});
      const retrievedOrder = await this.Db!.table('items').get(itemId);
      console.log("Agregando a Item Index DB");
      console.log(retrievedOrder);
      return retrievedOrder;
    } catch (error) {
      console.error('Error:', error);
      this.isLoading = false;
      return null;
    }
  }
  importOrder(customer: any) {
    // Logic to import one order for the costumer selected
  }

  editCustomer(customer: any) {
    // Logic to change the costumer selected
    console.log('Editar cliente:', customer);
  }

  showMoreInfo(customer: any) {
    // Logic to show more information about costumer selected
  }

  removeCustomer(customer: any) {
    // Logic to delete costumer selected
  }
}