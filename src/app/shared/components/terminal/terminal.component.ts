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
import {
  Editor,
  EditorChange,
  EditorFromTextArea,
  Position,
  ScrollInfo,
} from 'codemirror';
import { js_beautify } from 'js-beautify';
import { isNill } from 'src/app/core/utils/isNill';

import { ETerminalShortcuts } from './enums/terminal-shortcuts.enum';

// @ts-ignore

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
export class TerminalComponent
  implements AfterViewInit, OnDestroy, ControlValueAccessor, DoCheck
{
  /* class applied to the created textarea */
  @Input() className = '';
  /* name applied to the created textarea */
  @Input() name = 'codemirror';
  /* autofocus setting applied to the created textarea */
  @Input() autoFocus = true;

  @Input() set change(change: EditorChange | null) {
    if (isNill(change)) {
      return;
    }
    this.applyChange(change!);
  }

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

  /* called when the editor text is changed */
  @Output() onchange = new EventEmitter<EditorChange & { ignore: boolean }>();
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
  ingoreNextChange = false;
  /**
   * either global variable or required library
   */
  private _codeMirror: any;

  private _differ?: KeyValueDiffer<string, any>;
  private _options: any = {
    lineNumbers: true,
    theme: 'material',
    mode: 'text/typescript',
    indentUnit: 2,
  };

  constructor(private _differs: KeyValueDiffers, private _ngZone: NgZone) {}

  get codeMirrorGlobal(): any {
    if (this._codeMirror) {
      return this._codeMirror;
    }

    // in order to allow for universal rendering, we import Codemirror runtime with `require` to prevent node errors
    this._codeMirror =
      typeof CodeMirror !== 'undefined' ? CodeMirror : import('codemirror');
    return this._codeMirror;
  }

  ngAfterViewInit() {
    this._ngZone.runOutsideAngular(async () => {
      this.codeMirror = await this.createEditor();

      this.codeMirror.on('cursorActivity', (cm) =>
        this._ngZone.run(() => this.cursorActive(cm))
      );
      this.codeMirror.on('scroll', this.scrollChanged.bind(this));
      this.codeMirror.on('blur', (cm) =>
        this._ngZone.run(() => this.focusChanged(cm, false))
      );
      this.codeMirror.on('focus', (cm) =>
        this._ngZone.run(() => this.focusChanged(cm, true))
      );
      this.codeMirror.on('change', (cm, change) =>
        this._ngZone.run(() => {
          this.codemirrorValueChanged(cm, change);
        })
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
      changes.forEachChangedItem((option) =>
        this.setOptionIfChanged(option.key, option.currentValue)
      );
      changes.forEachAddedItem((option) =>
        this.setOptionIfChanged(option.key, option.currentValue)
      );
      changes.forEachRemovedItem((option) =>
        this.setOptionIfChanged(option.key, option.currentValue)
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

    this.value = cmVal;
    this.onchange.emit({ ...change, ignore: change.origin !== '+input'  });
    this.onChange(this.value);
  }
  setOptionIfChanged(optionName: string, newValue: any) {
    if (!this.codeMirror) {
      return;
    }

    // cast to any to handle strictly typed option names
    // could possibly import settings strings available in the future
    this.codeMirror.setOption(optionName as any, newValue);
  }
  focusChanged(cm: Editor, focused: boolean) {
    this.onTouched();
    this.isFocused = focused;
    if (!this.isFocused) {
      this.focusChange.emit(focused);
      return;
    }

    this.cursorActive(cm);
  }
  scrollChanged(cm: Editor) {
    this.scroll.emit(cm.getScrollInfo());
  }
  cursorActive(cm: Editor) {
    if (this.isFocused) {
      this.cursorActivity.emit(cm);
    }
  }
  dropFiles(cm: Editor, e: DragEvent) {
    this.drop.emit([cm, e]);
  }

  /** Implemented as part of ControlValueAccessor. */
  writeValue(value: string) {
    if (isNill(value)) {
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

    if (
      !isNill(value) &&
      value !== cur &&
      normalizeLineEndings(cur) !== normalizeLineEndings(value)
    ) {
      this.value = value;
      this.codeMirror.setValue(value);
    }
  }

  private applyChange(change: EditorChange): void {
    if (!isNill(change) && this.codeMirror) {
      this.lastChange = change;
      this.codeMirror.replaceRange(
        change.text,
        change.from,
        change.to,
        '+ignore'
      );
      this.value = this.codeMirror.getValue();
      // this.onChange({ value: this.value, change: change });
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

  private async createEditor(): Promise<EditorFromTextArea> {
    const codeMirrorObj = await this.codeMirrorGlobal;

    const codeMirror = codeMirrorObj?.default
      ? codeMirrorObj.default
      : codeMirrorObj;
    return codeMirror.fromTextArea(this.ref.nativeElement, {
      ...this._options,
      extraKeys: {
        [ETerminalShortcuts.format]: this.beautify,
        [ETerminalShortcuts.comment]: this.comment,
      },
    }) as EditorFromTextArea;
  }

  private comment(cm: Editor): void {
    const from = { line: cm.getCursor('from').line, ch: 0 };
    const to = { line: cm.getCursor('to').line } as Position;
    const lines = cm.getRange(from, to).split('\n');

    const uncomment = lines.every((line: string) => line.startsWith('//'));
    let text = '';
    if (uncomment) {
      text = lines.map((line: string) => line.slice(2)).join('\n');
    } else {
      text = lines.map((line: string) => '//' + line).join('\n');
    }
    cm.replaceRange(text, from, to);
  }

  private beautify(cm: Editor): void {
    cm.setValue(
      js_beautify(cm.getValue(), {
        indent_size: 2,
        indent_char: ' ',
        max_preserve_newlines: 2,
        preserve_newlines: true,
        keep_array_indentation: false,
        break_chained_methods: false,
        brace_style: 'collapse',
        space_before_conditional: true,
        unescape_strings: false,
        jslint_happy: false,
        end_with_newline: false,
        wrap_line_length: 0,
        comma_first: false,
        e4x: false,
        indent_empty_lines: false,
      })
    );
  }
  /** Implemented as part of ControlValueAccessor. */
  private onChange = (_: any) => {};
  /** Implemented as part of ControlValueAccessor. */
  private onTouched = () => {};
}
