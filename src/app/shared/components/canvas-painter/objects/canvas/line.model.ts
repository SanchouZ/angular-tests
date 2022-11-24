import { CPPathProperties, Point } from '../../models/editor.model';
import { CPCanvasObject } from './object.model';

export class CPLine extends CPCanvasObject {
  public path: Path2D;

  constructor(
    ctx: CanvasRenderingContext2D,
    private points: Point[] | Point[][],
    properties: CPPathProperties,
    id?: number
  ) {
    super(ctx, properties);
    this.calcBound(this.points.flat());
  }

  draw(): void {
    this.path = new Path2D();
    this.ctx.beginPath();

    this.points.forEach((point, i) => {
      if (Array.isArray(point)) {
        point.forEach((point) => {
          if (i === 0) {
            this.path.moveTo(point.x, point.y);
          } else {
            this.path.lineTo(point.x, point.y);
          }
        });
      } else {
        if (i === 0) {
          this.path.moveTo(point.x, point.y);
        } else {
          this.path.lineTo(point.x, point.y);
        }
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

    this.ctx.lineCap = this.properties?.strokeLineCap ?? 'butt';
    this.ctx.lineJoin = this.properties?.strokeLinejoin ?? 'miter';

    this.ctx.strokeStyle =
      this.isPointInStroke || this.isPointInPath
        ? this.properties?.hoverStrokeColor ?? '#558ed5'
        : this.properties?.strokeColor ?? '#2b405f';

    this.ctx.fill(this.path);
    this.ctx.stroke(this.path);
  }

  public rotate(angle: number): void {
    this._rotationAngle = angle;
  }

  public scale(scaleX: number, scaleY: number): void {
    this._scaleX = scaleX;
    this._scaleY = scaleY;
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
