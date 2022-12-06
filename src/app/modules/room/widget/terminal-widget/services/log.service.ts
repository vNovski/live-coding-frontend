import { Injectable } from '@angular/core';

@Injectable()
export class LogService {

  constructor() { }

  error(attrs: any[]): void {
   
    this.container(console.error.bind(this, ...attrs));
  }
  warn(attrs: any[]): void {
    this.container(console.warn.bind(this, ...attrs));
  }

  info(attrs: any[]): void {
    this.container(console.info.bind(this, ...attrs));
  }

  log(attrs: any[]): void {
    this.container(console.log.bind(this, ...attrs));
  }

  private container(fn: Function) {
    fn();
  }


}
