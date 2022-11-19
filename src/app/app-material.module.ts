import { NgModule } from '@angular/core';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatSliderModule } from '@angular/material/slider';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';

@NgModule({
  exports: [MatButtonToggleModule, MatSliderModule, MatSlideToggleModule],
})
export class AppMaterialModule {}
