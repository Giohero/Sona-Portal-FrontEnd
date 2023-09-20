import { Injectable } from '@angular/core';
import { DocumentLines, Order } from '../models/car';
import { Order as OrdeComplete} from '../models/order';

@Injectable({
  providedIn: 'root'
})
export class DataSharingService {

  customerData: any;
  //cartData:[] | undefined;
  //cartData: (DocumentLines)[] =[];
  OrderIndexDB?:any;
  cartData?: DocumentLines[];
  OrderData?: Order;
  orderCData?: OrdeComplete;

  constructor() { }

  setCustomerData(customer: any) {
    this.customerData = customer;
  }

  getCustomerData() {
    return this.customerData;
  }

  setCartData(cart: any) {
    this.cartData = cart;
  }

  getCartData() {
    return this.cartData;
  }

  setOrderReview(order: any) {
    //console.log('Order review')
    this.OrderData = order;
    //console.log(this.OrderData)
  }

  getOrderReview() {
    return this.OrderData;
  }

  setOrderCReview(order: any) {
    //console.log('OrderCReview')
    this.orderCData = order;
    //console.log(this.orderCData)
  }

  getOrderCReview() {
    return this.orderCData;
  }

  setOrderIndexDB(order: any) {
    this.OrderIndexDB = order;
  }

  getOrderIndexDB() {
    return this.OrderIndexDB;
  }
}
