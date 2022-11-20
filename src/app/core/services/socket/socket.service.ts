import { Injectable } from '@angular/core';
import { BehaviorSubject, filter, map, Observable } from 'rxjs';
import { io, Socket } from 'socket.io-client';
import { environment } from 'src/environments/environment';


export enum CommunicationEventTypes {
  terminalChange = 'terminal-code-change',
  terminalMouseMove = 'terminal-mousemove',
  terminalCursorChange = 'terminal-cursor-change',
  terminalSelectionChange = 'terminal-selection-change',
  connect = 'client-connect',
  disconnect = 'client-disconnect',
  shareConnections = 'room:share-connections',
  joinRoom = 'join-room',
  leaveRoom = 'leave-room',
}

@Injectable({
  providedIn: 'root'
})
export class SocketService {
  public _available$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  private socket: Socket;

  get available$(): Observable<boolean> {
    return this._available$.asObservable();
  }

  get id$(): Observable<string> {
    return this._available$.asObservable().pipe(filter(status => status), map(() => this.socket.id));
  }

  constructor() {
    this.socket = io(environment.serverUri, { transports: ['websocket'] });
    this.monitorConnectionStatus();
  }

  private monitorConnectionStatus() {
    this.socket.on('connect', () => {
      this._available$.next(true);
    })

    this.socket.on('disconnect', () => {
      this._available$.next(false);
    })
  }

  emit(event: string, data: any) {
    this.socket.emit(event, data);
  }
  on(event: any): Observable<any> {
    return new Observable(observer => {
      this.socket.on(event, (data: any) => observer.next(data));
    })
  }

}
