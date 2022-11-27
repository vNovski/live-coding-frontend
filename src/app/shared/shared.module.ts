import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TerminalModule } from './components/terminal/terminal.module';

@NgModule({
  declarations: [
  ],
  imports: [
    CommonModule,
    TerminalModule
  ],
  providers: [],
  exports: [TerminalModule]
})
export class SharedModule { }
