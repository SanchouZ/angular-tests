import {
  Attribute,
  Directive,
  EventEmitter,
  Input,
  OnInit,
  Output,
} from '@angular/core';

import { CPClickEvent, CPPathOptions } from '../models/editor.model';
import { CanvasPainterUtilsService } from '../services/canvas-painter-utils.service';

@Directive({
  selector: 'cp-svg-path',
})
export class CPSVGPath {
  @Input() geometry: number[][] | number[][][];
  @Input() options: CPPathOptions;

  public hover = false;

  @Output() pathClick = new EventEmitter<CPClickEvent>();
  constructor(
    @Attribute('class') public hostClass: string,
    private utils: CanvasPainterUtilsService
  ) {}
}
