import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ParticlesBackgroundComponent } from './particles-background.component';



@NgModule({
  declarations: [ParticlesBackgroundComponent],
  imports: [
    CommonModule
  ], 
  exports: [ParticlesBackgroundComponent]
})
export class ParticlesBackgroundModule { }
