import { Injectable, OnInit } from '@angular/core';
import { rejects } from 'assert';
import { time } from 'console';
import { EMPTY, fromEvent, merge, Observable, of, throwError, timer } from 'rxjs';
import { catchError, filter, finalize, map, switchMap, takeUntil, tap } from 'rxjs/operators';
import { TerminalLogType, TerminalLog } from '../interfaces/terminal-log.interface';

@Injectable()
export class TerminalService {
  constructor() {
  }

  eval(code: string): Observable<TerminalLog> {
    if(!code) {
      return of({ type: 'error', data: [] });
    }

    const worker = new Worker(this.getCodeBlob(code));

    const message$ = fromEvent<MessageEvent>(worker, 'message')
      .pipe(map(e => <TerminalLog>JSON.parse(e.data)));

    const successMessage$ = message$
      .pipe(
        filter(({ type }) => type === 'success'),
        tap(() => worker.terminate())
      );

    const timeoutClose$ = timer(1000).pipe(
      takeUntil(successMessage$),
      tap(() => worker.terminate()),
      switchMap(() => throwError(() => new Error(`The script was executed for more than 1 second and was terminated!`)))
    );

    worker.postMessage('RUN'); // Start the worker.

    return message$.pipe(
      takeUntil(successMessage$),
      takeUntil(timeoutClose$),
      catchError((error: Error): Observable<TerminalLog> => of({ type: 'error', data: [error.message] }))
    )
  }

  private getWorkerCode(codeToInject: string): string {

    return `
        onmessage = (message) => {
            
            const actions = [];
            const unit = message.data;
            
            const nativePostMessage = this.postMessage;
            
            ['log', 'info', 'warn', 'error'].forEach(patchConsoleMethod);
            
            // const sandboxProxy = new Proxy(Object.assign(unitApi, apis), {has, get});
            
            // Object.keys(this).forEach(key => {
            //     delete this[key];
            // });
            
            this.Function = function() { return 'Not bad =)' };
            
            //with (sandboxProxy) {
                (function() {
                    try {
                        ${codeToInject};
                    } catch (e) {
                        console.error(e);
                    }
                }).call('Nice try but try smth else ;)')
            //}
            
            function has (target, key) {
                return true;
            }
            
            function get (target, key) {
                if (key === Symbol.unscopables) return undefined;
                return target[key];
            }
            
            function patchConsoleMethod(name) {
                const nativeMethod = console[name].bind(console);
                
                console[name] = (...attributes) => {
                    attributes = attributes.map(attr => {
                        if (attr instanceof Error) {
                            return attr.constructor.name + ': ' + attr.message;
                        }
                        
                        if (attr instanceof Object) {
                            return JSON.stringify(attr);
                        }
                        
                        return attr;
                    })
                
                    nativePostMessage(JSON.stringify({type: name, data: attributes}));
                    
                    // nativeMethod(...attributes);
                }
            }
        
            nativePostMessage(JSON.stringify({type: 'success', data: actions}));
        }`;
  }

  private getCodeBlob(code: string): any {
    const blob = new Blob([this.getWorkerCode(code)], { type: "text/javascript" });

    return URL.createObjectURL(blob);
  }
}
