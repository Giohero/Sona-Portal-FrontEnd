import { Injectable } from '@angular/core';
import { DocumentLines, Order } from '../models/car';
import { Order as OrdeComplete} from '../models/order';
import { BehaviorSubject, Observable } from 'rxjs';
import { UsersAzure, UsersSR } from '../models/userSignalR';

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
  private orderSignal: BehaviorSubject<any> = new BehaviorSubject<any>({});
  orderSignal$: Observable<any> = this.orderSignal.asObservable();
  private usersSignal: BehaviorSubject<UsersAzure> = new BehaviorSubject<UsersAzure>({});
  usersSignal$: Observable<UsersAzure> = this.usersSignal.asObservable();
  private updateOrder: BehaviorSubject<{}> = new BehaviorSubject<{}>({});
  updateOrder$: Observable<{}> = this.updateOrder.asObservable();
  private updateRecharge: BehaviorSubject<{}> = new BehaviorSubject<{}>({});
  updateRecharge$: Observable<{}> = this.updateRecharge.asObservable();

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

  updateMessageRecharge(message: {}): void {
    this.updateRecharge.next(message);
  }

  updateOrderRecharge(order: {}): void {
    this.updateOrder.next(order);
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
    console.log('Is Online: ' + wifi)
    this.statusWifi.next(wifi);
  }

  updateOrderSignal(updateOrder: Order | undefined): void {
    //console.log('cambio a ' + updateOrder)
    this.orderSignal.next(updateOrder);
  }

  updateUsersSignal(usersNews: UsersAzure): void {
    //console.log('cambio a ' + usersNews)
    this.usersSignal.next(usersNews);
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
