import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OutletDirective } from './outlet.directive';



@NgModule({
  declarations: [OutletDirective],
  imports: [CommonModule],
  exports: [OutletDirective],
})
export class OutletModule {}
