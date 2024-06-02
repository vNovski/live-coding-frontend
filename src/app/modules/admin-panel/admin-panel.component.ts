import { HttpClient } from '@angular/common/http';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
} from '@angular/core';
import { debounce, debounceTime, throttleTime } from 'rxjs';
import { generateUsername } from 'src/app/core/utils/username-generator';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-admin-panel',
  templateUrl: './admin-panel.component.html',
  styleUrls: ['./admin-panel.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminPanelComponent {
  search: string = '';

  rooms: any[] = [];
  isLoading = false;
  roomsSearch = this.rooms;
  isLoggedIn = false;
  password = 'qweasdzxc';

  private headers = { 'Content-Type': 'application/json' };

  constructor(
    private httpClient: HttpClient,
    private cdRef: ChangeDetectorRef
  ) {}

  login() {
    this.httpClient
      .post<boolean>(
        environment.serverUri + '/api/login',
        { password: this.password },
        { headers: this.headers }
      )
      .subscribe((status) => {
        this.isLoggedIn = status;
        if (this.isLoggedIn) {
          this.refresh();
          this.cdRef.markForCheck();
        }
      });
  }

  refresh() {
    let rooms: { [roomId: string]: any } = {};
    this.isLoading = true;
    this.httpClient
      .post<any[]>(
        environment.serverUri + '/api/rooms',
        { password: this.password },
        { headers: this.headers }
      )
      .pipe(throttleTime(1000))
      .subscribe((clients: any[]) => {
        this.isLoading = false;
        if (!clients) return;

        clients.forEach((client) => {
          if (!rooms?.[client.roomId]) rooms[client.roomId] = [];
          rooms[client.roomId].push(client);
        });

        this.rooms = Object.entries(rooms).map(([id, clients]) => ({
          id,
          clients,
        }));
        this.cdRef.markForCheck();
      });
  }

  kickFromRoom(event: MouseEvent, roomId: string, socketId: string): void {
    event.preventDefault();
    event.stopPropagation();
    this.httpClient
      .post<{ socketId: string }>(
        environment.serverUri + '/api/kick',
        { password: this.password, socketId: socketId },
        { headers: this.headers }
      )
      .subscribe((data) => {
        if (!data) return;
        console.log(data);
        this.rooms = this.rooms.reduce((rooms, room) => {
          if (room.id !== roomId) return [...rooms, room];
          const updatedRoom = {
            ...room,
            clients: room.clients.filter(
              (client: any) => client.id !== data.socketId
            ),
          };
          if(!updatedRoom.clients.length) {
            return rooms;
          }
          return [...rooms, updatedRoom];
        }, []);
        this.cdRef.markForCheck();
      });
  }
}
