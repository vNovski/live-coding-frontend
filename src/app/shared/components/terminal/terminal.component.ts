import { AfterContentInit, AfterViewInit, ChangeDetectionStrategy, Component, ElementRef, EventEmitter, Input, OnDestroy, OnInit, Output, Renderer2, ViewChild } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { CodemirrorComponent } from '@ctrl/ngx-codemirror';
import { Editor, EditorFromTextArea, Position } from 'codemirror';
import { BehaviorSubject, combineLatest, debounceTime, fromEvent, map, Subject, switchMap, takeUntil, throttleTime } from 'rxjs';
import { TerminalLog } from './interfaces/terminal-log.interface';
import { TerminalService } from './services/terminal.service';

@Component({
  selector: 'app-terminal',
  templateUrl: './terminal.component.html',
  styleUrls: ['./terminal.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [TerminalService]
})
export class TerminalComponent implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild('terminal', { static: true }) terminal!: ElementRef;
  @ViewChild('terminalHeader', { static: true }) terminalHeader!: ElementRef;
  @ViewChild('codemirror', { static: true }) codemirror!: CodemirrorComponent;

  @Input('options') options = {
    lineNumbers: true,
    theme: 'material',
    mode: 'javascript'
  };

  @Input('code') set code(code: string | null) {
    if (code !== null) {
      const cursorPos = this.editor?.getCursor();
      const scrollPos = this.editor?.getScrollInfo();
      this.contentControl?.patchValue(code, { emitEvent: false });

      if (scrollPos) {
        this.editor.scrollTo(scrollPos.left, scrollPos.top);
      }
      if (cursorPos) {
        this.editor.setCursor(cursorPos);
      }
    }
  };

  @Output() changed = new EventEmitter<string>();
  @Output() mouseMove = new EventEmitter<{ x: number, y: number }>();
  @Output() mouseLeave = new EventEmitter<{ x: null, y: null }>();
  @Output() cursorChange = new EventEmitter<any>();
  @Output() selectionChange = new EventEmitter<any>();
  @Output() executionLog = new EventEmitter<TerminalLog>();


  fullscreenStatus = false;

  form = this.fb.group({
    content: ``
  });


  public get editor(): EditorFromTextArea {
    return this.codemirror.codeMirror!;
  }

  get contentControl() {
    return this.form.get('content');
  }

  private scroll$: BehaviorSubject<{ left: number, top: number }> = new BehaviorSubject<{ left: number, top: number }>({ left: 0, top: 0 });
  private ngUnsubscribe: Subject<void> = new Subject<void>();

  constructor(
    private readonly terminalService: TerminalService,
    private readonly fb: FormBuilder,
    private renderer: Renderer2
  ) { }

  ngOnInit(): void {
    this.listenForm();
  }

  ngAfterViewInit(): void {
    this.listenMouseMove();
  }

  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  updateCursor(): void {
    const from = this.editor.getCursor('from');
    const to = this.editor.getCursor('to');
    const cursorPos = this.editor.getCursor();
    this.cursorChange.emit(cursorPos);

    if (from.line === to.line && from.ch === to.ch) {
      this.selectionChange.emit({ from: null, to: null, head: null })
    }
  }

  // DEPRECATED
  // listenSelection(): void {
  //   let mousedown$ = fromEvent<MouseEvent>(this.terminal.nativeElement, 'mousedown');
  //   let mousemove$ = fromEvent<MouseEvent>(document, 'mousemove');
  //   let mouseup$ = fromEvent<MouseEvent>(document, 'mouseup');

  //   let mousedrag$ = mousedown$.pipe(
  //     switchMap(() => mousemove$.pipe(
  //       map((event: MouseEvent) => event.preventDefault()),
  //       takeUntil(mouseup$)
  //     )),
  //     takeUntil(this.ngUnsubscribe)
  //   );

  //   mousedrag$.pipe(debounceTime(10)).subscribe(() => {
  //     const from = this.editor.getCursor('from');
  //     const to = this.editor.getCursor('to');

  //     if (from.line === to.line && from.ch === to.ch) {
  //       return;
  //     }
  //     this.selectionChange.emit({ from: this.editor.getCursor('from'), to: this.editor.getCursor('to'), head: this.editor.getCursor('head') })
  //   });
  // }

  execute(): void {
    this.terminalService.eval(this.contentControl!.value).subscribe(log => {
      this.executionLog.emit(log)
    });
  }

  onCursorChange(): void {
    this.updateCursor();
    const from = this.editor.getCursor('from');
    const to = this.editor.getCursor('to');

    if (from.line === to.line && from.ch === to.ch) {
      return;
    }
    this.selectionChange.emit({ from: this.editor.getCursor('from'), to: this.editor.getCursor('to'), head: this.editor.getCursor('head') })
  }

  onScrollChange(event: any): void {
    this.scroll$.next(event);
  }

  private listenMouseMove() {
    const terminal = this.terminal.nativeElement;
    fromEvent<MouseEvent>(terminal, 'mouseleave').pipe(takeUntil(this.ngUnsubscribe)).subscribe(() => {
      this.mouseLeave.emit({ x: null, y: null });
    })

    const mousemove$ = combineLatest([fromEvent<MouseEvent>(terminal, 'mousemove'), this.scroll$]);

    mousemove$.pipe(takeUntil(this.ngUnsubscribe)).pipe(throttleTime(10)).subscribe(([{ clientX, clientY }, { top, left }]) => {
      const rect = terminal.getBoundingClientRect();
      const x = (clientX - rect.left) + left;
      const y = (clientY - rect.top) + top;
      this.mouseMove.emit({ x, y });
    })
  };

  private listenForm() {
    this.form.valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe(({ content }) => {
      this.changed.emit(content);
      this.updateCursor();
    });
  }
}


