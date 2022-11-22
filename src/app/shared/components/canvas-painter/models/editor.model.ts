
import { CPCanvasObject } from '../objects/canvas/object.model';
import { CPSVGObject } from '../objects/svg/object.model';

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

interface CPLayer {
  id: string;
  name: string;
  opacity: number;
}

export interface CPCanvasLayer extends CPLayer {
  objects: CPCanvasObject[];
}

export interface CPCanvasLayers {
  [id: string]: CPCanvasLayer;
}

export interface CPSVGLayer extends CPLayer {
  objects: CPSVGObject[];
}

export interface CPSVGLayers {
  [id: string]: CPSVGLayer;
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
