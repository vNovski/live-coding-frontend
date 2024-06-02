import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { map } from 'rxjs';
import { UserService } from 'src/app/modules/room/services/user/user.service';
import { RoomService } from 'src/app/modules/room/room.service';

@Component({
  selector: 'app-online-indicator',
  templateUrl: './online-indicator.component.html',
  styleUrls: ['./online-indicator.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OnlineIndicatorComponent implements OnInit {
  connections$ = this.roomService.connections$.pipe(
    map((connections) => {
      const uniq = new Set([this.userService.username]);
      return connections.filter(({ username }) =>
        uniq.has(username) ? false : uniq.add(username)
      );
    })
  );

  constructor(
    public roomService: RoomService,
    public userService: UserService
  ) {}

  ngOnInit(): void {}
}
