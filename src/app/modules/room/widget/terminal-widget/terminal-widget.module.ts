import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TerminalWidgetComponent } from './terminal-widget.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CodemirrorModule } from '@ctrl/ngx-codemirror';
import { MaterialModule } from 'src/app/material.module';
import { SharedModule } from 'src/app/shared/shared.module';

@NgModule({
  declarations: [
    TerminalWidgetComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    CodemirrorModule,
    MaterialModule,
    SharedModule
  ],
  providers: [],
  exports: [TerminalWidgetComponent]
})
export class TerminalWidgetModule { }
