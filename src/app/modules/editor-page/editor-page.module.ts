import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { EditorPageRoutingModule } from './editor-page-routing.module';
import { EditorPageComponent } from './editor-page.component';
import { TerminalModule } from '../terminal/terminal.module';
import { MaterialModule } from 'src/app/material.module';


@NgModule({
  declarations: [
    EditorPageComponent
  ],
  imports: [
    CommonModule,
    EditorPageRoutingModule,
    TerminalModule,
    MaterialModule
  ]
})
export class EditorPageModule { }
