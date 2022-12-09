import {
  CPBound,
  CPClickEvent,
  CPObjectProperties,
  ObjectPivot,
  Point,
} from '../models/editor.model';
import { CanvasPainterUtilsService } from '../services/canvas-painter-utils.service';

export abstract class CPObject {
  public static count = 0;
  protected _id: number;
  protected utils = new CanvasPainterUtilsService();

  public isPointInStroke = false;
  public isPointInPath = false;

  public clickCallback: (event: CPClickEvent, data: any) => void;

  protected _preview: HTMLImageElement;
  protected _pivot: ObjectPivot;
  protected _rotationAngle: number = 0;
  protected _scaleX: number = 1;
  protected _scaleY: number = 1;
  protected _editable: boolean = false;
  protected _bound: CPBound;
  protected _opacity: number = 1;

  public drawn = false;

  constructor(public properties: CPObjectProperties) {
    this.clickCallback = properties?.clickCallback;
    this._id = 100 + CPObject.count++;
    this._opacity = properties?.opacity ?? 1;
  }

  public get id(): number {
    return this._id;
  }

  public get pivot(): ObjectPivot {
    return this._pivot;
  }

  public set pivot(point: ObjectPivot) {
    this._pivot = point;
  }

  public updateWorldPivot(point: Point) {
    this._pivot.world.x = point.x;
    this._pivot.world.y = point.y;
  }

  public updateLocalPivot(point: Point) {
    this._pivot.local.x = point.x;
    this._pivot.local.y = point.y;
  }

  public get editable(): boolean {
    return this._editable;
  }

  public set editable(editable: boolean) {
    this._editable = editable;
  }

  public get rotationAngle(): number {
    return this._rotationAngle;
  }

  public get scaleX(): number {
    return this._scaleX;
  }

  public get scaleY(): number {
    return this._scaleY;
  }

  public get opacity(): number {
    return this._opacity;
  }

  public set opacity(opacity: number) {
    this._opacity = opacity;
  }

  public get preview(): HTMLImageElement {
    return this._preview;
  }

  public get bound(): CPBound {
    return this._bound;
  }

  public abstract rotate(angle: number): void;

  public abstract scale(scaleX: number, scaleY: number): void;

  protected calcBound(points: Point[]): void {
    let minX = Number.MAX_VALUE;
    let minY = Number.MAX_VALUE;
    let maxX = Number.MIN_VALUE;
    let maxY = Number.MIN_VALUE;

    points.forEach((point, i) => {
      if (i === 0) {
        minX = point.x;
        maxX = point.x;
        minY = point.y;
        maxY = point.y;
      } else {
        if (point.x < minX) {
          minX = point.x;
        }
        if (point.x > maxX) {
          maxX = point.x;
        }

        if (point.y < minY) {
          minY = point.y;
        }

        if (point.y > maxY) {
          maxY = point.y;
        }
      }
    });

    this._bound = {
      topLeft: { x: minX, y: minY },
      bottomRight: { x: maxX, y: maxY },
      width: Math.abs(maxX - minX),
      height: Math.abs(maxY - minY),
    };
  }

  abstract checkPointOn(point: Point): boolean;

  /**
   * Return images space coordinates
   * @param { Point } point - Canvas coordinates
   * @returns
   */
  public getLocalCoords(
    point: Point
  ): { current: Point; original: Point } | null {
    const isPointOn = this.checkPointOn(point);

    return this.createLocalCoords(point);
    // if (isPointOn) {
    //   return this.createLocalCoords(point);
    // } else {
    //   return null;
    // }
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
        x: this.pivot.local.x,
        y: this.pivot.local.y,
      }
    );

    const [objectOriginal] = this.utils.scalePoints(
      [rotated],
      this._scaleX,
      this._scaleY,
      {
        x: 0,
        y: 0,
      }
    );

    // console.log(
    //   'canvas - coords: ',
    //   objectOriginal.x + this.pivot.world.x - this.pivot.local.x * this._scaleX,
    //   objectOriginal.y + this.pivot.world.y - this.pivot.local.y * this._scaleY
    // );

    return {
      x:
        objectOriginal.x +
        this.pivot.world.x -
        this.pivot.local.x * this._scaleX,
      y:
        objectOriginal.y +
        this.pivot.world.y -
        this.pivot.local.y * this._scaleY,
    };
  }

  protected createLocalCoords(point: Point): {
    current: Point;
    original: Point;
  } {
    const x =
      point.x - (this.pivot.world.x - this.pivot.local.x * this._scaleX);
    const y =
      point.y - (this.pivot.world.y - this.pivot.local.y * this._scaleY);
    // console.log('input - x: ', x, ' : ', 'y: ', y);

    const [rotated] = this.utils.rotatePoints(
      [{ x, y }],
      -this._rotationAngle,
      {
        x: this.pivot.local.x * this.scaleX,
        y: this.pivot.local.y * this.scaleY,
      }
    );

    // console.log('rotated - x: ', rotated.x, ' : ', 'y: ', rotated.y);

    const [objectOriginal] = this.utils.scalePoints(
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
    //   objectOriginal.x,
    //   ' : ',
    //   'y: ',
    //   objectOriginal.y
    // );

    return { current: rotated, original: objectOriginal };
  }
}
