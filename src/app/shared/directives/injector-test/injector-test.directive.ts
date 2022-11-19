import {
  Directive,
  InjectionToken,
  Injector,
  Input,
  Type,
  ViewContainerRef,
} from '@angular/core';

export const TEST_INJECTOR = new InjectionToken<any>('test.injector');

@Directive({
  selector: '[appInjectorTest]',
})
export class InjectorTestDirective<C> {
  @Input() appInjectorTest: any;
  @Input() appInjectorTestCmp!: Type<C>;

  constructor(private vcr: ViewContainerRef) {}

  ngOnInit(): void {
    this.vcr.createComponent<C>(this.appInjectorTestCmp, {
      injector: Injector.create({
        providers: [{ provide: TEST_INJECTOR, useValue: this.appInjectorTest }],
      }),
    });
  }
}
