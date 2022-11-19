import { Directive, TemplateRef } from '@angular/core';

@Directive({
  selector: '[appContextTest]'
})
export class ContextTestDirective {

  constructor(public template: TemplateRef<any>) {}

  ngOnOnit(): void {
    console.log(this.template);
  }
}
