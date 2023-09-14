import { Component } from '@angular/core';
import { Value } from '../models/items';
import { ServiceService } from '../service/service.service';
import { ActivatedRoute, Router } from '@angular/router';
import { DocumentLines, Order } from '../models/car';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SnackbarsComponent } from '../snackbars/snackbars.component';
import { MatDialog } from '@angular/material/dialog';
import { DataSharingService } from '../service/data-sharing.service';

@Component({
  selector: 'app-cart',
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.css']
})
export class CartComponent {

  ListItems!: Value[] ;
  searchText = '';
  CurrentSellsItem: Value | undefined;
  ItemName = "";
  Quantity = 0;
  Price = "";
  Cart: DocumentLines[] | undefined;
  elementCart:any;
  OrderReview: Order | undefined;
  customer:any;

  constructor(private orderService: ServiceService, private dialog: MatDialog, private route: ActivatedRoute, private _snackBar: MatSnackBar, private myRouter: Router, private dataSharing: DataSharingService) {    
    this.Cart = dataSharing.getCartData();
    if(this.Cart == undefined)
      this.Cart = []
  }

  ngOnInit(): void {
    
    //console.log(this.Cart)
    this.elementCart = "info-card image-card";
    this.orderService.getItems().subscribe((retData) => {

      if (parseInt(retData.statusCode!) >= 200 && parseInt(retData.statusCode!) < 300) {

        this.ListItems = JSON.parse(retData.response!);
        //console.log(this.ListItems)
      } else {

        this.openSnackBar(retData.response!, "error", "Error", "red");

      }

    });

    
    if(this.Cart!.length > 0)
    {
      const element = document.getElementById('Cart');
        element!.classList.remove('image-card');
    }

  }

  addToCart(){
    
    if(this.ItemName != "")
    {
      if(this.Quantity > 0)
      {
        //console.log(this.Cart?.length)
        const element = document.getElementById('Cart');
        element!.classList.remove('image-card');

        this.Cart?.push({
          ItemCode: this.searchText,
          ItemName: this.ItemName,
          Quantity: this.Quantity,
          TaxCode: "EX",
          UnitPrice: this.Price,
          LineTotal: parseFloat(this.Price) * this.Quantity,
          U_Comments: ""
        })

        this.cleanSearching()
      }
      else
      {
        this.openSnackBar("You must add Quantity more than zero", "warning", "Warning", "darkorange");
      }
    }
    else
    {
      this.openSnackBar("You must select an Item", "error", "Error", "red");
    }

    
  }

  updateTotal(item: DocumentLines) {
    if(item.UnitPrice)
      item.LineTotal = parseFloat(item.UnitPrice) * item.Quantity;
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
        top: '10px',   // Ajusta la posición vertical según sea necesario
        right: '20px', // Ajusta la posición horizontal según sea necesario
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
      this.CurrentSellsItem = this.ListItems.find(x => x.ItemCode === selectedData);
      this.ItemName = this.CurrentSellsItem!.ItemName;
      //console.log(this.CurrentSellsItem?.ItemPrices)
      this.Price = this.CurrentSellsItem!.ItemPrices[0].Price.toString();
    }
  }

  nextWindow()
  {
    this.OrderReview = new Order();
    this.customer = this.dataSharing.getCustomerData();
     this.OrderReview!.CardCode = this.customer.CardCode;
     this.OrderReview!.DocumentLines = this.Cart;
    if(this.Cart!.length != 0)
    {
      this.dataSharing.setCartData(this.Cart);
      this.dataSharing.setOrderReview(this.OrderReview)

      this.myRouter.navigate(['dashboard/order-review']);
      //this.router.navigate(['dashboard/allocation/info/'+index.DocNum], { queryParams: { dataOrder: OrderText } });
    }
    else
    {
      this.openSnackBar("You Need Add Items to Cart", "error", "Error", "red");
    }
  }

  backWindow()
  {
    this.dataSharing.setCartData(this.Cart);
    this.myRouter.navigate(['dashboard/orders']);
  }
}