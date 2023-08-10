import { Component, Inject, OnInit } from '@angular/core';
import { MAT_LEGACY_SNACK_BAR_DATA as MAT_SNACK_BAR_DATA } from '@angular/material/legacy-snack-bar';

@Component({
  selector: 'app-play-pause-button',
  templateUrl: './connection-snackbar.component.html',
  styleUrls: ['./connection-snackbar.component.scss']
})
export class ConnectionSnackbarComponent implements OnInit {
  constructor(@Inject(MAT_SNACK_BAR_DATA) public data: { connected: boolean, color: string }) {
   }

  ngOnInit(): void {
   
  }

}
