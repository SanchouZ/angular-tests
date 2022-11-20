import { NO_ERRORS_SCHEMA, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CanvasPainterComponent } from './canvas-painter.component';
import { CPMarker } from './directives/marker.directive';
import { CPSVGPath } from './directives/svg-path.directive';

@NgModule({
  declarations: [CanvasPainterComponent, CPMarker, CPSVGPath],
  imports: [CommonModule],
  exports: [CanvasPainterComponent, CPMarker, CPSVGPath],
  schemas: [NO_ERRORS_SCHEMA],
})
export class CanvasPainterModule {}
