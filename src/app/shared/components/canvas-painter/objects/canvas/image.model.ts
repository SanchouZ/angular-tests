import { CPPathProperties, Point } from '../../models/editor.model';
import { CPCanvasObject } from './object.model';
import { CanvasPainterUtilsService } from '../../services/canvas-painter-utils.service';

export class CPImage extends CPCanvasObject {
  private _outline: Point[];
  private outlinePath: Path2D;
  private utils = new CanvasPainterUtilsService();

  private width: number;
  private height: number;

  constructor(
    ctx: CanvasRenderingContext2D,
    private image: HTMLImageElement,
    private insertPoint: Point,
    properties?: CPPathProperties,
    width?: number,
    height?: number
  ) {
    super(ctx, properties);
    this._pivot = { x: this.image.width / 2, y: this.image.height / 2 };
    this._editable = properties?.editable;

    this._rotationAngle = 30;
    this._scaleX = 1.5;
    this._scaleY = 1.5;

    this.width = width ?? this.image.width;
    this.height = height ?? this.image.height;

    this._preview = this.image;
  }

  draw(): void {
    this.makeOutlineCoordinates();

    this.ctx.save();
    this.ctx.translate(this.insertPoint.x, this.insertPoint.y);
    this.ctx.rotate(((this._rotationAngle ?? 0) * Math.PI) / 180);

    this.ctx.drawImage(
      this.image,
      -this._pivot.x * this._scaleX,
      -this._pivot.y * this._scaleY,
      this.width * this._scaleX,
      this.height * this._scaleY
    );
    this.ctx.translate(-this.insertPoint.x, -this.insertPoint.y);
    this.ctx.restore();

    this.drawOutline();
  }

  public rotate(angle: number): void {
    if (this.editable) {
      this._rotationAngle = angle;
    }
  }

  public scale(scaleX: number, scaleY: number): void {
    if (this.editable) {
      this._scaleX = scaleX;
      this._scaleY = scaleY;
    }
  }

  public checkPointOn(point: Point): boolean {
    this.isPointInPath = this.ctx.isPointInPath(
      this.outlinePath,
      point.x,
      point.y
    );
    this.isPointInStroke = this.ctx.isPointInStroke(
      this.outlinePath,
      point.x,
      point.y
    );
    return this.isPointInPath || this.isPointInStroke;
  }

  private drawOutline(): void {
    this.outlinePath = new Path2D();

    this.ctx.beginPath();

    this._outline.forEach(({ x, y }, i) => {
      if (i === 0) {
        this.outlinePath.moveTo(x, y);
      } else {
        this.outlinePath.lineTo(x, y);
      }
    });

    this.outlinePath.closePath();
    const { a } = this.ctx.getTransform().inverse();

    this.ctx.lineWidth =
      (this.isPointInPath || this.isPointInStroke) && this.editable
        ? 8 * a * devicePixelRatio
        : 0.0001;

    this.ctx.lineCap = 'round';
    this.ctx.lineJoin = 'round';

    this.ctx.strokeStyle = '#558ed5';
    this.ctx.stroke(this.outlinePath);
  }

  private makeOutlineCoordinates(): void {
    this._outline = [
      {
        x: this.insertPoint.x - this._pivot.x,
        y: this.insertPoint.y - this._pivot.y,
      },
      {
        x: this.insertPoint.x + this._pivot.x,
        y: this.insertPoint.y - this._pivot.y,
      },
      {
        x: this.insertPoint.x + this._pivot.x,
        y: this.insertPoint.y + this._pivot.y,
      },
      {
        x: this.insertPoint.x - this._pivot.x,
        y: this.insertPoint.y + this._pivot.y,
      },
    ];

    this._outline = this.utils.rotatePoints(
      this._outline,
      this._rotationAngle,
      this.insertPoint
    );

    this._outline = this.utils.scalePoints(
      this._outline,
      this._scaleX,
      this._scaleY,
      this.insertPoint
    );

    this.calcBound(this._outline);
    this.showBBox();
  }
}
