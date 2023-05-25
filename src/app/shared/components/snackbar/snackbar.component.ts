import { Component, Inject, Input, OnInit } from '@angular/core';
import { MatSnackBarRef, MAT_SNACK_BAR_DATA } from '@angular/material/snack-bar';

@Component({
  selector: 'app-snackbar',
  templateUrl: './snackbar.component.html',
  styleUrls: ['./snackbar.component.scss']
})
export class SnackbarComponent {
  constructor(
    public sbRef: MatSnackBarRef<SnackbarComponent>,
    @Inject(MAT_SNACK_BAR_DATA) public data: any
  ) {}

}
