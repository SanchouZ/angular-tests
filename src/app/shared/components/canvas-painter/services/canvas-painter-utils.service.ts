import { ElementRef, Injectable } from '@angular/core';
import { CPObjectProperties, Point, CPBound } from '../models/editor.model';

@Injectable()
export class CanvasPainterUtilsService {
  private _ctx: CanvasRenderingContext2D;
  private _canvasContainer: ElementRef<HTMLElement>;
  private _svg: ElementRef<SVGElement>;

  private _frame: CPBound;
  private _canvasCoordinates: Point;
  private _zoom: number;
  private _redraw: (forceZoomCheck?: boolean, emitZoom?: boolean) => void;

  public blockCanvasTranslate = false;

  constructor() {}

  set ctx(ctx: CanvasRenderingContext2D) {
    this._ctx = ctx;
  }

  get ctx(): CanvasRenderingContext2D {
    return this._ctx;
  }

  set canvasContainer(container: ElementRef<HTMLElement>) {
    this._canvasContainer = container;
  }

  get canvasContainer(): ElementRef<HTMLElement> {
    return this._canvasContainer;
  }

  set svg(svg: ElementRef<SVGElement>) {
    this._svg = svg;
  }

  get svg(): ElementRef<SVGElement> {
    return this._svg;
  }

  set frame(frame: CPBound) {
    this._frame = frame;
  }

  get frame(): CPBound {
    return this._frame;
  }

  set zoom(zoom: number) {
    this._zoom = zoom;
  }

  get zoom(): number {
    return this._zoom;
  }

  set redraw(redraw: (forceZoomCheck?: boolean, emitZoom?: boolean) => void) {
    this._redraw = redraw;
  }

  get redraw(): (forceZoomCheck?: boolean, emitZoom?: boolean) => void {
    return this._redraw;
  }

  set canvasCoordinates(canvasCoordinates: Point) {
    this._canvasCoordinates = canvasCoordinates;
  }

  get canvasCoordinates(): Point {
    return this._canvasCoordinates;
  }

  public getCanvasContainerBounds(): DOMRect {
    return this._canvasContainer.nativeElement.getBoundingClientRect();
  }

  /**
   * Takes screen (event.screenX & event.screenY) coordinates and returns canvas coordinate
   * @param x screen X
   * @param y screen Y
   * @returns
   */
  public getCanvasCoordinates(x: number, y: number): { x: number; y: number } {
    const { a, b, c, d, e, f } = this.ctx.getTransform().invertSelf();

    const bounds = this.getCanvasContainerBounds();
    const offsetX = (x - bounds.x) * devicePixelRatio;
    const offsetY = (y - bounds.y) * devicePixelRatio;

    return {
      x: a * offsetX + c * offsetY + e,
      y: b * offsetX + d * offsetY + f,
    };
  }

  /**
   * Takes canvas container (or event.offsetX & event.offsetY) coordinates and returns canvas coordinate
   * @param x screen X
   * @param y screen Y
   * @returns
   */
  public getCanvasCoordinatesCont(x: number, y: number): Point {
    const { a, b, c, d, e, f } = this.ctx.getTransform().invertSelf();

    const offsetX = x * devicePixelRatio;
    const offsetY = y * devicePixelRatio;

    return {
      x: a * offsetX + c * offsetY + e,
      y: b * offsetX + d * offsetY + f,
    };
  }

  /**
   * Takes canvas coordinates and returns canvas container coordinates
   * @param x screen X
   * @param y screen Y
   * @returns
   */
  public getContainerCoordinates(x: number, y: number): Point {
    const { a, b, c, d, e, f } = this.ctx.getTransform();

    const offsetX = x;
    const offsetY = y;

    const cx = (a * offsetX + c * offsetY + e) * (1 / devicePixelRatio);
    const cy = (b * offsetX + d * offsetY + f) * (1 / devicePixelRatio);

    return {
      x: cx,
      y: cy,
    };
  }

  public createSVGPath(
    points: (number[]| number[][])[],
    properties: CPObjectProperties
  ): string {
    let path = '';

    points.forEach((point, index) => {
      if (Array.isArray(point[0])) {
        point.forEach((point, index) => {
          const point1 = point as number[];
    
          if (index === 0) {
            path += `M${point1[0]},${point1[1]} `;
          } else {
            path += `L${point1[0]},${point1[1]} `;
          }
        });
      } else {
        if (index === 0) {
          path += `M${point[0]},${point[1]} `;
        } else {
          path += `L${point[0]},${point[1]} `;
        }
      }
    });

    if (properties.closed) {
      path += `z`;
    }

    return path;
  }

  public rotatePoints(
    points: Point[],
    angle: number,
    origin?: { x: number; y: number }
  ): Point[] {
    if (!origin) {
      origin = { x: 0, y: 0 };
    }

    const radAngle = (angle / 180) * Math.PI;
    const rotateMatrix = [
      [Math.cos(radAngle), -Math.sin(radAngle)],
      [Math.sin(radAngle), Math.cos(radAngle)],
    ];

    return points.map((point) => {
      const x = point.x - origin.x;
      const y = point.y - origin.y;

      const pX = rotateMatrix[0][0] * x + rotateMatrix[0][1] * y + origin.x;
      const pY = rotateMatrix[1][0] * x + rotateMatrix[1][1] * y + origin.y;

      return { x: pX, y: pY };
    });
  }

  public scalePoints(
    points: Point[],
    scaleX: number,
    scaleY: number,
    origin?: { x: number; y: number }
  ): Point[] {
    if (!origin) {
      origin = { x: 0, y: 0 };
    }

    return points.map((point) => {
      const x = point.x - origin.x;
      const y = point.y - origin.y;

      const pX = scaleX * x + 0 * y + origin.x;
      const pY = 0 * x + scaleY * y + origin.y;

      return { x: pX, y: pY };
    });
  }

  public translatePoints(
    points: Point[],
    tX: number,
    tY: number,
    origin?: { x: number; y: number }
  ): Point[] {
    if (!origin) {
      origin = { x: 0, y: 0 };
    }

    return points.map((point) => {
      const x = point.x - origin.x;
      const y = point.y - origin.y;

      const pX = 1 * x + 0 * y + origin.x + tX;
      const pY = 0 * x + 1 * y + origin.y + tY;

      return { x: pX, y: pY };
    });
  }
}
