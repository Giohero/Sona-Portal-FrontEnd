import { Component, OnInit } from '@angular/core';
import { Order } from '../models/order';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-order-edit',
  templateUrl: './order-edit.component.html',
  styleUrls: ['./order-edit.component.css']
})
export class OrderEditComponent implements OnInit {
  order: Order | undefined; // Inicializar como undefined

  constructor( private route: ActivatedRoute,) {
    this.route.queryParams.subscribe(params => {
      let datosComoTexto = params['order'];
      this.order = JSON.parse(datosComoTexto);
    //console.log(this.CustomerData);
    });
  }

  ngOnInit(): void {
    // Simula la asignación de datos a 'order'
    // this.order = {
    //   DocNum: '1284',
    //   CardCode: 'C23900',
    //   DocDate: '2023-08-21T00:00:00Z',
    //   DocDueDate: '2023-08-21T00:00:00Z',
    //   DocumentLines: [
    //     {
    //       ItemCode: 'CA001',
    //       ItemName: 'Coconut Shell',
    //       Quantity: 55,
    //       UnitPrice: '300.0',
    //       LineTotal: 14850.0,
    //       TaxCode: 'PA',
    //       U_Comments: ''
    //     },
    //     {
    //       ItemCode: 'NS0021',
    //       ItemName: 'Services Update',
    //       Quantity: 1,
    //       UnitPrice: '100.0',
    //       LineTotal: 100.0,
    //       TaxCode: 'PA',
    //       U_Comments: ''
    //     }
    //   ]
    // };
  }
}
