import {
  CPBound,
  CPClickEvent,
  CPObjectProperties,
  Point,
} from '../models/editor.model';

export abstract class CPObject {
  public static count = 0;
  protected _id: number;

  public isPointInStroke = false;
  public isPointInPath = false;

  public clickCallback: (event: CPClickEvent, data: any) => void;

  protected _preview: HTMLImageElement;
  protected _pivot: Point;
  protected _rotationAngle: number = 0;
  protected _scaleX: number = 1;
  protected _scaleY: number = 1;
  protected _editable: boolean = false;
  protected _bound: CPBound;
  protected _opacity: number = 1;

  constructor(public properties: CPObjectProperties) {
    this.clickCallback = properties?.clickCallback;
    this._id = 100 + CPObject.count++;
    this._opacity = properties?.opacity ?? 1;
  }

  get id(): number {
    return this._id;
  }

  get pivot(): Point {
    return this._pivot;
  }

  set pivot(point: Point) {
    this._pivot = point;
  }

  get editable(): boolean {
    return this._editable;
  }

  set editable(editable: boolean) {
    this._editable = editable;
  }

  get rotationAngle(): number {
    return this._rotationAngle;
  }

  get scaleX(): number {
    return this._scaleX;
  }

  get scaleY(): number {
    return this._scaleY;
  }

  get opacity(): number {
    return this._opacity;
  }

  set opacity(opacity: number) {
    this._opacity = opacity;
  }

  get preview(): HTMLImageElement {
    return this._preview;
  }

  get bound(): CPBound {
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
}
