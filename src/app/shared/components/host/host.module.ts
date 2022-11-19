import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HostComponent } from './host.component';
import { ContextTestModule } from '../../directives/context-test/context-test.module';



@NgModule({
  declarations: [HostComponent],
  imports: [CommonModule, ContextTestModule],
  exports: [HostComponent],
})
export class HostModule {}
