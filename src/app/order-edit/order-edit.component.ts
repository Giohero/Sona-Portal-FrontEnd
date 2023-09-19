import { Component, OnInit } from '@angular/core';
import { DocumentLines, Order } from '../models/order';
import { ActivatedRoute } from '@angular/router';
import { FormControl } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { DataSharingService } from '../service/data-sharing.service';
import { ServiceService } from '../service/service.service';
import { Value } from '../models/items';
import { SnackbarsComponent } from '../snackbars/snackbars.component';
import { MatDialog } from '@angular/material/dialog';
import { Order as OrderPost, DocumentLines as DocLinePost } from '../models/car';

@Component({
  selector: 'app-order-edit',
  templateUrl: './order-edit.component.html',
  styleUrls: ['./order-edit.component.css'],
  providers: [DatePipe]
})
export class OrderEditComponent implements OnInit {
  order: Order | undefined; 
  orderOld: any | undefined; 
  post!: FormControl;
  delivery!: FormControl;
  selectedItemIndex: number | null = null;
  ListItems!: Value[];
  colorStatus=""

  constructor( private route: ActivatedRoute,private pipe: DatePipe, private dataSharing:DataSharingService, private orderService: ServiceService, private dialog: MatDialog,) {
    this.order = dataSharing.getOrderCReview();

    if(this.order != undefined)
      this.orderOld = JSON.parse(JSON.stringify(this.order));
    
    this.post = new FormControl({value: new Date(), disabled: true});
    this.delivery = new FormControl(new Date());
  }

  ngOnInit(): void {

    this.orderService.getItems().subscribe((retData) => {
      if (parseInt(retData.statusCode!) >= 200 && parseInt(retData.statusCode!) < 300) {
        this.ListItems = JSON.parse(retData.response!);
      } else {
        this.openSnackBar(retData.response!, "error", "Error", "red");
      }
    });
  }

  openSnackBar(message: string, icon: string, type: string, color: string) {
    const dialogRef = this.dialog.open(SnackbarsComponent, {
      hasBackdrop: false,
      width: '300px',
      position: {
        top: '10px',   
        right: '20px', 
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

  onSelectItem(selectedData: any, item: DocumentLines)
  {
    if (selectedData != undefined)
    {
      var itemFound = this.ListItems.find(x => x.ItemCode === selectedData);
      item.ItemDescription = itemFound!.ItemName;
      item.UnitPrice = itemFound!.ItemPrices[0].Price.toString();
    }
  }

  status(status:string)
  {
    if(status === 'bost_Close')
    {
      this.colorStatus = "2px solid #e15567";
      return 'Closed'
    }
    else
      this.colorStatus = "2px solid green";
      return 'Open'
  }

  statusCircle(status:string)
  {
    if(status === 'bost_Close')
      return 'red'
    else
      return 'green'
  }

  changeQuantity(item: DocumentLines)
  {
    var itemOld = this.orderOld?.DocumentLines.find((x:any) => x.ItemCode === item.ItemCode);
    var unitPriceOld = parseFloat(itemOld!.LineTotal) / itemOld!.Quantity;

    if(item.UnitPrice === unitPriceOld.toString())
    {
      var totalItem =  parseFloat(item.UnitPrice) * item.Quantity;
      item.LineTotal = totalItem.toString()
    }
    else
    {
      var diference = Math.abs(itemOld!.Quantity - item.Quantity);
      //console.log(itemOld!.Quantity)
      //console.log(item.Quantity)
      //console.log(this.orderOld)
      var totalUpdate = (parseFloat(item.UnitPrice) * diference);
      //console.log(totalUpdate)
      if(itemOld!.Quantity > item.Quantity)
        item.LineTotal = (parseFloat(itemOld.LineTotal) - totalUpdate).toString();
      else if(itemOld!.Quantity < item.Quantity)
        item.LineTotal = (parseFloat(itemOld.LineTotal) + totalUpdate).toString();
      else
        item.LineTotal = itemOld.LineTotal
    }
    
  }

  totalOrder()
  {
    let sumLines = this.order!.DocumentLines!.reduce((acumulador:number, elemento:any) => acumulador + parseFloat(elemento.LineTotal), 0);
    if(sumLines == this.order?.DocTotal)
      return this.order?.DocTotal
    else
      return sumLines;
  }

  addItem()
  {
    const Item : DocumentLines = {
      ItemCode: "",
      FixedItemCode: "",
      ItemDescription: "",
      Quantity: 0,
      UnitPrice: "",
      LineTotal: "",
      Dummie: "",
      TaxRate: "",
      TaxCode: "",
      U_Comments: "",
      ItemPrices: ""
    }

    this.order!.DocumentLines.push(Item)
  }

  removeItem(index: number): void {
    if (this.order && this.order.DocumentLines && this.order.DocumentLines.length > index) {
      var itemDelete = this.order.DocumentLines[index];
      this.order.DocTotal -= parseFloat(itemDelete.LineTotal);
      this.order.DocumentLines.splice(index, 1);
    }
  }

  updateOrder()
  {
    console.log(this.order)

    var DocumentLinesP: DocLinePost[];
    DocumentLinesP = [];
    
    this.order?.DocumentLines.forEach(element => {
      DocumentLinesP.push({
        ItemCode: element.ItemCode,
        Quantity: element.Quantity,
        TaxCode: 'EX',
        U_Comments: element.U_Comments
      })

      //delete DocumentLinesP[0].ItemName;
    });

    const docDueDate = this.pipe.transform(this.order?.DocDueDate, 'yyyy-MM-dd');
    const docDate = this.pipe.transform(this.order?.DocDate, 'yyyy-MM-dd');
    //const taxDate = this.pipe.transform(this.order?.TaxDate, 'yyyy-MM-dd');
    
    var OrderPost: OrderPost = {
      DocDueDate: docDueDate?.toString(),
      DocDate:docDate?.toString(),
      TaxDate: docDate?.toString(),
      AddressExtension: this.order?.AddressExtension,
      DocEntry: this.order?.DocEntry.toString(),
      DocNum: this.order?.DocNum.toString(),
      DocumentLines: DocumentLinesP!,
      CardCode: this.order?.CardCode
    }

    console.log(OrderPost)
    this.orderService.UpdateOrder(OrderPost).subscribe((retData) => {
      if (parseInt(retData.statusCode!) >= 200 && parseInt(retData.statusCode!) < 300) {
        this.openSnackBar(retData.response!, "check_circle", "Order Updated!", "green");
      } else {
        this.openSnackBar(retData.response!, "error", "Error", "red");
      }
    });
  }

}

