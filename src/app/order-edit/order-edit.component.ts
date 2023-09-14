import { Component, OnInit } from '@angular/core';
import { Order } from '../models/order';
import { ActivatedRoute } from '@angular/router';
import { FormControl } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { DataSharingService } from '../service/data-sharing.service';

@Component({
  selector: 'app-order-edit',
  templateUrl: './order-edit.component.html',
  styleUrls: ['./order-edit.component.css'],
  providers: [DatePipe]
})
export class OrderEditComponent implements OnInit {
  order: Order | undefined; 
  orderOld: Order | undefined; 
  post!: FormControl;
  delivery!: FormControl;
  selectedItemIndex: number | null = null;


  constructor( private route: ActivatedRoute,private pipe: DatePipe, private dataSharing:DataSharingService) {
    this.order = dataSharing.getOrderCReview();
    this.orderOld = dataSharing.getOrderCReview();
    const dateToday = this.pipe.transform(this.order?.DocDate, 'yyyy-MM-dd');
    const dateDelivery = this.pipe.transform(this.order?.DocDueDate, 'yyyy-MM-dd');

    this.post = new FormControl({value: new Date(), disabled: true});
    this.delivery = new FormControl(new Date());
  }

  ngOnInit(): void {

  }

  disableUpdate(orderNew :Order)
  {
    if (orderNew !== this.orderOld) 
      return false;
    else
      return true;
  }

  removeItem(index: number): void {
    if (this.order && this.order.DocumentLines && this.order.DocumentLines.length > index) {
      this.order.DocumentLines.splice(index, 1);
    }
  }
}
