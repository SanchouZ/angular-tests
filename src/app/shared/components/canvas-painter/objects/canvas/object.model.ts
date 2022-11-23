import {
  CPClickEvent,
  CPPathProperties,
  Point,
} from '../../models/editor.model';

export abstract class CPCanvasObject {
  public static count = 0;
  private _id: number;

  public path: Path2D;

  public isPointInStroke = false;
  public isPointInPath = false;

  public clickCallback: (event: CPClickEvent, data: any) => void;

  constructor(
    public ctx: CanvasRenderingContext2D,
    public properties: CPPathProperties,
    id?: number
  ) {
    this._id = 100 + CPCanvasObject.count++;
  }

  get id(): number {
    return this._id;
  }

  abstract draw(): void;

  abstract checkPointOn(point: Point): boolean;
}
