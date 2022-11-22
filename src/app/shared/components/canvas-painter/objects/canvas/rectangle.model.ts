import { Point } from '../../models/editor.model';
import { CPCanvasObject } from './object.model';

export class Rectangle extends CPCanvasObject {
  private _cornerRadius: number;
  private _points: Point[] = [];

  constructor(
    ctx: CanvasRenderingContext2D,
    private x: number,
    private y: number,
    private width: number,
    private height: number,
    cornerRadius: number = 0
  ) {
    super(ctx);
    this._cornerRadius = cornerRadius;
    this._points.push(
      { x, y },
      { x: x + width, y },
      { x: x + width, y: y + height },
      { x, y: y + height }
    );
  }

  draw(): void {
    this.ctx.save();
    console.log('draw rect');
    this.path = new Path2D();

    this.path.rect(this.x, this.y, this.width, this.height);

    this.ctx.fillStyle = this.isPointInPath ? 'red' : 'green';
    this.ctx.stroke(this.path);
    this.ctx.fill(this.path);

    this.ctx.restore();
  }
  // TODO: Not working as expected, it has to be done with math
  public checkPointOn(point: Point): boolean {
    this.isPointInPath = this.ctx.isPointInPath(this.path, point.x, point.y);
    this.isPointInStroke = this.ctx.isPointInStroke(
      this.path,
      point.x,
      point.y
    );

    return this.isPointInPath || this.isPointInStroke;
  }
}
