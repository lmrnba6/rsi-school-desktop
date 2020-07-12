import {Component, OnInit} from '@angular/core';
import './administration.component.scss';

@Component({
    selector: 'app-administration',
    templateUrl: './administration.component.html'
})
export class AdministrationComponent implements OnInit {

    public schoolImage = `../../dist/assets/images/schoolImage.png`;
    public userImage = `../../dist/assets/images/userImage.png`;

    constructor() {
    }

    ngOnInit() {
    }

    fixImage(event: any) {
        if (event.target.src.includes('dist')) {
            return event.target.src = event.target.src.replace('/dist', '');
        }    }
}
