import {Component, OnChanges, OnInit} from '@angular/core';
import './home.component.scss';
import {AbstractTableSetting} from "../model/abstractTableSetting";
import {Session} from "../model/session";
import {Room} from "../model/room";
import {Instructor} from "../model/instructor";
import {Weekday} from "../model/weekday";
import MAX_SAFE_INTEGER = require("core-js/fn/number/max-safe-integer");
import {Intern} from "../model/intern";
import {Training} from "../model/training";
import {School} from "../model/school";
import {AuthenticationService} from "../_services/authentication.service";
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
    public internImage = `../../dist/assets/images/internImage.png`;
    public instructorImage = `../../dist/assets/images/instructorImage.png`;
    public sessionImage = `../../dist/assets/images/sessionImage.png`;
    public trainingImage = `../../dist/assets/images/trainingImage.png`;


    constructor(private auth: AuthenticationService) {}

    ngOnInit(): void {
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
        this.getDataTable(0, MAX_SAFE_INTEGER, '', 'time', this.toDay());
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
        this.getDataTable(0, MAX_SAFE_INTEGER, '', 'time', this.toDay());
        this.initSetting();
    }

    onDayChange(e: any) {
        this.getDataTable(0, MAX_SAFE_INTEGER, '', 'time', e);
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
        this.setting.tools = false;
        this.setting.cols = [
            {columnDef: 'time', header: 'weekday.placeholder.time', type: 'text', cell: (row: any) => `${row.time}`},
            {columnDef: 'session_id', header: 'weekday.placeholder.session_id', type: 'text', cell: (row: any) => `${row.session}`},
            {columnDef: 'instructor', header: 'weekday.placeholder.instructor', type: 'text', cell: (row: any) => `${row.instructor}`},
            {columnDef: 'training', header: 'weekday.placeholder.training', type: 'text', cell: (row: any) => `${row.training}`},
            {columnDef: 'room_id', header: 'weekday.placeholder.room_id', type: 'text', cell: (row: any) => `${row.room}`}
        ];
    }

    public getDataTable(pageIndex: number, pageSize: number, sort: string, order: string, filter: string): void {
        const offset: number = pageIndex * pageSize;
        const limit: number = pageSize;
        this.block = true;
        Promise.all([this.instructor ? Weekday.getAllPagedByInstructor(offset, limit, sort, order,this.instructor.id) :
            this.room ? Weekday.getAllPagedByRoom(offset, limit, sort, order, this.room.id) :
                this.session ? Weekday.getAllPagedBySession(offset, limit, sort, order, this.session.id) :
                    Weekday.getAllPaged(offset, limit, sort, order, filter),this.instructor ? Weekday.getCountByInstructor(this.instructor.id) :
            this.room ? Weekday.getCountByRoom(this.room.id) :
                this.session ? Weekday.getCountBySession(this.session.id) :
                    Weekday.getCount(this.filter)])
            .then(
                values => {
                    this.block = false;
                    this.data = {items: values[0], paging: {totalCount: (values[1][0] as any).count}};
                }, () => this.block = false);
    }


}
