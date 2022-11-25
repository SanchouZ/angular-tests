import { CPPathProperties, Point } from '../../models/editor.model';
import { CPObject } from '../object.model';

export abstract class CPCanvasObject extends CPObject {
  constructor(
    public ctx: CanvasRenderingContext2D,
    properties: CPPathProperties
  ) {
    super(properties);
  }

  abstract draw(): void;

  abstract checkPointOn(point: Point): boolean;

  protected showBBox(): void {
    if (this._bound) {
      this.ctx.rect(
        this._bound.topLeft.x,
        this._bound.topLeft.y,
        this._bound.width,
        this._bound.height
      );
      const { a } = this.ctx.getTransform().inverse();
      this.ctx.lineWidth = 1 * a * devicePixelRatio;
      this.ctx.strokeStyle = 'black';
      this.ctx.stroke();
    }
  }
}
