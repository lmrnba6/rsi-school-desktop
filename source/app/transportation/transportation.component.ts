import {Component, OnInit} from '@angular/core';
import './transportation.component.scss';
import {Router} from "@angular/router";

@Component({
    selector: 'app-transportation',
    templateUrl: './transportation.component.html'
})
export class TransportationComponent implements OnInit {

    public busImage = `${this.getPath()}dist/assets/images/busImage.png`;
    public busTimeImage = `${this.getPath()}dist/assets/images/busTimeImage.png`;
    public backImage = `${this.getPath()}dist/assets/images/backImage.png`;

    constructor(private router: Router,
    ) {
    }

    goBack() {
        this.router.navigate(['settings']);
    }

    getPath() {
        const l = window.location.href.split('/');
        const c = l.length - l.indexOf('index.html');
        return '../'.repeat(c);
    }

    ngOnInit() {
    }

    fixImage(event: any) {
        if (event.target.src.includes('dist')) {
            return event.target.src = event.target.src.replace('/dist', '');
        }
    }


}
