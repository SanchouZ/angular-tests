import {
  Attribute,
  Directive,
  EventEmitter,
  Input,
  OnInit,
  Output,
} from '@angular/core';

import { CPClickEvent, CPObjectProperties } from '../models/editor.model';
import { CanvasPainterUtilsService } from '../services/canvas-painter-utils.service';

@Directive({
  selector: 'cp-path',
})
export class CPPathDirective<D = any> {
  @Input() target: 'svg' | 'canvas' = 'svg';

  @Input() geometry: (number[] | number[][])[];
  @Input() properties: CPObjectProperties;

  public hover = false;
  public clickCallback: (event: CPClickEvent, data: D) => void;

  @Output() pathClick = new EventEmitter<CPClickEvent>();
  constructor(
    @Attribute('class') public hostClass: string,
    private utils: CanvasPainterUtilsService
  ) {}
}
