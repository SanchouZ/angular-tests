import { CPPathProperties } from '../../models/editor.model';
import { CPSVGObject } from './object.model';

export class CPPath extends CPSVGObject {
  constructor(
    geometry: number[][] | number[][][],
    properties: CPPathProperties
  ) {
    super(geometry, properties);
  }
}
