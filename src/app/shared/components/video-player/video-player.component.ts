import {
  Component,
  ElementRef,
  OnInit,
  TemplateRef,
  ViewChild,
} from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable, of } from 'rxjs';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-video-player',
  templateUrl: './video-player.component.html',
  styleUrls: ['./video-player.component.css'],
})
export class VideoPlayerComponent implements OnInit {
  @ViewChild('video', { static: true }) video: ElementRef<HTMLVideoElement>;

  public link: string =
    'http://localhost:7009/media-static/Big_Buck_Bunny_1080_10s_30MB.mp4';

  public mediaLink: SafeResourceUrl = '';

  constructor(private http: HttpClient, private sanitizer: DomSanitizer) {}

  ngOnInit(): void {
    this.getMediaStream().subscribe();

    this.video.nativeElement.addEventListener('play', (evt) => {
      console.log(evt);
    });

    this.video.nativeElement.addEventListener('seeking', (evt) => {
      console.log(evt);
    });

    this.video.nativeElement.addEventListener('timeupdate', (evt) => {
      console.log('timeupdated');
      console.log(evt);
    });
  }

  getMediaStream(): Observable<SafeResourceUrl> {
    return this.http
      .get('http://localhost:7009/media', {
        headers: {
          token: '12542135',
        },
        responseType: 'blob',
      })
      .pipe(
        map((buff) => {
          this.mediaLink = this.sanitizer.bypassSecurityTrustResourceUrl(
            URL.createObjectURL(buff)
          );
          console.log(this.mediaLink);
          return this.mediaLink;
        })
      );

    // return of(URL.createObjectURL(this.link));
  }
}
