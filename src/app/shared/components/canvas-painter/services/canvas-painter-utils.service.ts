import { Injectable } from '@angular/core';
import { CPSVGPathOptions, Point } from '../models/editor.model';

@Injectable()
export class CanvasPainterUtilsService {
  private _ctx: CanvasRenderingContext2D;

  constructor() {}

  set ctx(ctx: CanvasRenderingContext2D) {
    this._ctx = ctx;
  }

  get ctx(): CanvasRenderingContext2D {
    return this._ctx;
  }

  public createSVGPath(
    points: number[][] | number[][][],
    options: CPSVGPathOptions
  ): string {
    let path = '';

    points.forEach((point, index) => {
      if (Array.isArray(point[0])) {
        point.forEach((point, index) => {
          const point1 = point as number[];
          const point2 = point as number[];
          if (index === 0) {
            path += `M${point1[0]},${point1[1]} `;
          } else {
            path += `L${point2[0]},${point2[1]} `;
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

    if (options.closed) {
      path += `z`;
    }

    return path;
  }

  private rotatePoints(
    points: Point[],
    angle: number,
    origin: { x: number; y: number }
  ): Point[] {
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
}
