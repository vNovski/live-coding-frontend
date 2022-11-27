import { AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, EventEmitter, Input, OnDestroy, OnInit, Output, Renderer2, SkipSelf, ViewChild } from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import addAlpha from 'src/app/core/utils/addAlpha';
import { TerminalLogTypes } from 'src/app/shared/components/terminal/enums/terminal-log-types.enum';
import { TerminalLog } from 'src/app/shared/components/terminal/interfaces/terminal-log.interface';
import { TerminalComponent } from 'src/app/shared/components/terminal/terminal.component';
import { RoomService } from '../../room.service';
import { LogService } from './services/log.service';
import { TerminalWidgetService } from './services/terminal-widget.service';


@Component({
  selector: 'app-terminal-widget',
  templateUrl: './terminal-widget.component.html',
  styleUrls: ['./terminal-widget.component.scss'],
  providers: [TerminalWidgetService, LogService],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TerminalWidgetComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('terminal', { static: true }) terminal!: TerminalComponent;
  @ViewChild('terminalWidget', { static: true, read: ElementRef }) terminalWidget!: ElementRef;
  @Input('code') code: string = '';

  @Output() fullscreenChange = new EventEmitter<boolean>();

  options = {
    lineNumbers: true,
    theme: 'material',
    mode: 'javascript'
  }

  otherCursors: any = [];
  fullscreenStatus = false;
  otherMouseElements: Map<string, SVGElement> = new Map<string, SVGElement>();

  private selectionMarkers: Map<string, any> = new Map();
  private cursorMarkers: Map<string, any> = new Map();
  private ngUnsubscribe: Subject<void> = new Subject<void>();

  private editorScroll: HTMLElement | null = null;

  outsideScreenIndicators: Map<string, any> = new Map();

  constructor(
    @SkipSelf() readonly roomService: RoomService,
    public readonly terminalWidgetService: TerminalWidgetService,
    private readonly logService: LogService,
    private readonly cdRef: ChangeDetectorRef,
    private readonly renderer: Renderer2,
  ) { }

  ngOnInit(): void {
    this.terminalWidgetService.otherSelectionChange$.pipe(takeUntil(this.ngUnsubscribe)).subscribe((receivedSelection: any) => {
      this.renderOtherSelections(receivedSelection);
    });

    this.terminalWidgetService.otherCursorChange$.pipe(takeUntil(this.ngUnsubscribe)).subscribe((receivedCursor: any) => {
      this.renderOtherCursors(receivedCursor);
    });

    this.terminalWidgetService.executionLog$.pipe(takeUntil(this.ngUnsubscribe)).subscribe((log: TerminalLog) => {
      this.log(log);
    });

    this.roomService.connections$.pipe(takeUntil(this.ngUnsubscribe)).subscribe(connections => {
      if (!this.editorScroll) {
        this.editorScroll = this.terminal.terminal.nativeElement.querySelector('.CodeMirror-scroll');
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

    if(isTop && isRight) {
      result.angle -=  rotationAngle / 2;
    }

    if(isTop && isLeft) {
      result.angle +=  rotationAngle / 2;
    }

    if(isBottom && isLeft) {
      result.angle = 0;
    }

    if(isBottom && isRight) {
      result.angle -=  rotationAngle / 2;
    }

    if(result.top === undefined) {
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

  terminalChanged(code: string): void {
    this.roomService.terminalChanged(code);
  }

  execute(): void {
    this.terminal.execute();
  }

  cursorChange(position: any): void {
    this.roomService.cursorChange(position);
  }

  selectionChange(position: any): void {
    this.roomService.selectionChange(position);
  }


  mouseMove(position: { x: number | null, y: number | null }): void {
    this.roomService.mouseMove(position);
  }

  executionLog(log: TerminalLog): void {
    this.terminalWidgetService.shareExecutionLog(this.roomService.id, log);
    this.log(log);

  }

  trackOutsideScreenInicators(index: number, indicator: any): string {
    return indicator.userId;
  }

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
    if (cursor && this.terminal.editor) {
      const marker = this.cursorMarkers.get(cursor.color);

      if (marker) {
        marker.clear();
      }
      const cursorCoords = this.terminal.editor.cursorCoords(cursor);
      const cursorElement = document.createElement('span');
      cursorElement.classList.add('other-cursor')
      cursorElement.style.borderLeftColor = cursor.color;
      cursorElement.style.height = `${(cursorCoords.bottom - cursorCoords.top)}px`;
      this.cursorMarkers.set(cursor.color, this.terminal.editor.setBookmark(cursor, { widget: cursorElement }));
    }
  }

  private renderOtherSelections(selection: any): void {
    if (selection && this.terminal.editor) {
      const { from, to, color } = selection;
      const marker = this.selectionMarkers.get(color);
      if (marker) {
        marker.clear();
      }
      if (!(from || to)) {
        return;
      }
      this.selectionMarkers.set(selection.color, (this.terminal.editor as any).doc.markText(from, to, { css: `background: ${addAlpha(color, 0.5)}` }));
    }
  }

  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
}

