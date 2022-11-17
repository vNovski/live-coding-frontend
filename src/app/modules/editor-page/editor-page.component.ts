import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { ConnectionsService } from 'src/app/core/services/connections/connections.service';
import { CommunicationEventTypes, SocketService } from 'src/app/core/services/socket/socket.service';
import { UserService } from 'src/app/core/services/user/user.service';

@Component({
  selector: 'app-editor-page',
  templateUrl: './editor-page.component.html',
  styleUrls: ['./editor-page.component.scss']
})
export class EditorPageComponent implements OnInit, OnDestroy {
  code = '';
  otherMouses: any = [];
  otherCursors: any = [];
  otherSelections: any = [];
  communicationEventTypes = CommunicationEventTypes;
  roomId: string | null = null;

  private ngUnsubscribe: Subject<void> = new Subject<void>();

  constructor(
    public readonly connectionService: ConnectionsService,
    public socketService: SocketService,
    private readonly userService: UserService,
    private readonly snackBar: MatSnackBar,
    private route: ActivatedRoute,
    private readonly router: Router
  ) { }

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      console.log('join-room');
      const id = params['id'];
      this.roomId = id;
      this.socketService.emit(CommunicationEventTypes.joinRoom, id);
    });

    this.connectionService.connect$.pipe(takeUntil(this.ngUnsubscribe)).subscribe(() => {
      console.log('connected')
      this.snackBar.open('User connected', '', {
        duration: 2000,
        verticalPosition: 'bottom',
        horizontalPosition: 'right',
        panelClass: 'snackbar'
      })
    })
    this.connectionService.disconnect$.pipe(takeUntil(this.ngUnsubscribe)).subscribe(() => {
      console.log('disconnect')
      this.snackBar.open('User disconnect', '', {
        duration: 2000,
        verticalPosition: 'bottom',
        horizontalPosition: 'right',
        panelClass: 'snackbar'
      })
    })
    this.connectionService.connections$.pipe(takeUntil(this.ngUnsubscribe)).subscribe(connections => {
      this.otherMouses = connections.map((id) => ({ x: null, y: null, color: null, userId: id }));
    });
    this.socketService.on(CommunicationEventTypes.terminalChange).pipe(takeUntil(this.ngUnsubscribe)).subscribe(code => this.code = code);
    this.socketService.on(CommunicationEventTypes.terminalMouseMove).pipe(takeUntil(this.ngUnsubscribe)).subscribe((receivedMouse) => {
      this.otherMouses = this.otherMouses.map((mouse: any) => mouse.userId === receivedMouse.userId ? receivedMouse : mouse);
    });

    this.socketService.on(CommunicationEventTypes.terminalSelectionChange).pipe(takeUntil(this.ngUnsubscribe)).subscribe((receivedSelection: any) => {
      if (!this.otherSelections.length) {
        this.otherSelections = [receivedSelection];
      }

      this.otherSelections = this.otherSelections.reduce((selections: any, selection: any) => {
        return [...selections, selection.userId === receivedSelection.userId ? receivedSelection : selection];
      }, [] as any[])
    });

    this.socketService.on(CommunicationEventTypes.terminalCursorChange).pipe(takeUntil(this.ngUnsubscribe)).subscribe((receivedCursor: any) => {
      if (!this.otherCursors.length) {
        this.otherCursors = [receivedCursor];
      }

      this.otherCursors = this.otherCursors.reduce((cursors: any, cursor: any) => {
        return [...cursors, cursor.userId === receivedCursor.userId ? receivedCursor : cursor];
      }, [] as any[])
    });
  }

  leaveRoom(): void {
    this.socketService.emit(CommunicationEventTypes.leaveRoom, { roomId: this.roomId });
    this.router.navigate(['/'])
  }

  terminalChanged(code: string): void {
    this.socketService.emit(CommunicationEventTypes.terminalChange, { roomId: this.roomId, data: code });
  }

  mouseMove(position: { x: number | null, y: number | null }): void {
    this.socketService.emit(CommunicationEventTypes.terminalMouseMove, { roomId: this.roomId, data: { color: this.userService.color, ...position } });
  }

  cursorChange(position: any): void {
    this.socketService.emit(CommunicationEventTypes.terminalCursorChange, { roomId: this.roomId, data: { color: this.userService.color, ...position } });
  }

  selectionChange(position: any): void {
    this.socketService.emit(CommunicationEventTypes.terminalSelectionChange, { roomId: this.roomId, data: { color: this.userService.color, ...position } });
  }


  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
}
