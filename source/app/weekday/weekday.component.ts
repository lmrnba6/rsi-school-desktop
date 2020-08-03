import {Component, Input, OnChanges, OnInit} from '@angular/core';
import {DialogsService} from '../_services/dialogs.service';
import {MessagesService} from "../_services/messages.service";
import {Router} from '@angular/router';
import {AbstractTableSetting} from "../model/abstractTableSetting";
import './weekday.component.scss';
import {TranslateService} from "@ngx-translate/core";
import {Weekday} from "../model/weekday";
import {Intern} from "../model/intern";
import {Session} from "../model/session";
import {Room} from "../model/room";
import {Instructor} from "../model/instructor";
import {AuthenticationService} from "../_services/authentication.service";


@Component({
    selector: 'app-weekday',
    templateUrl: './weekday.component.html',
})
export class WeekdayComponent implements OnInit, OnChanges {

    @Input() public intern: Intern;
    @Input() public session: Session;
    @Input() public room: Room;
    @Input() public instructor: Instructor;
    public tabSelected: number = 0;
    public filter: string = '';
    public data: any;
    public tableName: string;
    public setting: AbstractTableSetting;
    public weekSetting: AbstractTableSetting;
    public weekday: Weekday;
    public block: boolean;
    public color: string = 'warn';
    public mode: string = 'indeterminate';
    public value: number = 100;
    public pageIndex: number = 0;
    public pageSize: number = 10;
    public sortName: string = 'name';
    public sortDirection: string = 'ASC';
    days: Array<string>;
    date: string;
    public sunday: any;
    public saturday: any;
    public monday: any;
    public tuesday: any;
    public wednesday: any;
    public thursday: any;
    public friday: any;
    public isAdmin: boolean;
    public isUser: boolean;


    constructor(
        private dialogsService: DialogsService,
        public messagesService: MessagesService,
        private router: Router,
        private authService: AuthenticationService,
        private translate: TranslateService,) {
    }

    ngOnInit(): void {
        const user = this.authService.getCurrentUser();
        this.isAdmin = user.role === 'admin';
        this.isUser = user.role === 'user';
        this.getDataTable(this.pageIndex, this.pageSize, this.sortName, this.sortDirection, this.filter);
        this.initSetting();
        this.initWeekSetting();
        this.toDay();
        this.getSchedule();
    }

    ngOnChanges(): void {
        this.getDataTable(this.pageIndex, this.pageSize, this.sortName, this.sortDirection, this.filter);
        this.initSetting();
        this.initWeekSetting();
    }


    public getDataTable(pageIndex: number, pageSize: number, sort: string, order: string, filter: string): void {
        const offset: number = pageIndex * pageSize;
        const limit: number = pageSize;
        this.block = true;
        Promise.all([this.intern ? Weekday.getAllPagedByIntern(offset, limit, sort, order,this.intern.id) :
            this.instructor ? Weekday.getAllPagedByInstructor(offset, limit, sort, order,this.instructor.id) :
            this.room ? Weekday.getAllPagedByRoom(offset, limit, sort, order, this.room.id) :
            this.session ? Weekday.getAllPagedBySession(offset, limit, sort, order, this.session.id) :
            Weekday.getAllPaged(offset, limit, sort, order, filter),
            this.intern ? Weekday.getCountByIntern(this.intern.id) :
            this.instructor ?  Weekday.getCountByInstructor(this.instructor.id) :
            this.room ? Weekday.getCountByRoom(this.room.id) :
            this.session ? Weekday.getCountBySession(this.session.id) :
            Weekday.getCount(this.filter)])
            .then(
                values => {
                    this.block = false;
                    this.data = {items: values[0], paging: {totalCount: (values[1][0] as any).count}};
                },
                () => {
                    this.block = false;
                    this.messagesService.notifyMessage(this.translate.instant('messages.something_went_wrong_message'), '', 'error');
                });
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

    getSchedule(){
        this.asyncForEach(this.days, v => {
            Weekday.getScheduleByDay(v).then(value => {
                this[v] = {items: value, paging: {totalCount: value.length}}
            });
        });
    }

    async asyncForEach(array: any, callback: any) {
        for (let index = 0; index < array.length; index++) {
            await callback(array[index], index, array);
        }
    }

    /**
     * sortOnChange
     */
    public sortOnChange(event: any): void {
        this.sortName = event.col;
        this.sortDirection = event.sortDirection.length ? event.sortDirection : 'ASC';
        this.pageIndex = 0;
        this.getDataTable(this.pageIndex, this.pageSize, event.col, event.sortDirection, this.filter);
    }

    /**
     * onPageChange
     */
    public onPageChange(event: any): void {
        this.pageIndex = event.pageIndex;
        this.pageSize = event.pageSize;
        this.getDataTable(this.pageIndex, this.pageSize, this.sortName, this.sortDirection, this.filter);
    }

    public initSetting(): void {
        this.setting = new AbstractTableSetting();
        this.setting.settingColumn = !this.session && !this.room && !this.instructor && !this.intern;
        this.setting.tableName = this.tableName;
        this.setting.filter = !this.session && !this.room  && !this.instructor && !this.intern;
        this.setting.addRow = this.isAdmin || this.isUser;
        this.setting.cols = [
            {columnDef: 'name', header: 'weekday.placeholder.name', type: 'day', cell: (row: any) => `${this.translate.instant('weekday.placeholder.' + row.name)}`},
            {columnDef: 'time', header: 'weekday.placeholder.time', type: 'text', cell: (row: any) => `${row.time}`},
            {columnDef: 'session', header: 'weekday.placeholder.session_id', type: 'text', cell: (row: any) => `${row.session}`},
            {columnDef: 'instructor', header: 'weekday.placeholder.instructor', type: 'text', cell: (row: any) => `${row.instructor}`},
            {columnDef: 'training', header: 'weekday.placeholder.training', type: 'text', cell: (row: any) => `${row.training}`},
            {columnDef: 'room', header: 'weekday.placeholder.room_id', type: 'text', cell: (row: any) => `${row.room}`}
        ];
        !this.session && !this.room && !this.instructor && !this.intern &&
        this.setting.cols.push({columnDef: 'settings',class: 'a10', header: '', type: 'settings', delete: true, editRow: true});
    }


    public initWeekSetting(): void {
        this.weekSetting = new AbstractTableSetting();
        this.weekSetting.settingColumn = false;
        this.weekSetting.filter = false;
        this.weekSetting.paging = false;
        this.weekSetting.addRow = false;
        this.weekSetting.hideHeader = true;
        this.weekSetting.tools = false;
        this.weekSetting.cols = [
            {columnDef: 'time', class:'a25', header: 'weekday.placeholder.time', type: 'text', cell: (row: any) => `${row.time}`},
            {columnDef: 'name', class:'a75', header: 'weekday.title', type: 'html', cell: (row: any) => `${this.handleLines(row.name)}`},
            // {columnDef: 'instructor', header: 'weekday.placeholder.instructor', type: 'text', cell: (row: any) => `${row.instructor}`},
            // {columnDef: 'training', header: 'weekday.placeholder.training', type: 'text', cell: (row: any) => `${row.training}`},
            // {columnDef: 'room_id', header: 'weekday.placeholder.room_id', type: 'text', cell: (row: any) => `${row.room}`}
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

    /**
     * init data
     */
    public onRowDeleted(id: number): void {
        this.dialogsService
            .confirm('messages.warning_title', 'messages.remove_row_warning_message', true, 'warning-sign')
            .subscribe(confirm => {
                if (confirm) {
                    this.block = true;
                    Weekday
                        .delete(id)
                        .then(
                            () => {
                                this.block = false;
                                this.data = [];
                                this.getDataTable(this.pageIndex, this.pageSize, this.sortName, this.sortDirection, this.filter);
                                this.messagesService.notifyMessage(this.translate.instant('messages.operation_success_message'), '', 'success');
                            },
                            () => {
                                this.block = false;
                                this.messagesService.notifyMessage(this.translate.instant('messages.something_went_wrong_message'), '', 'error');
                            }
                        );
                }
            });
    }

    /**
     * add row
     */
    public onAddRow(): void {
        this.router.navigate(['weekday/form']);
    }

    /**
     * onEditRow
     */
    public onEditRow(event: Weekday): void {
        this.weekday = event;
        this.router.navigate(['weekday-management/' + event.id]);

    }

    onFilter(filter: string) {
        this.filter = filter;
        this.getDataTable(this.pageIndex, this.pageSize, this.sortName, this.sortDirection, this.filter);
    }

}
