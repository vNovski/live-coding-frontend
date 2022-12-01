import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CodemirrorModule } from '@ctrl/ngx-codemirror';
import { MaterialModule } from 'src/app/material.module';
import { TerminalComponent } from './terminal.component';



@NgModule({
  declarations: [
    TerminalComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    CodemirrorModule,
    MaterialModule,
  ],
  providers: [],
  exports: [TerminalComponent]
})
export class TerminalModule { }
