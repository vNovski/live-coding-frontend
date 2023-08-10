import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatLegacyButtonModule as MatButtonModule } from '@angular/material/legacy-button';
import { MatIconModule } from '@angular/material/icon';
import { ConnectionSnackbarComponent } from './components/connection-snackbar/connection-snackbar.component';
import { EmptyComponent } from './components/empty/empty.component';
import { ParticlesBackgroundModule } from './modules/particles-background/particles-background.module';
import { TerminalModule } from './modules/terminal/terminal.module';

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
    exports: [
        TerminalModule,
        ParticlesBackgroundModule,
        EmptyComponent,
    ]
})
export class SharedModule {}
