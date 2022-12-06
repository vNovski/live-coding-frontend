import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TerminalModule } from './components/terminal/terminal.module';
import { ConnectionSnackbarComponent } from './components/connection-snackbar/connection-snackbar.component';

@NgModule({
  declarations: [
  
    ConnectionSnackbarComponent
  ],
  imports: [
    CommonModule,
    TerminalModule
  ],
  providers: [],
  exports: [TerminalModule]
})
export class SharedModule { }
