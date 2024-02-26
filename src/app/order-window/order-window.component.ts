import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-order-window',
  templateUrl: './order-window.component.html',
  styleUrls: ['./order-window.component.css']
})
export class OrderWindowComponent {
  @Input() window!: OrderWindowComponent;
  minimized: boolean = false;
  maximized: boolean = true;
  
  toggleMinimize() {
    this.minimized = !this.minimized;
    this.maximized = !this.maximized;
  }
}
