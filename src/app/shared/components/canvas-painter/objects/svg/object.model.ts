import { EventEmitter } from '@angular/core';
import { CPClickEvent, CPPathOptions } from '../../models/editor.model';

export abstract class CPSVGObject<T = CPPathOptions> {
  public geometry: number[][] | number[][][];
  public options: CPPathOptions;

  public pathClick: (event: CPClickEvent, data: T) => void;

  constructor() {}
}
