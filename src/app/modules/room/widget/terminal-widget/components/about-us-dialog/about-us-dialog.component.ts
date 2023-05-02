import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'app-about-us-dialog',
  templateUrl: './about-us-dialog.component.html',
  styleUrls: ['./about-us-dialog.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AboutUsDialogComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

}
