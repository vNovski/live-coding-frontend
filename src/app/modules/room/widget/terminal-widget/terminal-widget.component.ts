import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter,
  OnDestroy,
  OnInit,
  Output,
  Renderer2,
  SkipSelf,
  ViewChild
} from '@angular/core';
import { BehaviorSubject, combineLatest, fromEvent, Subject, takeUntil, throttleTime } from 'rxjs';
import { TerminalLogTypes } from 'src/app/shared/components/terminal/enums/terminal-log-types.enum';
import { TerminalLog } from 'src/app/shared/components/terminal/interfaces/terminal-log.interface';
import { RoomService } from '../../room.service';
import { LogService } from './services/log.service';
import { TerminalWidgetService } from './services/terminal-widget.service';
import { FormBuilder } from '@angular/forms';
import { TerminalComponent } from '../../../../shared/components/terminal/terminal.component';
import addAlpha from '../../../../core/utils/addAlpha';
import { TerminalChange } from './interfaces/terminal-change.interface';


@Component({
  selector: 'app-terminal-widget',
  templateUrl: './terminal-widget.component.html',
  styleUrls: ['./terminal-widget.component.scss'],
  providers: [TerminalWidgetService, LogService],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TerminalWidgetComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('terminalContainer', { static: true }) terminalContainer!: ElementRef;
  @ViewChild('editor', { static: true }) editor!: TerminalComponent;
  @ViewChild('terminalWidget', { static: true, read: ElementRef }) terminalWidget!: ElementRef;
  code: string = '';

  @Output() fullscreenChange = new EventEmitter<boolean>();


  terminalForm = this.fb.group({
    content: { value: '', change: null }
  });

  otherCursors: any = [];
  fullscreenStatus = false;
  otherMouseElements: Map<string, SVGElement> = new Map<string, SVGElement>();

  private selectionMarkers: Map<string, any> = new Map();
  private cursorMarkers: Map<string, any> = new Map();
  private ngUnsubscribe: Subject<void> = new Subject<void>();

  private editorScroll: HTMLElement | null = null;
  private scroll$: BehaviorSubject<{ left: number, top: number }> = new BehaviorSubject<{ left: number, top: number }>({ left: 0, top: 0 });

  get contentControl() {
    return this.terminalForm.get('content');
  }

  outsideScreenIndicators: Map<string, any> = new Map();

  constructor(
    @SkipSelf() readonly roomService: RoomService,
    public readonly terminalWidgetService: TerminalWidgetService,
    private readonly logService: LogService,
    private readonly cdRef: ChangeDetectorRef,
    private readonly fb: FormBuilder,
    private readonly renderer: Renderer2,
  ) {
  }

  ngOnInit(): void {
    this.listenForm();
    this.listenMouseMove();
    this.terminalWidgetService.otherSelectionChange$.pipe(takeUntil(this.ngUnsubscribe)).subscribe((receivedSelection: any) => {
      this.renderOtherSelections(receivedSelection);
    });

    this.terminalWidgetService.otherCursorChange$.pipe(takeUntil(this.ngUnsubscribe)).subscribe((receivedCursor: any) => {
      this.renderOtherCursors(receivedCursor);
    });

    this.terminalWidgetService.initialState$.pipe(takeUntil(this.ngUnsubscribe)).subscribe(({ value }: { value: string }) => {
      this.contentControl!.patchValue({ value }, { emitEvent: false });
    });

    this.terminalWidgetService.otherChanged$.pipe(takeUntil(this.ngUnsubscribe)).subscribe((change: any) => {
      this.contentControl!.patchValue({ change }, { emitEvent: false })
    });

    this.terminalWidgetService.executionLog$.pipe(takeUntil(this.ngUnsubscribe)).subscribe((log: TerminalLog) => {
      this.log(log);
    });

    this.roomService.connections$.pipe(takeUntil(this.ngUnsubscribe)).subscribe(connections => {
      if (!this.editorScroll) {
        this.editorScroll = this.terminalContainer.nativeElement.querySelector('.CodeMirror-scroll');
      }

      connections.forEach((userId) => {
        const mouseEl = this.createMouseEl(userId, '');
        this.otherMouseElements.set(userId, mouseEl);
        this.renderer.appendChild(this.editorScroll, mouseEl);
      })
    });

    this.terminalWidgetService.otherMouseMove$.pipe(takeUntil(this.ngUnsubscribe)).subscribe((receivedMouse) => {
      this.updateOtherMousePosition(receivedMouse);
    });
  }

  ngAfterViewInit(): void {
  }

  private updateOtherMousePosition(mouse: any): void {
    const terminalWidgetRect = this.terminalWidget.nativeElement?.getBoundingClientRect();
    const terminalWidgetWidth = terminalWidgetRect!.width;
    const terminalWidgetHeight = terminalWidgetRect!.height;
    const editorScrollTop = this.editorScroll!.scrollTop;
    const editorScrollLeft = this.editorScroll!.scrollLeft;

    const rotationAngle = 90;
    const initialAngle = -45;

    const angles = {
      bottom: initialAngle,
      left: initialAngle + rotationAngle,
      top: initialAngle + (rotationAngle * 2),
      right: initialAngle + (rotationAngle * 3),
    }

    const result: any = { color: mouse.color, angle: initialAngle };
    const isLeft = mouse.x < editorScrollLeft;
    const isRight = mouse.x > terminalWidgetWidth + editorScrollLeft;
    const isBottom = mouse.y >= terminalWidgetHeight + editorScrollTop;
    const isTop = mouse.y < editorScrollTop;

    if (isTop) { // TOP
      result.top = 5;
      result.left = Math.min(mouse.x - editorScrollLeft, terminalWidgetWidth - 25);
      result.angle = angles.top;
    }

    if (isRight) { // RIGHT
      result.top = Math.max(Math.min(mouse.y - editorScrollTop, terminalWidgetHeight - 25), 0);
      result.left = terminalWidgetWidth - 25;
      result.angle = angles.right;
    }

    if (isBottom) { // BOTTOM
      result.top = terminalWidgetHeight - 25;
      result.left = Math.min(mouse.x - editorScrollLeft, terminalWidgetWidth - 25);
      result.angle = angles.bottom;
    }

    if (isLeft) { // LEFT
      result.left = 5;
      result.top = Math.max(Math.min(mouse.y - editorScrollTop, terminalWidgetHeight - 25), 0);
      result.angle = angles.left;
    }

    if (isTop && isRight) {
      result.angle -= rotationAngle / 2;
    }

    if (isTop && isLeft) {
      result.angle += rotationAngle / 2;
    }

    if (isBottom && isLeft) {
      result.angle = 0;
    }

    if (isBottom && isRight) {
      result.angle -= rotationAngle / 2;
    }

    if (result.top === undefined) {
      result.display = 'none';
    }


    this.outsideScreenIndicators.set(mouse.userId, result);
    const mouseEl = this.otherMouseElements.get(mouse.userId);
    this.renderer.setStyle(mouseEl, 'fill', mouse.color);
    this.renderer.setStyle(mouseEl, 'top', mouse.y || -100);
    this.renderer.setStyle(mouseEl, 'left', mouse.x || -100);
    this.cdRef.markForCheck();
  }

  private createMouseEl(id: string, color: string, top = -100, left = -100): SVGElement {
    const mouse = this.renderer.createElement('svg', 'svg');
    this.renderer.addClass(mouse, 'mouse');
    this.renderer.setAttribute(mouse, 'fill', color);
    this.renderer.setAttribute(mouse, 'xmlns', 'http://www.w3.org/2000/svg');
    this.renderer.setAttribute(mouse, 'viewBox', '0 0 24 24');
    this.renderer.setAttribute(mouse, 'width', '24px');
    this.renderer.setAttribute(mouse, 'id', id);
    this.renderer.setStyle(mouse, 'top', top);
    this.renderer.setStyle(mouse, 'left', left);
    mouse.innerHTML = `
    <path
       d="M8.3,3.213l9.468,8.836c0.475,0.443,0.2,1.24-0.447,1.296L13.2,13.7l2.807,6.21c0.272,0.602,0.006,1.311-0.596,1.585l0,0
       c-0.61,0.277-1.33,0-1.596-0.615L11.1,14.6l-2.833,2.695C7.789,17.749,7,17.411,7,16.751V3.778C7,3.102,7.806,2.752,8.3,3.213z"/>
    `
    return mouse;
  }


  toggleFullscreen(): void {
    this.fullscreenStatus = !this.fullscreenStatus;
    this.fullscreenChange.emit(this.fullscreenStatus);
  }

  terminalChanged(change: TerminalChange): void {
    this.roomService.terminalChanged(change);
  }

  onCursorActivity(editor: any): void {

    const from = editor.getCursor('from');
    const to = editor.getCursor('to');

    const cursorPos = editor.getCursor();
    this.cursorChange(cursorPos);

    if (from.line === to.line && from.ch === to.ch) {
      this.selectionChange({ from: null, to: null, head: null });
      return;
    }
    this.selectionChange({ from: editor.getCursor('from'), to: editor.getCursor('to'), head: editor.getCursor('head') })
  }

  execute(): void {
    this.terminalWidgetService.eval(this.contentControl!.value.value).subscribe(log => {
      this.terminalWidgetService.shareExecutionLog(this.roomService.id, log);
      this.log(log);
    });
  }

  cursorChange(position: any): void {
    this.roomService.cursorChange(position);
  }


  trackOutsideScreenInicators(index: number, indicator: any): string {
    return indicator.userId;
  }

  onScrollChange(event: any): void {
    this.scroll$.next(event);
  }

  private selectionChange(position: any): void {
    this.roomService.selectionChange(position);
  }

  private mouseLeave(): void {
    this.roomService.mouseMove({ x: null, y: null });
  }

  private listenMouseMove() {
    const terminal = this.terminalContainer.nativeElement;
    fromEvent<MouseEvent>(terminal, 'mouseleave').pipe(takeUntil(this.ngUnsubscribe)).subscribe(() => {
      this.mouseLeave();
    })

    const mousemove$ = combineLatest([fromEvent<MouseEvent>(terminal, 'mousemove'), this.scroll$]);

    mousemove$.pipe(takeUntil(this.ngUnsubscribe)).pipe(throttleTime(100)).subscribe(([{ clientX, clientY }, scroll]) => {
      const rect = terminal.getBoundingClientRect();
      const x = (clientX - rect.left) + scroll.left;
      const y = (clientY - rect.top) + scroll.top;
      this.roomService.mouseMove({ x, y });
    })
  };

  private log(log: TerminalLog): void {
    switch (log.type) {
      case TerminalLogTypes.log:
        this.logService.log(log.data);
        break;
      case TerminalLogTypes.error:
        this.logService.error(log.data);
        break;
      case TerminalLogTypes.warn:
        this.logService.warn(log.data);
        break;
      case TerminalLogTypes.info:
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
      const cursorCoords = this.editor.codeMirror.cursorCoords(cursor);
      const cursorElement = document.createElement('span');
      cursorElement.classList.add('other-cursor')
      cursorElement.style.borderLeftColor = cursor.color;
      cursorElement.style.height = `${(cursorCoords.bottom - cursorCoords.top)}px`;
      this.cursorMarkers.set(cursor.color, this.editor.codeMirror.setBookmark(cursor, { widget: cursorElement }));
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
      this.selectionMarkers.set(selection.color, (this.editor.codeMirror as any).doc.markText(from, to, { css: `background: ${addAlpha(color, 0.5)}` }));
    }
  }

  private listenForm() {
    this.terminalForm.valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe(({ content } : { content: TerminalChange }) => {
      this.terminalChanged(content);
    });
  }

  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
}

