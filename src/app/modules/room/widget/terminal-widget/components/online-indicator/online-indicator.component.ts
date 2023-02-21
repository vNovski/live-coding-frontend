import { Component, OnInit } from '@angular/core';
import { RoomService } from 'src/app/modules/room/room.service';

@Component({
  selector: 'app-online-indicator',
  templateUrl: './online-indicator.component.html',
  styleUrls: ['./online-indicator.component.scss']
})
export class OnlineIndicatorComponent implements OnInit {

  constructor(public roomService: RoomService) { }

  ngOnInit(): void {
    this.roomService.connections$.subscribe(data => {
      console.log(data)
    })
  }

}
