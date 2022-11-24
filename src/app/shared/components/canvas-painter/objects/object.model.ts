import { CPClickEvent, CPPathProperties, Point } from '../models/editor.model';

export abstract class CPObject {
  public static count = 0;
  protected _id: number;

  public isPointInStroke = false;
  public isPointInPath = false;

  public clickCallback: (event: CPClickEvent, data: any) => void;

  protected _pivot: Point;
  protected _rotationAngle: number = 0;
  protected _scaleX: number = 1;
  protected _scaleY: number = 1;
  protected _editable: boolean = false;

  constructor(public properties: CPPathProperties) {
    this.clickCallback = properties?.clickCallback;
    this._id = 100 + CPObject.count++;
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

  public abstract rotate(angle: number): void;

  public abstract scale(scaleX: number, scaleY: number): void;
}
