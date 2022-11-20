import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { SocketService } from '../socket/socket.service';


export enum RoomEvents {
  join = 'room:join',
  leave = 'room:leave',
  shareConnections = 'room:share-connections',
}

@Injectable({
  providedIn: 'root'
})
export class ConnectionsService {
  public _connections$: BehaviorSubject<string[]> = new BehaviorSubject<string[]>([]);

  public connect$ = this.socketService.on(RoomEvents.join);
  public disconnect$ = this.socketService.on(RoomEvents.leave);
  public initialConnections$ = this.socketService.on(RoomEvents.shareConnections);

  get connections$(): Observable<string[]> {
    return this._connections$.asObservable();
  }

  constructor(private readonly socketService: SocketService) {
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
    this.connect$.subscribe((userId: string) => {
      this._connections$.next([...this._connections$.getValue(), userId])
    })
  }

  private listenForDisconnect(): void {
    this.disconnect$.subscribe((userId: string) => {
      this._connections$.next(this._connections$.getValue().filter(id => id !== userId))
    })
  }
}
