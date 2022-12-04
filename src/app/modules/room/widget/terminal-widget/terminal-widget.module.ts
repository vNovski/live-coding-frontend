import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TerminalWidgetComponent } from './terminal-widget.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CodemirrorModule } from '@ctrl/ngx-codemirror';
import { MaterialModule } from 'src/app/material.module';
import { SharedModule } from 'src/app/shared/shared.module';
import { HeaderComponent } from './components/header/header.component';
import { MouseIndicatorsDirective } from './directives/mouse-indicators.directive';

@NgModule({
  declarations: [
    TerminalWidgetComponent,
    HeaderComponent,
    MouseIndicatorsDirective
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    CodemirrorModule,
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
