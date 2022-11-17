import { Component } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Position } from 'codemirror';
import { Socket } from 'ngx-socket-io';
import { ConnectionsService } from './core/services/connections/connections.service';
import { CommunicationEventTypes, SocketService } from './core/services/socket/socket.service';
import { UserService } from './core/services/user/user.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  year = new Date().getFullYear();
 
}
