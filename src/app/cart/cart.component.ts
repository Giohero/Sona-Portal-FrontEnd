import { Component } from '@angular/core';
import { Value } from '../models/items';
import { ServiceService } from '../service/service.service';
import { ActivatedRoute, Router } from '@angular/router';
import { DocumentLines, Order } from '../models/car';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-cart',
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.css']
})
export class CartComponent {

  ListItems!: Value[] ;
  searchText = '';
  //routeParams;
  CurrentSellsItem: Value | undefined;
  ItemName = "";
  Quantity = 0;
  Price = "";
  Cart: DocumentLines[] | undefined;
  elementCart:any;
  OrderReview: Order | undefined;
  customer:any;

  constructor(private orderService: ServiceService, private route: ActivatedRoute, private _snackBar: MatSnackBar, private myRouter: Router) {
    this.route.queryParams.subscribe(params => {
      const datosComoTexto = params['customer'];
      const dataOrder = JSON.parse(datosComoTexto);
      this.customer = dataOrder;
      
      console.log(this.customer);
    });
    
    // this.routeParams = this.route.snapshot.paramMap;
    // this.customer = this.routeParams.get('customer');
  }

  ngOnInit(): void {
    this.Cart = []
    //console.log(this.Cart)
    this.elementCart = "info-card image-card";
    this.orderService.getItems().subscribe((retData) => {

      if (parseInt(retData.statusCode!) >= 200 && parseInt(retData.statusCode!) < 300) {

        this.ListItems = JSON.parse(retData.response!);
        //console.log(this.ListItems)
      } else {

        this.openSnackBar("Error: " + retData.response, "")

      }

    });

  }

  addToCart(){
    if(this.ItemName != "")
    {
      if(this.Quantity > 0)
      {
        console.log(this.Cart?.length)
        const element = document.getElementById('Cart');
        element!.classList.remove('image-card');

        this.Cart?.push({
          ItemCode: this.searchText,
          ItemName: this.ItemName,
          Quantity: this.Quantity,
          TaxCode: "EX",
          UnitPrice: this.Price,
          LineTotal: parseFloat(this.Price) * this.Quantity,
        })

        this.cleanSearching()
      }
      else
      {
        this.openSnackBar("You must add Quantity more than zero", "")
      }
    }
    else
    {
      this.openSnackBar("You must select an Item", "")
    }

    
  }

  openSnackBar(message: string, action: string) {
    this._snackBar.open(message, action,  {
      horizontalPosition: 'center',
      verticalPosition: 'top',
      duration: 5000,
      panelClass: ['custom-snackbar'], 
    });
  }

  RemoveToCart(index: number){
    this.Cart!.splice(index, 1);
    this.cleanSearching();

    if(this.Cart!.length === 0)
    {
      const miDiv = document.getElementById('Cart');
      miDiv!.classList.add('image-card');
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
      //console.log(this.CurrentSellsItem?.ItemPrices)
      this.Price = this.CurrentSellsItem!.ItemPrices[0].Price.toString();
      // //Item.get('ItemCode')?.setValue(selectedData.ItemCode);
      // Item.get('ItemDescription')?.setValue(this.CurrentSellsItem?.ItemName);
      // Item.get('Quantity')?.setValue(1);
      // Item.get('TaxCode')?.setValue('EX');
      // this.addButton = false;
    }
  }

  nextWindow()
  {
    this.OrderReview = new Order();
     this.OrderReview!.CardCode = this.customer.CardCode;
     this.OrderReview!.DocumentLine = this.Cart;
    if(this.Cart!.length != 0)
    {
      this.myRouter.navigate(['dashboard/order-review'], {queryParams: { orderR: JSON.stringify(this.OrderReview), customer:JSON.stringify(this.customer)}});
      //this.router.navigate(['dashboard/allocation/info/'+index.DocNum], { queryParams: { dataOrder: OrderText } });
    }
    else
    {
      this.openSnackBar("Error: You Need Add Items to Cart", "");
    }
  }

  backWindow()
  {
    this.myRouter.navigate(['dashboard/cart'], {queryParams: {customer: JSON.stringify(this.customer)}});
  }
}
