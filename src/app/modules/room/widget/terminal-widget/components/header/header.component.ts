import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import {MatDialog, MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import { ShortcutsDialogComponent } from '../shortcuts-dialog/shortcuts-dialog.component';

@Component({
  selector: 'app-terminal-widget-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {
  @Output() execute = new EventEmitter<void>();
  @Output() watch = new EventEmitter<boolean>();
  @Output() toggleFullScreen = new EventEmitter<boolean>();

  constructor(private readonly dialog: MatDialog) { }

  fullscreenStatus = false;
  watchStatus = false;

  ngOnInit(): void {
  }


  onToggleFullScreen(): void {
    this.fullscreenStatus = !this.fullscreenStatus;
    this.toggleFullScreen.emit(this.fullscreenStatus);
  }

  onExecute(): void {
    this.execute.emit();
  }

  onWatch(event: MouseEvent): void {
    event.stopPropagation();
    this.watchStatus = !this.watchStatus;
    this.watch.emit(this.watchStatus);

  }

  openShortcutsDialog(): void {
    const dialogRef = this.dialog.open(ShortcutsDialogComponent, {
      maxWidth: '100vw',
      maxHeight: '100vh',
      panelClass: 'shortcuts-dialog'
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log('The dialog was closed');
    });
  }

}
