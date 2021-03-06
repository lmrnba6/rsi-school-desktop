import {Component, OnChanges, OnInit} from '@angular/core';
import './home.component.scss';
import {AbstractTableSetting} from "../model/abstractTableSetting";
import {Session} from "../model/session";
import {Room} from "../model/room";
import {Instructor} from "../model/instructor";
import {Weekday} from "../model/weekday";
import {Intern} from "../model/intern";
import {Training} from "../model/training";
import {School} from "../model/school";
import {AuthenticationService} from "../_services/authentication.service";
import moment = require("moment");
import {Router} from "@angular/router";
@Component({
  selector: 'app-home',
  templateUrl: './home.component.html'
})
export class HomeComponent implements OnInit,OnChanges {

    logo = '';
    data: any;
    date: string;
    setting: AbstractTableSetting;
    session: Session;
    room: Room;
    days: Array<string>;
    instructor: Instructor;
    filter: string;
    interns: number;
    instructors: number;
    trainings: number
    sessions: number;
    public block: boolean;
    public color: string = 'warn';
    public mode: string = 'indeterminate';
    public value: number = 100;
    public isTeacher: boolean;
    public isIntern: boolean;
    public internImage = `${this.getPath()}dist/assets/images/internImage.png`;
    public instructorImage = `${this.getPath()}dist/assets/images/instructorImage.png`;
    public sessionImage = `${this.getPath()}dist/assets/images/sessionImage.png`;
    public trainingImage = `${this.getPath()}dist/assets/images/trainingImage.png`;

    constructor(private auth: AuthenticationService, private router: Router) {
    }
    getPath(){
        const l = window.location.href.split('/');
        const c = l.length - l.indexOf('index.html');
        return '../'.repeat(c);
    }

    ngOnInit(): void {
        const exp = localStorage.getItem('expiration');
        if (!this.auth.getCurrentUser().role.includes('super') && exp && moment(Number(exp)).isBefore(moment())) {
            this.auth.logout();
            this.router.navigate(['/login']);
        }
        this.block = true;
        this.isTeacher = this.auth.getCurrentUser().role === 'teacher';
        this.isIntern = this.auth.getCurrentUser().role === 'student';
        Promise.all([Intern.getCount(''), Instructor.getCount(''),Session.getCount(''), Training.getCount('')]).then(
            values => {
                this.interns = (values[0][0] as any).count;
                this.instructors = (values[1][0] as any).count;
                this.sessions = (values[2][0] as any).count;
                this.trainings = (values[3][0] as any).count;
                this.block = false;
            })
        this.toDay();
        this.getDataTable(this.toDay());
        this.initSetting();
        this.getLogo();
    }

    getLogo() {
        this.block = true;
        School.getAll().then(school => {
            this.block = false;
            if(school.length) {
                this.logo = 'data:image/png;base64,' + school[0].photo;
            }
        })
    }

    ngOnChanges(): void {
        this.getDataTable(this.toDay());
        this.initSetting();
    }

    onDayChange(e: any) {
        this.getDataTable(e);
    }

    toDay() {
        let a = new Date();
        let weekdays = new Array(7);
        weekdays[0] = "sunday";
        weekdays[1] = "monday";
        weekdays[2] = "tuesday";
        weekdays[3] = "wednesday";
        weekdays[4] = "thursday";
        weekdays[5] = "friday";
        weekdays[6] = "saturday";
        this.days =weekdays;
        this.date = weekdays[a.getDay()];
        return weekdays[a.getDay()];
    }

    public initSetting(): void {
        this.setting = new AbstractTableSetting();
        this.setting.settingColumn = false;
        this.setting.filter = false;
        this.setting.paging = false;
        this.setting.addRow = false;
        this.setting.hideHeader = true;
        this.setting.tools = false;
        this.setting.cols = [
            {columnDef: 'time', class:'a25', header: 'weekday.placeholder.time', type: 'text', cell: (row: any) => `${row.time}`},
            {columnDef: 'name', class:'a75', header: 'weekday.title', type: 'html', cell: (row: any) => `${this.handleLines(row.name)}`},
        ];
    }

    handleLines(text: string) {
        text = text || '';
        const list = text.split('---');
        const s = list.reduce((a,b) => {
            a = a + `<li class="timeTable">${b}</li>`; return a
        },'')
        return `<ul>${s}</ul>`
    }

    public getDataTable(filter: string): void {
        this.block = true;
        Weekday.getScheduleByDay(filter).then(values => {
            this.block = false;
            this.data = {items: values, paging: {totalCount: values.length}};
        }, () => this.block = false);

    }


}
