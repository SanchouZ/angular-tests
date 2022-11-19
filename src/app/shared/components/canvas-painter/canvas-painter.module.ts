import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CanvasPainterComponent } from './canvas-painter.component';
import { CPMarker } from './directives/marker.directive';

@NgModule({
  declarations: [CanvasPainterComponent, CPMarker],
  imports: [CommonModule],
  exports: [CanvasPainterComponent, CPMarker],
})
export class CanvasPainterModule {}
