import { Component, EventEmitter, OnInit, Output } from '@angular/core';

@Component({
  selector: 'app-terminal-widget-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {
  @Output() execute = new EventEmitter<void>();
  @Output() toggleFullScreen = new EventEmitter<boolean>();

  constructor() { }

  fullscreenStatus = false;

  ngOnInit(): void {
  }


  onToggleFullScreen(): void {
    this.fullscreenStatus = !this.fullscreenStatus;
    this.toggleFullScreen.emit(this.fullscreenStatus);
  }

  onExecute(): void {
    this.execute.emit();
  }

}
