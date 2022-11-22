import { Point } from '../../models/editor.model';
import { CPCanvasObject } from './object.model';

export class Control extends CPCanvasObject implements Point {
  public x: number;
  public y: number;

  constructor(ctx: CanvasRenderingContext2D, x: number, y: number) {
    super(ctx);
    this.x = x;
    this.y = y;
  }

  draw(): void {}

  public checkPointOn(point: Point): boolean {
    return false;
  }
}
