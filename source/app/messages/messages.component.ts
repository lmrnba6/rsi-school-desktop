import { Component, OnInit } from '@angular/core';
import './messages.component.scss';
import {Router} from "@angular/router";
@Component({
  selector: 'app-messages',
  templateUrl: './messages.component.html'
})
export class MessagesComponent implements OnInit {
  public messageInImage = `../../dist/assets/images/messageInImage.png`;
  public messageOutImage = `../../dist/assets/images/messageOutImage.png`;

  constructor(private router: Router) { }

  ngOnInit() {
  }

  fixImage(event: any) {
    if (event.target.src.includes('dist')) {
      return event.target.src = event.target.src.replace('/dist', '');
    }  }

  newMessage() {
    this.router.navigate(['inbox/form'])
  }


}
