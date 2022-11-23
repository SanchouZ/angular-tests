import { CPPathProperties, Point } from '../../models/editor.model';
import { CPCanvasObject } from './object.model';

export class CPImage extends CPCanvasObject {
  constructor(
    ctx: CanvasRenderingContext2D,
    private image: HTMLImageElement,
    private insertPoint: Point,
    properties?: CPPathProperties,
    private width?: number,
    private height?: number,
    private angle?: number,
    id?: number
  ) {
    super(ctx, properties, id);
    this.clickCallback = properties?.clickCallback;
  }

  draw(): void {
    this.ctx.save();
    this.ctx.translate(this.insertPoint.x, this.insertPoint.y);
    this.ctx.rotate(((this.angle ?? 0) * Math.PI) / 180);
    this.ctx.drawImage(
      this.image,
      0,
      0,
      this.width ?? this.image.width,
      this.height ?? this.image.height
    );
    this.ctx.translate(-this.insertPoint.x, -this.insertPoint.y);
    this.ctx.restore();
  }

  public checkPointOn(point: Point): boolean {
    // this.isPointInPath = this.ctx.isPointInPath(this.path, point.x, point.y);
    // this.isPointInStroke = this.ctx.isPointInStroke(
    //   this.path,
    //   point.x,
    //   point.y
    // );
    // return this.isPointInPath || this.isPointInStroke;
    return false;
  }
}
