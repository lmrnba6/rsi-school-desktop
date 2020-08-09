import {Component, OnInit} from '@angular/core';
import './document.component.scss';
import {COMMA, ENTER} from '@angular/cdk/keycodes';
import {Session} from "../model/session";
import {Intern} from "../model/intern";
import {Router} from "@angular/router";
import {TranslateService} from "@ngx-translate/core";
import {MessagesService} from "../_services/messages.service";

@Component({
    selector: 'app-document',
    templateUrl: './document.component.html'
})
export class DocumentComponent implements OnInit {

    session_id: number;
    sessions = [];
    public internsToPrint: Array<Intern> = [];
    public interns: Array<Intern> = [];
    public internsFiltered: Array<Intern> = [];
    public internSelected: Intern;
    readonly separatorKeysCodes: number[] = [ENTER, COMMA];
    card: boolean;
    receipt: boolean;
    form: boolean;
    open: string;
    public block: boolean;
    public color: string = 'warn';
    public mode: string = 'indeterminate';
    public value: number = 100;
    public internImage = `${this.getPath()}dist/assets/images/internImage.png`;
    public idImage = `${this.getPath()}dist/assets/images/idImage.png`;
    public paymentImage = `${this.getPath()}dist/assets/images/paymentImage.png`;
    public pvImage = `${this.getPath()}dist/assets/images/pvImage.png`;
    public diplomaImage = `${this.getPath()}dist/assets/images/diplomaImage.png`;

    constructor(private router: Router, private translate: TranslateService, private messagesService: MessagesService) {
    }

    getPath(){
        const l = window.location.href.split('/');
        const c = l.length - l.indexOf('index.html');
        return '../'.repeat(c);
    }

    ngOnInit() {
        this.getSessions();
    }

    fixImage(event: any) {
        if (event.target.src.includes('dist')) {
            return event.target.src = event.target.src.replace('/dist', '');
        }    }

    handleOpen(type: string) {
        this.open = type === this.open ? '' : type;
    }

    remove(i: Intern): void {
        const index = this.internsToPrint.indexOf(i);

        if (index >= 0) {
            this.internsToPrint.splice(index, 1);
        }
    }

    onAttendanceForm() {
        this.router.navigate(['/document/pv/intern/' + this.session_id]);
    }

    public displayFn(intern: Intern) {
        return intern ? intern.name : this.internSelected ? this.internSelected.name : '';
    }

    public internOnChange(event: any): void {
        if (event.code !== 'ArrowDown' && event.code !== 'ArrowUp' && event.code !== 'NumpadEnter' && event.code !== 'Enter') {
            this.block = true;
            Intern.getAllPaged(0, 5, 'name', '', event.target.value).then(
                users => {
                    this.block = false;
                    this.internsFiltered = users
                }, () => {
                    this.messagesService.notifyMessage(this.translate.instant('messages.something_went_wrong_message'), '', 'error');
                    this.block = false
                });
        }
        //this.internsFiltered = this.interns.filter(interns => interns.name.toLowerCase().includes(event.toLowerCase()));
    }

    public printDiploma() {
        const interns = this.internsToPrint.reduce((a,b,i) =>
            a+b.id + (i < this.internsToPrint.length-1 ? ',' : ''),'');
        this.router.navigate(['/document/pv/card/0/' + interns]);
    }

    public internOnSelect(intern: Intern): void {
        this.internSelected = intern;
        if (this.open === 'card') {
            if(this.internsToPrint.length < 8){
                this.internsToPrint.push(intern);
                (this.internSelected as any) = null;
            }
        } else if (this.open === 'receipt') {
            this.router.navigate(['/document/pv/receipt/' + this.internSelected.id]);
        } else if (this.open === 'form') {
            this.router.navigate(['/document/pv/form/' + this.internSelected.id]);
        }else if (this.open === 'diploma') {
            this.router.navigate(['/document/pv/diploma/' + this.internSelected.id]);
        }
    }

    getSessions() {
        Session.getAll().then((sessions: any) => {
            this.sessions = sessions;
        });
    }

}
