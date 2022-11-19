import {
  AfterViewInit,
  Component,
  ComponentRef,
  ContentChild,
  ElementRef,
  HostListener,
  Inject,
  OnInit,
  Renderer2,
  Type,
  ViewChild,
} from '@angular/core';
import { MatButtonToggleChange } from '@angular/material/button-toggle';
import { MatSliderChange } from '@angular/material/slider';
import {
  BehaviorSubject,
  delayWhen,
  filter,
  interval,
  of,
  tap,
  withLatestFrom,
} from 'rxjs';
import { CanvasPainterComponent } from './shared/components/canvas-painter/canvas-painter.component';
import {
  CPClickEvent,
  CPMarkerOptions,
} from './shared/components/canvas-painter/models/editor.model';
import { VideocardsNamesComponent } from './shared/videocard-names/videocard-names.component';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit, AfterViewInit {
  @ViewChild('canvas', { static: true }) canvas: ElementRef<HTMLCanvasElement>;

  title = 'car-watcher';

  public component: Type<VideocardsNamesComponent> = VideocardsNamesComponent;

  private test$ = new BehaviorSubject<number[]>([]);

  public imageToDraw$ = new BehaviorSubject<HTMLImageElement>(null);

  public imageURL$ = new BehaviorSubject<string>(null);

  public zoom: number = 1;

  // public images: string[] = ['/assets/images/1.png', '/assets/images/2.jpg'];
  public images: string[] = [
    'https://picsum.photos/seed/fullhd2/1920/1080',
    'https://picsum.photos/seed/rect2/1000/800',
    'https://picsum.photos/seed/square2/2000/2000',
  ];
  public currentImageIndex = 1;

  public isMarkersAddMode = false;
  public markerOptions: CPMarkerOptions = {
    offsetX: -20,
    offsetY: -20,
  };
  public markers = [
    {
      id: 0,
      x: 0,
      y: 0,
      value: '1',
      links: [1],
    },
    {
      id: 1,
      x: 100,
      y: 0,
      value: '2',
      links: [0, 2, 3],
    },
    {
      id: 2,
      x: 127,
      y: 351,
      value: '2',
      links: [1],
    },
    {
      id: 3,
      x: -57,
      y: 420,
      value: '3',
      links: [],
    },
  ];

  constructor(private renderer: Renderer2) {}

  ngOnInit(): void {
    console.log(
      Math.sin((30 / 180) * Math.PI),
      Math.cos((30 / 180) * Math.PI),
      Math.sin((-30 / 180) * Math.PI)
    );

    console.log(Math.asinh(Math.sin(30 / 180) * Math.PI));

    console.log(Math.asinh(Math.sin(30 / 180) * Math.PI) * (180 / Math.PI));
  }

  ngAfterViewInit(): void {
    this.loadImage();
  }

  public loadImage() {
    // const img = new Image();
    // img.src = '/assets/images/1.png';
    // img.onload = () => {
    //   this.imageToDraw$.next(img);
    // };

    this.imageURL$.next(this.images[this.currentImageIndex]);
  }

  public changeImage(evt: MatButtonToggleChange) {
    console.log(evt);
    this.imageURL$.next(this.images[evt.value]);
  }

  public onCanvasReady(canvas: CanvasPainterComponent) {}

  onChangeZoom(zoom: number): void {
    this.zoom = zoom;
  }

  handleCanvasClick(event: CPClickEvent) {
    if (this.isMarkersAddMode) {
      this.markers[this.markers.length - 1].links.push(this.markers.length);
      this.markers.push({
        id: this.markers.length,
        x: event.canvasCoordinates.x,
        y: event.canvasCoordinates.y,
        value: this.markers.length.toString(),
        links: [this.markers.length - 1],
      });
    }
  }
}