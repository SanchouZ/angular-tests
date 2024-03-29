import {
  Attribute,
  Directive,
  EventEmitter,
  Input,
  OnInit,
  Output,
} from '@angular/core';

import {
  CPClickEvent,
  CPObjectProperties,
  Point,
} from '../models/editor.model';
import { CanvasPainterUtilsService } from '../services/canvas-painter-utils.service';

@Directive({
  selector: 'cp-image',
})
export class CPImageDirective<D = any> {
  @Input() url: string;
  @Input() centerPoint: [number, number] = [0, 0];
  @Input() properties: CPObjectProperties;
  @Input() width: number;
  @Input() height: number;

  public clickCallback: (event: CPClickEvent, data: D) => void;

  @Output() imageClick = new EventEmitter<CPClickEvent>();
  constructor(
    @Attribute('class') public hostClass: string,
    private utils: CanvasPainterUtilsService
  ) {}
}
