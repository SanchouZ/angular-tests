import { CPObject } from '../objects/object.model';

export interface Point {
  x: number;
  y: number;
}

export interface CPBound {
  topLeft: Point;
  bottomRight: Point;
  width: number;
  height: number;
}

export interface CPClickEvent {
  zoom: number;
  canvasCoordinates: Point;
  containerCoordinates: Point;
  bounds: DOMRect;
  frame: CPBound;
}

export interface CPLayer {
  id: string;
  name: string;
  opacity: number;
  objects: CPObject[];
}

export interface CPMarkerOptions {
  offsetX: number;
  offsetY: number;
}

export interface CPLineOptions {
  closed?: boolean;
  lineWidth?: number;
  strokeColor?: string;
  maintainRelativeWidth?: boolean;
}