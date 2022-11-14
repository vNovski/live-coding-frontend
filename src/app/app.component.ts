import { Component } from '@angular/core';
import { Position } from 'codemirror';
import { Socket } from 'ngx-socket-io';
import { ConnectionsService } from './core/services/connections/connections.service';
import { CommunicationEventTypes, SocketService } from './core/services/socket/socket.service';
import { UserService } from './core/services/user/user.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'live-cooding';
  code = '';
  otherMouses: any = [];
  otherCursors: any = [];
  otherSelections: any = [];
  communicationEventTypes = CommunicationEventTypes;

  constructor(
    public readonly connectionService: ConnectionsService,
    public socketService: SocketService,
    private readonly userService: UserService
  ) {
    this.connectionService.connections$.subscribe(connections => {
      this.otherMouses = connections.map((id) => ({ x: null, y: null, color: null, userId: id }));
    });
    this.socketService.on(CommunicationEventTypes.terminalChange).subscribe(code => this.code = code);
    this.socketService.on(CommunicationEventTypes.terminalMouseMove).subscribe((receivedMouse) => {
      this.otherMouses = this.otherMouses.map((mouse: any) => mouse.userId === receivedMouse.userId ? receivedMouse : mouse);
    });

    this.socketService.on(CommunicationEventTypes.terminalSelectionChange).subscribe((receivedSelection: any) => {
      if (!this.otherSelections.length) {
        this.otherSelections = [receivedSelection];
      }

      this.otherSelections = this.otherSelections.reduce((selections: any, selection: any) => {
        return [...selections, selection.userId === receivedSelection.userId ? receivedSelection : selection];
      }, [] as any[])
    });

    this.socketService.on(CommunicationEventTypes.terminalCursorChange).subscribe((receivedCursor: any) => {
      if (!this.otherCursors.length) {
        this.otherCursors = [receivedCursor];
      }

      this.otherCursors = this.otherCursors.reduce((cursors: any, cursor: any) => {
        return [...cursors, cursor.userId === receivedCursor.userId ? receivedCursor : cursor];
      }, [] as any[])
    });
  }

  terminalChanged(code: string): void {
    this.socketService.emit(CommunicationEventTypes.terminalChange, code);
  }

  mouseMove(position: { x: number | null, y: number | null }): void {
    this.socketService.emit(CommunicationEventTypes.terminalMouseMove, { color: this.userService.color, ...position });
  }

  cursorChange(position: any): void {
    this.socketService.emit(CommunicationEventTypes.terminalCursorChange, { color: this.userService.color, ...position });
  }

  selectionChange(position: any): void {
    this.socketService.emit(CommunicationEventTypes.terminalSelectionChange, { color: this.userService.color, ...position });
  }
}
