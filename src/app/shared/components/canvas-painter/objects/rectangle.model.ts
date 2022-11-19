import { Point } from '../models/editor.model';
import { CPObject } from './object.model';

export class Rectangle extends CPObject {
  private _cornerRadius: number;
  private _points: Point[];

  constructor(
    ctx: CanvasRenderingContext2D,
    private x: number,
    private y: number,
    private widht: number,
    private height: number,
    cornerRadius: number = 0
  ) {
    super(ctx);
    this._cornerRadius = cornerRadius;
    this._points.push(
      { x, y },
      { x: x + widht, y },
      { x: x + widht, y: y + height },
      { x, y: y + height }
    );
  }

  draw(): void {
    this.ctx.save();
    this._points.forEach((point, i) => {
      if (i === 0) {
        this.ctx.moveTo(point.x + this._cornerRadius, point.y);
      }

      //   ctx.lineTo(point.x - this._cornerRadius);
    });
  }
}
