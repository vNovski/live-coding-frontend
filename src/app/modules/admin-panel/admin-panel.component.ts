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
  constructor(
    private httpClient: HttpClient,
    private cdRef: ChangeDetectorRef
  ) {}

  login() {
    const headers = { 'Content-Type': 'application/json' };
    this.httpClient
      .post<boolean>(
        environment.serverUri + '/api/login',
        { password: this.password },
        { headers }
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
    const headers = { 'Content-Type': 'application/json' };
    this.httpClient
      .post<any[]>(
        environment.serverUri + '/api/rooms',
        { password: this.password },
        { headers }
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
}
