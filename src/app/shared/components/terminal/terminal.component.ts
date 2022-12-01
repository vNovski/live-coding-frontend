import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  DoCheck,
  ElementRef,
  EventEmitter,
  forwardRef,
  Input,
  KeyValueDiffer,
  KeyValueDiffers,
  NgZone,
  OnDestroy,
  Output,
  ViewChild,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { Editor, EditorChange, EditorFromTextArea, ScrollInfo } from 'codemirror';
import { isNill } from 'src/app/core/utils/isNill';

function normalizeLineEndings(str: string): string {
  if (!str) {
    return str;
  }
  return str.replace(/\r\n|\r/g, '\n');
}

declare var require: any;
declare var CodeMirror: any;

@Component({
  selector: 'app-terminal',
  templateUrl: './terminal.component.html',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => TerminalComponent),
      multi: true,
    },
  ],
  styleUrls: ['./terminal.component.scss'],
  preserveWhitespaces: false,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TerminalComponent implements AfterViewInit, OnDestroy, ControlValueAccessor, DoCheck {
  /* class applied to the created textarea */
  @Input() className = '';
  /* name applied to the created textarea */
  @Input() name = 'codemirror';
  /* autofocus setting applied to the created textarea */
  @Input() autoFocus = true;

  /**
   * set options for codemirror
   * @link http://codemirror.net/doc/manual.html#config
   */
  @Input()
  set options(value: { [key: string]: any }) {
    this._options = value;
    if (!this._differ && value) {
      this._differ = this._differs.find(value).create();
    }
  }
  /* preserve previous scroll position after updating value */
  @Input() preserveScrollPosition = false;
  /* preserve previous cursor position after updating value */
  @Input() preserveCursorPosition = true;
  /* called when the text cursor is moved */
  @Output() cursorActivity = new EventEmitter<Editor>();
  /* called when the editor is focused or loses focus */
  @Output() focusChange = new EventEmitter<boolean>();
  /* called when the editor is scrolled */
  @Output() scroll = new EventEmitter<ScrollInfo>();
  /* called when file(s) are dropped */
  @Output() drop = new EventEmitter<[Editor, DragEvent]>();

  @ViewChild('ref') ref!: ElementRef<HTMLTextAreaElement>;
  value = '';
  lastChange: EditorChange | null = null;
  disabled = false;
  isFocused = false;
  codeMirror?: EditorFromTextArea;
  /**
   * either global variable or required library
   */
  private _codeMirror: any;

  private _differ?: KeyValueDiffer<string, any>;
  private _options: any = {
    lineNumbers: true,
    theme: 'material',
    mode: 'javascript'
  };

  constructor(private _differs: KeyValueDiffers, private _ngZone: NgZone) { }

  get codeMirrorGlobal(): any {
    if (this._codeMirror) {
      return this._codeMirror;
    }

    // in order to allow for universal rendering, we import Codemirror runtime with `require` to prevent node errors
    this._codeMirror = typeof CodeMirror !== 'undefined' ? CodeMirror : import('codemirror');
    return this._codeMirror;
  }

  ngAfterViewInit() {
    this._ngZone.runOutsideAngular(async () => {
      const codeMirrorObj = await this.codeMirrorGlobal;
      const codeMirror = codeMirrorObj?.default ? codeMirrorObj.default : codeMirrorObj;
      this.codeMirror = codeMirror.fromTextArea(
        this.ref.nativeElement,
        this._options,
      ) as EditorFromTextArea;
      this.codeMirror.on('cursorActivity', cm => this._ngZone.run(() => this.cursorActive(cm)));
      this.codeMirror.on('scroll', this.scrollChanged.bind(this));
      this.codeMirror.on('blur', () => this._ngZone.run(() => this.focusChanged(false)));
      this.codeMirror.on('focus', () => this._ngZone.run(() => this.focusChanged(true)));
      this.codeMirror.on('change', (cm, change) =>
        this._ngZone.run(() => this.codemirrorValueChanged(cm, change)),
      );
      this.codeMirror.on('drop', (cm, e) => {
        this._ngZone.run(() => this.dropFiles(cm, e));
      });
      this.codeMirror.setValue(this.value);
    });
  }
  ngDoCheck() {
    if (!this._differ) {
      return;
    }
    // check options have not changed
    const changes = this._differ.diff(this._options);
    if (changes) {
      changes.forEachChangedItem(option =>
        this.setOptionIfChanged(option.key, option.currentValue),
      );
      changes.forEachAddedItem(option => this.setOptionIfChanged(option.key, option.currentValue));
      changes.forEachRemovedItem(option =>
        this.setOptionIfChanged(option.key, option.currentValue),
      );
    }
  }
  ngOnDestroy() {
    // is there a lighter-weight way to remove the cm instance?
    if (this.codeMirror) {
      this.codeMirror.toTextArea();
    }
  }
  codemirrorValueChanged(cm: Editor, change: EditorChange) {
    const cmVal = cm.getValue();

    if (this.value === cmVal || JSON.stringify(this.lastChange) === JSON.stringify(change)) {
      return;
    }

    this.value = cmVal;
    this.onChange({ value: this.value, change: change });
  }
  setOptionIfChanged(optionName: string, newValue: any) {
    if (!this.codeMirror) {
      return;
    }

    // cast to any to handle strictly typed option names
    // could possibly import settings strings available in the future
    this.codeMirror.setOption(optionName as any, newValue);
  }
  focusChanged(focused: boolean) {
    this.onTouched();
    this.isFocused = focused;
    this.focusChange.emit(focused);
  }
  scrollChanged(cm: Editor) {
    this.scroll.emit(cm.getScrollInfo());
  }
  cursorActive(cm: Editor) {
    this.cursorActivity.emit(cm);
  }
  dropFiles(cm: Editor, e: DragEvent) {
    this.drop.emit([cm, e]);
  }

  /** Implemented as part of ControlValueAccessor. */
  writeValue(content: { value: string, change: any }) {
    const { value, change } = content;
    if (isNill(value) && isNill(change)) {
      return;
    }

    if (!this.codeMirror) {
      this.value = value || '';
      return;
    }
    const cur = this.codeMirror.getValue();

    if (this.preserveScrollPosition) {
      const prevScrollPosition = this.codeMirror.getScrollInfo();
      this.codeMirror.scrollTo(prevScrollPosition.left, prevScrollPosition.top);
    }

    if (this.preserveCursorPosition) {
      const prevCursorPosition = this.codeMirror.getCursor();
      this.codeMirror.setCursor(prevCursorPosition);
    }

    if (!isNill(value) && value !== cur && normalizeLineEndings(cur) !== normalizeLineEndings(value)) {
      this.value = value;
      this.codeMirror.setValue(value);
    }

    if (!isNill(change)) {
      this.lastChange = change;
      this.codeMirror.replaceRange(change.text, change.from, change.to, change.origin)
    }
  }

  /** Implemented as part of ControlValueAccessor. */
  registerOnChange(fn: (value: string) => void) {
    this.onChange = fn;
  }
  /** Implemented as part of ControlValueAccessor. */
  registerOnTouched(fn: () => void) {
    this.onTouched = fn;
  }
  /** Implemented as part of ControlValueAccessor. */
  setDisabledState(isDisabled: boolean) {
    this.disabled = isDisabled;
    this.setOptionIfChanged('readOnly', this.disabled);
  }
  /** Implemented as part of ControlValueAccessor. */
  private onChange = (_: any) => { };
  /** Implemented as part of ControlValueAccessor. */
  private onTouched = () => { };
}
