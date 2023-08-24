import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { BPAddresses } from '../models/customer';
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

constructor(public dialogRef: MatDialogRef<DialogAddressComponent>,
  @Inject(MAT_DIALOG_DATA) public dataReq:  BPAddresses,private MyFb: FormBuilder,private orderService: ServiceService)
  {
    
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
    this.AddressForm.patchValue({AddressName: this.dataReq?.AddressName});
    this.AddressForm.patchValue({AddressName2: this.dataReq?.AddressName2});
    this.AddressForm.patchValue({Street: this.dataReq?.Street});
    this.AddressForm.patchValue({Block: this.dataReq?.Block});
    this.AddressForm.patchValue({City: this.dataReq?.City});
    this.AddressForm.patchValue({State: this.dataReq?.State});
    this.AddressForm.patchValue({ZipCode: this.dataReq?.ZipCode});
  }

  updateAddress(){

  }
}

