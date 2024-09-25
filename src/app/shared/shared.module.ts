import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { ConnectionSnackbarComponent } from './components/connection-snackbar/connection-snackbar.component';
import { EmptyComponent } from './components/empty/empty.component';
import { ParticlesBackgroundModule } from './modules/particles-background/particles-background.module';
import { TerminalModule } from './modules/terminal/terminal.module';
import { FilterPipe } from './pipes/filter.pipe';

@NgModule({
    declarations: [
        ConnectionSnackbarComponent,
        EmptyComponent,
        FilterPipe,
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
        FilterPipe,
    ]
})
export class SharedModule {}
