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
  offsetX?: number;
  offsetY?: number;
  editable?: boolean;
}

export interface CPLineOptions {
  closed?: boolean;
  lineWidth?: number;
  strokeColor?: string;
  maintainRelativeWidth?: boolean;
}

export interface CPSVGPathOptions {
  closed?: boolean;
  strokeWidth?: number;
  strokeColor?: string;
  hoverStrokeWidth?: number;
  hoverStrokeColor?: string;
  strokeLineCap?: 'butt' | 'square' | 'round';
  strokeLinejoin?: 'miter' | 'round' | 'bevel';
  fill?: string;
  hoverFill?: string;
  maintainRelativeWidth?: boolean;
}
