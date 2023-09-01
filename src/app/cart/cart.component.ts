import { Component } from '@angular/core';
import { Value } from '../models/items';
import { ServiceService } from '../service/service.service';
import { ActivatedRoute } from '@angular/router';
import { DocumentLines } from '../models/car';

@Component({
  selector: 'app-cart',
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.css']
})
export class CartComponent {

  ListItems!: Value[] ;
  searchText = '';
  routeParams;
  customer: string | null;
  CurrentSellsItem: Value | undefined;
  ItemName = "";
  Quantity = 0;
  Price = "";
  Cart: DocumentLines[] | undefined;

  constructor(private orderService: ServiceService, private route: ActivatedRoute) {
    // this.route.queryParams.subscribe(params => {
    //   const datosComoTexto = params['customer'];
    //   //const dataOrder = JSON.parse(datosComoTexto);
    // console.log(datosComoTexto);
    // });

    this.routeParams = this.route.snapshot.paramMap;
    this.customer = this.routeParams.get('customer');
  }

  ngOnInit(): void {
    this.Cart = []
    this.orderService.getItems().subscribe((retData) => {

      if (parseInt(retData.statusCode!) >= 200 && parseInt(retData.statusCode!) < 300) {

        this.ListItems = JSON.parse(retData.response!);
        console.log(this.ListItems)
      } else {

        console.log(retData.response);

        console.log('Error');

      }

    });

  }

  addToCart(){
    if(this.Quantity > 0)
    {
      this.Cart?.push({
        ItemCode: this.searchText,
        ItemName: this.ItemName,
        Quantity: this.Quantity,
        TaxCode: "EX",
        UnitPrice: "Price"})

      this.cleanSearching()
    }
    else
    {

    }
  }

  RemoveToCart(){
    if(this.Quantity > 0)
    {
      this.Cart?.push({
        ItemCode: this.searchText,
        ItemName: this.ItemName,
        Quantity: this.Quantity,
        TaxCode: "EX",
        UnitPrice: "Price"})

      this.cleanSearching()
    }
    else
    {

    }
  }

  cleanSearching()
  {
    this.ItemName = "";
    this.Quantity = 0;
    this.Price = "";
    this.searchText = "";
  }

  onSelectItem(selectedData: any){
    //console.log(selectedData);
    //console.log('pasa por aqui');
    if (selectedData != undefined)
    {
      // this.itemIndex.patchValue({ItemName: this.CurrentSellsItem?.ItemName});
      //this.itemIndex.patchValue({ItemCode: selectedData.ItemCode});
      this.CurrentSellsItem = this.ListItems.find(x => x.ItemCode === selectedData);
      this.ItemName = this.CurrentSellsItem!.ItemName;
      console.log(this.CurrentSellsItem?.ItemPrices)
      //this.Price = this.CurrentSellsItem!.ItemPrices[0].Price.toString();
      // //Item.get('ItemCode')?.setValue(selectedData.ItemCode);
      // Item.get('ItemDescription')?.setValue(this.CurrentSellsItem?.ItemName);
      // Item.get('Quantity')?.setValue(1);
      // Item.get('TaxCode')?.setValue('EX');
      // this.addButton = false;
    }
  }
}
