import { Component } from '@angular/core';
import { Value } from '../models/items';
import { ServiceService } from '../service/service.service';
import {MatTabsModule} from '@angular/material/tabs';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent {
  ListItems!: Value[] ;
  
  searchText = '';
  isSidebarExpanded: boolean = false;
  ordersData: { name: any; value: any; }[] | undefined;
  lastThreeMonths: any;

  constructor(private orderService: ServiceService) {}

  ngOnInit(): void {
    this.orderService.getItems().subscribe((retData) => {
      if (parseInt(retData.statusCode!) >= 200 && parseInt(retData.statusCode!) < 300) {
        this.ListItems = JSON.parse(retData.response!);
      } else {
        console.log(retData.response);
        console.log('Error');
      }
    });
  }

  onSelectMaterial(selectedData: any){
    //console.log(selectedData);
    //console.log('pasa por aqui');
    if (selectedData != undefined)
    {
      // this.itemIndex.patchValue({ItemName: this.CurrentSellsItem?.ItemName});
      //this.itemIndex.patchValue({ItemCode: selectedData.ItemCode});
      // this.CurrentSellsItem = this.optionsItemCode.find(x => x.ItemCode === selectedData || x.ItemName === selectedData);
      // //Item.get('ItemCode')?.setValue(selectedData.ItemCode);
      // Item.get('ItemDescription')?.setValue(this.CurrentSellsItem?.ItemName);
      // Item.get('Quantity')?.setValue(1);
      // Item.get('TaxCode')?.setValue('EX');
      // this.addButton = false;
    }
  }

  getOrderLogDataComparation(): void {
    this.orderService.getOrderLogDataComparation().subscribe(
      (retData) => {
        if (parseInt(retData.statusCode!) >= 200 && parseInt(retData.statusCode!) < 300) {
          const orderCountCurrentMonth = retData.orderCountCurrentMonth;
          const orderCountPreviousMonth = retData.orderCountLastMonth;
          const orderCountTwoMonthsAgo = retData.orderCountTwoMonthsAgo;
          const orderCountThreeMonthsAgo = retData.orderCountThreeMonthsAgo;

          this.ordersData = [
            {
              name: this.lastThreeMonths[3],
              value: orderCountCurrentMonth
            },
            {
              name: this.lastThreeMonths[2], 
              value: orderCountPreviousMonth 
            },
            {
              name: this.lastThreeMonths[1], 
              value: orderCountTwoMonthsAgo 
            },
            {
              name: this.lastThreeMonths[0],
              value: orderCountThreeMonthsAgo
            }
          ];
          console.log("data" + this.ordersData);
        } else {
          console.error('Failed to retrieve order log data:', retData.statusCode);
        }
      },
      (error) => {
        console.error('Failed to retrieve order log data:', error);
      }
    );
  }

}
