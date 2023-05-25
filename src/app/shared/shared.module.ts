import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { ConnectionSnackbarComponent } from './components/connection-snackbar/connection-snackbar.component';
import { EmptyComponent } from './components/empty/empty.component';
import { TerminalModule } from './components/terminal/terminal.module';
import { ParticlesBackgroundModule } from './modules/particles-background/particles-background.module';

@NgModule({
  declarations: [
    ConnectionSnackbarComponent,
    EmptyComponent,
  ],
  imports: [
    CommonModule,
    TerminalModule,
    ParticlesBackgroundModule,
    MatIconModule,
    MatButtonModule,
  ],
  providers: [],
  entryComponents: [],
  exports: [
    TerminalModule,
    ParticlesBackgroundModule,
    EmptyComponent,
  ],
})
export class SharedModule {}
