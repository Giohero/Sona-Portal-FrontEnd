import { Component, OnInit } from '@angular/core'; //add OnInit
import { ServiceService } from '../service/service.service'; // Ruta del servicio
import { INResponse } from '../models/INResponse';
import { BusinessPartner, Customer } from '../models/customer';
import { Router } from '@angular/router';
import { DataSharingService } from '../service/data-sharing.service';

@Component({
  selector: 'app-costumers',
  templateUrl: './costumers.component.html',
  styleUrls: ['./costumers.component.css']
})
// component and constructor to do use an api
export class CostumersComponent {
  customerData : BusinessPartner[] = [];
  /*agregamos*/
  customers: any[] = [];
  constructor(private customerService: ServiceService, private myRouter: Router, private dataSharing: DataSharingService) { }
  ngOnInit(): void { this.loadCustomerData(); }
  
  columnsToDisplay = ['selectedCustomer', 'item', 'orderTotal', 'actions'];

  importOrder(customer: any) {
    // Logic to import one order for the costumer selected
  }

  editCustomer(customer: any) {
    // Logic to change the costumer selected
    //console.log('Editar cliente:', customer);
    this.dataSharing.setCustomerData(customer);
    this.myRouter.navigate(['dashboard/order-customer/edit']);
  }

  showMoreInfo(customer: any) {
    // Logic to show more information about costumer selected
  }

  removeCustomer(customer: any) {
    // Logic to delete costumer selected
  }

  loadCustomerData(): void {
    this.customerService.getCustomer().subscribe( (retData: INResponse) => { 
    if (parseInt(retData.statusCode!) >= 200 && parseInt(retData.statusCode!) < 300)
    { this.customerData = JSON.parse
    (retData.response!); 
    console.log(this.customerData)} 
    else { console.log('Error fetching customer data'); } }, (error) => 
    { console.error('Error fetching customer data:', error); } );}
}