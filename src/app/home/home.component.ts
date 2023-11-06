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

}
