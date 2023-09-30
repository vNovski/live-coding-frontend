import { Component } from '@angular/core';
import { routerTransition } from './routing-animations';
import { SocketService } from './modules/room/services/socket/socket.service';
import { UserService } from './modules/room/services/user/user.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  animations: [ routerTransition ]
})
export class AppComponent {
  year = new Date().getFullYear();

  getState(outlet: any) {
    return outlet && 
    outlet.activatedRouteData && 
    outlet.activatedRouteData['state'];
  }
}
