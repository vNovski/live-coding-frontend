import { Injectable } from '@angular/core';
import { BehaviorSubject, map, Observable, switchMap, tap } from 'rxjs';
import { CommunicationEventTypes, SocketService } from '../socket/socket.service';


@Injectable({
  providedIn: 'root'
})
export class ConnectionsService {
  public _connections$: BehaviorSubject<string[]> = new BehaviorSubject<string[]>([]);

  public connect$ = this.socketService.on(CommunicationEventTypes.connect);
  public disconnect$ = this.socketService.on(CommunicationEventTypes.disconnect);

  get connections$(): Observable<string[]> {
    return this._connections$.asObservable();
  }

  constructor(private readonly socketService: SocketService) {
    this.listenForConnect();
    this.listenForDisconnect();
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
