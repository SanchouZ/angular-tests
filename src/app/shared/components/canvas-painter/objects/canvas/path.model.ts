import { EDITOR_COLORS, EDITOR_DIMS } from '../../config/editor.config';
import { CPObjectProperties, Point } from '../../models/editor.model';
import { CPCanvasObject } from './object.model';

export class CPCanvasPath extends CPCanvasObject {
  public path: Path2D;

  constructor(
    ctx: CanvasRenderingContext2D,
    private points: (Point | Point[])[],
    properties: CPObjectProperties
  ) {
    super(ctx, properties);
    this.calcBound(this.points.flat());
  }

  draw(): void {
    this.path = new Path2D();
    this.ctx.beginPath();

    this.points.forEach((point, i) => {
      if (Array.isArray(point)) {
        point.forEach((point, i) => {
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
        ? this.properties?.hoverStrokeWidth ??
          this.properties?.strokeWidth ??
          EDITOR_DIMS.strokeWidth
        : this.properties?.strokeWidth ?? EDITOR_DIMS.strokeWidth) *
      devicePixelRatio;

    if (this.properties?.maintainRelativeWidth) {
      const { a } = this.ctx.getTransform().inverse();
      lineWidth *= a;
    }

    this.ctx.globalAlpha = this.opacity ?? 1;

    this.ctx.lineWidth = lineWidth;

    this.ctx.lineCap = this.properties?.strokeLineCap ?? 'butt';
    this.ctx.lineJoin = this.properties?.strokeLinejoin ?? 'miter';

    this.ctx.strokeStyle =
      this.isPointInStroke || this.isPointInPath
        ? this.properties?.hoverStrokeColor ??
          this.properties?.strokeColor ??
          EDITOR_COLORS.strokeHover
        : this.properties?.strokeColor ?? EDITOR_COLORS.stroke;

    this.ctx.fillStyle =
      this.isPointInStroke || this.isPointInPath
        ? this.properties?.hoverFill ??
          this.properties?.fill ??
          EDITOR_COLORS.fillHover
        : this.properties?.fill ?? EDITOR_COLORS.fill;

    this.ctx.fill(this.path);
    this.ctx.stroke(this.path);

    this.ctx.globalAlpha = 1;
    this.calcBound(this.points.flat());
  }

  public rotate(angle: number): void {
    this._rotationAngle = angle;
  }

  public scale(scaleX: number, scaleY: number): void {
    this._scaleX = scaleX;
    this._scaleY = scaleY;
  }

  public checkPointOn(point: Point): boolean {
    this.isPointInPath = this.ctx?.isPointInPath(this.path, point.x, point.y);
    this.isPointInStroke = this.ctx?.isPointInStroke(
      this.path,
      point.x,
      point.y
    );
    return this.isPointInPath || this.isPointInStroke;
  }
}
