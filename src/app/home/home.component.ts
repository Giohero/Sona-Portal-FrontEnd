import { Component } from '@angular/core';
import { Value } from '../models/items';
import { ServiceService } from '../service/service.service';
import {MatTabsModule} from '@angular/material/tabs';
import { Color, ScaleType } from '@swimlane/ngx-charts';
import { catchError, mergeMap, retryWhen, throwError, timer } from 'rxjs';
import { SnackbarsComponent } from '../snackbars/snackbars.component';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent {
  ListItems!: Value[] ;
  
  searchText = '';
  isSidebarExpanded: boolean = false;
  ordersData: { name: any; value: any; }[] | undefined;
  lastThreeMonths: any;
  single:any;
  multi:any;
  singleBar:any;

  // options
  showXAxis = false;
  showYAxis = true;
  gradient = false;
  showLegend = false;

  showLegendBar = true;
  showXAxisLabel = true;
  xAxisLabel = 'Country';
  showYAxisLabel = false;
  yAxisLabel = 'Population';

  colorSchemeBar = {
    domain: ['#5AA454', '#A10A28', '#C7B42C', '#AAAAAA']
  };
  //single: any[] = [];
  //multi: any[] = [];

  

  // colorScheme = {
  //   domain: ['#5AA454', '#A10A28', '#C7B42C', '#AAAAAA']
  // };

  colorScheme: Color = {
    name: 'Custom Palette',
    selectable: true,
    group: ScaleType.Ordinal,
    domain: ['#5AA454', '#A10A28', '#C7B42C', '#AAAAAA']
  };
  

  constructor(private orderService: ServiceService, private dialog: MatDialog,) {
    const single1 = this.single;
    const multi1 = this.multi;
    Object.assign(this, {single1, multi1}) 
  }


  // pie
  showLabels = true;
  explodeSlices = false;
  doughnut = false;
  

  onSelect(event: Event) {
    console.log(event);
  }

  ngOnInit(): void {
    // this.orderService.getItems().subscribe((retData) => {
    //   if (parseInt(retData.statusCode!) >= 200 && parseInt(retData.statusCode!) < 300) {
    //     this.ListItems = JSON.parse(retData.response!);
    //     // Llama a getOrderLogDataComparation aquí después de obtener los items
    //     this.getOrderLogDataComparation();
    //   } else {
    //     console.log(retData.response);
    //     console.log('Error');
    //   }
    // });
    this.getOrderLogDataComparation()

    this.orderService.getRetrieveItemsC().subscribe((retData) => {
      console.log(retData)
    });
  }

  onSelectMaterial(selectedData: any){
    //console.log(selectedData);
    //console.log('pasa por aqui');
    if (selectedData != undefined)
    {
      // this.itemIndex.patchValue({ItemName: this.CurrentSellsItem?.ItemName});
      //this.itemIndex.patchValue({ItemCode: selectedData.ItemCode});
      // this.CurrentSellsItem = this.optionsItemCode.find(x => x.ItemCode === selectedData || x.ItemName === selectedData);
      // //Item.get('ItemCode')?.setValue(selectedData.ItemCode);
      // Item.get('ItemDescription')?.setValue(this.CurrentSellsItem?.ItemName);
      // Item.get('Quantity')?.setValue(1);
      // Item.get('TaxCode')?.setValue('EX');
      // this.addButton = false;
    }
  }

  getOrderLogDataComparation(): void {
    this.orderService.getOrderLogDataComparation()
    .pipe(
      retryWhen(errors =>
        errors.pipe(
          mergeMap((error, attemptNumber) => (attemptNumber < 3) ? timer(5000) : throwError(error))
        )
      ),
      catchError(error => {
        this.openSnackBar('Cannot retrieve information, try again', 'error', 'Error', 'red');
        return throwError(error);
      })
    )
    .subscribe(
      (retData) => {
        if (parseInt(retData.statusCode!) >= 200 && parseInt(retData.statusCode!) < 300) {
          const orderCountCurrentMonth = retData.orderCountCurrentMonth;
          const orderCountPreviousMonth = retData.orderCountLastMonth;
          const orderCountTwoMonthsAgo = retData.orderCountTwoMonthsAgo;
          const orderCountThreeMonthsAgo = retData.orderCountThreeMonthsAgo;
  
          this.ordersData = [
            {
              name: 'Current Month',
              value: orderCountCurrentMonth
            },
            {
              name: 'Last Month', 
              value: orderCountPreviousMonth 
            },
            {
              name: 'Two Months Ago', 
              value: orderCountTwoMonthsAgo 
            },
            {
              name: 'Three Months Ago',
              value: orderCountThreeMonthsAgo
            }
          ];
  
          // Ahora, puedes asignar estos valores a tus gráficos ngx-charts
          this.single = this.ordersData.map(item => ({ name: item.name, value: item.value }));
          this.singleBar = this.ordersData.map(item => ({ name: item.name, value: item.value }));
  
          //console.log("data", this.ordersData);
        } else {
          console.error('Failed to retrieve order log data:', retData.statusCode);
        }
      },
    );
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

}
