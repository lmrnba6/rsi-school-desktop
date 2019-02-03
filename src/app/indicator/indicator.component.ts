import {Component, Input, OnInit} from '@angular/core';
import './indicator.component.scss';
@Component({
  selector: 'app-indicator',
  templateUrl: './indicator.component.html'
})
export class IndicatorComponent implements OnInit {

  @Input() public color: string;
  constructor() { }

  ngOnInit() {
  }

}
