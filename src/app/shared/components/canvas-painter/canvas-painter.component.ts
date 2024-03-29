import {
  AfterViewInit,
  ChangeDetectorRef,
  ChangeDetectionStrategy,
  Component,
  ContentChildren,
  ElementRef,
  EventEmitter,
  HostListener,
  Input,
  NgZone,
  OnDestroy,
  OnInit,
  Output,
  QueryList,
  Renderer2,
  ViewChild,
  ViewChildren,
} from '@angular/core';

import { Subscription } from 'rxjs';
import { tap } from 'rxjs/operators';

import { fadeInOutAnimation } from './animations/fade-in-out.animation';
import {
  EDITOR_COLORS,
  EDITOR_DIMS,
  EDITOR_MARKER,
} from './config/editor.config';
import { CPMarkerDirective } from './directives/marker.directive';
import { CPPathDirective } from './directives/path.directive';
import { SceneSVGLayers } from './models/editor-only.model';
import {
  CPBound,
  CPClickEvent,
  CPCanvasLayer,
  CPCanvasLayers,
  Point,
  CPSVGLayers,
  CPSVGLayer,
  CPObjectProperties,
} from './models/editor.model';
import { CPCanvasPath } from './objects/canvas/path.model';
import { CPCanvasObject } from './objects/canvas/object.model';
import { CPObject } from './objects/object.model';
import { CanvasPainterUtilsService } from './services/canvas-painter-utils.service';
import { CanvasPainterObjectsService } from './services/objects.service';
import { CPImage } from './objects/canvas/image.model';
import { CPImageDirective } from './directives/image.directive';

@Component({
  selector: 'mf-canvas-painter',
  templateUrl: './canvas-painter.component.html',
  styleUrls: ['./canvas-painter.component.scss'],
  animations: [fadeInOutAnimation],
})
export class CanvasPainterComponent
  implements OnInit, AfterViewInit, OnDestroy
{
  @ViewChild('canvas', { static: true }) canvas: ElementRef<HTMLCanvasElement>;
  @ViewChild('canvasContainer', { static: true })
  canvasContainer: ElementRef<HTMLElement>;

  @ViewChild('svgOverlay', { static: true }) svg: ElementRef<SVGElement>;

  @ViewChildren(CPMarkerDirective) editorMarker: QueryList<CPMarkerDirective>;

  @Input()
  set zoom(zoomLevel: number) {
    if (
      this.ctx &&
      zoomLevel <= this.maxZoom &&
      zoomLevel > 0 &&
      zoomLevel !== this.zoom
    ) {
      const container = this.utils.getCanvasContainerBounds();
      const centerPoint = this.utils.getCanvasCoordinatesCont(
        container.width / 2,
        container.height / 2
      );
      const zoom = zoomLevel / this.zoom;
      this.ctx.translate(centerPoint.x, centerPoint.y);
      this.ctx.scale(zoom, zoom);
      this.ctx.translate(-centerPoint.x, -centerPoint.y);

      const { a } = this.ctx.getTransform();

      this.#zoom = a;

      this.redraw(false, false);
    }
  }

  @Input() disableAnimations = false;
  @Input() centerOrigin = false;
  @Input() showOriginLines = true;
  @Input() showDebugPanel = false;
  @Input() maintainRelativeWidth = false;
  @Input() maxZoom = 20;
  @Input() markerLinksLineProperties: CPObjectProperties = {
    strokeWidth: 10,
    hoverStrokeColor: 'green',
    strokeLineCap: 'round',
    maintainRelativeWidth: false,
    clickCallback: (event, data) => {
      // console.log('CANVAS PATH');
      // console.log(event);
      // console.log(data);
    },
  };

  @Input() set layersCanvas(layers: CPCanvasLayers) {
    if (layers) {
      this.#layersCanvas = {
        ...this.#layersCanvas,
        ...layers,
      };
      this.redraw();
    }
  }

  @Input() set layersSVG(layers: CPSVGLayers) {
    if (layers) {
      Object.values(layers).forEach((layer) => this.createSVGLayer(layer));
    }
  }

  @Input() set bgImage(img: HTMLImageElement) {
    this.imageBackground = img;
    this.#holdBound = {
      topLeft: { x: this.imageEntryPoint.x, y: this.imageEntryPoint.y },
      bottomRight: {
        x: this.imageBackground.width + this.imageEntryPoint.x,
        y: this.imageBackground.height + this.imageEntryPoint.y,
      },
      width: this.imageBackground.width,
      height: this.imageBackground.height,
    };
    this.redraw(true);
  }

  @Input() set bgImageByURL(url: string) {
    if (!url) {
      return;
    }
    const img = new Image();
    img.src = url;
    img.setAttribute('crossOrigin', '');

    this.toogleLoadingState();

    img.onload = () => {
      this.imageBackground = img;
      this.#holdBound = {
        topLeft: { x: this.imageEntryPoint.x, y: this.imageEntryPoint.y },
        bottomRight: {
          x: this.imageBackground.width + this.imageEntryPoint.x,
          y: this.imageBackground.height + this.imageEntryPoint.y,
        },
        width: this.imageBackground.width,
        height: this.imageBackground.height,
      };
      this.redraw(true);
      this.toogleLoadingState();
    };

    img.onerror = () => this.toogleLoadingState();
  }

  @Input() holdZoomToImage = false;

  @Output() private canvasClick = new EventEmitter<CPClickEvent>();
  @Output() private zoomChange = new EventEmitter<number>();
  @Output() private canvasReady = new EventEmitter<CanvasPainterComponent>();
  @Output() private loading = new EventEmitter<boolean>();
  @Output() private selectObjects = new EventEmitter<CPObject[]>();

  @ContentChildren(CPMarkerDirective) markers: QueryList<CPMarkerDirective>;
  @ContentChildren(CPPathDirective) templatePaths: QueryList<CPPathDirective>;
  @ContentChildren(CPImageDirective)
  templateImages: QueryList<CPImageDirective>;

  private ctx: CanvasRenderingContext2D;

  private imageEntryPoint: Point = { x: 0, y: 0 };
  private clicks: Point[] = [];
  private templateSvgLayerId = 'svg_fr_tmp';
  private templateCanvasLayerId = 'canvas_fr_tmp';
  private templateImagesLayerId = 'images_fr_tmp';
  private templateImagesCache = new Map<string, CPImage>();
  private markersLayerId = 'markers-lines';
  private markersHasLinks = false;
  private showSin = false;
  private showCos = false;

  private imageBackground: HTMLImageElement;

  private moveStart: Point = { x: 0, y: 0 };
  private moveActive = false;

  private _selection: CPObject[] = [];

  #layersCanvas: CPCanvasLayers = {};
  #layersSVG: SceneSVGLayers = {};
  #canvasCoords: Point = { x: 0, y: 0 };
  #screenCoords: Point = { x: 0, y: 0 };
  #movementVector: Point = { x: 0, y: 0 };
  #canvasFrame: CPBound;
  #holdBound: CPBound;
  #zoom: number;
  #drawCount: number = 0;

  private sub = new Subscription();

  public isLoading = false;
  public editorMarkerOptions = EDITOR_MARKER;

  public lastDrawTime: number = 0;
  public lastCheckIntercectTIme: number = 0;

  public maxDrawTime: number = -1;
  public maxCheckIntercectTIme: number = 0;

  @HostListener('window:resize', ['$event'])
  public validateCanvas() {
    const { a, b, c, d, e, f } = this.ctx.getTransform();
    this.updateCanvasBounds();
    this.ctx.setTransform(a, b, c, d, e, f);

    this.redraw();
  }

  @HostListener('click', ['$event'])
  private handleClick(evt: MouseEvent) {
    const canvasPoint = this.utils.getCanvasCoordinates(
      evt.clientX,
      evt.clientY
    );
    this.canvasClick.emit({
      zoom: this.zoom,
      canvasCoordinates: canvasPoint,
      containerCoordinates: this.utils.getContainerCoordinates(
        canvasPoint.x,
        canvasPoint.y
      ),
      bounds: this.utils.getCanvasContainerBounds(),
      frame: this.getCanvasFrame(),
    });
  }

  @HostListener('mousedown', ['$event'])
  private handleMouseDown(evt: MouseEvent) {
    // if (evt.button === 1) {
    //   this.moveStart = this.getCanvasCoordinates(evt.clientX, evt.clientY);
    //   this.moveActive = true;
    // }
    this.moveStart = this.utils.getCanvasCoordinates(evt.clientX, evt.clientY);
    this.moveActive = true;
  }

  @HostListener('mouseup', ['$event'])
  private handleMouseUp(evt: MouseEvent) {
    this.moveActive = false;
  }

  @HostListener('mouseleave', ['$event'])
  private handleMouseLeave(evt: MouseEvent) {
    this.moveActive = false;
  }

  @HostListener('mousemove', ['$event'])
  private handleMouseMove(evt: MouseEvent) {
    const coords = this.utils.getCanvasCoordinates(evt.clientX, evt.clientY);
    this.#screenCoords.x = evt.clientX;
    this.#screenCoords.y = evt.clientY;
    const mX = coords.x - this.#canvasCoords.x;
    const mY = coords.y - this.#canvasCoords.y;
    this.#movementVector.x = mX > 0 ? Math.ceil(mX) : Math.floor(mX);
    this.#movementVector.y = mY > 0 ? Math.ceil(mY) : Math.floor(mY);
    this.#canvasCoords = coords;

    if (this.moveActive) {
      this.ctx.translate(
        this.canvasCoords.x - this.moveStart.x,
        this.canvasCoords.y - this.moveStart.y
      );

      this.redraw(false, false);
    } else {
      this.updateUtils();
    }
  }

  @HostListener('wheel', ['$event'])
  private handleWheel(event: WheelEvent) {
    const zoomFactor = event.deltaY < 0 ? 1.1 : 0.9;
    if (this.zoom * zoomFactor < this.maxZoom) {
      this.#canvasCoords = this.utils.getCanvasCoordinates(
        event.clientX,
        event.clientY
      );

      this.ctx.translate(this.#canvasCoords.x, this.#canvasCoords.y);
      this.ctx.scale(zoomFactor, zoomFactor);
      this.ctx.translate(-this.#canvasCoords.x, -this.#canvasCoords.y);

      const { a } = this.ctx.getTransform();
      this.#zoom = a;
      this.redraw();
    }
  }

  @HostListener('window:keypress', ['$event'])
  private handleKeyboard(evt: KeyboardEvent) {
    if (evt.code === 'KeyS') {
      this.showSin = !this.showSin;
      this.drawSin();
    }

    if (evt.code === 'KeyC') {
      // this.drawCos();
      // this.showCos = !this.showCos;

      const container = this.utils.getCanvasContainerBounds();
      const centerPoint = this.utils.getCanvasCoordinates(
        container.x + container.width / 2,
        container.y + container.height / 2
      );
    }
  }

  private canvasWorker: Worker;

  constructor(
    public utils: CanvasPainterUtilsService,
    public objectsService: CanvasPainterObjectsService,
    private renderer: Renderer2,
    private cd: ChangeDetectorRef,
    private zone: NgZone
  ) {}

  ngOnInit(): void {
    if (typeof Worker !== 'undefined') {
      // Create a new
      this.canvasWorker = new Worker(
        new URL('./canvas-painter.worker', import.meta.url)
      );
      this.canvasWorker.onmessage = ({ data }) => {
        console.log(`page got message: ${data}`);
      };
      this.canvasWorker.postMessage('hello');
    } else {
      // Web workers are not supported in this environment.
      // You should add a fallback so that your program still executes correctly.
    }

    this.ctx = this.canvas.nativeElement.getContext('2d');

    if (this.ctx) {
      this.utils.ctx = this.ctx;
      this.objectsService.ctx = this.ctx;
      this.objectsService.maintainWidth = this.maintainRelativeWidth;
    }

    if (this.canvasContainer) {
      this.utils.canvasContainer = this.canvasContainer;
    }

    if (this.svg) {
      this.utils.svg = this.svg;
    }

    const bounds = this.canvasContainer.nativeElement.getBoundingClientRect();
    this.updateCanvasBounds();

    if (this.centerOrigin) {
      this.ctx.translate(bounds.width / 2, bounds.height / 2);
    }

    this.#zoom = this.ctx.getTransform().a;

    this.redraw();

    this.canvasReady.emit(this);
  }

  ngAfterViewInit(): void {
    this.updateCanvasBounds();
    this.createMarkerLinks();
    this.redraw();
    this.createPathsFromTemplate();
    this.createImagesFromTemplate();

    this.zone.runOutsideAngular(() => {
      this.canvasContainer.nativeElement.addEventListener(
        'mousemove',
        (evt: MouseEvent) => {
          const intercect = this.checkCanvasObjectIntersect(this.#canvasCoords);
          if (intercect.redraw) {
            this.redraw();
            this.canvasContainer.nativeElement.style.cursor = 'pointer';
          } else {
            this.canvasContainer.nativeElement.style.cursor = 'auto';
          }
        }
      );

      this.canvas.nativeElement.addEventListener('click', (evt: MouseEvent) => {
        const intercect = this.checkCanvasObjectIntersect(this.#canvasCoords);

        intercect.intercectedObjects.forEach((object) => {
          if (object.clickCallback) {
            if (object instanceof CPImage) {
              const coordsData = {
                ...object.getLocalCoords(this.#canvasCoords),
              };
              object.clickCallback(
                {
                  ...this.getEventInfo(),
                  objectLocalCoords: coordsData?.original,
                  transformedObjectLocalCoords: coordsData?.current,
                },
                object.properties?.data
              );
            } else {
              object.clickCallback(
                this.getEventInfo(),
                object.properties?.data
              );
            }
          }
        });
        this.selectObjects.emit(intercect.intercectedObjects);
        this._selection = intercect.intercectedObjects;

        if (intercect.intercectedObjects[0] instanceof CPImage) {
          intercect.intercectedObjects[0].getCanvasCoords({ x: 1161, y: 717 });
        }
      });
    });

    this.sub.add(
      this.markers.changes
        .pipe(
          tap(() => {
            this.createMarkerLinks();
            this.redraw();
          })
        )
        .subscribe()
    );
    this.sub.add(
      this.templatePaths.changes
        .pipe(
          tap(() => {
            this.createPathsFromTemplate();
            this.redraw();
          })
        )
        .subscribe()
    );

    this.sub.add(
      this.templateImages.changes
        .pipe(
          tap(() => {
            this.createImagesFromTemplate();
          })
        )
        .subscribe()
    );
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }

  public addCanvasLayer(id: string, layerData: CPCanvasLayer) {
    this.#layersCanvas[id] = layerData;
    this.redraw();
  }

  public removeCanvasLayer(id: string) {
    if (id in this.#layersCanvas) {
      delete this.#layersCanvas[id];
      this.redraw();
    }
  }

  public addSVGLayer(layer: CPSVGLayer) {
    this.createSVGLayer(layer);
  }

  public removeSVGLayer(id: string) {
    if (id in this.#layersSVG) {
      delete this.#layersSVG[id];
      this.#layersSVG = { ...this.#layersSVG };
    }
  }

  public getEventInfo(): CPClickEvent {
    const canvasPoint = this.#canvasCoords;

    return {
      zoom: this.zoom,
      canvasCoordinates: canvasPoint,
      containerCoordinates: this.utils.getContainerCoordinates(
        canvasPoint.x,
        canvasPoint.y
      ),
      bounds: this.utils.getCanvasContainerBounds(),
      frame: this.getCanvasFrame(),
    };
  }

  public get canvasCoords(): Point {
    return this.#canvasCoords;
  }

  public get screenCoords(): Point {
    return this.#screenCoords;
  }

  public get movementVector(): Point {
    return this.#movementVector;
  }

  public get canvasFrame(): CPBound {
    return this.#canvasFrame;
  }

  // eslint-disable-next-line @typescript-eslint/adjacent-overload-signatures
  public get zoom(): number {
    return this.#zoom;
  }

  public get drawCount(): number {
    return this.#drawCount;
  }

  public get transform(): {
    scaleX: number;
    skewY: number;
    skewX: number;
    scaleY: number;
    tX: number;
    tY: number;
  } {
    const { a, b, c, d, e, f } = this.ctx.getTransform();
    return {
      scaleX: a,
      skewY: b,
      skewX: c,
      scaleY: d,
      tX: e,
      tY: f,
    };
  }

  public toogleLoadingState(): void {
    this.isLoading = !this.isLoading;
    this.loading.emit(this.isLoading);
  }

  get svgElements(): SceneSVGLayers {
    return this.#layersSVG;
  }

  get canvasElements(): CPCanvasLayers {
    return this.#layersCanvas;
  }

  get selection(): CPObject[] {
    return this._selection;
  }

  private createPathsFromTemplate(): void {
    if (this.templatePaths) {
      this.#layersSVG[this.templateSvgLayerId] = {
        id: this.templateSvgLayerId,
        name: this.templateSvgLayerId,
        opacity: 1,
        objects: this.templatePaths
          .toArray()
          .filter((path) => path.target === 'svg'),
      };

      this.#layersCanvas[this.templateCanvasLayerId] = {
        id: this.templateCanvasLayerId,
        name: this.templateCanvasLayerId,
        opacity: 1,
        objects: this.templatePaths
          .toArray()
          .filter((path) => path.target === 'canvas')
          .map(
            (path) =>
              new CPCanvasPath(
                this.ctx,
                this.objectsService.geometryToPoints(path.geometry),
                {
                  ...path.properties,
                  clickCallback:
                    path.properties.clickCallback ??
                    function (event, data) {
                      path.pathClick.emit(event);
                    },
                }
              )
          ),
      };
    }
  }

  private async createImagesFromTemplate(): Promise<void> {
    if (!this.#layersCanvas[this.templateImagesLayerId]) {
      this.#layersCanvas[this.templateImagesLayerId] = {
        id: this.templateImagesLayerId,
        name: this.templateImagesLayerId,
        opacity: 1,
        objects: [],
      };
    }

    for (const templateImage of this.templateImages?.toArray()) {
      let image: CPImage;

      if (this.templateImagesCache.has(templateImage.url)) {
        console.log('get cached: ', templateImage.url);
        image = this.templateImagesCache.get(templateImage.url);
      } else {
        console.log('create new: ', templateImage.url);
        image = await this.objectsService.createImage(
          templateImage.url,
          { x: templateImage.centerPoint[0], y: templateImage.centerPoint[1] },
          {
            ...templateImage.properties,
            clickCallback:
              templateImage.properties?.clickCallback ??
              function (event, data) {
                templateImage.imageClick.emit(event);
              },
          },
          templateImage.width,
          templateImage.height
        );
        this.templateImagesCache.set(templateImage.url, image);
      }
      this.#layersCanvas[this.templateImagesLayerId].objects.push(image);
    }

    if (this.templateImages) {
      console.log('redraw');
      this.redraw();
    }
  }

  private createSVGLayer(layer: CPSVGLayer): void {
    this.#layersSVG[layer.id] = {
      ...layer,
      objects: layer.objects.map((object) => {
        const svgHost = new CPPathDirective('', this.utils);
        svgHost.geometry = object.geometry;
        svgHost.properties = object.properties;
        svgHost.clickCallback = object.properties.clickCallback;
        return svgHost;
      }),
    };
  }

  private updateCanvasBounds(): void {
    const bounds = this.canvasContainer.nativeElement.getBoundingClientRect();
    const aspectRatio = bounds.height / bounds.width;

    const width = (bounds.height / aspectRatio) * devicePixelRatio;
    const height = bounds.height * devicePixelRatio;

    this.renderer.setAttribute(this.canvas.nativeElement, 'width', `${width}`);

    this.renderer.setAttribute(
      this.canvas.nativeElement,
      'height',
      `${height}`
    );
  }

  private updateSvgBounds(): void {
    if (this.svg) {
      const canvasBounds =
        this.canvasContainer.nativeElement.getBoundingClientRect();
      const canvasFrame = this.getCanvasFrame();

      this.renderer.setAttribute(
        this.svg.nativeElement,
        'width',
        `${canvasBounds.width}`
      );
      this.renderer.setAttribute(
        this.svg.nativeElement,
        'height',
        `${canvasBounds.height}`
      );

      this.renderer.setAttribute(
        this.svg.nativeElement,
        'viewBox',
        `${canvasFrame.topLeft.x} ${canvasFrame.topLeft.y} ${
          -canvasFrame.topLeft.x + canvasFrame.bottomRight.x
        } ${-canvasFrame.topLeft.y + canvasFrame.bottomRight.y}`
      );
    }
  }

  private updateUtils(): void {
    this.utils.frame = this.#canvasFrame;
    this.utils.zoom = this.#zoom;
    this.utils.canvasCoordinates = this.#canvasCoords;
    this.utils.redraw = this.redraw.bind(this);
  }

  private redraw(
    forceZoomCheck: boolean = false,
    emitZoom: boolean = true
  ): void {
    const startTime = performance.now();

    this.zone.runOutsideAngular(() => {
      this.#canvasFrame = this.getCanvasFrame();

      if (this.#holdBound && this.holdZoomToImage) {
        this.holdToBound(this.#holdBound, forceZoomCheck);
      }

      this.ctx.save();
      this.ctx.setTransform(1, 0, 0, 1, 0, 0);
      this.ctx.clearRect(
        0,
        0,
        this.canvas.nativeElement.width,
        this.canvas.nativeElement.height
      );

      this.ctx.restore();

      this.updateMarkers();

      if (this.showOriginLines) {
        this.drawOriginLines();
      }

      this.drawBackgroundImage();

      let drawCount = 0;
      Object.values(this.#layersCanvas).forEach((layer) => {
        layer.objects.forEach((object) => {
          object.drawn = false;
          if (
            (((object.bound.topLeft.x > this.canvasFrame.topLeft.x &&
              object.bound.topLeft.x < this.canvasFrame.bottomRight.x) ||
              (object.bound.bottomRight.x > this.canvasFrame.topLeft.x &&
                object.bound.bottomRight.x < this.canvasFrame.bottomRight.x)) &&
              ((object.bound.topLeft.y > this.canvasFrame.topLeft.y &&
                object.bound.topLeft.y < this.canvasFrame.bottomRight.y) ||
                (object.bound.bottomRight.y > this.canvasFrame.topLeft.y &&
                  object.bound.bottomRight.y <
                    this.canvasFrame.bottomRight.y))) ||
            (object.bound.topLeft.x < this.canvasFrame.topLeft.x &&
              object.bound.bottomRight.x > this.canvasFrame.bottomRight.x) ||
            (object.bound.topLeft.y < this.canvasFrame.topLeft.y &&
              object.bound.bottomRight.y > this.canvasFrame.bottomRight.y)
          ) {
            drawCount++;
            object.draw();
            object.drawn = true;
          }
        });
      });

      this.#drawCount = drawCount;

      this.clicks.forEach((click) => {
        this.drawArc(click.x, click.y);
      });

      if (this.showSin) {
        this.drawSin();
      }

      if (this.showCos) {
        this.drawCos();
      }

      this.#canvasFrame = this.getCanvasFrame();
      if (emitZoom) {
        this.zoomChange.emit(this.zoom);
      }

      this.resetContext();

      this.updateSvgBounds();
      this.updateUtils();
    });
    this.lastDrawTime = performance.now() - startTime;
    this.maxDrawTime =
      this.maxDrawTime < this.lastDrawTime
        ? this.lastDrawTime
        : this.maxDrawTime;
  }

  private resetContext(): void {
    this.ctx.lineWidth = EDITOR_DIMS.strokeWidth * (1 / this.zoom);
    this.ctx.lineCap = 'butt';
    this.ctx.lineJoin = 'miter';
    this.ctx.strokeStyle = EDITOR_COLORS.stroke;
    this.ctx.globalAlpha = 1;
  }

  private checkCanvasObjectIntersect(point: Point): {
    redraw: boolean;
    intercectedObjects: CPObject[];
  } {
    const startTime = performance.now();
    this.ctx.save();
    this.ctx.setTransform(1, 0, 0, 1, 0, 0);
    const intercectedObjects: CPCanvasObject[] = [];
    let redraw = false;
    Object.values(this.#layersCanvas).forEach((layer) => {
      layer.objects.forEach((object) => {
        if (!object.drawn) {
          return;
        }

        if (object.isPointInPath || object.isPointInStroke) {
          redraw = true;
        }

        const intersect = object.checkPointOn(point);
        if (intersect && !redraw) {
          redraw = true;
        }

        if (intersect) {
          intercectedObjects.push(object);
        }
      });
    });
    this.ctx.restore();

    this.lastCheckIntercectTIme = performance.now() - startTime;
    this.maxCheckIntercectTIme =
      this.maxCheckIntercectTIme < this.lastCheckIntercectTIme
        ? this.lastCheckIntercectTIme
        : this.maxCheckIntercectTIme;

    return { redraw, intercectedObjects };
  }

  private updateMarkers(): void {
    this.markersHasLinks = false;

    const update = (marker: CPMarkerDirective) => {
      const containerCoords = this.utils.getContainerCoordinates(
        marker.x,
        marker.y
      );
      marker.updatePosition(containerCoords);
    };

    this.markers?.forEach((marker) => {
      update(marker);
      if (marker.linkedMarkers && marker.linkedMarkers.length > 0) {
        this.markersHasLinks = true;
      }
    });

    this.editorMarker?.forEach(update);
  }

  private createMarkerLinks(): void {
    const alreadyProcced = new Set<number>();

    const layer = this.#layersCanvas[this.markersLayerId];

    const lines: CPCanvasPath[] = [];
    this.markers?.forEach((marker) => {
      if (marker.linkedMarkers && marker.linkedMarkers.length > 0) {
        alreadyProcced.add(marker.id);
        const linkedMarkers: CPMarkerDirective[] = [];
        marker.linkedMarkers.forEach((id) => {
          const linkedmarker = this.markers?.find((marker) => marker.id === id);
          if (linkedmarker) {
            if (alreadyProcced.has(linkedmarker.id)) {
              return;
            }

            alreadyProcced.add(linkedmarker.id);
            linkedMarkers.push(linkedmarker);
          }
        });

        linkedMarkers.forEach((linkedMarker) => {
          lines.push(
            new CPCanvasPath(this.ctx, [marker, linkedMarker], {
              ...this.markerLinksLineProperties,
              maintainRelativeWidth: this.maintainRelativeWidth,
              data: {
                point1: marker,
                point2: linkedMarker,
              },
            })
          );
        });
      }
    });

    if (layer) {
      layer.objects = lines;
    } else {
      this.#layersCanvas[this.markersLayerId] = {
        id: performance.now().toFixed(0),
        name: this.markersLayerId,
        opacity: 1,
        objects: lines,
      };
    }
  }

  private drawBackgroundImage(): void {
    if (!this.imageBackground) {
      return;
    }
    this.ctx.save();
    this.ctx.rotate((0 * Math.PI) / 180);
    this.ctx.drawImage(
      this.imageBackground,
      this.imageEntryPoint.x,
      this.imageEntryPoint.y
    );
    this.ctx.restore();
  }

  public focusToPoint(point: Point, padding?: [number, number]) {
    const frame = this.#canvasFrame;
    const hOffset = padding ? padding[1] : frame.width / 2;
    const vOffset = padding ? padding[0] : frame.height / 2;
    const bound: CPBound = {
      topLeft: { x: point.x - hOffset, y: point.y - vOffset },
      bottomRight: {
        x: point.x + hOffset,
        y: point.y + vOffset,
      },
      width: hOffset * 2,
      height: vOffset * 2,
    };

    this.fitBounds(bound);
  }

  public currentAnimation: number;

  public fitBounds(targetBound: CPBound, padding?: [number, number]) {
    let bound = { ...targetBound };
    if (padding) {
      bound = {
        topLeft: {
          x: targetBound.topLeft.x - padding[1],
          y: targetBound.topLeft.y - padding[0],
        },
        bottomRight: {
          x: targetBound.bottomRight.x + padding[1],
          y: targetBound.bottomRight.y + padding[0],
        },
        width: Math.abs(
          targetBound.bottomRight.x - targetBound.topLeft.x + padding[1] * 2
        ),
        height: Math.abs(
          targetBound.bottomRight.y - targetBound.topLeft.y + padding[0] * 2
        ),
      };
    }
    let transform = this.ctx.getTransform();

    const capturedZoom = this.#zoom;
    const { targetScale, targetTX, targetTY } = this.getTargetTransform(bound);

    const transformFunc = (zoom: number, tx: number, ty: number) => {
      transform.a = zoom;
      transform.d = zoom;

      this.ctx.setTransform(transform);

      transform = this.ctx.getTransform();

      this.#zoom = transform.a;
      this.#canvasFrame = this.getCanvasFrame();

      transform.e = tx;
      transform.f = ty;

      this.ctx.setTransform(transform);
      this.#zoom = transform.a;
      this.#canvasFrame = this.getCanvasFrame();
      this.redraw();
    };

    if (!this.disableAnimations) {
      let startTime: number = null;
      const duration = 175;

      const captureTX = transform.e;
      const captureTY = transform.f;
      const zoomOffset = targetScale - capturedZoom;
      const tXOffset = targetTX - captureTX;
      const tYOffset = targetTY - captureTY;

      if (this.currentAnimation) {
        cancelAnimationFrame(this.currentAnimation);
      }

      const animate = (time: number) => {
        if (!startTime) startTime = time;

        const timeFraction = parseFloat(
          duration < 250
            ? ((time - startTime) / duration).toFixed(1)
            : ((time - startTime) / duration).toFixed(2)
        );
        const inverseFraction = Math.abs(1 - timeFraction);

        transformFunc(
          capturedZoom + zoomOffset * timeFraction,
          captureTX + tXOffset * timeFraction,
          captureTY + tYOffset * timeFraction
        );

        if (timeFraction < 1) {
          this.currentAnimation = requestAnimationFrame(animate);
        }
      };

      this.currentAnimation = requestAnimationFrame(animate);
    } else {
      transformFunc(targetScale, targetTX, targetTY);
    }
  }

  private getTargetTransform(bound: CPBound): {
    targetScale: number;
    targetTX: number;
    targetTY: number;
  } {
    let transform = this.ctx.getTransform();
    const transformInv = this.ctx.getTransform().inverse();
    this.#canvasFrame = this.getCanvasFrame();

    const zoomX = this.#canvasFrame.width / bound.width;
    const zoomY = this.#canvasFrame.height / bound.height;
    const targetZoom = Math.min(zoomX, zoomY) / transformInv.a;

    transform.a = targetZoom;
    transform.d = targetZoom;

    this.ctx.setTransform(transform);

    transform = this.ctx.getTransform();
    this.#zoom = transform.a;
    this.#canvasFrame = this.getCanvasFrame();

    let xDiff = bound.width - this.#canvasFrame.width;
    let yDiff = bound.height - this.#canvasFrame.height;

    const xTranslate =
      Math.abs(xDiff) > Math.abs(bound.topLeft.x)
        ? bound.topLeft.x * -1 * this.#zoom +
          Math.abs(xDiff / 2) / (1 / transform.a)
        : Math.abs(xDiff) - bound.topLeft.x * this.#zoom;

    const yTranslate =
      Math.abs(yDiff) > Math.abs(bound.topLeft.y)
        ? bound.topLeft.y * -1 * this.#zoom +
          Math.abs(yDiff / 2) / (1 / transform.a)
        : Math.abs(yDiff / 2) / (1 / transform.a) -
          bound.topLeft.y * this.#zoom;

    transform.e = xTranslate;
    transform.f = yTranslate;

    this.ctx.setTransform(transform);

    const { a, e, f } = this.ctx.getTransform();

    return {
      targetScale: a,
      targetTX: e,
      targetTY: f,
    };
  }

  private holdToBound(bound: CPBound, forceZoomCheck?: boolean): void {
    if (!bound) {
      return;
    }
    let transform = this.ctx.getTransform();
    const transformInv = this.ctx.getTransform().inverse();

    const zoomX = this.#canvasFrame.width / bound.width;
    const zoomY = this.#canvasFrame.height / bound.height;
    const minZoom = Math.min(zoomX, zoomY) / transformInv.a;

    let xDiff = bound.width - this.#canvasFrame.width;
    let yDiff = bound.height - this.#canvasFrame.height;

    const minTranslateX =
      xDiff > 0 ? bound.topLeft.x : bound.topLeft.x + xDiff / 2;
    const minTranslateY =
      yDiff > 0 ? bound.topLeft.y : bound.topLeft.y + yDiff / 2;

    const maxTranslateX =
      xDiff > 0 ? bound.bottomRight.x - this.#canvasFrame.width : minTranslateX;

    const maxTranslateY =
      yDiff > 0
        ? bound.bottomRight.y - this.#canvasFrame.height
        : minTranslateY;

    if (forceZoomCheck || this.zoom < minZoom) {
      const { targetScale, targetTX, targetTY } =
        this.getTargetTransform(bound);
      transform.a = targetScale;
      transform.d = targetScale;
      transform.e = targetTX;
      transform.f = targetTY;
    } else if (this.zoom > minZoom) {
      if (this.zoom > minZoom && transformInv.e < minTranslateX) {
        transform.e = minTranslateX * transform.a * -1;
      }
      if (this.zoom > minZoom && transformInv.e > maxTranslateX) {
        transform.e = maxTranslateX * transform.a * -1;
      }
      if (this.zoom > minZoom && transformInv.f < minTranslateY) {
        transform.f = minTranslateY * transform.a * -1;
      }
      if (this.zoom > minZoom && transformInv.f > maxTranslateY) {
        transform.f = maxTranslateY * transform.a * -1;
      }
    }

    this.ctx.setTransform(transform);
    this.#zoom = transform.a;
    this.#canvasFrame = this.getCanvasFrame();
  }

  private handleCanvasClick(evt: MouseEvent) {
    const canvasCoords = this.utils.getCanvasCoordinates(
      evt.clientX,
      evt.clientY
    );
    this.clicks.push(canvasCoords);
    this.drawArc(canvasCoords.x, canvasCoords.y);
  }

  private getCanvasFrame(): CPBound {
    const bounds = this.utils.getCanvasContainerBounds();
    const topLeft = this.utils.getCanvasCoordinates(bounds.x, bounds.y);
    const bottomRight = this.utils.getCanvasCoordinates(
      bounds.right,
      bounds.bottom
    );
    return {
      topLeft,
      bottomRight,
      width: Math.abs(bottomRight.x - topLeft.x),
      height: Math.abs(bottomRight.y - topLeft.y),
    };
  }

  public handlePathClick(): void {
    console.log('path');
  }

  public handleEditorMarkerUpdate(position: Point, object: CPObject): void {
    if (object && object.pivot) {
      object.pivot.world.x = position.x;
      object.pivot.world.y = position.y;
    }
  }

  private drawArc(x: number, y: number) {
    const r = 0;
    const e1 = 200;
    const e2 = 150;
    this.ctx.save();
    this.ctx.beginPath();
    this.ctx.moveTo(x + r + 0, y);
    this.ctx.arcTo(x + e1, y, x + e1, y + e2, r + 4);
    this.ctx.arcTo(x + e1, y + e2, x, y + e2, r + 8);
    this.ctx.arcTo(x, y + e2, x, y, r);
    this.ctx.arcTo(x, y, x + e1, y, r + 0);
    this.ctx.closePath();
    this.ctx.stroke();
    this.ctx.restore();
  }

  private drawRect(x: number, y: number): void {
    this.ctx.save();
    this.ctx.rect(x, y, 50, 50);
    this.ctx.stroke();
    this.ctx.restore();
  }

  private drawSin(): void {
    let x = 0;
    const startPoint: [number, number] = [100, 100];
    this.ctx.save();
    this.ctx.beginPath();
    this.ctx.moveTo(...startPoint);
    while (x <= 720) {
      this.ctx.lineTo(
        // startPoint[0] + Math.cos((-x / 180) * Math.PI) * 90,
        startPoint[0] + x * 2,
        startPoint[1] + Math.sin((-x / 180) * Math.PI) * 45 * 2
      );
      x++;
    }
    this.ctx.stroke();
    this.ctx.restore();
  }

  private drawCos(): void {
    let x = 0;
    const startPoint: [number, number] = [100, 300];
    this.ctx.save();
    this.ctx.beginPath();
    this.ctx.moveTo(...startPoint);
    while (x <= 720) {
      this.ctx.lineTo(
        // startPoint[0] + Math.cos((-x / 180) * Math.PI) * 90,
        startPoint[0] + x * 2,
        startPoint[1] + Math.cos((-x / 180) * Math.PI) * 45 * 2
      );
      x++;
    }
    this.ctx.stroke();
    this.ctx.restore();
  }

  private drawOriginLines(): void {
    const frame = this.getCanvasFrame();
    const scale = this.ctx.getTransform().inverse().a;
    // X

    this.ctx.beginPath();
    this.ctx.lineWidth = 2 * scale * devicePixelRatio;
    this.ctx.moveTo(frame.topLeft.x, 0);
    this.ctx.lineTo(frame.bottomRight.x, 0);
    this.ctx.strokeStyle = '#d60100';
    this.ctx.stroke();

    // Y
    this.ctx.beginPath();
    this.ctx.moveTo(0, frame.topLeft.y);
    this.ctx.lineTo(0, frame.bottomRight.y);
    this.ctx.strokeStyle = '#46b145';
    this.ctx.stroke();
  }
}
