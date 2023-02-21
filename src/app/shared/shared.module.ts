import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TerminalModule } from './components/terminal/terminal.module';
import { ConnectionSnackbarComponent } from './components/connection-snackbar/connection-snackbar.component';
import { ParticlesBackgroundModule } from './modules/particles-background/particles-background.module';
import { TooltipComponent, TooltipContainerDirective } from './components/tooltip/tooltip.component';
import { TooltipDirective } from './components/tooltip/directives/tooltip.directive';
import { EmptyComponent } from './components/empty/empty.component';
import { MatIconModule } from '@angular/material/icon';

@NgModule({
  declarations: [
    TooltipContainerDirective,
    ConnectionSnackbarComponent,
    TooltipDirective,
    TooltipComponent,
    EmptyComponent,
  ],
  imports: [CommonModule, TerminalModule, ParticlesBackgroundModule, MatIconModule],
  providers: [],
  entryComponents: [TooltipComponent],
  exports: [TerminalModule, ParticlesBackgroundModule, TooltipDirective, TooltipContainerDirective, EmptyComponent],
})
export class SharedModule {}
