import { EventEmitter } from '@angular/core';
import { CPClickEvent, CPPathProperties } from '../../models/editor.model';

export abstract class CPSVGObject {
  public clickCallback: (event: CPClickEvent, data: any) => void;

  constructor(
    public geometry: number[][] | number[][][],
    public properties: CPPathProperties
  ) {
    this.clickCallback = properties.clickCallback;
  }
}
