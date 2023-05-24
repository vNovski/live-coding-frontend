import { Injectable, OnInit } from '@angular/core';
import { rejects } from 'assert';
import { time } from 'console';
import {
  EMPTY,
  fromEvent,
  merge,
  Observable,
  of,
  throwError,
  timer,
} from 'rxjs';
import {
  catchError,
  filter,
  finalize,
  map,
  switchMap,
  takeUntil,
  tap,
} from 'rxjs/operators';
import {
  TerminalLogType,
  ITerminalLog,
} from '../interfaces/terminal-log.interface';
import { IAsyncOperation } from '../interfaces/terminal-asyncOperation.interface';

@Injectable()
export class TerminalService {
  constructor() {}
}
