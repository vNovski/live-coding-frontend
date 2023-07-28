import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
  Renderer2,
  SkipSelf,
  ViewChild,
} from '@angular/core';
import {
  BehaviorSubject,
  combineLatest,
  debounceTime,
  filter,
  fromEvent,
  map,
  Subject,
  takeUntil,
  throttleTime,
} from 'rxjs';
import { ETerminalLogTypes, terminalLogTypes } from 'src/app/shared/components/terminal/enums/terminal-log-types.enum';
import { ITerminalLog } from 'src/app/shared/components/terminal/interfaces/terminal-log.interface';
import { LogService } from './services/log.service';
import { TerminalWidgetService } from './services/terminal-widget.service';
import { FormBuilder } from '@angular/forms';
import { TerminalComponent } from '../../../../shared/components/terminal/terminal.component';
import addAlpha from '../../../../core/utils/addAlpha';
import { TerminalChange } from './interfaces/terminal-change.interface';
import { OffScreenIndicator } from './interfaces/off-screen-indicator.interface';
import { EditorChange } from 'codemirror';
import { isNill } from 'src/app/core/utils/isNill';
import tippy from 'tippy.js';

@Component({
  selector: 'app-terminal-widget',
  templateUrl: './terminal-widget.component.html',
  styleUrls: ['./terminal-widget.component.scss'],
  providers: [TerminalWidgetService, LogService],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TerminalWidgetComponent
  implements OnInit, AfterViewInit, OnDestroy
{
  @ViewChild('terminalContainer', { static: true })
  terminalContainer!: ElementRef;
  @ViewChild('editor', { static: true }) editor!: TerminalComponent;
  code: string = '';

  @Input('value') set value(data: { value: string }) {
    if (isNill(data)) {
      return;
    }
    
    this.contentControl!.patchValue(data.value, { emitEvent: false });
  }

  @Input('editorChange') editorChange: EditorChange | null = null;

  @Input('otherSelection') set otherSelection(selection: any) {
    this.renderOtherSelections(selection);
  }

  @Input('otherCursor') set otherCursor(cursor: any) {
    this.renderOtherCursors(cursor);
  }

  @Input('otherMouseMove') otherMouseMove: any;
  @Input('otherMouses') otherMouses: string[] = [];
  @Input('otherLog') set otherLog(otherLog: ITerminalLog) {
    if (isNill(otherLog)) {
      return;
    }
    this.log(otherLog);
  }

  @Output() fullscreenChange = new EventEmitter<boolean>();
  @Output() logsChange = new EventEmitter<ITerminalLog>();
  @Output() edit = new EventEmitter<TerminalChange>();
  @Output() cursorChange = new EventEmitter<any>();
  @Output() selectionChange = new EventEmitter<{
    from: any;
    to: any;
    head: any;
  }>();
  @Output() mouseMove = new EventEmitter<{
    x: number | null;
    y: number | null;
  }>();

  terminalForm = this.fb.group({
    content: '',
  });

  fullscreenStatus = false;
  isWatchEnabled: boolean = false;
  otherMouseElements: Map<string, SVGElement> = new Map<string, SVGElement>();

  tootlip: any = null;

  private selectionMarkers: Map<string, any> = new Map();
  private cursorMarkers: Map<string, any> = new Map();
  private ngUnsubscribe: Subject<void> = new Subject<void>();

  private scroll$: BehaviorSubject<{ left: number; top: number }> =
    new BehaviorSubject<{ left: number; top: number }>({ left: 0, top: 0 });

  get contentControl() {
    return this.terminalForm.get('content');
  }

  outsideScreenIndicators: Map<string, OffScreenIndicator> = new Map();

  constructor(
    public readonly terminalWidgetService: TerminalWidgetService,
    private readonly logService: LogService,
    private readonly fb: FormBuilder,
    private renderer: Renderer2
  ) {}

  ngOnInit(): void {
    this.listenForm();
    this.listenWatchForm();
    this.listenMouseMove();
  }

  ngAfterViewInit(): void {}

  toggleFullscreen(status: boolean): void {
    this.fullscreenStatus = status;
    this.fullscreenChange.emit(status);
  }

  onCursorActivity(editor: any): void {
    const from = editor.getCursor('from');
    const to = editor.getCursor('to');

    const cursorPos = editor.getCursor();
    this.cursorChange.emit(cursorPos);

    if (from.line === to.line && from.ch === to.ch) {
      this.selectionChange.emit({ from: null, to: null, head: null });
      return;
    }
    this.selectionChange.emit({
      from: editor.getCursor('from'),
      to: editor.getCursor('to'),
      head: editor.getCursor('head'),
    });
  }

  focusChange(status: boolean) {
    if (!status) {
      this.cursorChange.emit({ outside: 0 });
    }
  }

  execute(): void {
    console.log(this.contentControl!.value.value, this.contentControl!.value, 'AAAA')
    this.terminalWidgetService
      .eval(this.contentControl!.value.value || this.contentControl!.value) // TODO: Get rid of this shit 
      .subscribe((logs) => {
        for(let log of logs) {
          this.logsChange.emit(log);
          this.log(log);
        }
      });
  }

  trackOutsideScreenInicators(index: number, indicator: any): string {
    return indicator.userId;
  }

  onScrollChange(event: any): void {
    this.scroll$.next(event);
  }

  onWatch(status: boolean): void {
    this.isWatchEnabled = status;
  }

  download(): void {
    this.terminalWidgetService.download(this.contentControl!.value.value);
  }

  private listenMouseMove() {
    const terminal = this.terminalContainer.nativeElement;
    fromEvent<MouseEvent>(terminal, 'mouseleave')
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(() => {
        this.mouseMove.emit({ x: null, y: null });
      });

    const mousemove$ = combineLatest([
      fromEvent<MouseEvent>(terminal, 'mousemove'),
      this.scroll$,
    ]);

    mousemove$
      .pipe(takeUntil(this.ngUnsubscribe))
      .pipe(throttleTime(100))
      .subscribe(([{ clientX, clientY }, scroll]) => {
        const rect = terminal.getBoundingClientRect();
        const x = clientX - rect.left + scroll.left;
        const y = clientY - rect.top + scroll.top;
        this.mouseMove.emit({ x, y });
      });
  }

  private log(log: ITerminalLog): void {
    switch (log.type) {
      case ETerminalLogTypes.log:
        this.logService.log(log.data);
        break;
      case ETerminalLogTypes.error:
        this.logService.error(log.data);
        break;
      case ETerminalLogTypes.warn:
        this.logService.warn(log.data);
        break;
      case ETerminalLogTypes.info:
        this.logService.info(log.data);
        break;
      default:
        break;
    }
  }

  private renderOtherCursors(cursor: any): void {
    if (cursor && this.editor.codeMirror) {
      const marker = this.cursorMarkers.get(cursor.color);

      if (marker) {
        marker.clear();
      }

      if (cursor.outside === 0) {
        return;
      }
      const cursorCoords = this.editor.codeMirror.cursorCoords(cursor);
      const cursorElement = this.renderer.createElement('span');
      cursorElement.classList.add('other-cursor');
      cursorElement.classList.add('tooltip');
      cursorElement.style.borderLeftColor = cursor.color;
      cursorElement.style.height = `${
        cursorCoords.bottom - cursorCoords.top
      }px`;

      const curosTooltip = tippy(cursorElement, {
        content: cursor.username,
        delay: [0, 500],
        arrow: false,
        placement: 'top-start',
      }) as any;

      this.renderer.setStyle(
        curosTooltip.popper.querySelector('.tippy-box'),
        'background',
        cursor.color
      );

      this.cursorMarkers.set(
        cursor.color,
        this.editor.codeMirror.setBookmark(cursor, {
          widget: cursorElement,
        })
      );
    }
  }

  private renderOtherSelections(selection: any): void {
    if (selection && this.editor.codeMirror) {
      const { from, to, color } = selection;
      const marker = this.selectionMarkers.get(color);
      if (marker) {
        marker.clear();
      }
      if (!(from || to)) {
        return;
      }
      this.selectionMarkers.set(
        selection.color,
        (this.editor.codeMirror as any).doc.markText(from, to, {
          css: `background: ${addAlpha(color, 0.5)}`,
        })
      );
    }
  }

  private listenWatchForm(): void {
    this.terminalForm.valueChanges
      .pipe(
        debounceTime(3000),
        takeUntil(this.ngUnsubscribe),
        filter(() => this.isWatchEnabled)
      )
      .subscribe(() => {
        this.execute();
      });
  }

  private listenForm() {
    this.terminalForm.valueChanges
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(({ content }: { content: TerminalChange & { ignore: true } }) => {
        if(content.ignore) { // if client recevied changes the he should npt sync these changes
          return;
        }
        this.edit.emit(content);
      });
  }

  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
}
