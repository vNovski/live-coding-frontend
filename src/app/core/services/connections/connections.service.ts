import { Injectable } from '@angular/core';
import { BehaviorSubject, map, Observable, switchMap, tap } from 'rxjs';
import { CommunicationEventTypes, SocketService } from '../socket/socket.service';


@Injectable({
  providedIn: 'root'
})
export class ConnectionsService {
  public connections$: Observable<string[]> = this.socketService.on(CommunicationEventTypes.userConnect);

  constructor(private readonly socketService: SocketService) {
  }
}
