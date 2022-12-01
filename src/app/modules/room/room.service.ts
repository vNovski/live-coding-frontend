import { Inject, Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { SocketService } from 'src/app/core/services/socket/socket.service';
import { UserService } from 'src/app/core/services/user/user.service';
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

  get connections$(): Observable<string[]> {
    return this._connections$.asObservable();
  }

  constructor(
    @Inject('id') id: string,
    private readonly userService: UserService,
    private readonly socketService: SocketService,
    private readonly snackBar: MatSnackBar
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
        this.snackBar.open('User connected', '', {
          duration: 2000,
          verticalPosition: 'bottom',
          horizontalPosition: 'right',
          panelClass: 'snackbar'
        })
      })
    ).subscribe((userId: string) => {
      this._connections$.next([...this._connections$.getValue(), userId])
    })
  }

  private listenForDisconnect(): void {
    this.disconnect$.pipe(
      tap(() => {
        this.snackBar.open('User disconnected', '', {
          duration: 2000,
          verticalPosition: 'bottom',
          horizontalPosition: 'right',
          panelClass: 'snackbar'
        })
      })
    ).subscribe((userId: string) => {
      this._connections$.next(this._connections$.getValue().filter(id => id !== userId))
    })
  }

  leaveRoom(): void {
    this.socketService.emit(RoomEvents.leave, this.id);
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
