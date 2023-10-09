import { Inject, Injectable } from '@angular/core';
import { BehaviorSubject, filter, map, Observable, take, tap, withLatestFrom } from 'rxjs';
import { SnackbarService } from 'src/app/core/services/snackbar.service';
import { SocketService } from 'src/app/modules/room/services/socket/socket.service';
import { IUserInfo as IUser, UserService } from 'src/app/modules/room/services/user/user.service';

import { RoomEvents } from './enums/room-events.enum';
import { TermianlEvents } from './widget/enums/terminal-events.enum';
import { TerminalChange } from './widget/terminal-widget/interfaces/terminal-change.interface';
import { ICursorPosition } from 'src/app/shared/modules/terminal/interfaces/cursor-position';
import { IMousePosition } from 'src/app/shared/modules/terminal/interfaces/mouse-position.interface';
import { ITerminalLog } from 'src/app/shared/modules/terminal/interfaces/terminal-log.interface';

@Injectable()
export class RoomService {
  id!: string; // room id
  public _connections$: BehaviorSubject<IUser[]> = new BehaviorSubject<IUser[]>([]);

  public connect$ = this.socketService.on(RoomEvents.join);
  public disconnect$ = this.socketService.on(RoomEvents.leave);
  public initialConnections$ = this.socketService.on(
    RoomEvents.shareConnections
  );

  public otherCursorChange$ = this.socketService
    .on(TermianlEvents.cursorChange)
    .pipe(
      withLatestFrom(this.connections$),
      map(([cursor, users]) => ({
        ...users.find((user) => user.id === cursor.userId),
        ...cursor.position,
      }))
    );

  public otherSelectionChange$ = this.socketService
    .on(TermianlEvents.selectionChange)
    .pipe(
      withLatestFrom(this.connections$),
      map(([selection, users]) => ({
        ...users.find((user) => user.id === selection.userId),
        ...selection.position,
      }))
    );

  public executionLog$ = this.socketService.on(TermianlEvents.executionLog);
  public otherChanged$ = this.socketService.on(TermianlEvents.change);

  public otherMouseMove$ = this.socketService.on(TermianlEvents.mouseMove).pipe(
    withLatestFrom(this.connections$),
    map(([mouse, users]) => {
      return {
      ...users.find((user) => user.id === mouse.userId),
      ...mouse.position,
    }})
  );

  public initialState$ = this.socketService.on(TermianlEvents.shareState);
  public available$ = this.socketService.available$;

  get connections$(): Observable<IUser[]> {
    return this._connections$.asObservable();
  }

  constructor(
    @Inject('id') id: string, // room id
    private readonly userService: UserService,
    private readonly socketService: SocketService,
    private readonly snackBar: SnackbarService
  ) {
    this.id = id;
    const basicUserInfo = this.userService.getInfo();
    this.socketService.connect(basicUserInfo).subscribe((id) => this.userService.id = id);

    this.init();
    this.listenForConnect();
    this.listenForDisconnect();
  }

  private init(): void {
    this.initialConnections$.subscribe((users: IUser[]) => {
      this._connections$.next(users);
    });
  }

  private listenForConnect(): void {
    this.connect$
      .pipe(
        tap((user: IUser) => {
          this.snackBar.open(`${user.username}: Connected`, '', {
            panelClass: ['info'],
          });
        })
      )
      .subscribe((user: IUser) => {
        this._connections$.next([...this._connections$.getValue(), user]);
      });
  }

  private listenForDisconnect(): void {
    this.disconnect$
      .pipe(
        tap((id) => {
          const username = this._connections$.value.find((client: any) => client.id === id)?.username;
          this.snackBar.open(`${username} disconnected`, '', { panelClass: ['info'] });
        })
      )
      .subscribe((userId: string) => {
        this._connections$.next(
          this._connections$.getValue().filter(({ id }) => id !== userId)
        );
      });
  }

  shareExecutionLog(log: ITerminalLog) {
    this.socketService.emit(TermianlEvents.executionLog, {
      roomId: this.id,
      data: log,
    });
  }

  leaveRoom(): void {
    this.socketService.disconnect();
  }

  joinRoom(): void {
    const userInfo = this.userService.getInfo();
    if (userInfo) {
      this.socketService.emit(RoomEvents.join, {
        roomId: this.id,
        user: userInfo,
      });
    }
  }

  mouseMove(position: IMousePosition): void {
    this.socketService.emit(TermianlEvents.mouseMove, {
      roomId: this.id,
      position,
    });
  }

  cursorChange(position: ICursorPosition): void {
    this.socketService.emit(TermianlEvents.cursorChange, {
      roomId: this.id,
      position,
    });
  }

  selectionChange(position: any): void {
    this.socketService.emit(TermianlEvents.selectionChange, {
      roomId: this.id,
      position,
    });
  }

  terminalChanged(change: TerminalChange): void {
    this.socketService.emit(TermianlEvents.change, {
      roomId: this.id,
      data: change,
    });
  }
}
