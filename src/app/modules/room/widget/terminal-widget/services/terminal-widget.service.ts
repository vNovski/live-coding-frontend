import { Injectable } from '@angular/core';
import { SocketService } from 'src/app/core/services/socket/socket.service';
import { ITerminalLog } from 'src/app/shared/components/terminal/interfaces/terminal-log.interface';
import { TermianlEvents } from '../../enums/terminal-events.enum';
import {
  catchError,
  debounceTime,
  filter,
  finalize,
  map,
  observeOn,
  reduce,
  scan,
  switchMap,
  take,
  takeUntil,
  tap,
} from 'rxjs/operators';
import {
  fromEvent,
  Observable,
  throwError,
  timer,
  of,
  asyncScheduler,
  queueScheduler,
  OperatorFunction,
  combineLatest,
  merge,
  BehaviorSubject,
  Subject,
} from 'rxjs';
import { SnackbarService } from 'src/app/core/services/snackbar.service';
import { transpileModule, ModuleKind } from 'typescript';
import { ETerminalLogTypes } from 'src/app/shared/components/terminal/enums/terminal-log-types.enum';
import { IAsyncOperation } from 'src/app/shared/components/terminal/interfaces/terminal-asyncOperation.interface';
import { EExecutionEvents } from 'src/app/shared/components/terminal/enums/terminal-executon-events.enum';

function bufferDebounceTime(
  time: number = 0
): OperatorFunction<MessageEvent, ITerminalLog[]> {
  return (source: Observable<MessageEvent>) => {
    let bufferedValues: ITerminalLog[] = [];

    return source.pipe(
      tap((value) => bufferedValues.push(<ITerminalLog>JSON.parse(value.data))),
      debounceTime(time),
      map(() => bufferedValues),
      tap(() => console.log(bufferedValues)),
      tap(() => (bufferedValues = []))
    );
  };
}

@Injectable()
export class TerminalWidgetService {
  private isWorkerAlive$ = new BehaviorSubject(false);
  private worker: Worker | null = null;
  private workerLiveTime = 5000; // in ms

  public readonly isRunning$ = this.isWorkerAlive$.asObservable();

  constructor(private readonly snackBar: SnackbarService) {}

  download(code: string): void {
    if (!code) {
      return;
    }
    const blob = new Blob([code], { type: 'text/javascript' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('href', url);
    a.setAttribute('download', 'code');
    a.click();
  }

  eval(code: string): Observable<ITerminalLog[]> {
    if (this.isWorkerAlive$.value) {
      this.terminateWorker();
      return of([]);
    }

    if (this.worker) {
      this.terminateWorker();
    }

    this.isWorkerAlive$.next(true);

    this.worker = new Worker(this.getCodeBlob(code));

    const workerEvents$ = fromEvent<MessageEvent>(this.worker, 'message').pipe(
      observeOn(asyncScheduler),
      map(
        (
          e
        ): {
          type: EExecutionEvents;
          data: ITerminalLog[] | null | string;
        } => JSON.parse(e.data)
      )
    );
    const syncAndAsyncCompleteEvent$ = workerEvents$.pipe(
      filter(
        ({ type }) =>
          type === EExecutionEvents.syncComplete ||
          type === EExecutionEvents.asyncComplete
      ),
      take(2),
      reduce((acc) => acc + 1, 0),
      tap(() => this.terminateWorker())
    )


    const clientError$ = fromEvent<ErrorEvent>(this.worker, 'error').pipe(
      tap((error) => {
        this.snackBar.open(error.message, '', {
          panelClass: ['error'],
        });
        this.terminateWorker();
      }),
      map((error): ITerminalLog[] => [{ type: 'error', data: [error.message] }])
    );

    const clientEvents$ = workerEvents$.pipe(
      takeUntil(
        syncAndAsyncCompleteEvent$.pipe(
          filter((completedOperations) => completedOperations === 2)
        )
      ),
      filter(({ type }) => type === EExecutionEvents.client),
      map(({ data }) => data as ITerminalLog[])
    );

    this.worker.postMessage('RUN'); // Start the worker.
    return merge(clientEvents$, clientError$);
  }

  private terminateWorker() {
    console.log('kill');
    this.isWorkerAlive$.next(false);
    this.worker?.terminate();
    this.worker = null;
  }

  private getWorkerCode(codeToInject: string): string {
    return `
        class AsyncOperationsManager {
          counter = 0;
          postMessage;

          constuctor(postMessage) {
            this.postMessage = postMessage
          }
        
          inc() {
            this.counter+=1;
            this.shareUpdate();
          }
        
          dec() {
            this.counter-=1;
            this.shareUpdate();
          }

          shareUpdate() {
            if(this.counter === 0) {
              self.postMessage(JSON.stringify({ type: ${EExecutionEvents.asyncComplete}, data: null }));
            }
          }
        }
        
        const timersSet = new Set();
        
        onmessage = (message) => {
            const nativePostMessage = this.postMessage;
            const asyncOperationManager = new AsyncOperationsManager(nativePostMessage);
            const bufferTime = 100 // ms;
            let startTime = performance.now();
            let actions = [];
            const unit = message.data;
            

            ['log', 'info', 'warn', 'error'].forEach(patchConsoleMethod);
            // const sandboxProxy = new Proxy(Object.assign(unitApi, apis), {has, get});
            
            // Object.keys(this).forEach(key => {
            //     delete this[key];
            // });
            
            this.Function = function() { return 'Not bad =)' };

            // Monkey patched async methods

            // Promise
            class LiveCodingPromise extends Promise {
              constructor(executor, test) {
                asyncOperationManager.inc();
                super(executor);
                super.finally(() => asyncOperationManager.dec());
              }
            }
            LiveCodingPromise.prototype.constructor = Promise;
            this.Promise = LiveCodingPromise;

            // SetTimeout
            const nativeSetTimeout = setTimeout;
            const liveCodingSetTimeout = (cb, ...args) => {
              const timeout = nativeSetTimeout(() => {
                  cb();
                  asyncOperationManager.dec();
                  timersSet.delete(timeout);
              }, ...args);
              asyncOperationManager.inc();
              timersSet.add(timeout);
            }
            setTimeout = liveCodingSetTimeout;

            // SetInterval
            const nativeSetInterval = setInterval;
            const liveCodingSetInterval = (...args) => {
              const interval = nativeSetInterval(...args);
              asyncOperationManager.inc();
              timersSet.add(interval);
              return interval;
            }
            setInterval = liveCodingSetInterval;

            // clearInterval
            const nativeClearInterval = clearInterval;
            const liveCodingClearInterval = (id) => {
              asyncOperationManager.dec();
              timersSet.delete(id);
              return nativeClearInterval(id)
            }
            clearInterval = liveCodingClearInterval;

            // clearTimeout
            const nativeclearTimeout = clearTimeout;
            const liveCodingClearTimeout = (id) => {
              asyncOperationManager.dec();
              timersSet.delete(id);
              return nativeclearTimeout(id)
            }
            clearTimeout = liveCodingClearTimeout;


            //with (sandboxProxy) {
                (function() {
                        ${codeToInject};
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
                    actions.push({type: name, data: [...attributes]});
                   
                    // let endTime = performance.now();
                    // if(endTime - startTime >= bufferTime) {
                      // startTime = performance.now();
                      nativePostMessage(JSON.stringify({ type: ${EExecutionEvents.client}, data: actions}));
                      actions = [];
                    // }

                    // nativeMethod(...attributes);
                }
            }
            nativePostMessage(JSON.stringify({ type: ${EExecutionEvents.syncComplete}, data: null }));
        }`;
  }

  private getCodeBlob(code: string): any {
    const jsCode = this.tsToMinifiedJs(code);
    const blob = new Blob([this.getWorkerCode(jsCode)], {
      type: 'text/javascript',
    });
    return URL.createObjectURL(blob);
  }

  private tsToMinifiedJs(code: string): string {
    let { outputText: jsCode } = transpileModule(code, {
      compilerOptions: {
        module: ModuleKind.CommonJS,
        allowJs: true,
        removeComments: true,
      },
    });
    return jsCode;
  }
}
