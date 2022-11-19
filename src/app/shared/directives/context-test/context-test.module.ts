import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ContextTestDirective } from './context-test.directive';



@NgModule({
  declarations: [ContextTestDirective],
  imports: [CommonModule],
  exports: [ContextTestDirective],
})
export class ContextTestModule {}
