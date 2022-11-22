import { Point } from '../../models/editor.model';
import { CPCanvasObject } from './object.model';

export class Path extends CPCanvasObject {
  constructor(ctx: CanvasRenderingContext2D) {
    super(ctx);
  }

  draw(): void {}

  checkPointOn(point: Point): boolean {
    return false;
  }
}
