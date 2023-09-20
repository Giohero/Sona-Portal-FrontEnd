import { Component, OnInit } from '@angular/core';
import { ServiceService } from '../service/service.service';
import { INResponse } from '../models/INResponse';
import { BusinessPartner, Customer } from '../models/customer';
import { Router } from '@angular/router';
import { DataSharingService } from '../service/data-sharing.service';

@Component({
  selector: 'app-costumers',
  templateUrl: './costumers.component.html',
  styleUrls: ['./costumers.component.css']
})
export class CostumersComponent implements OnInit {
  customerData: BusinessPartner[] = [];
  isLoading = false;

  constructor(
    private customerService: ServiceService,
    private myRouter: Router,
    private dataSharing: DataSharingService
  ) {}

  ngOnInit(): void {
    this.loadCustomerData();
  }

  editCustomer(customer: any) {
    this.dataSharing.setCustomerData(customer);
    this.myRouter.navigate(['dashboard/order-customer/edit']);
  }

  removeCustomer(customer: any) {
  
  }

  loadCustomerData(): void {
    this.isLoading = true;
    this.customerService.getCustomer().subscribe(
      (retData: INResponse) => {
        if (parseInt(retData.statusCode!) >= 200 && parseInt(retData.statusCode!) < 300) {
          this.customerData = JSON.parse(retData.response!);
          console.log(this.customerData);
        } else {
          console.log('Error fetching customer data');
        }
        this.isLoading = false;
      },
      (error) => {
        console.error('Error fetching customer data:', error);
        this.isLoading = false;
      }
    );
  }
}