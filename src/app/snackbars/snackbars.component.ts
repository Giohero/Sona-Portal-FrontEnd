import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { window } from '../models/snackbar';

@Component({
  selector: 'app-snackbars',
  templateUrl: './snackbars.component.html',
  styleUrls: ['./snackbars.component.css']
})
export class SnackbarsComponent {

  constructor(@Inject(MAT_DIALOG_DATA) public data: window)
  {

  }

}
