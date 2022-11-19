import { Component, ContentChild, OnInit } from '@angular/core';
import { ContextTestDirective } from '../../directives/context-test/context-test.directive';

@Component({
  selector: 'app-host',
  templateUrl: './host.component.html',
  styleUrls: ['./host.component.css'],
})
export class HostComponent implements OnInit {
  public name: string = "I'm host";

  constructor() {}

  ngOnInit(): void {}

  @ContentChild(ContextTestDirective) anchor: ContextTestDirective;
}
