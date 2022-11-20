import { NgModule } from '@angular/core';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatSliderModule } from '@angular/material/slider';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@NgModule({
  exports: [
    MatButtonToggleModule,
    MatSliderModule,
    MatSlideToggleModule,
    MatProgressSpinnerModule,
  ],
})
export class AppMaterialModule {}
