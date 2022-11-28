import { Injectable } from '@angular/core';
import { CPObjectProperties, Point } from '../models/editor.model';
import { CPImage } from '../objects/canvas/image.model';
import { CPCanvasPath } from '../objects/canvas/path.model';
import { CPPath } from '../objects/svg/path.model';
import { CanvasPainterUtilsService } from './canvas-painter-utils.service';

@Injectable()
export class CanvasPainterObjectsService {
  private _ctx: CanvasRenderingContext2D;
  private _maintainWidth: boolean = false;

  constructor(private utils: CanvasPainterUtilsService) {}

  public set ctx(ctx: CanvasRenderingContext2D) {
    this._ctx = ctx;
  }

  public set maintainWidth(maintainWidth: boolean) {
    this._maintainWidth = maintainWidth;
  }

  public async createImage(
    url: string,
    centerPoint: Point,
    properties?: CPObjectProperties,
    width?: number,
    height?: number
  ): Promise<CPImage> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.src = url;
      img.setAttribute('crossOrigin', '');
      img.onload = () =>
        resolve(
          new CPImage(
            this._ctx,
            img,
            centerPoint,
            {
              ...properties,
              maintainRelativeWidth:
                properties?.maintainRelativeWidth ?? this._maintainWidth,
            },
            width,
            height
          )
        );

      img.onerror = () => reject(null);
    });
  }

  public createSVGPath(
    geometry: (number[] | number[][])[],
    properties?: CPObjectProperties
  ): CPPath {
    return new CPPath(geometry, {
      ...properties,
      maintainRelativeWidth:
        properties?.maintainRelativeWidth ?? this._maintainWidth,
    });
  }

  public createCanvasPath(
    geometry: number[][] | number[][][],
    properties?: CPObjectProperties
  ): CPCanvasPath {
    const points = this.geometryToPoints(geometry);

    return new CPCanvasPath(this._ctx, points, {
      ...properties,
      maintainRelativeWidth:
        properties?.maintainRelativeWidth ?? this._maintainWidth,
    });
  }

  public geometryToPoints(
    geometry: (number[] | number[][])[]
  ): (Point | Point[])[] {
    return geometry.map((point) => {
      if (Array.isArray(point[0])) {
        return (point as number[][]).map((point) => {
          return { x: point[0], y: point[1] } as Point;
        });
      } else {
        return { x: point[0], y: point[1] } as Point;
      }
    });
  }
}
