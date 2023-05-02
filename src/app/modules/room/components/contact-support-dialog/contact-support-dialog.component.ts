import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'app-contact-support-dialog',
  templateUrl: './contact-support-dialog.component.html',
  styleUrls: ['./contact-support-dialog.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ContactSupportDialogComponent implements OnInit {
  selectedValue: any;
  constructor() { }

  ngOnInit(): void {
  }

}
