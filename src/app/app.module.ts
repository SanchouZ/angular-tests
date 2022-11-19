import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';

import { AppComponent } from './app.component';
import { VideocardsNamesModule } from './shared/videocard-names/videocard-names.module';
import { InjectorTestModule } from './shared/directives/injector-test/injector-test.module';
import { LoopModule } from './shared/directives/loop/loop.module';
import { OutletModule } from './shared/directives/outlet/outlet.module';
import { ContextTestModule } from './shared/directives/context-test/context-test.module';
import { HostModule } from './shared/components/host/host.module';
import { VideoPlayerModule } from './shared/components/video-player/video-player.module';
import { CanvasPainterModule } from './shared/components/canvas-painter/canvas-painter.module';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AppMaterialModule } from './app-material.module';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';

@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    AppMaterialModule,
    VideocardsNamesModule,
    InjectorTestModule,
    LoopModule,
    OutletModule,
    ContextTestModule,
    HostModule,
    VideoPlayerModule,
    HttpClientModule,
    CanvasPainterModule,
    BrowserAnimationsModule,
    ReactiveFormsModule,
    FormsModule,
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
