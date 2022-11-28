import { CommonModule } from '@angular/common';
import { NgModule, NO_ERRORS_SCHEMA } from '@angular/core';

import { CanvasPainterComponent } from './canvas-painter.component';
import { CPMarkerDirective } from './directives/marker.directive';
import { CPPathDirective } from './directives/path.directive';
import { CanvasPainterUtilsService } from './services/canvas-painter-utils.service';
import { CanvasPainterObjectsService } from './services/objects.service';

@NgModule({
  declarations: [CanvasPainterComponent, CPMarkerDirective, CPPathDirective],
  imports: [CommonModule],
  exports: [CanvasPainterComponent, CPMarkerDirective, CPPathDirective],
  providers: [CanvasPainterUtilsService, CanvasPainterObjectsService],
  schemas: [NO_ERRORS_SCHEMA],
})
export class CanvasPainterModule {}
