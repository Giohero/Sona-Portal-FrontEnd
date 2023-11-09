import { Injectable } from '@angular/core';
import { DocumentLines, Order } from '../models/car';
import { Order as OrdeComplete} from '../models/order';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DataSharingService {

  private customerData: any;
  //cartData:[] | undefined;
  //cartData: (DocumentLines)[] =[];
  private OrderIndexDB?:any;
  private cartData?: DocumentLines[];
  private OrderData?: Order;
  private orderCData?: OrdeComplete;
  private listaSubject: BehaviorSubject<DocumentLines[]> = new BehaviorSubject<DocumentLines[]>([]);
  cartData$: Observable<DocumentLines[]> = this.listaSubject.asObservable();
  private docNumPublish: BehaviorSubject<number> = new BehaviorSubject<number>(0);
  docNum$: Observable<number> = this.docNumPublish.asObservable();
  private docEntryPublish: BehaviorSubject<number> = new BehaviorSubject<number>(0);
  docEntry$: Observable<number> = this.docEntryPublish.asObservable();
  private OrderIndexDBActual: BehaviorSubject<any> = new BehaviorSubject<any>({});
  OrderIndexDB$: Observable<number> = this.OrderIndexDBActual.asObservable();
  private TransactionIndexDBActual: BehaviorSubject<any> = new BehaviorSubject<any>({});
  TransactionIndexDB$: Observable<number> = this.TransactionIndexDBActual.asObservable();
  private statusWifi: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(true);
  statusWifi$: Observable<boolean> = this.statusWifi.asObservable();

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

  updateCart(cart: DocumentLines[]): void {
    this.listaSubject.next(cart);
  }

  updateIdsOrder(docnum: number, docentry:number): void {
    this.docNumPublish.next(docnum);
    this.docEntryPublish.next(docentry);
  }

  updateIndexOrder(order: any): void {
    this.OrderIndexDBActual.next(order);
  }

  updateIndexTransaction(transactions: any): void {
    this.TransactionIndexDBActual.next(transactions);
  }

  updateWifi(wifi: boolean): void {
    console.log('cambio a ' + wifi)
    this.statusWifi.next(wifi);
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
