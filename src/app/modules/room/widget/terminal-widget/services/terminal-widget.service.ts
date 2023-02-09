import { Injectable } from '@angular/core';
import { SocketService } from 'src/app/core/services/socket/socket.service';
import { TerminalLog } from 'src/app/shared/components/terminal/interfaces/terminal-log.interface';
import { TermianlEvents } from '../../enums/terminal-events.enum';
import { catchError, filter, map, switchMap, takeUntil, tap } from 'rxjs/operators';
import { fromEvent, Observable, throwError, timer, of } from 'rxjs';
import { SnackbarService } from 'src/app/core/services/snackbar.service';
import { transpileModule, ModuleKind } from 'typescript'

@Injectable()
export class TerminalWidgetService {
  constructor(private readonly snackBar: SnackbarService) {
  }

  eval(code: string): Observable<TerminalLog> {
    let { outputText: jsCode }  = transpileModule(code, { compilerOptions: { module: ModuleKind.CommonJS, allowJs: true }});
    const worker = new Worker(this.getCodeBlob(jsCode));

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
      tap(() => {
        this.snackBar.open('Compiled', '', {
          panelClass: ['success'],
        })
      }),
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
