import { CPCanvasObject } from '../objects/canvas/object.model';
import { CPSVGObject } from '../objects/svg/object.model';
import { CPLayer } from './editor-only.model';

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

export interface CPMarkerProperties {
  offsetX?: number;
  offsetY?: number;
  editable?: boolean;
}

export interface CPPathProperties {
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
  /** SVG Only for now */
  clickCallback?: (event: CPClickEvent, data: any) => void;
  data?: any;
}
