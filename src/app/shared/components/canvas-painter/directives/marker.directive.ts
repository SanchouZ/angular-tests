import { Directive, Input, Renderer2, OnInit, ElementRef } from '@angular/core';
import { CPMarkerOptions, Point } from '../models/editor.model';

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

  /**
   * Container Y coordinate
   */
  private cx: number;

  /**
   * Container Y coordinate
   */
  private cy: number;

  constructor(private el: ElementRef, private renderer: Renderer2) {}

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
