import {
  CPPathProperties,
  Point,
} from '../../models/editor.model';
import { CPObject } from '../object.model';

export abstract class CPCanvasObject extends CPObject {
  constructor(
    public ctx: CanvasRenderingContext2D,
    properties: CPPathProperties,
  ) {
    super(properties);
  }

  abstract draw(): void;

  abstract checkPointOn(point: Point): boolean;
}
