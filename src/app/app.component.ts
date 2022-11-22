import { NONE_TYPE } from '@angular/compiler';
import {
  AfterViewInit,
  Component,
  ElementRef,
  OnInit,
  Renderer2,
  Type,
  ViewChild,
} from '@angular/core';
import { MatButtonToggleChange } from '@angular/material/button-toggle';
import { MatSliderChange } from '@angular/material/slider';
import { BehaviorSubject } from 'rxjs';
import { CanvasPainterComponent } from './shared/components/canvas-painter/canvas-painter.component';
import { CPSVGPath } from './shared/components/canvas-painter/directives/svg-path.directive';
import {
  CPClickEvent,
  CPMarkerProperties,
  CPPathProperties,
  CPSVGLayer,
  CPSVGLayers,
  Point,
} from './shared/components/canvas-painter/models/editor.model';
import { CPSVGObject } from './shared/components/canvas-painter/objects/svg/object.model';
import { CPPath } from './shared/components/canvas-painter/objects/svg/path.model';
import { VideocardsNamesComponent } from './shared/videocard-names/videocard-names.component';

interface Marker {
  id: number;
  x: number;
  y: number;
  value: string;
  links: number[];
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit, AfterViewInit {
  @ViewChild('canvas', { static: true }) canvas: ElementRef<HTMLCanvasElement>;

  title = 'car-watcher';

  public component: Type<VideocardsNamesComponent> = VideocardsNamesComponent;

  public loading = false;

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
  public markerOptions: CPMarkerProperties = {
    offsetX: -20,
    offsetY: -20,
    editable: true,
  };
  public markers: Marker[] = [
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

  public pathOptions: CPPathProperties = {
    strokeColor: '#ff131266',
    hoverStrokeColor: 'green',
    strokeWidth: 6,
    hoverStrokeWidth: 12,
    strokeLineCap: 'round',
    strokeLinejoin: 'round',
    maintainRelativeWidth: false,
  };

  public pathOptionsTest: CPPathProperties = {
    strokeColor: '#2f61a066',
    hoverStrokeColor: 'green',
    strokeWidth: 6,
    hoverStrokeWidth: 12,
    strokeLineCap: 'round',
    strokeLinejoin: 'round',
    maintainRelativeWidth: false,
    clickCalback: this.pathClick,
    data: 'data'
  };

  public svgLayers: CPSVGLayers = {
    test: {
      id: 'test',
      name: 'test',
      opacity: 1,
      objects: [
        new CPPath(
          [
            [400, 400],
            [620, 420],
            [510, 450],
          ],
          this.pathOptionsTest
        ),
      ],
    },
  };

  public svgLayer: CPSVGLayer = {
    id: 'test1',
    name: 'test1',
    opacity: 1,
    objects: [
      new CPPath(
        [
          [400, 700],
          [620, 720],
          [510, 750],
        ],
        this.pathOptionsTest
      ),
    ],
  };

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

  public handleCanvasLoading(state: boolean): void {
    this.loading = state;
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
    this.imageURL$.next(this.images[evt.value]);
  }

  public onCanvasReady(canvas: CanvasPainterComponent) {
    const layer = this.svgLayer;
    // canvas.addSVGLayer(this.svgLayer);

    setTimeout(() => {
      // console.log('remove layer');
      // canvas.removeSVGLayer('test1');
      this.svgLayers = {
        ...this.svgLayers,
        layer,
      };
      console.log(this.svgLayers);
    }, 5000);
  }

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

  handleMarkerClick(): void {}

  pathClick(evt: CPClickEvent, data: any): void {
    console.log('path click');
    console.log(evt);
    console.log(data);
  }

  handleMarkerPositionUdpdate(position: Point, marker: Marker) {
    marker.x = position.x;
    marker.y = position.y;
  }
}
