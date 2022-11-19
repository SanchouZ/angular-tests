import { Point } from '../models/editor.model';
import { CPObject } from './object.model';

export class Control extends CPObject implements Point {
  public x: number;
  public y: number;

  constructor(ctx: CanvasRenderingContext2D, x: number, y: number) {
    super(ctx);
    this.x = x;
    this.y = y;
  }

  draw(): void {}
}
