import { CPPathOptions, Point } from '../../models/editor.model';
import { CPCanvasObject } from './object.model';

export class CPLine extends CPCanvasObject {
  constructor(
    ctx: CanvasRenderingContext2D,
    private points: [Point, Point],
    public options?: CPPathOptions
  ) {
    super(ctx);
    this.path = new Path2D();
  }

  draw(): void {
    this.ctx.save();

    this.path = new Path2D();
    this.ctx.beginPath();

    this.points.forEach(({ x, y }, i, points) => {
      if (i === 0) {
        this.path.moveTo(x, y);
      } else {
        this.path.lineTo(x, y);
      }
    });

    if (this.options?.closed) {
      this.path.closePath();
    }
    let lineWidth = (this.options?.strokeWidth ?? 4) * devicePixelRatio;
    if (this.options?.maintainRelativeWidth) {
      const { a } = this.ctx.getTransform().inverse();
      lineWidth *= a;
    }

    this.ctx.lineWidth = lineWidth;
    this.ctx.strokeStyle = this.isPointInStroke
      ? 'red'
      : this.options?.strokeColor ?? 'blue';

    this.ctx.fill(this.path);
    this.ctx.stroke(this.path);
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
    // console.log('check: ', this.isPointInPath, this.isPointInStroke);
    return this.isPointInPath || this.isPointInStroke;
  }
}
