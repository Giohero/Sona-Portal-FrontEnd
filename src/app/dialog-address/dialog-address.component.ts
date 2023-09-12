import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { BPAddresses, DialogAddress } from '../models/customer';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { SAPStates } from '../models/SAPStates';
import { ServiceService } from '../service/service.service';

@Component({
  selector: 'app-dialog-address',
  templateUrl: './dialog-address.component.html',
  styleUrls: ['./dialog-address.component.css']
})

export class DialogAddressComponent {
  AddressForm!: FormGroup;
  StateList!: SAPStates | undefined;
  selection: any;
  displayedColumns= ["select", "AddressName", "AddressName2", "Street", "Block" ,"ZipCode", "City", "State" ]
  option!:number;

constructor(public dialogRef: MatDialogRef<DialogAddressComponent>,
  @Inject(MAT_DIALOG_DATA) public dataReq:  DialogAddress,private MyFb: FormBuilder,private orderService: ServiceService)
  {
    console.log('por aqui')
    console.log(dataReq)
  }
  
  toggleSelection(row: any) {
    this.selection = row;
  }

  close(): void {
    this.dialogRef.close();
  }
  
  ngOnInit(): void {
    this.AddressForm = this.MyFb.group({
      AddressName: ['', Validators.required],
      AddressName2: ['', Validators.required],
      Street: ['', Validators.required],
      Block: [''],
      City: ['', Validators.required],
      State: ['', Validators.required],
      ZipCode: ['1', Validators.required],
    });

    if(this.StateList == undefined)
      {
        this.orderService.getStates().subscribe(retData => {

          if (parseInt(retData.statusCode!) >= 200 && parseInt(retData.statusCode!) < 300)
          {
            this.StateList = JSON.parse(retData.response!);
          }
          else
          {
            if (retData.response)
            {
              // this.MyError = JSON.parse(retData.response!);
              // this.toastr.error(this.MyError?.error?.message?.value, 'Error:', { timeOut: 6000 });
            }
            else
            {
              // this.toastr.error("Sever request failed, please try again later", 'Error:', { timeOut: 8000 });
            }
          }
        });
      }

    this.addToForm();
  }

  addToForm(){
    if(this.dataReq.addresses != undefined)
    {
      this.AddressForm.patchValue({AddressName: this.dataReq?.addresses.AddressName});
      this.AddressForm.patchValue({AddressName2: this.dataReq?.addresses.AddressName2});
      this.AddressForm.patchValue({Street: this.dataReq?.addresses.Street});
      this.AddressForm.patchValue({Block: this.dataReq?.addresses.Block});
      this.AddressForm.patchValue({City: this.dataReq?.addresses.City});
      this.AddressForm.patchValue({State: this.dataReq?.addresses.State});
      this.AddressForm.patchValue({ZipCode: this.dataReq?.addresses.ZipCode});
    }
  }

  updateAddress(){

  }
}

