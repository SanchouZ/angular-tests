import { Point } from '../../models/editor.model';

export abstract class CPCanvasObject {
  protected ctx: CanvasRenderingContext2D;
  public path: Path2D;

  public isPointInStroke = false;
  public isPointInPath = false;

  constructor(ctx: CanvasRenderingContext2D) {
    this.ctx = ctx;
  }
  abstract draw(): void;

  abstract checkPointOn(point: Point): boolean;
}
