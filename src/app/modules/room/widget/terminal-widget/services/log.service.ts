import { Injectable } from '@angular/core';

@Injectable()
export class LogService {

  constructor() { }

  error(attrs: any[]): void {
    console.error(...attrs);
  }
  warn(attrs: any[]): void {
    console.warn(...attrs);
  }

  info(attrs: any[]): void {
    console.info(...attrs);
  }

  log(attrs: any[]): void {
    console.log(...attrs);
  }


}
