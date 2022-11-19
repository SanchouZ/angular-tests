import {
  Component,
  ElementRef,
  OnInit,
  ViewChild,
  HostListener,
  AfterViewInit,
  Renderer2,
  Output,
  EventEmitter,
  OnDestroy,
  Input,
  ContentChildren,
  QueryList,
} from '@angular/core';

import { Subscription, fromEvent } from 'rxjs';
import { tap, debounceTime } from 'rxjs/operators';
import { CPMarker } from './directives/marker.directive';
import { CPBound, CPClickEvent, CPLayer, Point } from './models/editor.model';
import { CPLine } from './objects/line.mode';

@Component({
  selector: 'app-canvas-painter',
  templateUrl: './canvas-painter.component.html',
  styleUrls: ['./canvas-painter.component.scss'],
})
export class CanvasPainterComponent
  implements OnInit, AfterViewInit, OnDestroy
{
  @ViewChild('canvas', { static: true }) canvas: ElementRef<HTMLCanvasElement>;
  @ViewChild('canvasContainer', { static: true })
  canvasContainer: ElementRef<HTMLElement>;

  private ctx: CanvasRenderingContext2D;

  @Input() set zoom(zoomLevel: number) {
    if (this.ctx && zoomLevel > 0 && zoomLevel !== this.zoom) {
      const currentZoom = this.ctx.getTransform().a;
      const container = this.getCanvasContainerBounds();
      const centerPoint = this.getCanvasCoordinates(
        container.x + container.width / 2,
        container.y + container.height / 2
      );

      const zoom = currentZoom < zoomLevel ? 1.1 : 0.9;

      this.ctx.translate(centerPoint.x, centerPoint.y);
      this.ctx.scale(zoom, zoom);
      this.ctx.translate(-centerPoint.x, -centerPoint.y);

      const { a } = this.ctx.getTransform();
      this.#zoom = a;

      this.redraw(false, false);
    }
  }

  @Input() centerOrigin = false;
  @Input() showOriginLines = true;
  @Input() showDebugPanel = false;
  @Input() maintainRelativeWidth = false;

  @Input() set layers(layers: CPLayer[]) {
    if (layers) {
      this.#layers = layers;
    }
  }

  @Input() set bgImage(img: HTMLImageElement) {
    this.imageBackground = img;
    this.redraw();
  }

  @Input() set bgImageByURL(url: string) {
    if (!url) {
      return;
    }

    const img = new Image();
    img.src = url;
    img.setAttribute('crossOrigin', '');
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
    };
  }

  @Input() holdZoomToImage = false;

  @Output() private canvasClick = new EventEmitter<CPClickEvent>();
  @Output() private zoomChange = new EventEmitter<number>();
  @Output() private canvasReady = new EventEmitter<CanvasPainterComponent>();

  @ContentChildren(CPMarker) markers: QueryList<CPMarker>;

  @HostListener('window:resize', ['$event'])
  private handleResize(event: Event) {
    const { a, b, c, d, e, f } = this.ctx.getTransform();
    this.updateCanvasBounds();
    this.ctx.setTransform(a, b, c, d, e, f);
    this.redraw();
  }

  @HostListener('window:wheel', ['$event'])
  private handleWheel(event: WheelEvent) {
    this.#canvasCoords = this.getCanvasCoordinates(
      event.clientX,
      event.clientY
    );

    const zoom = event.deltaY < 0 ? 1.1 : 0.9;

    this.ctx.translate(this.#canvasCoords.x, this.#canvasCoords.y);
    this.ctx.scale(zoom, zoom);
    this.ctx.translate(-this.#canvasCoords.x, -this.#canvasCoords.y);

    const { a } = this.ctx.getTransform();
    this.#zoom = a;

    this.redraw();
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

      const container = this.getCanvasContainerBounds();
      const centerPoint = this.getCanvasCoordinates(
        container.x + container.width / 2,
        container.y + container.height / 2
      );
      console.log(container);
      console.log(centerPoint);
    }
  }

  private imageEntryPoint: Point = { x: 0, y: 0 };
  private clicks: Point[] = [];
  private showSin = false;
  private showCos = false;

  private imageBackground: HTMLImageElement;

  private moveStart: Point = { x: 0, y: 0 };
  private moveActive = false;

  #layers: CPLayer[] = [];
  #canvasCoords: Point = { x: 0, y: 0 };
  #screenCoords: Point = { x: 0, y: 0 };
  #movementVector: Point = { x: 0, y: 0 };
  #canvasFrame: CPBound;
  #holdBound: CPBound;
  #zoom: number;

  private sub = new Subscription();

  constructor(private renderer: Renderer2) {}

  ngOnInit(): void {
    this.ctx = this.canvas.nativeElement.getContext('2d')!;

    const bounds = this.canvasContainer.nativeElement.getBoundingClientRect();
    this.updateCanvasBounds();

    if (this.centerOrigin) {
      this.ctx.translate(bounds.width / 2, bounds.height / 2);
    }

    this.#zoom = this.ctx.getTransform().a;

    this.redraw();

    this.renderer.listen(
      this.canvas.nativeElement,
      'click',
      (evt: MouseEvent) => {
        const canvasPoint = this.getCanvasCoordinates(evt.clientX, evt.clientY);

        this.canvasClick.emit({
          zoom: this.zoom,
          canvasCoordinates: canvasPoint,
          containerCoordinates: this.getContainerCoordinates(
            canvasPoint.x,
            canvasPoint.y
          ),
          bounds: this.getCanvasContainerBounds(),
          frame: this.getCanvasFrame(),
        });
      }
    );

    this.renderer.listen(
      this.canvas.nativeElement,
      'mousedown',
      (evt: MouseEvent) => {
        // if (evt.button === 1) {
        //   this.moveStart = this.getCanvasCoordinates(evt.clientX, evt.clientY);
        //   this.moveActive = true;
        // }
        this.moveStart = this.getCanvasCoordinates(evt.clientX, evt.clientY);
        this.moveActive = true;
      }
    );

    this.renderer.listen(
      this.canvas.nativeElement,
      'mouseup',
      (evt: MouseEvent) => {
        this.moveActive = false;
      }
    );

    this.renderer.listen(
      this.canvas.nativeElement,
      'mouseleave',
      (evt: MouseEvent) => {
        this.moveActive = false;
      }
    );

    this.renderer.listen(
      this.canvas.nativeElement,
      'mousemove',
      (evt: MouseEvent) => {
        const coords = this.getCanvasCoordinates(evt.clientX, evt.clientY);
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

          this.redraw();
        }
      }
    );

    // this.renderer.listen(
    //   this.canvas.nativeElement,
    //   'wheel',
    //   (evt: WheelEvent) => {
    //     this.#canvasCoords = this.getCanvasCoordinates(
    //       evt.clientX,
    //       evt.clientY
    //     );

    //     const zoom = evt.deltaY < 0 ? 1.1 : 0.9;

    //     this.ctx.translate(this.#canvasCoords.x, this.#canvasCoords.y);
    //     this.ctx.scale(zoom, zoom);
    //     this.ctx.translate(-this.#canvasCoords.x, -this.#canvasCoords.y);

    //     const { a } = this.ctx.getTransform();
    //     this.#zoom = a;

    //     this.redraw();
    //   }
    // );

    this.canvasReady.emit(this);
  }

  ngAfterViewInit(): void {
    this.sub.add(
      this.markers.changes.pipe(tap(() => this.redraw())).subscribe()
    );
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
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

  public get zoom(): number {
    return this.#zoom;
  }

  private updateCanvasBounds(): void {
    const bounds = this.canvasContainer.nativeElement.getBoundingClientRect();
    const aspectRatio = bounds.height / bounds.width;

    let width = (bounds.height / aspectRatio) * devicePixelRatio;
    let height = bounds.height * devicePixelRatio;

    this.renderer.setAttribute(this.canvas.nativeElement, 'width', `${width}`);

    this.renderer.setAttribute(
      this.canvas.nativeElement,
      'height',
      `${height}`
    );
  }

  private redraw(
    forceZoomCheck: boolean = false,
    emitZoom: boolean = true
  ): void {
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

    this.#layers.forEach((layer) => {
      layer.objects.forEach((object) => object.draw());
    });

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
      this.zoomChange.emit(this.#zoom);
    }
  }

  private updateMarkers(): void {
    let hasLinks = false;
    this.markers?.forEach((marker) => {
      const containerCoords = this.getContainerCoordinates(marker.x, marker.y);
      marker.updatePosition(containerCoords);
      if (marker.linkedMarkers && marker.linkedMarkers.length > 0) {
        hasLinks = true;
      }
    });

    if (hasLinks) {
      this.createMarkerLinks('markers', true);
    }
  }

  private createMarkerLinks(
    layerName: string,
    maintainRelativeWidth?: boolean
  ): void {
    const alreadyProcced = new Set<number>();

    const lines: CPLine[] = [];
    this.markers?.forEach((marker) => {
      if (marker.linkedMarkers && marker.linkedMarkers.length > 0) {
        alreadyProcced.add(marker.id);
        const linkedMarkers: CPMarker[] = [];
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
            new CPLine(
              this.ctx,
              [
                { x: marker.x, y: marker.y },
                { x: linkedMarker.x, y: linkedMarker.y },
              ],
              {
                maintainRelativeWidth:
                  maintainRelativeWidth ?? this.maintainRelativeWidth,
              }
            )
          );
        });
      }
    });

    const layer = this.#layers.find((layer) => layer.name === layerName);
    if (layer) {
      layer.objects = lines;
    } else {
      this.#layers.push({
        id: performance.now().toFixed(0),
        name: layerName,
        opacity: 1,
        objects: lines,
      });
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

  private holdToBound(bound: CPBound, forceZoomCheck?: boolean): void {
    if (!bound) {
      return;
    }
    let transform = this.ctx.getTransform();
    let transformInv = this.ctx.getTransform().inverse();

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

    console.log(
      'image: ',
      this.imageBackground.width,
      'x',
      this.imageBackground.height
    );

    if (forceZoomCheck || this.zoom < minZoom) {
      transform.a = minZoom;
      transform.d = minZoom;

      this.ctx.setTransform(transform);

      transform = this.ctx.getTransform();
      this.#zoom = transform.a;
      this.#canvasFrame = this.getCanvasFrame();

      xDiff = bound.width - this.#canvasFrame.width;
      yDiff = bound.height - this.#canvasFrame.height;

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

  private holdImageInViewPort(): void {
    if (this.imageBackground && this.holdZoomToImage) {
      let transform = this.ctx.getTransform();
      let transformInv = this.ctx.getTransform().inverse();

      const zoomX = this.#canvasFrame.width / this.imageBackground.width;
      const zoomY = this.#canvasFrame.height / this.imageBackground.height;
      const minZoom = Math.min(zoomX, zoomY) / transformInv.a;

      let xDiff = this.imageBackground.width - this.#canvasFrame.width;
      let yDiff = this.imageBackground.height - this.#canvasFrame.height;

      const minTranslateX = xDiff > 0 ? -10 : xDiff / 2;
      const minTranslateY = yDiff > 0 ? -10 : yDiff / 2;

      const maxTranslateX =
        xDiff > 0
          ? this.imageBackground.width - this.#canvasFrame.width + 10
          : minTranslateX;
      const maxTranslateY =
        yDiff > 0
          ? this.imageBackground.height - this.#canvasFrame.height + 10
          : minTranslateY;

      console.log(
        'image: ',
        this.imageBackground.width,
        'x',
        this.imageBackground.height
      );
      console.log(
        'frame: ',
        this.#canvasFrame.width,
        'x',
        this.#canvasFrame.height
      );
      console.log('Transform: ', transform.a, transform.e, transform.f);
      console.log(
        'TransformInv: ',
        transformInv.a,
        transformInv.e,
        transformInv.f
      );

      console.log('Min zoom: ', minZoom);
      console.log('Min TranslateX: ', minTranslateX);
      console.log('Min TranslateY: ', minTranslateY);
      console.log('Max TranslateX: ', maxTranslateX);
      console.log('Max TranslateY: ', maxTranslateY);
      console.log('Max TranslateX: ', maxTranslateX * transform.a * -1);
      console.log('Max TranslateY: ', maxTranslateY * transform.a * -1);

      if (this.zoom < minZoom) {
        console.log('zoom correct');
        console.log(xDiff, yDiff);
        transform.a = minZoom;
        transform.d = minZoom;

        this.ctx.setTransform(transform);

        transform = this.ctx.getTransform();
        this.#zoom = transform.a;
        this.#canvasFrame = this.getCanvasFrame();

        xDiff = this.imageBackground.width - this.#canvasFrame.width;
        yDiff = this.imageBackground.height - this.#canvasFrame.height;

        console.log(xDiff, yDiff);
        transform.e = Math.abs(xDiff);
        transform.f = Math.abs(yDiff / 2) / (1 / transform.a);

        console.log(transform);
      } else if (this.zoom > minZoom) {
        console.log('trans correct');
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
      // const { a, b, c, d, e, f } = this.ctx.getTransform();
      // console.log(a, b, c, d, e, f);
    }
  }

  private handleCanvasClick(evt: MouseEvent) {
    const canvasCoords = this.getCanvasCoordinates(evt.clientX, evt.clientY);
    this.clicks.push(canvasCoords);
    this.drawArc(canvasCoords.x, canvasCoords.y);
  }

  /**
   * Takes screen (event.screenX & event.screenY) coordinates and returns canvas coordinate
   * @param x screen X
   * @param y screen Y
   * @returns
   */
  private getCanvasCoordinates(x: number, y: number): { x: number; y: number } {
    const { a, b, c, d, e, f } = this.ctx.getTransform().invertSelf();

    const bounds = this.getCanvasContainerBounds();
    const offsetX = (x - bounds.x) * devicePixelRatio;
    const offsetY = (y - bounds.y) * devicePixelRatio;

    return {
      x: a * offsetX + c * offsetY + e,
      y: b * offsetX + d * offsetY + f,
    };
  }

  /**
   * Takes canvas container (or event.offsetX & event.offsetY) coordinates and returns canvas coordinate
   * @param x screen X
   * @param y screen Y
   * @returns
   */
  public getCanvasCoordinatesCont(x: number, y: number): Point {
    const { a, b, c, d, e, f } = this.ctx.getTransform().invertSelf();

    const offsetX = x * devicePixelRatio;
    const offsetY = y * devicePixelRatio;

    return {
      x: a * offsetX + c * offsetY + e,
      y: b * offsetX + d * offsetY + f,
    };
  }

  /**
   * Takes canvas coordinates and returns canvas container coordinates
   * @param x screen X
   * @param y screen Y
   * @returns
   */
  public getContainerCoordinates(x: number, y: number): Point {
    const { a, b, c, d, e, f } = this.ctx.getTransform();

    const offsetX = x;
    const offsetY = y;

    const cx = (a * offsetX + c * offsetY + e) * (1 / devicePixelRatio);
    const cy = (b * offsetX + d * offsetY + f) * (1 / devicePixelRatio);

    return {
      x: cx,
      y: cy,
    };
  }

  private getCanvasFrame(): CPBound {
    const bounds = this.getCanvasContainerBounds();
    const topLeft = this.getCanvasCoordinates(bounds.x, bounds.y);
    const bottomRight = this.getCanvasCoordinates(bounds.right, bounds.bottom);
    return {
      topLeft,
      bottomRight,
      width: Math.abs(bottomRight.x - topLeft.x),
      height: Math.abs(bottomRight.y - topLeft.y),
    };
  }

  private getCanvasContainerBounds(): DOMRect {
    return this.canvasContainer.nativeElement.getBoundingClientRect();
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
    this.ctx.save();
    this.ctx.beginPath();
    this.ctx.lineWidth = 2 * scale * devicePixelRatio;
    this.ctx.moveTo(frame.topLeft.x, 0);
    this.ctx.lineTo(frame.bottomRight.x, 0);
    this.ctx.strokeStyle = '#d60100';
    this.ctx.stroke();
    this.ctx.save();
    this.ctx.restore();
    // Y
    this.ctx.beginPath();
    this.ctx.moveTo(0, frame.topLeft.y);
    this.ctx.lineTo(0, frame.bottomRight.y);
    this.ctx.strokeStyle = '#46b145';
    this.ctx.stroke();
    this.ctx.restore();
  }
}
