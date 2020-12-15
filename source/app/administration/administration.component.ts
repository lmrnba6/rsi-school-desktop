import {Component, OnInit} from '@angular/core';
import './administration.component.scss';
import moment = require("moment");
import {AuthenticationService} from "../_services/authentication.service";

@Component({
    selector: 'app-administration',
    templateUrl: './administration.component.html'
})
export class AdministrationComponent implements OnInit {

    public schoolImage = `${this.getPath()}dist/assets/images/schoolImage.png`;
    public userImage = `${this.getPath()}dist/assets/images/userImage.png`;
    public carImage = `${this.getPath()}dist/assets/images/carImage.png`;
    public user;
    public date;

    constructor(private auth: AuthenticationService) {
    }

    getPath(){
        const l = window.location.href.split('/');
        const c = l.length - l.indexOf('index.html');
        return '../'.repeat(c);
    }

    handleExpiration(date) {
        if(date) {
            localStorage.setItem('expiration', JSON.stringify(new Date(date).getTime()));
        }
    }

    ngOnInit() {
        const exp = localStorage.getItem('expiration');
        this.date = exp ? moment(Number(exp)).format('YYYY-MM-DD') : new Date();
        this.user = this.auth.getCurrentUser();
    }

    fixImage(event: any) {
        if (event.target.src.includes('dist')) {
            return event.target.src = event.target.src.replace('/dist', '');
        }    }
}
