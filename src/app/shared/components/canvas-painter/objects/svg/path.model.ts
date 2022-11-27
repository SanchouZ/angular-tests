import { CPObjectProperties, Point } from '../../models/editor.model';
import { CPSVGObject } from './svg-object.model';

export class CPPath extends CPSVGObject {
  constructor(
    geometry: (number[] | number[][])[],
    properties: CPObjectProperties
  ) {
    super(geometry, properties);
  }

  public rotate(angle: number): void {}

  public scale(scaleX: number, scaleY: number): void {}

  public checkPointOn(point: Point): boolean {
    return false;
  }
}
