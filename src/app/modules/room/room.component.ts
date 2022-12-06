import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { ConnectionsService, RoomEvents } from 'src/app/core/services/connections/connections.service';
import { SnackbarService } from 'src/app/core/services/snackbar.service';
import { CommunicationEventTypes, SocketService } from 'src/app/core/services/socket/socket.service';
import { UserService } from 'src/app/core/services/user/user.service';
import { TerminalLog } from 'src/app/shared/components/terminal/interfaces/terminal-log.interface';
import { RoomService } from './room.service';
import { TermianlEvents } from './widget/enums/terminal-events.enum';
import { TerminalChange } from './widget/terminal-widget/interfaces/terminal-change.interface';


function roomServiceFactory(route: ActivatedRoute, userService: UserService, socketService: SocketService, snackBar: SnackbarService) {
  // TODO: check if id exists via GUARD
  return new RoomService(route.snapshot.paramMap.get('id')!, userService, socketService, snackBar);
}


@Component({
  selector: 'app-room',
  templateUrl: './room.component.html',
  styleUrls: ['./room.component.scss'],
  providers: [{
    provide: RoomService,
    useFactory: roomServiceFactory,
    deps: [ActivatedRoute, UserService, SocketService, SnackbarService]
  }]
})
export class RoomComponent implements OnInit, OnDestroy {
  code = '';

  communicationEventTypes = CommunicationEventTypes;
  roomId: string | null = null;
  hideLeaveBtn = false;

  private ngUnsubscribe: Subject<void> = new Subject<void>();

  constructor(
    public readonly connectionService: ConnectionsService,
    public socketService: SocketService,
    private route: ActivatedRoute,
    private readonly router: Router,
    readonly roomService: RoomService
  ) { }

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      const id = params['id'];
      this.roomId = id;
      this.socketService.emit(RoomEvents.join, id);
    });
  }

  onLogsChange(log: TerminalLog): void {
    this.roomService.shareExecutionLog(log);
  }
  onChange(change: TerminalChange): void {
    this.roomService.terminalChanged(change);
  }
  onCursorChange(position: any): void {
    this.roomService.cursorChange(position);
  }
  onSelectionChange(position: any): void {
    this.roomService.selectionChange(position)
  }
  onMouseMove(position: any): void {
    this.roomService.mouseMove(position);
  }

  fullscreenChange(status: boolean): void {
    this.hideLeaveBtn = status;
  }

  leaveRoom(): void {
    this.socketService.emit(RoomEvents.leave, this.roomId);
    this.router.navigate(['/'])
  }

  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
}
