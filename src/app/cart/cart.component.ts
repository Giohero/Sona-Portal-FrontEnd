import { Component } from '@angular/core';
import { Value } from '../models/items';
import { ServiceService } from '../service/service.service';
import { ActivatedRoute, Router } from '@angular/router';
import { DocumentLines, Order } from '../models/car';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SnackbarsComponent } from '../snackbars/snackbars.component';
import { MatDialog } from '@angular/material/dialog';
import { DataSharingService } from '../service/data-sharing.service';
import Dexie from 'dexie';

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
  CartOld: DocumentLines[] | undefined;
  elementCart:any;
  OrderReview: Order | undefined;
  customer:any;
  private Db?: Dexie;
  OrderIndexDB?:any;

  constructor(private orderService: ServiceService, private dialog: MatDialog, private route: ActivatedRoute, private _snackBar: MatSnackBar, private myRouter: Router, private dataSharing: DataSharingService) {    
    this.Cart = dataSharing.getCartData();
    if(this.Cart == undefined)
      this.Cart = []
    else
      this.CartOld = JSON.parse(JSON.stringify(this.Cart));

    this.Db = new Dexie('order');
    this.Db.version(1).stores({
      orders: '++id, DocNum, CardCode, DocumentLines',
    });
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

  async addToDB(data: Order): Promise<void> {
    //const DocNum = data.DocNum;
    const CardCode = data.CardCode;
    const DocumentLines = data.DocumentLines;

    try {
      const orderId = await this.Db!.table('orders').add({ CardCode, DocumentLines });
      const retrievedOrder = await this.Db!.table('orders').get(orderId);
      this.OrderIndexDB = retrievedOrder;
      console.log(retrievedOrder);

    } catch (error) {
      console.error('Error al añadir datos a la tabla1:', error);
    }
  }

  async editToDB(id: number, DocNum: string, CardCode: string, DocumentLines: DocumentLines[]): Promise<void> {
    try {
      await  this.Db!.table('orders').put({ id, DocNum, CardCode, DocumentLines });
      console.log("Se editó el registro con ID" +id+" en la tabla1.");

    } catch (error) {
      console.error('Error al editar datos en la tabla1:', error);
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

        //this.editToDB(6, "12345", )

        this.cleanSearching()

        if(this.Cart!.length === 1)
        {
          this.OrderReview = new Order();
          this.customer = this.dataSharing.getCustomerData();
          this.OrderReview!.CardCode = this.customer.CardCode;
          this.OrderReview!.DocumentLines = this.Cart;
          this.addToDB(this.OrderReview)
          console.log('Add in the Index DB')
        }
        else
        {
          this.editToDB(this.OrderIndexDB.id, '1234', this.customer.CardCode, this.Cart!)
        }
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

  subTotal()
  {
    return this.Cart!.reduce((acum:number, elemento:any) => acum + elemento.LineTotal, 0);
  }


  openSnackBar(message: string, icon: string, type: string, color: string) {

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
    this.myRouter.navigate(['dashboard/order-customer/new-order']);
  }

  set informacion(nuevaInformacion: DocumentLines[]) {
    if (nuevaInformacion !== this.CartOld) {
      //this.Cart = nuevaInformacion;
      // Realiza acciones en respuesta al cambio de información
      console.log('La información ha cambiado:', nuevaInformacion);
    }
  }
}
