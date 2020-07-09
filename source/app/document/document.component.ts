import {Component, OnInit} from '@angular/core';
import './document.component.scss';
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
    sessions =  [];
    public interns: Array<Intern> = [];
    public internsFiltered: Array<Intern> = [];
    public internSelected: Intern;
    attendanceForm: boolean;
    card: boolean;
    receipt: boolean;
    form: boolean;
    open: string;
    public block: boolean;
    public color: string = 'warn';
    public mode: string = 'indeterminate';
    public value: number = 100;

    constructor(private router: Router, private translate: TranslateService, private messagesService: MessagesService) {}

    ngOnInit() {
    this.getSessions();
    }

    handleOpen(type: string) {
        this.open = type === this.open ? '' : type;
    }

    onAttendanceForm() {
        this.router.navigate(['/document/pv/intern/' + this.session_id]);
    }

    public displayFn(intern: Intern) {
        return intern ? intern.name : this.internSelected.name;
    }

    public internOnChange(event: any): void {
        if(event.code !== 'ArrowDown' && event.code !== 'ArrowUp' && event.code !== 'NumpadEnter' && event.code !== 'Enter') {
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

    public internOnSelect(intern: Intern): void {
        this.internSelected = intern;
        if(this.open === 'card') {
            this.router.navigate(['/document/pv/card/' + this.internSelected.id]);
        }
        else if(this.open === 'receipt') {
            this.router.navigate(['/document/pv/receipt/' + this.internSelected.id]);
        }
        else if(this.open === 'form') {
            this.router.navigate(['/document/pv/form/' + this.internSelected.id]);
        }
    }

    getSessions() {
        Session.getAll().then((sessions: any) => {
            this.sessions = sessions;
        });
    }

}
