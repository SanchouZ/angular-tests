import { CPSVGPath } from '../directives/svg-path.directive';

export interface CPLayer {
  id: string;
  name: string;
  opacity: number;
}

/**
 * This is for using inside the lib, DO NOT use for component input, instead use CPSVGLayer
 */
export interface SceneSVGLayer extends CPLayer {
  objects: CPSVGPath[];
}

/**
 * This is for using inside the lib, DO NOT use for component input, instead use CPSVGLayers
 */
export interface SceneSVGLayers {
  [id: string]: SceneSVGLayer;
}
