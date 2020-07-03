import { Component, OnInit } from '@angular/core';
import './messages.component.scss';
import {Router} from "@angular/router";
@Component({
  selector: 'app-messages',
  templateUrl: './messages.component.html'
})
export class MessagesComponent implements OnInit {

  constructor(private router: Router) { }

  ngOnInit() {
  }

  newMessage() {
    this.router.navigate(['inbox/form'])
  }


}
