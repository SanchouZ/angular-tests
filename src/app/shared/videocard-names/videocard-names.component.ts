import { Component, Inject, OnInit, ViewEncapsulation } from '@angular/core';
import { TEST_INJECTOR } from '../directives/injector-test/injector-test.directive';
import { VideoCards } from '../providers/videocards.provider';

@Component({
  selector: 'app-videocard-names',
  templateUrl: './videocard-names.component.html',
  styleUrls: ['./videocard--names.component.css'],
  encapsulation: ViewEncapsulation.ShadowDom,
  providers: [{ provide: VideoCards, useClass: VideoCards }],
})
export class VideocardsNamesComponent implements OnInit {
  public videocardsList: string[] = [];

  constructor(
    private videocards: VideoCards,
  ) {}

  ngOnInit(): void {
    this.videocardsList = this.videocards.cards;
  }
}
