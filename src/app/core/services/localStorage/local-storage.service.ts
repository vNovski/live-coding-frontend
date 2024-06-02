import { Injectable, Inject } from "@angular/core";
import { DOCUMENT } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class LocalStorageService {
  private domain = this.document.location.hostname;

  constructor(@Inject(DOCUMENT) private document: Document) { }

  public set(key: string, value: string) {
    localStorage.setItem(`${this.domain}-${key}`, value);
  }

  public get(key: string) {
    return localStorage.getItem(`${this.domain}-${key}`)
  }
  public remove(key: string) {
    localStorage.removeItem(`${this.domain}-${key}`);
  }

  public clear() {
    localStorage.clear();
  }
}