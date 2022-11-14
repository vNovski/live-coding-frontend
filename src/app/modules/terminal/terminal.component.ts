import { ChangeDetectionStrategy, Component, ElementRef, EventEmitter, Input, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { CodemirrorComponent } from '@ctrl/ngx-codemirror';
import { Editor } from 'codemirror';
import { debounceTime, filter, fromEvent, map, Subscription, switchMap, takeUntil, throttleTime } from 'rxjs';

@Component({
  selector: 'app-terminal',
  templateUrl: './terminal.component.html',
  styleUrls: ['./terminal.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TerminalComponent implements OnInit, OnDestroy {
  @ViewChild('terminal', { static: true }) terminal!: ElementRef;
  @ViewChild('codemirror', { static: true }) codemirror!: CodemirrorComponent;
  @Input('code') set code(code: string | null) {
    if (code !== null) {
      this.contentControl?.patchValue(code, { emitEvent: false });
    }
  };

  @Input('otherSelections') set otherSelections(otherSelections: any[]) {
    const mirror = this.codemirror.codeMirror;

    if (otherSelections.length && mirror) {
      this.selectionMarkers.forEach((marker: { clear: () => any; }) => marker.clear());
      for (const selection of otherSelections) {
        const { from, to, color } = selection;
        this.selectionMarkers.push(((mirror as any).doc.markText(from, to, { css: `background: ${color}` })));
      }

    }
  };

  @Input('otherCursors') set otherCursors(otherCursors: any[]) {
    const mirror = this.codemirror.codeMirror;
    console.log('a', otherCursors);

    if (otherCursors.length && mirror) {
      this.cursorMarkers.forEach((marker: { clear: () => any; }) => marker.clear());

      for (const cursor of otherCursors) {
        const cursorCoords = mirror.cursorCoords(cursor);
        const cursorElement = document.createElement('span');
        cursorElement.classList.add('other-cursor')
        cursorElement.style.borderLeftColor = cursor.color;
        cursorElement.style.height = `${(cursorCoords.bottom - cursorCoords.top)}px`;
        const marker = mirror.setBookmark(cursor, { widget: cursorElement });
        this.cursorMarkers.push(marker);
      }
    }
  };

  @Output() changed = new EventEmitter<string>();
  @Output() mouseMove = new EventEmitter<{ x: number, y: number }>();
  @Output() mouseLeave = new EventEmitter<{ x: null, y: null }>();
  @Output() cursorChange = new EventEmitter<any>();
  @Output() selectionChange = new EventEmitter<any>();

  sub!: Subscription;

  form = this.fb.group({
    content: ''
  });

  options = {
    lineNumbers: true,
    theme: 'material',
    mode: 'javascript'
  }

  get contentControl() {
    return this.form.get('content');
  }

  private cursorMarkers: any = [];
  private selectionMarkers: any = [];

  constructor(
    private readonly fb: FormBuilder
  ) { }

  ngOnInit(): void {
    this.listenForm();
    this.listenMouseMove();
    this.listenSelection();

    this.contentControl?.patchValue(`// Hello World (▽◕ ᴥ ◕▽)`)
  }

  ngOnDestroy() {
    this.sub?.unsubscribe();
  }

  onCursorChange(mirror: Editor | undefined): void {
    if (!mirror) {
      return;
    }
    const from = mirror.getCursor('from');
    const to = mirror.getCursor('to');
    // console.log({ from: mirror.getCursor('from'), to: mirror.getCursor('to'), head: mirror.getCursor('head') });
    const cursorPos = mirror.getCursor();
    this.cursorChange.emit(cursorPos);

    if(from.line === to.line && from.ch === to.ch) {
      this.selectionChange.emit(null)
    }
  }

  listenSelection(): void {
    let mousedown$ = fromEvent<MouseEvent>(this.terminal.nativeElement, 'mousedown');
    let mousemove$ = fromEvent<MouseEvent>(document, 'mousemove');
    let mouseup$ = fromEvent<MouseEvent>(document, 'mouseup');

    let mousedrag$ = mousedown$.pipe(
      switchMap(() => mousemove$.pipe(
        map((event: MouseEvent) => event.preventDefault()),
        takeUntil(mouseup$)
      ))
    );

    mousedrag$.pipe(debounceTime(10)).subscribe(() => {
      const mirror = this.codemirror.codeMirror;
      if (mirror) {
        this.selectionChange.emit({ from: mirror.getCursor('from'), to: mirror.getCursor('to'), head: mirror.getCursor('head') })
      }
    });
  }

  private listenMouseMove() {
    const terminal = this.terminal.nativeElement;
    fromEvent<MouseEvent>(terminal, 'mouseleave').subscribe(() => {
      this.mouseLeave.emit({ x: null, y: null });
    })
    fromEvent<MouseEvent>(terminal, 'mousemove').pipe(throttleTime(10)).subscribe(({ clientX, clientY }) => {
      var rect = terminal.getBoundingClientRect();
      var x = clientX - rect.left;
      var y = clientY - rect.top;
      this.mouseMove.emit({ x, y });
    })
  };

  private listenForm() {
    this.sub = this.form.valueChanges.subscribe(({ content }) => {
      this.changed.emit(content);
    });
  }
}

