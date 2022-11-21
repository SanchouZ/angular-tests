import {
  Directive,
  Input,
  Output,
  Renderer2,
  OnInit,
  ElementRef,
  HostListener,
  EventEmitter,
} from '@angular/core';
import { CPMarkerOptions, Point } from '../models/editor.model';
import { CanvasPainterUtilsService } from '../services/canvas-painter-utils.service';

@Directive({
  selector: '[cpMarker]',
})
export class CPMarker implements OnInit {
  @Input() id: number;

  /**
   * Canvas X coordinate
   */
  @Input() x: number;

  /**
   * Canvas Y coordinate
   */
  @Input() y: number;

  /**
   * IDs of linked markers
   */
  @Input() linkedMarkers: number[];
  @Input() options: CPMarkerOptions;

  @Output() positionUpdated = new EventEmitter<Point>();

  /**
   * Container Y coordinate
   */
  private cx: number;

  /**
   * Container Y coordinate
   */
  private cy: number;

  private moveActive = false;
  private capturedMarkerCoords: Point = { x: 0, y: 0 };
  private capturedCanvasCoords: Point = { x: 0, y: 0 };

  @HostListener('click', ['$event'])
  private handleClick(evt: MouseEvent) {
    evt.stopPropagation();
  }

  @HostListener('mousedown', ['$event'])
  private handleMouseDown(evt: MouseEvent) {
    evt.stopPropagation();
    if (this.options?.editable) {
      this.moveActive = true;
      this.capturedCanvasCoords.x = this.utils.canvasCoordinates.x;
      this.capturedCanvasCoords.y = this.utils.canvasCoordinates.y;
      this.capturedMarkerCoords.x = this.x;
      this.capturedMarkerCoords.y = this.y;
    }
  }

  @HostListener('mouseup', ['$event'])
  private handleMouseUp(evt: MouseEvent) {
    evt.stopPropagation();
    if (this.options?.editable) {
      this.moveActive = false;
    }
  }

  @HostListener('mouseleave', ['$event'])
  private handleMouseLeave(evt: MouseEvent) {
    evt.stopPropagation();
    if (this.options?.editable) {
      this.moveActive = false;
    }
  }

  @HostListener('mousemove', ['$event'])
  private handleMouseMove(evt: MouseEvent) {
    if (this.options?.editable && this.moveActive) {
      const currentCanvasCoords = this.utils.canvasCoordinates;

      const tX = this.capturedCanvasCoords.x - currentCanvasCoords.x;
      const tY = this.capturedCanvasCoords.y - currentCanvasCoords.y;

      this.x = this.capturedMarkerCoords.x - tX;
      this.y = this.capturedMarkerCoords.y - tY;

      const newMarkerContainerCoords = this.utils.getContainerCoordinates(
        this.x,
        this.y
      );

      this.updatePosition(newMarkerContainerCoords);

      this.positionUpdated.emit({
        x: this.x,
        y: this.y,
      });

      this.utils.redraw();
    }
  }

  constructor(
    private el: ElementRef<HTMLElement>,
    private renderer: Renderer2,
    private utils: CanvasPainterUtilsService,
  ) {}

  ngOnInit(): void {
    this.renderer.setStyle(this.el.nativeElement, 'position', 'absolute');
  }

  /**
   * Update position of marker in the container
   * @param coords Container Point (coordinates)
   */
  public updatePosition(coords: Point): void {
    this.cx = coords.x + (this.options?.offsetX ?? 0);
    this.cy = coords.y + (this.options?.offsetX ?? 0);

    this.renderer.setStyle(this.el.nativeElement, 'top', `${this.cy}px`);
    this.renderer.setStyle(this.el.nativeElement, 'left', `${this.cx}px`);
  }
}
