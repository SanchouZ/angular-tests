import { CPLineOptions, Point } from '../models/editor.model';
import { CPObject } from './object.model';

export class CPLine extends CPObject {
  constructor(
    ctx: CanvasRenderingContext2D,
    private points: [Point, Point],
    public options?: CPLineOptions
  ) {
    super(ctx);
  }

  draw(): void {
    this.ctx.save();

    const path = new Path2D();
    this.points.forEach(({ x, y }, i, points) => {
      if (i === 0) {
        path.moveTo(x, y);
      } else if (i === points.length - 1 && this.options?.closed) {
        path.closePath();
      } else {
        path.lineTo(x, y);
      }
    });

    let lineWidth = (this.options?.lineWidth ?? 4) * devicePixelRatio;
    if (this.options?.maintainRelativeWidth) {
      const { a } = this.ctx.getTransform().inverse();
      lineWidth *= a;
    }

    this.ctx.lineWidth = lineWidth;
    this.ctx.strokeStyle = this.options?.strokeColor ?? 'blue';
    this.ctx.stroke(path);

    this.ctx.restore();
  }
}
