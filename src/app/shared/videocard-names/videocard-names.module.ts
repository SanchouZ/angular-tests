import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { VideocardsNamesComponent } from './videocard-names.component';
import { VideoCards } from '../providers/videocards.provider';


@NgModule({
  declarations: [VideocardsNamesComponent],
  imports: [CommonModule],
  exports: [VideocardsNamesComponent],
  providers: [{ provide: VideoCards, useClass: VideoCards }],
})
export class VideocardsNamesModule {}
