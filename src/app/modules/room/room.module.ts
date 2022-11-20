import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { MaterialModule } from 'src/app/material.module';
import { SharedModule } from 'src/app/shared/shared.module';
import { RoomRoutingModule } from './room-routing.module';
import { RoomComponent } from './room.component';
import { TerminalWidgetComponent } from './widget/terminal-widget/terminal-widget.component';



@NgModule({
  declarations: [
    RoomComponent,
    TerminalWidgetComponent
  ],
  imports: [
    CommonModule,
    RoomRoutingModule,
    MaterialModule,
    SharedModule
  ],

})
export class RoomModule { }
