import { Component, EventEmitter, OnInit, Output } from '@angular/core';

@Component({
  selector: 'app-terminal-widget-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {
  @Output() execute = new EventEmitter<void>();
  @Output() watch = new EventEmitter<boolean>();
  @Output() toggleFullScreen = new EventEmitter<boolean>();

  constructor() { }

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

}
