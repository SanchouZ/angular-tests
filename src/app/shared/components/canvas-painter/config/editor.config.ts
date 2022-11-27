import { CPMarkerProperties } from '../models/editor.model';

export const EDITOR_COLORS = {
  stroke: '#2b405f',
  strokeHover: '#558ed5',
  fill: 'transparent',
  fillHover: 'transparent',
  selectionStroke: '#558ed5',
  bBoxStroke: 'black',
};

export const EDITOR_DIMS = {
  strokeWidth: 8,
  hoverStrokeWidth: 8,
  bBoxStrokeWidth: 1,
};

export const EDITOR_MARKER: CPMarkerProperties = {
  offsetX: -15,
  offsetY: -15,
  editable: true,
};
