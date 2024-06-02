import { Injectable } from '@angular/core';
import { UserInfo } from 'os';
import { environment } from 'src/environments/environment';
import { HEX } from '../../../../core/types/color.type';
import { generateUsername } from '../../../../core/utils/username-generator';
import { LocalStorageService } from '../../../../core/services/localStorage/local-storage.service';

export interface IUserInfo {
  id?: string; 
  color: HEX;
  username: string;
}

@Injectable({
  providedIn: 'root',
})
export class UserService {
  color!: HEX;
  username: string = '';
  id: string | null = null;

  constructor(private readonly localStorage: LocalStorageService) {
    this.initColor();
    this.initUserName();
  }

  initColor(): void {
    const color = this.localStorage.get('user-color') as HEX;
    if (color) {
      this.color = color;
    } else {
      const randomColor = environment.userColor[
        Math.floor(Math.random() * environment.userColor.length)
      ] as HEX;
      this.localStorage.set('user-color', randomColor);
      this.color = randomColor;
    }
  }

  initUserName(): void {
    const username = this.localStorage.get('user-name');
    if (username) {
      this.username = username;
    } else {
      const newUsername = generateUsername();
      this.localStorage.set('user-name', newUsername);
      this.username = newUsername;
    }
  }

  getInfo(): IUserInfo {

    return {
      username: this.username,
      color: this.color,
    };
  }
}
