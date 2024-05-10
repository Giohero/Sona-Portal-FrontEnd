import { Component } from '@angular/core';
import { Value } from '../models/items';
import { ServiceService } from '../service/service.service';
import {MatTabsModule} from '@angular/material/tabs';
import { Color, ScaleType } from '@swimlane/ngx-charts';
import { catchError, mergeMap, of, retry, retryWhen, switchMap, tap, throwError, timer } from 'rxjs';
import { SnackbarsComponent } from '../snackbars/snackbars.component';
import { MatDialog } from '@angular/material/dialog';
import {getTradeshowLogs } from '../service/cosmosdb.service';
import { AuthService } from '../service/auth.service';
import { IndexDbService } from '../service/index-db.service';
import { GeolocationService } from '../service/geolocation.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  template: `<p>Your location: {{ location | json }}</p>`,
  styleUrls: ['./home.component.css']
})
export class HomeComponent {
  ListItems!: Value[] ;
  location: GeolocationPosition | null = null;
  searchText = '';
  isSidebarExpanded: boolean = false;
  ordersData: { name: any; value: any; }[] | undefined;
  lastThreeMonths: any;
  single:any;
  multi:any;
  singleBar:any;
  showIndex = false;
  nameAzure = '';


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
  

  constructor(private orderService: ServiceService, private dialog: MatDialog,private auth: AuthService, private indexDB: IndexDbService, private geoService: GeolocationService) {
    const single1 = this.single;
    const multi1 = this.multi;
    Object.assign(this, {single1, multi1}) 
  }


  // pie
  showLabels = true;
  explodeSlices = false;
  doughnut = false;
  

  onSelect(event: Event) {
    //console.log(event);
  }

  async ngOnInit(): Promise<void> {
    try {
      this.location = await this.geoService.getLocation();
      const { latitude, longitude } = this.location.coords;
      const address = await this.geoService.getAddress(latitude, longitude).toPromise();
      console.log('Location:', address.display_name);
      console.log(address)
      console.log(address.address.country + ', ' + address.address.state)

    } catch (error) {
      console.error('Error obtaining location or address', error);
    }
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
    this.auth.nameAzure$.subscribe(
      (username: string) => {
        this.nameAzure = username.split(' ')[0]
        //console.log('Es nameazure '+this.nameAzure)
      },
      (error: any) => {
        this.nameAzure = ''
      }
    );

    var resultsIndex = await this.indexDB.getDataOrdersInformation()
    if(resultsIndex != null)
    {
      this.single = resultsIndex.map((item:any) => ({ name: item.name, value: item.value }));
    }
    else
      this.showIndex = true
    this.getOrderLogDataComparation()
    // var ListTradeshows = await getTradeshowLogs()
    // console.log(ListTradeshows);
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
          //tap(val => console.log(`Value ${val} was too high!`)), // Para depurar
          switchMap((error, index) =>
            index < 3 ? timer(index * 5000) : throwError(() => new Error('Retry limit reached'))
          )
        )
      ),
      catchError(error => {
        console.error('An error occurred', error);
        return throwError(() => new Error('An error occurred')); 
      })
    )
    .subscribe(
      (retData) => {
        //console.log(retData)
        if (parseInt(retData.statusCode!) >= 200 && parseInt(retData.statusCode!) < 300) {
          //console.log(retData)
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
  
          // Now,you can assign this values for this ngx-charts
          // this.single = this.ordersData.map(item => ({ name: item.name, value: item.value }));
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

