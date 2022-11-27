import { EDITOR_COLORS, EDITOR_DIMS } from '../../config/editor.config';
import { CPObjectProperties, Point } from '../../models/editor.model';
import { CPObject } from '../object.model';

export abstract class CPCanvasObject extends CPObject {
  constructor(
    public ctx: CanvasRenderingContext2D,
    properties: CPObjectProperties
  ) {
    super(properties);
  }

  abstract draw(): void;

  protected showBBox(): void {
    if (this._bound) {
      this.ctx.rect(
        this._bound.topLeft.x,
        this._bound.topLeft.y,
        this._bound.width,
        this._bound.height
      );
      const { a } = this.ctx.getTransform().inverse();
      this.ctx.lineWidth = EDITOR_DIMS.bBoxStrokeWidth * a * devicePixelRatio;
      this.ctx.strokeStyle = EDITOR_COLORS.bBoxStroke;
      this.ctx.stroke();
    }
  }
}
