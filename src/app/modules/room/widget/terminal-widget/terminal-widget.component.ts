import { AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, EventEmitter, Input, OnDestroy, OnInit, Output, SkipSelf, ViewChild } from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import { SocketService } from 'src/app/core/services/socket/socket.service';
import addAlpha from 'src/app/core/utils/addAlpha';
import { TerminalLogTypes as TerminalLogTypes } from 'src/app/shared/components/terminal/enums/terminal-log-types.enum';
import { TerminalLog } from 'src/app/shared/components/terminal/interfaces/terminal-log.interface';
import { TerminalComponent } from 'src/app/shared/components/terminal/terminal.component';
import { RoomService } from '../../room.service';
import { TermianlEvents } from '../enums/terminal-events.enum';
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
  @Input('code') code: string = '';

  @Output() fullscreenChange = new EventEmitter<boolean>();

  options = {
    lineNumbers: true,
    theme: 'material',
    mode: 'javascript'
  }

  otherCursors: any = [];
  fullscreenStatus = false;
  otherMouses: any = [];

  private selectionMarkers: Map<string, any> = new Map();
  private cursorMarkers: Map<string, any> = new Map();
  private ngUnsubscribe: Subject<void> = new Subject<void>();

  constructor(
    @SkipSelf() readonly roomService: RoomService,
    public readonly terminalWidgetService: TerminalWidgetService,
    private readonly logService: LogService,
    private readonly socketService: SocketService,
    private readonly cdRef: ChangeDetectorRef
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
      this.otherMouses = connections.map((id) => ({ x: null, y: null, color: null, userId: id }));
    });

    // TODO: избавиться от socket service
    this.socketService.on(TermianlEvents.mouseMove).pipe(takeUntil(this.ngUnsubscribe)).subscribe((receivedMouse) => {
      this.otherMouses = this.otherMouses.map((mouse: any) => mouse.userId === receivedMouse.userId ? { ...receivedMouse } : mouse);
      this.cdRef.markForCheck();
    });
  }

  ngAfterViewInit(): void {
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

