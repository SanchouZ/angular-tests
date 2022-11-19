import {
  Directive,
  Input,
  OnInit,
  TemplateRef,
  ViewContainerRef,
} from '@angular/core';

@Directive({
  selector: '[appOutlet]',
})
export class OutletDirective implements OnInit {
  @Input() set appOutlet(template: TemplateRef<any>) {
    if (template) {
      this._template = template;
    }
  }

  @Input() set appOutletContext(context: { [id: string]: any }) {
    if (context) {
      this._context = context;
    }
  }
  
  private _template: TemplateRef<any>;
  private _context: { [id: string]: any } = {};

  constructor(private _vcr: ViewContainerRef) {}

  ngOnInit(): void {
    this._vcr.createEmbeddedView(this._template, this._context);
  }
}
