import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-shortcuts-dialog',
  templateUrl: './shortcuts-dialog.component.html',
  styleUrls: ['./shortcuts-dialog.component.scss']
})
export class ShortcutsDialogComponent implements OnInit {

  constructor() { }

  displayedColumns: string[] = ['command', 'binding'];

  shortcuts = [
    {
      command: 'Add line comment',
      binding: ['Ctrl', '/']
    },
    {
      command: 'Format code',
      binding: ['Ctrl', 'Atl', 'F']
    },
    {
      command: 'Select all',
      binding: ['Ctrl', 'A']
    },
    {
      command: 'Delete line under the cursor',
      binding: ['Ctrl', 'D']
    },
    {
      command: 'Undo last change',
      binding: ['Ctrl', 'Z']
    },

    {
      command: 'Redo the last undone change',
      binding: ['Ctrl', 'Y']
    },
    {
      command: 'Undo the last change to the selection, or if there are no selection-only changes at the top of the history, undo the last change',
      binding: ['Ctrl', 'U']
    },
    {
      command: 'Redo the last change to the selection, or the last text change if no selection changes remain',
      binding: ['Alt', 'U']
    },
    {
      command: 'Move cursor to the start of the document',
      binding: ['Alt', 'HOME']
    },
    {
      command: 'Move cursor to the end of the document',
      binding: ['Alt', 'END']
    },
    {
      command: 'Move cursor to the start of the line',
      binding: ['Alt', '←']
    },
    {
      command: 'Move to the start of the text on the line, or if we are already there, go to the actual start of the line (including whitespace)',
      binding: ['HOME']
    },
    {
      command: 'Move cursor to the end of the line',
      binding: ['Alt', 'U']
    },
    {
      command: 'Move cursor to the end of the line',
      binding: ['Alt', '→']
    },
    {
      command: 'Move the cursor up one line',
      binding: ['↑']
    },
    {
      command: 'Move the cursor down one line',
      binding: ['↓']
    },
    {
      command: 'Move the cursor up one screen, and scroll up by the same distance',
      binding: ['Page Up']
    },
    {
      command: 'Move the cursor down one screen, and scroll down by the same distance',
      binding: ['Page Down']
    },
    {
      command: 'Move the cursor one character left, going to the previous line when hitting the start of line',
      binding: ['←']
    },
    {
      command: 'Move the cursor one character right, going to the next line when hitting the end of line',
      binding: ['→']
    },
    {
      command: 'Move the cursor one character right, going to the next line when hitting the end of line',
      binding: ['Ctrl', '←']
    },
    {
      command: 'Move to the left of the group before the cursor. A group is a stretch of word characters, a stretch of punctuation characters, a newline, or a stretch of more than one whitespace character',
      binding: ['Ctrl', '→']
    },
    {
      command: 'Delete the character before the cursor',
      binding: ['Shift', 'Backspace']
    },
    {
      command: 'Delete the character after the cursor',
      binding: ['Del']
    },
    {
      command: 'Delete to the left of the group before the cursor',
      binding: ['Ctrl', 'Backspace']
    },
    {
      command: 'Delete to the start of the group after the cursor',
      binding: ['Ctrl', 'Del']
    },
    {
      command: 'Auto-indent the current line or selection',
      binding: ['Shift', 'Tab']
    },
    {
      command: 'Indent the current line or selection by one indent unit',
      binding: ['Ctrl', ']']
    },
    {
      command: 'Dedent the current line or selection by one indent unit',
      binding: ['Ctrl', '[']
    },
    {
      command: 'If something is selected, indent it by one indent unit. If nothing is selected, insert a tab character',
      binding: ['Tab']
    },
    {
      command: 'Insert a newline and auto-indent the new line',
      binding: ['⤶ Enter']
    },
    {
      command: 'Toggle the overwrite flag',
      binding: ['Insert']
    },
    {
      command: 'We are still working on implementing some new  useful shortcuts...',
      binding: []
    }
  ]

  ngOnInit(): void {
  }

}
