import { Injectable } from '@angular/core';
import { SocketService } from 'src/app/core/services/socket/socket.service';
import { TerminalLog } from 'src/app/shared/components/terminal/interfaces/terminal-log.interface';
import { TermianlEvents } from '../../enums/terminal-events.enum';

@Injectable()
export class TerminalWidgetService {

  public otherCursorChange$ = this.socketService.on(TermianlEvents.cursorChange);
  public otherSelectionChange$ = this.socketService.on(TermianlEvents.selectionChange);
  public executionLog$ = this.socketService.on(TermianlEvents.executionLog);
  public otherChanged$ = this.socketService.on(TermianlEvents.change);
  public otherMouseMove$  = this.socketService.on(TermianlEvents.mouseMove);

  constructor(private readonly socketService: SocketService) { }

  shareExecutionLog(roomId: string, log: TerminalLog): void {
    this.socketService.emit(TermianlEvents.executionLog, { roomId, data: log })
  }
}
