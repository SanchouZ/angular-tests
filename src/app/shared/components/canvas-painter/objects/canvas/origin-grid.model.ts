import { CPBound, Point } from '../../models/editor.model';
import { CPCanvasObject } from './object.model';

export class OriginGrid extends CPCanvasObject {
  private frame: CPBound;

  constructor(ctx: CanvasRenderingContext2D, frame: CPBound) {
    super(ctx);
    this.frame = frame;
  }

  draw(): void {
    const scale = this.ctx.getTransform().inverse().a;
    console.log(scale);

    // X
    this.ctx.save();

    this.ctx.beginPath();
    this.ctx.lineWidth = 2 * scale * devicePixelRatio;

    this.ctx.moveTo(this.frame.topLeft.x, 0);
    this.ctx.lineTo(this.frame.bottomRight.x, 0);
    this.ctx.strokeStyle = '#d60100';
    this.ctx.stroke();

    this.ctx.save();
    this.ctx.restore();
    // Y
    this.ctx.beginPath();
    this.ctx.moveTo(0, this.frame.topLeft.y);
    this.ctx.lineTo(0, this.frame.bottomRight.y);
    this.ctx.strokeStyle = '#46b145';
    this.ctx.stroke();

    this.ctx.restore();
  }

  public checkPointOn(point: Point): boolean {
    return false;
  }
}
