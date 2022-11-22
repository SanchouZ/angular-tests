import { EventEmitter } from '@angular/core';
import { CPClickEvent, CPPathProperties } from '../../models/editor.model';

export abstract class CPSVGObject {
  public clickCalback: (event: CPClickEvent, data: CPPathProperties) => void;

  constructor(
    public geometry: number[][] | number[][][],
    public properties: CPPathProperties
  ) {
    this.clickCalback = properties.clickCalback;
  }
}
