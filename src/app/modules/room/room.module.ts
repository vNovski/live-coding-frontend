import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { MaterialModule } from 'src/app/material.module';
import { SharedModule } from 'src/app/shared/shared.module';
import { RoomRoutingModule } from './room-routing.module';
import { RoomComponent } from './room.component';
import { TerminalWidgetModule } from './widget/terminal-widget/terminal-widget.module';



@NgModule({
  declarations: [
    RoomComponent,
  ],
  imports: [
    CommonModule,
    TerminalWidgetModule,
    RoomRoutingModule,
    MaterialModule,
    SharedModule
  ],

})
export class RoomModule { }
