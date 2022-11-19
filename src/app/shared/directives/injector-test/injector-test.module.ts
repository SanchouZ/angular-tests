import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { InjectorTestDirective } from './injector-test.directive';



@NgModule({
  declarations: [InjectorTestDirective],
  imports: [CommonModule],
  exports: [InjectorTestDirective],
})
export class InjectorTestModule {}
