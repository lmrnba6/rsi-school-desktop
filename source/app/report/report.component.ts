import {Component, OnInit} from '@angular/core';
import {MessagesService} from "../_services/messages.service";
import {Router} from '@angular/router';
import './report.component.scss';

@Component({
    selector: 'app-register-form',
    templateUrl: './report.component.html',
})
export class ReportComponent implements OnInit {

    public block: boolean;
    public color: string = 'warn';
    public value: number = 100;
    public mode: string = 'indeterminate';
    public from = new Date();
    public to = new Date();

    public backImage = `${this.getPath()}dist/assets/images/backImage.png`;

    getPath() {
        const l = window.location.href.split('/');
        const c = l.length - l.indexOf('index.html');
        return '../'.repeat(c);
    }

    fixImage(event: any) {
        if (event.target.src.includes('dist')) {
            return event.target.src = event.target.src.replace('/dist', '');
        }
    }

    constructor(
        public messagesService: MessagesService,
        private router: Router,
    ) {
    }

    public ngOnInit(): void {
    }

    /**
     * onSave
     */
    public generate(): void {
        if(this.from && this.to) {

        }
    }

    /**
     * onSave
     */

    goBack() {
        this.router.navigate(['accounting']);
    }

}
