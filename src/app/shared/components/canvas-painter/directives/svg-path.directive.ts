import {
  Directive,
  Input,
  Output,
  EventEmitter,
  OnInit,
  Attribute,
} from '@angular/core';
import { CPSVGPathOptions } from '../models/editor.model';

@Directive({
  selector: 'cp-svg-path',
})
export class CPSVGPath {
  @Input() geometry: number[][] | number[][][];
  @Input() options: CPSVGPathOptions;

  @Output() pathClick = new EventEmitter();
  constructor(@Attribute('class') public hostClass: string) {}
}
