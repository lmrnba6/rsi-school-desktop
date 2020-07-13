import {Component, OnInit} from '@angular/core';
import './payments.component.scss';

@Component({
    selector: 'app-payments',
    templateUrl: './payments.component.html'
})
export class PaymentsComponent implements OnInit {

    public internImage = `${this.getPath()}dist/assets/images/internImage.png`;
    public instructorImage = `${this.getPath()}dist/assets/images/instructorImage.png`;

    constructor() {
    }

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
        }    }


}
