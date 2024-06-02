import { Component } from '@angular/core';
import { routerTransition } from './routing-animations';

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
