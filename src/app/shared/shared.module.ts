import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TerminalModule } from './components/terminal/terminal.module';
import { ConnectionSnackbarComponent } from './components/connection-snackbar/connection-snackbar.component';
import { ParticlesBackgroundModule } from './modules/particles-background/particles-background.module';

@NgModule({
  declarations: [ConnectionSnackbarComponent],
  imports: [CommonModule, TerminalModule, ParticlesBackgroundModule],
  providers: [],
  exports: [TerminalModule, ParticlesBackgroundModule],
})
export class SharedModule {}
