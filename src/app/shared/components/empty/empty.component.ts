import { Component, Input, OnInit } from '@angular/core';

@Component({
    selector: 'app-snackbar',
    templateUrl: './empty.component.html',
    styleUrls: ['./empty.component.scss'],
    standalone: false
})
export class EmptyComponent implements OnInit {
  @Input('message') message: string = 'No Data';

  constructor() { }

  ngOnInit(): void {
  }

}
