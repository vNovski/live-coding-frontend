import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatLegacySnackBar as MatSnackBar } from '@angular/material/legacy-snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { filter, map, Observable, startWith, Subject, takeUntil } from 'rxjs';
import { SnackbarService } from 'src/app/core/services/snackbar.service';
import {
  CommunicationEventTypes,
  SocketService,
} from 'src/app/modules/room/services/socket/socket.service';
import { UserService } from 'src/app/modules/room/services/user/user.service';
import { RoomService } from './room.service';
import { TerminalChange } from './widget/terminal-widget/interfaces/terminal-change.interface';
import { ContactSupportDialogComponent } from './components/contact-support-dialog/contact-support-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { ITerminalLog } from 'src/app/shared/modules/terminal/interfaces/terminal-log.interface';

function roomServiceFactory(
  route: ActivatedRoute,
  userService: UserService,
  socketService: SocketService,
  snackBar: SnackbarService
) {
  // TODO: check if id exists via GUARD
  return new RoomService(
    route.snapshot.paramMap.get('id')!,
    userService,
    socketService,
    snackBar
  );
}

@Component({
  selector: 'app-room',
  templateUrl: './room.component.html',
  styleUrls: ['./room.component.scss'],
  providers: [
    {
      provide: RoomService,
      useFactory: roomServiceFactory,
      deps: [ActivatedRoute, UserService, SocketService, SnackbarService],
    },
  ],
})
export class RoomComponent implements OnInit, OnDestroy {
  communicationEventTypes = CommunicationEventTypes;
  roomId: string | null = null;
  hideLeaveBtn = false;

  userIds$: Observable<string[]> = this.roomService.connections$.pipe(
    map((users) => users.map(({ id }) => id))
  );

  private ngUnsubscribe: Subject<void> = new Subject<void>();

  constructor(
    public socketService: SocketService,
    private route: ActivatedRoute,
    private readonly router: Router,
    readonly roomService: RoomService,
    private readonly dialog: MatDialog,
  ) {
  }

  ngOnInit(): void {
    this.route.params.subscribe((params) => {
      const id = params['id'];
      this.roomId = id;
    });
    this.roomService.available$
      .pipe(filter((status) => status))
      .subscribe(() => {
        this.roomService.joinRoom();
      });
  }

  onLogsChange(log: ITerminalLog): void {
    this.roomService.shareExecutionLog(log);
  }
  onChange(change: TerminalChange): void {
    this.roomService.terminalChanged(change);
  }
  onCursorChange(position: any): void {
    this.roomService.cursorChange(position);
  }
  onSelectionChange(position: any): void {
    this.roomService.selectionChange(position);
  }
  onMouseMove(position: any): void {
    this.roomService.mouseMove(position);
  }

  fullscreenChange(status: boolean): void {
    this.hideLeaveBtn = status;
  }

  leaveRoom(): void {
    this.roomService.leaveRoom();
    this.router.navigate(['/']);
  }

  contactSupport(): void {
    const dialogRef = this.dialog.open(ContactSupportDialogComponent, {
      maxWidth: '100vw',
      maxHeight: '100vh',
      panelClass: 'contact-support-dialog',
    });
  }

  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
}
