import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoopDirective } from './loop.directive';



@NgModule({
  declarations: [LoopDirective],
  imports: [CommonModule],
  exports: [LoopDirective],
})
export class LoopModule {}
