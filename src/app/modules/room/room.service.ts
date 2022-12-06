import { Inject, Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { BehaviorSubject, map, Observable, tap } from 'rxjs';
import { SnackbarService } from 'src/app/core/services/snackbar.service';
import { SocketService } from 'src/app/core/services/socket/socket.service';
import { UserService } from 'src/app/core/services/user/user.service';
import { ConnectionSnackbarComponent } from 'src/app/shared/components/connection-snackbar/connection-snackbar.component';
import { TerminalLog } from 'src/app/shared/components/terminal/interfaces/terminal-log.interface';
import { RoomEvents } from './enums/room-events.enum';
import { RoomModule } from './room.module';
import { TermianlEvents } from './widget/enums/terminal-events.enum';
import { TerminalChange } from './widget/terminal-widget/interfaces/terminal-change.interface';

@Injectable()
export class RoomService {
  id: string;
  public _connections$: BehaviorSubject<string[]> = new BehaviorSubject<string[]>([]);

  public connect$ = this.socketService.on(RoomEvents.join);
  public disconnect$ = this.socketService.on(RoomEvents.leave);
  public initialConnections$ = this.socketService.on(RoomEvents.shareConnections);

  public otherCursorChange$ = this.socketService.on(TermianlEvents.cursorChange);
  public otherSelectionChange$ = this.socketService.on(TermianlEvents.selectionChange);
  public executionLog$ = this.socketService.on(TermianlEvents.executionLog);
  public otherChanged$ = this.socketService.on(TermianlEvents.change);
  public otherMouseMove$ = this.socketService.on(TermianlEvents.mouseMove);
  public initialState$ = this.socketService.on(TermianlEvents.shareState);

  get connections$(): Observable<string[]> {
    return this._connections$.asObservable();
  }

  constructor(
    @Inject('id') id: string,
    private readonly userService: UserService,
    private readonly socketService: SocketService,
    private readonly snackBar: SnackbarService
  ) {
    this.id = id;
    this.init();
    this.listenForConnect();
    this.listenForDisconnect();
  }

  private init(): void {
    this.initialConnections$.subscribe((userIds) => {
      this._connections$.next(userIds);
    })
  }

  private listenForConnect(): void {
    this.connect$.pipe(
      tap(() => {
        this.snackBar.open('User Connected', '', { panelClass: ['info'] })
      }),
      map(({ userId }) => userId)
    ).subscribe((userId: string) => {
      this._connections$.next([...this._connections$.getValue(), userId])
    })
  }

  private listenForDisconnect(): void {
    this.disconnect$.pipe(
      tap(() => {
        this.snackBar.open('User disconnected', '', { panelClass: ['info'] })
      })
    ).subscribe((userId: string) => {
      this._connections$.next(this._connections$.getValue().filter(id => id !== userId))
    })
  }

  shareExecutionLog(log: TerminalLog) {
    this.socketService.emit(TermianlEvents.executionLog, { roomId: this.id, data: log })
  }

  leaveRoom(): void {
    this.socketService.emit(RoomEvents.leave, this.id);
  }

  joinRoom(id: string): void {
    this.socketService.emit(RoomEvents.join, id);
  }

  mouseMove(position: any): void {
    this.socketService.emit(TermianlEvents.mouseMove, { roomId: this.id, data: { color: this.userService.color, ...position } });
  }

  cursorChange(position: any): void {
    this.socketService.emit(TermianlEvents.cursorChange, { roomId: this.id, data: { color: this.userService.color, ...position } });
  }

  selectionChange(position: any): void {
    this.socketService.emit(TermianlEvents.selectionChange, { roomId: this.id, data: { color: this.userService.color, ...position } });
  }


  terminalChanged(change: TerminalChange): void {
    this.socketService.emit(TermianlEvents.change, { roomId: this.id, data: change });
  }
}
