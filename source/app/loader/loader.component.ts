import { Component, OnInit, Input } from '@angular/core';
import './loader.component.scss';
@Component({
  selector: 'app-loader',
  templateUrl: './loader.component.html',
})
export class LoaderComponent implements OnInit {

  @Input() public color: string;
  @Input() public mode: string;
  @Input() public value: string;
  @Input() public diameter: string;
  @Input() public type: string;
  constructor() { }

  ngOnInit() {
  }

}
