import { CPPathProperties, Point } from '../../models/editor.model';
import { CPCanvasObject } from './object.model';

export class CPLine extends CPCanvasObject {
  constructor(
    ctx: CanvasRenderingContext2D,
    private points: [Point, Point],
    public properties?: CPPathProperties
  ) {
    super(ctx);
    this.path = new Path2D();
  }

  draw(): void {
    this.path = new Path2D();
    this.ctx.beginPath();

    this.points.forEach(({ x, y }, i, points) => {
      if (i === 0) {
        this.path.moveTo(x, y);
      } else {
        this.path.lineTo(x, y);
      }
    });

    if (this.properties?.closed) {
      this.path.closePath();
    }
    let lineWidth =
      (this.isPointInStroke || this.isPointInPath
        ? this.properties?.hoverStrokeWidth ?? this.properties?.strokeWidth ?? 4
        : this.properties?.strokeWidth ?? 4) * devicePixelRatio;
    if (this.properties?.maintainRelativeWidth) {
      const { a } = this.ctx.getTransform().inverse();
      lineWidth *= a;
    }

    this.ctx.lineWidth = lineWidth;
    this.ctx.strokeStyle =
      this.isPointInStroke || this.isPointInPath
        ? this.properties?.hoverStrokeColor ??
          this.properties?.strokeColor ??
          'blue'
        : this.properties?.strokeColor ?? 'blue';

    this.ctx.fill(this.path);
    this.ctx.stroke(this.path);
  }

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
