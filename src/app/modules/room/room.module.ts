import { CommonModule } from '@angular/common';
import { inject, NgModule } from '@angular/core';
import { filter } from 'rxjs';
import { LocalStorageService } from 'src/app/core/services/localStorage/local-storage.service';
import { SocketService } from 'src/app/core/services/socket/socket.service';
import { UserService } from 'src/app/core/services/user/user.service';

import { MaterialModule } from 'src/app/material.module';
import { SharedModule } from 'src/app/shared/shared.module';
import { RoomRoutingModule } from './room-routing.module';
import { RoomComponent } from './room.component';
import { TerminalWidgetModule } from './widget/terminal-widget/terminal-widget.module';
import { ContactSupportDialogComponent } from './components/contact-support-dialog/contact-support-dialog.component';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';

@NgModule({
  declarations: [
    RoomComponent,
    ContactSupportDialogComponent,
  ],
  imports: [
    CommonModule,
    TerminalWidgetModule,
    RoomRoutingModule,
    MaterialModule,
    MatFormFieldModule,
    MatInputModule,
    SharedModule,
    MatSelectModule
  ]
})
export class RoomModule { }
