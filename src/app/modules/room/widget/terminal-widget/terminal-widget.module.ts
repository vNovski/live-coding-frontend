import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TerminalWidgetComponent } from './terminal-widget.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from 'src/app/material.module';
import { SharedModule } from 'src/app/shared/shared.module';
import { HeaderComponent } from './components/header/header.component';
import { MouseIndicatorsDirective } from './directives/mouse-indicators.directive';
import { ShortcutsDialogComponent } from './components/shortcuts-dialog/shortcuts-dialog.component';
import { OnlineIndicatorComponent } from './components/online-indicator/online-indicator.component';
import { TestComponent } from './components/test/test.component';
import { AboutUsDialogComponent } from './components/about-us-dialog/about-us-dialog.component';

@NgModule({
  declarations: [
    TerminalWidgetComponent,
    HeaderComponent,
    MouseIndicatorsDirective,
    ShortcutsDialogComponent,
    OnlineIndicatorComponent,
    TestComponent,
    AboutUsDialogComponent,
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MaterialModule,
    SharedModule
  ],
  exports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    TerminalWidgetComponent
  ],
  providers: [MouseIndicatorsDirective],
})
export class TerminalWidgetModule { }
