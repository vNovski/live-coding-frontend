import { Injectable } from '@angular/core';
import { UserInfo } from 'os';
import { environment } from 'src/environments/environment';
import { HEX } from '../../types/color.type';
import { generateUsername } from '../../utils/username-generator';
import { LocalStorageService } from '../localStorage/local-storage.service';

export interface IUserInfo {
  id: string;
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

  setId(id: string) {
    this.id = id;
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

  getInfo(): IUserInfo | null {
    if (!this.id) {
      return null;
    }
    return {
      id: this.id,
      username: this.username,
      color: this.color,
    };
  }
}
