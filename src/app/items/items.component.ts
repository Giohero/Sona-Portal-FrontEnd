import { Component } from '@angular/core';
import { Value } from '../models/items';
import { ServiceService } from '../service/service.service';
import { MatTableDataSource } from '@angular/material/table';

@Component({
  selector: 'app-items',
  templateUrl: './items.component.html',
  styleUrls: ['./items.component.css']
})
export class ItemsComponent {
  ListItems!: Value[] ;
  displayedColumns : string [] = ['selectedCustomer', 'item', 'orderTotal', 'symbol'];
  dataSource = new MatTableDataSource(this.ListItems);

  applyFilter(event: Event){
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  constructor(private orderService: ServiceService) {}

  ngOnInit(): void {

    this.orderService.getItems().subscribe((retData) => {

      if (parseInt(retData.statusCode!) >= 200 && parseInt(retData.statusCode!) < 300) {

        this.ListItems = JSON.parse(retData.response!);
        this.dataSource = new MatTableDataSource(this.ListItems); 

      
      } else {

        console.log(retData.response);

        console.log('Error');

      }

    });

  }
  columnsToDisplay = ['selectedCustomer', 'item', 'orderTotal', 'actions'];

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