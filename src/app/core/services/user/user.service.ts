import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { LocalStorageService } from '../localStorage/local-storage.service';
import { SocketService } from '../socket/socket.service';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  color: string;

  constructor(private readonly localStorage: LocalStorageService) {
    const color = this.localStorage.get('user-color');
    if(color) {
      this.color = color;
    } else {
      const randomColor = environment.userColor[Math.floor(Math.random() * environment.userColor.length)]
      this.localStorage.set('user-color', randomColor);
      this.color = randomColor;
    }
  }
}
