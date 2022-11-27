import { CPObjectProperties, Point } from '../../models/editor.model';
import { CPCanvasObject } from './object.model';
import { CanvasPainterUtilsService } from '../../services/canvas-painter-utils.service';
import { EDITOR_COLORS, EDITOR_DIMS } from '../../config/editor.config';

export class CPImage extends CPCanvasObject {
  private _outline: Point[];
  private outlinePath: Path2D;
  private utils = new CanvasPainterUtilsService();

  private _width: number;
  private _height: number;

  constructor(
    ctx: CanvasRenderingContext2D,
    private image: HTMLImageElement,
    private insertPoint: Point,
    properties?: CPObjectProperties,
    width?: number,
    height?: number
  ) {
    super(ctx, properties);
    this._pivot = { x: this.image.width / 2, y: this.image.height / 2 };
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
    this.ctx.translate(this.insertPoint.x, this.insertPoint.y);
    this.ctx.rotate(((this._rotationAngle ?? 0) * Math.PI) / 180);
    this.ctx.globalAlpha = this.opacity ?? 1;
    this.ctx.drawImage(
      this.image,
      -this._pivot.x * this._scaleX,
      -this._pivot.y * this._scaleY,
      this._width * this._scaleX,
      this._height * this._scaleY
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

    if (this.isPointInPath || this.isPointInStroke) {
      this.createLocalCoords(point);
    }
    return this.isPointInPath || this.isPointInStroke;
  }

  /**
   * Return images space coordinates
   * @param { Point } point - Canvas coordinates
   * @returns
   */
  public getLocalCoords(
    point: Point
  ): { current: Point; original: Point } | null {
    if (this.checkPointOn(point)) {
      return this.createLocalCoords(point);
    } else {
      return null;
    }
  }

  /**
   * Return canvas space coordinates
   * @param { Point } point - Object local coordinates
   * @returns
   */
  public getCanvasCoords(point: Point): Point {
    const [rotated] = this.utils.rotatePoints(
      [{ x: point.x, y: point.y }],
      this._rotationAngle,
      {
        x: this._pivot.x,
        y: this._pivot.y,
      }
    );

    const [imageOriginal] = this.utils.scalePoints(
      [rotated],
      this._scaleX,
      this._scaleY,
      {
        x: 0,
        y: 0,
      }
    );

    return {
      x: imageOriginal.x + this.insertPoint.x - this._pivot.x * this._scaleX,
      y: imageOriginal.y + this.insertPoint.y - this._pivot.y * this._scaleY,
    };
  }

  private createLocalCoords(point: Point): { current: Point; original: Point } {
    const x = point.x - (this.insertPoint.x - this.pivot.x * this._scaleX);
    const y = point.y - (this.insertPoint.y - this.pivot.y * this._scaleY);
    // console.log('input - x: ', x, ' : ', 'y: ', y);

    const [rotated] = this.utils.rotatePoints(
      [{ x, y }],
      -this._rotationAngle,
      {
        x: this._pivot.x * this.scaleX,
        y: this._pivot.y * this.scaleY,
      }
    );

    // console.log('rotated - x: ', rotated.x, ' : ', 'y: ', rotated.y);

    const [imageOriginal] = this.utils.scalePoints(
      [rotated],
      1 / this._scaleX,
      1 / this._scaleY,
      {
        x: 0,
        y: 0,
      }
    );

    // console.log(
    //   'imageOriginal - x: ',
    //   imageOriginal.x,
    //   ' : ',
    //   'y: ',
    //   imageOriginal.y
    // );

    return { current: rotated, original: imageOriginal };
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
