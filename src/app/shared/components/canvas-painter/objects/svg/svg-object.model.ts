import { CPPathProperties } from '../../models/editor.model';
import { CPObject } from '../object.model';

export abstract class CPSVGObject extends CPObject {
  constructor(
    public geometry: number[][] | number[][][],
    properties: CPPathProperties
  ) {
    super(properties);
  }
}
