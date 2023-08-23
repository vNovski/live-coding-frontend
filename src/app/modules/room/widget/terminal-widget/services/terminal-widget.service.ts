import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import {
  asyncScheduler,
  BehaviorSubject,
  fromEvent,
  merge,
  Observable,
  of,
  OperatorFunction,
} from 'rxjs';
import {
  debounceTime,
  filter,
  map,
  observeOn,
  reduce,
  skip,
  take,
  takeUntil,
  tap,
} from 'rxjs/operators';
import { SnackbarService } from 'src/app/core/services/snackbar.service';
import { isDevtoolsOpen } from 'src/app/core/utils/checkIfDevtoolsOpen';
import { SnackbarComponent } from 'src/app/shared/components/snackbar/snackbar.component';
import { EExecutionEvents } from 'src/app/shared/modules/terminal/enums/terminal-executon-events.enum';
import { ITerminalLog } from 'src/app/shared/modules/terminal/interfaces/terminal-log.interface';
import { ModuleKind, transpileModule } from 'typescript';

@Injectable()
export class TerminalWidgetService {
  private isWorkerAlive$ = new BehaviorSubject(false);
  private worker: Worker | null = null;
  private evalModuleCode = '';
  public readonly isRunning$ = this.isWorkerAlive$.asObservable();

  constructor(
    private readonly snackBar: SnackbarService,
    private httpClient: HttpClient
  ) {
    this.getWorkerWrapper().subscribe((code) => (this.evalModuleCode = code));
  }

  getWorkerWrapper(): Observable<string> {
    return this.httpClient.get('assets/eval/eval.js', { responseType: 'text' });
  }

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
    this.showModalIfDevToolsIsClosed();

    const jsCode = this.tsToMinifiedJs(code);
    if (!jsCode) {
      this.terminateWorker();
      return of([]);
    }

    this.isWorkerAlive$.next(true);
    this.worker = new Worker(this.getCodeBlob(jsCode));

    const workerEvents$ = fromEvent<MessageEvent>(this.worker, 'message').pipe(
      observeOn(asyncScheduler),
      takeUntil(
        this.isWorkerAlive$.pipe(filter((isWorkerAlive) => !isWorkerAlive))
      ),
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
      take(2), // complete stream after receiving status about sync and async operations
      skip(1), // skip first value because we use syncAndAsyncCompleteEvent$ in TakeUntil so we wanna trigger emit only onse when everything is completed
      tap(() => this.terminateWorker())
    );

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
      takeUntil(syncAndAsyncCompleteEvent$),
      filter(({ type }) => type === EExecutionEvents.client),
      map(({ data }) => data as ITerminalLog[])
    );

    this.worker.postMessage('RUN'); // Start the worker.
    return merge(clientEvents$, clientError$);
  }

  private terminateWorker() {
    this.isWorkerAlive$.next(false);
    this.worker?.terminate();
    this.worker = null;
  }

  private showModalIfDevToolsIsClosed() {
    if (!isDevtoolsOpen()) {
      this.snackBar.openFromComponent(SnackbarComponent, {
        duration: 40000,
        data: `
        <div class='open-devtools-snackbar'>
          <p>
            Please Open DevTools to see the result
          </p>
          <p>
            To open DevTools press <code> Ctrl + Shift + I </code>
          </p>
        </div>`,
        panelClass: ['info'],
      });
    }
  }

  private getCodeBlob(jsCode: string): any {
    const code = this.evalModuleCode.replace('//{INJECT}//', jsCode);
    const blob = new Blob([code], {
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
