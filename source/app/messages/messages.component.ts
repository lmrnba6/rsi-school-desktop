import { Component, OnInit } from '@angular/core';
import './messages.component.scss';
import {Router} from "@angular/router";
@Component({
  selector: 'app-messages',
  templateUrl: './messages.component.html'
})
export class MessagesComponent implements OnInit {
  public messageInImage = `${this.getPath()}dist/assets/images/messageInImage.png`;
  public messageOutImage = `${this.getPath()}dist/assets/images/messageOutImage.png`;

  constructor(private router: Router) { }

  getPath(){
    const l = window.location.href.split('/');
    const c = l.length - l.indexOf('index.html');
    return '../'.repeat(c);
  }

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
