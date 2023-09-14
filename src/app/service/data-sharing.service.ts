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
    this.OrderData = order;
  }

  getOrderReview() {
    return this.OrderData;
  }

  setOrderCReview(order: any) {
    this.orderCData = order;
  }

  getOrderCReview() {
    return this.orderCData;
  }
}
