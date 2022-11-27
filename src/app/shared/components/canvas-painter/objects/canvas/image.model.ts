import { CPObjectProperties, Point } from '../../models/editor.model';
import { CPCanvasObject } from './object.model';
import { CanvasPainterUtilsService } from '../../services/canvas-painter-utils.service';
import { EDITOR_COLORS, EDITOR_DIMS } from '../../config/editor.config';

export class CPImage extends CPCanvasObject {
  private _outline: Point[];
  private outlinePath: Path2D;

  private _width: number;
  private _height: number;

  constructor(
    ctx: CanvasRenderingContext2D,
    private image: HTMLImageElement,
    insertPoint: Point,
    properties?: CPObjectProperties,
    width?: number,
    height?: number
  ) {
    super(ctx, properties);
    this._pivot = {
      world: insertPoint,
      local: { x: this.image.width / 2, y: this.image.height / 2 },
    };
    this._editable = properties?.editable;

    this._width = width ?? this.image.width;
    this._height = height ?? this.image.height;

    this._preview = this.image;
  }

  get width(): number {
    return this._width;
  }

  get height(): number {
    return this._height;
  }

  draw(): void {
    this.makeOutlineCoordinates();

    this.ctx.save();
    this.ctx.translate(this.pivot.world.x, this.pivot.world.y);
    this.ctx.rotate(((this._rotationAngle ?? 0) * Math.PI) / 180);
    this.ctx.globalAlpha = this.opacity ?? 1;
    this.ctx.drawImage(
      this.image,
      -this.pivot.local.x * this._scaleX,
      -this.pivot.local.y * this._scaleY,
      this._width * this._scaleX,
      this._height * this._scaleY
    );
    this.ctx.translate(-this.pivot.world.x, -this.pivot.world.y);
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

    if (this.isPointInPath || this.isPointInStroke) {
      this.createLocalCoords(point);
    }
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
        ? EDITOR_DIMS.hoverStrokeWidth * a * devicePixelRatio
        : 0.0001;

    this.ctx.lineCap = 'round';
    this.ctx.lineJoin = 'round';

    this.ctx.strokeStyle = EDITOR_COLORS.selectionStroke;
    this.ctx.stroke(this.outlinePath);
  }

  private makeOutlineCoordinates(): void {
    this._outline = [
      {
        x: this.pivot.world.x - this.pivot.local.x,
        y: this.pivot.world.y - this.pivot.local.y,
      },
      {
        x: this.pivot.world.x + this.pivot.local.x,
        y: this.pivot.world.y - this.pivot.local.y,
      },
      {
        x: this.pivot.world.x + this.pivot.local.x,
        y: this.pivot.world.y + this.pivot.local.y,
      },
      {
        x: this.pivot.world.x - this.pivot.local.x,
        y: this.pivot.world.y + this.pivot.local.y,
      },
    ];

    this._outline = this.utils.rotatePoints(
      this._outline,
      this._rotationAngle,
      this.pivot.world
    );

    this._outline = this.utils.scalePoints(
      this._outline,
      this._scaleX,
      this._scaleY,
      this.pivot.world
    );

    this.calcBound(this._outline);
    this.showBBox();
  }
}
