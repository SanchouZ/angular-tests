import { CommonModule } from '@angular/common';
import { NgModule,NO_ERRORS_SCHEMA } from '@angular/core';

import { CanvasPainterComponent } from './canvas-painter.component';
import { CPMarker } from './directives/marker.directive';
import { CPSVGPath } from './directives/svg-path.directive';
import { CanvasPainterUtilsService } from './services/canvas-painter-utils.service';
import { CanvasPainterObjectsService } from './services/objects.service';

@NgModule({
  declarations: [CanvasPainterComponent, CPMarker, CPSVGPath],
  imports: [CommonModule],
  exports: [CanvasPainterComponent, CPMarker, CPSVGPath],
  providers: [CanvasPainterUtilsService, CanvasPainterObjectsService],
  schemas: [NO_ERRORS_SCHEMA],
})
export class CanvasPainterModule {}
