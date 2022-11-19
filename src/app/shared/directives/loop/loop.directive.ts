import {
  Directive,
  Input,
  OnChanges,
  OnInit,
  TemplateRef,
  ViewContainerRef,
} from '@angular/core';

@Directive({
  selector: '[appLoop]',
})
export class LoopDirective implements OnInit, OnChanges {
  @Input() set appLoopTmp(template: TemplateRef<any>) {
    if (template) {
      this._template = template;
    }
  }

  @Input() set appLoopOf(array: any[]) {
    this._array = array;
  }

  private _array: any[] = [];

  constructor(
    private _template: TemplateRef<any>,
    private vcr: ViewContainerRef
  ) {}

  ngOnInit(): void {
    this.vcr.clear();
    this._array.forEach((item, index) => {
      this.vcr.createEmbeddedView(this._template, { $implicit: item, index });
    });
  }

  ngOnChanges(): void {
    
  }
}
