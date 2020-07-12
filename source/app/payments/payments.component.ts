import {Component, OnInit} from '@angular/core';
import './payments.component.scss';

@Component({
    selector: 'app-payments',
    templateUrl: './payments.component.html'
})
export class PaymentsComponent implements OnInit {

    public internImage = `../../dist/assets/images/internImage.png`;
    public instructorImage = `../../dist/assets/images/instructorImage.png`;

    constructor() {
    }

    ngOnInit() {
    }

    fixImage(event: any) {
        if (event.target.src.includes('dist')) {
            return event.target.src = event.target.src.replace('/dist', '');
        }    }


}
