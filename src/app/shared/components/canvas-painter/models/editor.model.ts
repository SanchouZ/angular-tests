import { CPCanvasObject } from '../objects/canvas/object.model';

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

export interface CPCanvasLayer {
  id: string;
  name: string;
  opacity: number;
  objects: CPCanvasObject[];
}

export interface CPLayers {
  [id: string]: CPCanvasLayer;
}

export interface CPMarkerOptions {
  offsetX?: number;
  offsetY?: number;
  editable?: boolean;
}

export interface CPPathOptions {
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
