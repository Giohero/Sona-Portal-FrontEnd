import { Component, Input,Injectable,Type, ViewChild, ViewContainerRef } from '@angular/core';// ComponentFactoryResolver es ambiguo desde Angular 13
import { BehaviorSubject } from 'rxjs';

@Component({
  selector: 'app-order-window',
  templateUrl: './order-window.component.html',
  styleUrls: ['./order-window.component.css']
})
export class OrderWindowComponent {
  @ViewChild('orderEditContainer', { read: ViewContainerRef }) orderEditContainer: ViewContainerRef | undefined;//Apunto al componente padre o hijo
  private componentRef: Type<any> | undefined; //

  setComponent(component: Type<any>) {
    this.componentRef = component;
  }

  getComponent(): Type<any> {
   return this.componentRef!;
  }

  @Input() window!: OrderWindowComponent; //Mostrar o contraer ventana 
  minimized: boolean = false;
  maximized: boolean = true;
  
  toggleMinimize() {
    this.minimized = !this.minimized;
    this.maximized = !this.maximized;
  }
}
