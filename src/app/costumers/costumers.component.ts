import { Component, OnInit } from '@angular/core';
import { ServiceService } from '../service/service.service';
import { INResponse } from '../models/INResponse';
import { BusinessPartner, Customer } from '../models/customer';
import { Router } from '@angular/router';
import { DataSharingService } from '../service/data-sharing.service';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SnackbarsComponent } from '../snackbars/snackbars.component';
import { DialogAddressComponent } from '../dialog-address/dialog-address.component';
import { TransactionCostumerService } from '../service/transaction-costumer.service';
import { catchError, mergeMap, retryWhen, throwError, timer } from 'rxjs';

@Component({
  selector: 'app-costumers',
  templateUrl: './costumers.component.html',
  styleUrls: ['./costumers.component.css']
})
export class CostumersComponent implements OnInit {
  customerData: BusinessPartner[] = [];
  isAscending: boolean = true;
  filteredCustomerData: BusinessPartner[] = [];
  isLoading = false;
  ListCustomers!: BusinessPartner[] ;
  searchText = '';
  idcustomer = '';
  ActiveAddButton= true;
  CurrentSellsItem?: BusinessPartner | undefined;
  billingAddress?: string | undefined;
  notes?: string | undefined;
  shippingAddress?: string | undefined;
  phone1?: string | undefined;
  email?: string | undefined;
  shippingType?: string | undefined;
  taxId?: string | undefined;
  inputSearchCutomer = false;
  saveUpdates = false;
  showAddButton = true;
  showEditInputs = true;
  AddressShip: any;
  Address: any;
  customerBack: any;
  rowShip=0;
  rowBill=0;
  ShowEdit = false;
  title=""
  isOnline!:boolean;

  constructor(
    private transactionCustomer: TransactionCostumerService,
    private customerService: ServiceService,
    private myRouter: Router,
    private dataSharing: DataSharingService,
    private orderService: ServiceService,
    private dialog: MatDialog,
    private _snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadCustomerData();
    
    this.dataSharing.statusWifi$.subscribe((newWifi) => {
      console.log('llego el cambio a '+newWifi)
      this.isOnline = newWifi;
    });
  }

  AdCustomer(type: string) {
    //var GetBill = this.CurrentSellsItem?.BPAddresses.find(x => x.AddressType == 'bo_BillTo');
    const dialogRef = this.dialog.open(DialogAddressComponent, {
      height: 'auto',
      width: '90%',
      autoFocus: false,
      maxHeight: '90vh', //you can adjust the value as per your view
      maxWidth: '140vh',
      data: { 
        viewEdit: false,
        viewAdd: true,
        viewList: false,
        addresses: undefined,
        addressesList: undefined
      },
    });

    dialogRef.afterClosed().subscribe(result => {
     
      if(result != undefined)
      {
        this.Address = {};

        this.Address = {
          AddressName : result!.AddressName ?? " ",
          AddressName2 : result.AddressName2 ?? " ",
          AddressType : type,
          Block : result?.Block ?? "",
          //Country : result?.Country ?? "",
          Country: 'US',
          City : result?.City ?? "",
          State : result?.State ?? "",
          Street : result?.Street ?? "",
          ZipCode : result?.ZipCode ?? "",
        }

        var CustomerAdd={
          CardCode: this.idcustomer,
          CardName: this.searchText,
          CardType: 'C',
          BPAddresses: [
            this.Address
          ]
        }

        //console.log(CustomerAdd)
        this.transactionCustomer.addTransactionCustomerToIndex(this.idcustomer,this.searchText,'C',this.CurrentSellsItem!.BPAddresses,"Customer Created",this.email!,this.notes!, '');

        this.orderService.UpdateCustomer(CustomerAdd).subscribe(retData => {
          //console.log(CustomerAdd);
          if (parseInt(retData.statusCode!) >= 200 && parseInt(retData.statusCode!) < 300)
          {

            this.openSnackBar("", "check_circle", "Address Add!", "green");
            if(type == 'bo_ShipTo')
            this.shippingAddress = this.Address!.AddressName +' '+ this.Address!.Street  +' '+ this.Address!.City +' '+ this.Address!.State +' '+ this.Address!.Country +' '+ this.Address!.ZipCode;  
            else
              this.billingAddress = this.Address!.AddressName +' '+ this.Address!.Street  +' '+ this.Address!.City +' '+ this.Address!.State +' '+ this.Address!.Country +' '+ this.Address!.ZipCode;

            // console.log(AddressReq)
            // this.CurrentSellsItem?.BPAddresses.push(this.Address)
            this.UpdateList(this.idcustomer, type)
          }
          else
          {
            this.openSnackBar(retData.response!, "error", "Error", "red");
            //console.log(retData.response)
          }
        });
      }
        //console.log(this.AddressBill);
    });
  }

  UpdateList(cardcode:string, type: string)
  {
    this.orderService.getCustomer().subscribe((retData) => {

      if (parseInt(retData.statusCode!) >= 200 && parseInt(retData.statusCode!) < 300) {

        this.ListCustomers = JSON.parse(retData.response!);
        //console.log(this.CurrentSellsItem!.BPAddresses)
        //console.log(this.ListCustomers.find(x=> x.CardCode == cardcode)!.BPAddresses)
        const addressNew = this.ListCustomers.find(x=> x.CardCode == cardcode)!.BPAddresses.filter(x => !this.CurrentSellsItem!.BPAddresses.some(y => x.RowNum === y.RowNum));
        //console.log(addressNew)

        if(type == 'bo_ShipTo')
          this.rowShip = parseFloat(addressNew[0].RowNum)
        else
          this.rowBill = parseFloat(addressNew[0].RowNum)

        //console.log(this.rowBill)
        //console.log(this.rowShip)
        this.CurrentSellsItem!.BPAddresses = this.ListCustomers.find(x=> x.CardCode == cardcode)!.BPAddresses
      } else {
        this.openSnackBar(retData.response!, "error", "Error", "red");
      }

    });
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

 
  toggleSort() {
    // Cambia el orden actual
    this.isAscending = !this.isAscending;
    this.sortCustomersAlphabetically();
    this.customerData = [...this.customerData];
  }

  Sort() {
    this.sortCustomersAlphabetically();
  }

  sortCustomersAlphabetically() {
    this.customerData = this.customerData.slice().sort((a, b) => {
      const orderFactor = this.isAscending ? 1 : -1;
      return orderFactor * a.CardName.localeCompare(b.CardName);
    });
  }

  pageSize = 10; 
  pageSizeOptions: number[] = [10,20,30]; 
  currentPage = 0; 


  onPageChange(event: any): void {
    this.currentPage = event.pageIndex;
    this.pageSize = event.pageSize;
  }

  editCustomer(customer: any) {
    
    this.dataSharing.setCustomerData(customer);
    console.log(customer)
    this.myRouter.navigate(['dashboard/customers-edit']);
  }

  AddNewCustomer() {
    this.dataSharing.setCustomerData(undefined);
    this.myRouter.navigate(['dashboard/customers-edit']);
  }

  removeCustomer(customer: any) {
  
  }

  loadCustomerData(): void {
    this.isLoading = true;
    // this.customerService.getCustomer().subscribe(
    //   (retData: INResponse) => {
    //     if (parseInt(retData.statusCode!) >= 200 && parseInt(retData.statusCode!) < 300) {
    //       this.customerData = JSON.parse(retData.response!);
          
    //       console.log(this.customerData);
    //     } else {
    //       console.log('Error fetching customer data');
    //     }
    //     this.isLoading = false;
    //   },
    //   (error) => {
    //     console.error('Error fetching customer data:', error);
    //     this.isLoading = false;
    //   }
    // );

    this.orderService.getCustomer()
    .pipe(
      retryWhen(errors =>
        errors.pipe(
          mergeMap((error, attemptNumber) => (attemptNumber < 3) ? timer(5000) : throwError(error))
        )
      ),
      catchError(error => {
        this.openSnackBar('Cannot retrieve information, try again', 'error', 'Error', 'red');
        this.isLoading = false;
        return throwError(error);
      })
    )
    .subscribe(
      (retData:INResponse) =>  {
        if (parseInt(retData.statusCode!) >= 200 && parseInt(retData.statusCode!) < 300) {
          this.customerData = JSON.parse(retData.response!);
          
          console.log(this.customerData);
        } 
        this.isLoading = false;
      }
    );
  }
  
}