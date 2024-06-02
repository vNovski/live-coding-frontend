import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AdminPanelRoutingModule } from './admin-panel-routing.module';
import { MaterialModule } from 'src/app/material.module';
import { AdminPanelComponent } from './admin-panel.component';
import { FormsModule } from '@angular/forms';
import { FilterPipe } from 'src/app/shared/pipes/filter.pipe';
import { SharedModule } from 'src/app/shared/shared.module';
import { HttpClientModule } from '@angular/common/http';



@NgModule({
  declarations: [
    AdminPanelComponent,
  ],
  imports: [
    CommonModule,
    FormsModule,
    AdminPanelRoutingModule,
    MaterialModule,
    SharedModule,
    HttpClientModule
  ],
})
export class AdminPanelModule { }
