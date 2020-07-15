import {Component, OnInit} from '@angular/core';
import './administration.component.scss';

@Component({
    selector: 'app-administration',
    templateUrl: './administration.component.html'
})
export class AdministrationComponent implements OnInit {

    public schoolImage = `${this.getPath()}dist/assets/images/schoolImage.png`;
    public userImage = `${this.getPath()}dist/assets/images/userImage.png`;
    public carImage = `${this.getPath()}dist/assets/images/carImage.png`;

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
