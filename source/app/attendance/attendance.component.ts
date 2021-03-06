import {Component, Input, OnChanges, OnInit} from '@angular/core';
import {DialogsService} from '../_services/dialogs.service';
import {MessagesService} from "../_services/messages.service";
import {ActivatedRoute, Router} from '@angular/router';
import {AbstractTableSetting} from "../model/abstractTableSetting";
import './attendance.component.scss';
import {TranslateService} from "@ngx-translate/core";
import {Attendance} from "../model/attendance";
import {Instructor} from "../model/instructor";
import {Intern} from "../model/intern";
import {Session} from "../model/session";

import {Weekday} from "../model/weekday";
import {Enrollment} from "../model/enrollment";
import {AuthenticationService} from "../_services/authentication.service";
import {User} from "../model/user";
import {Settings} from "../model/settings";


@Component({
    selector: 'app-attendance',
    templateUrl: './attendance.component.html',
})
export class AttendanceComponent implements OnInit, OnChanges {

    @Input() public intern: Intern;
    @Input() public instructor: Instructor;
    @Input() public weekday: Weekday;
    @Input() public session: Weekday;
    public filter: string = '';
    public data: any;
    public dataByDate: any;
    public dataByDateCopy: any;
    public tableName: string;
    public setting: AbstractTableSetting;
    public settingByDate: AbstractTableSetting;
    public attendance: Attendance;
    public block: boolean;
    public color: string = 'warn';
    public mode: string = 'indeterminate';
    public value: number = 100;
    public pageIndex: number = 0;
    public pageSize: number = 10;
    public sortName: string = 'date';
    public sortDirection: string = 'DESC';
    public isOnByDateDisplayed: boolean;
    public interns: Array<any> = [];
    public session_id: number;
    public sessions: Array<Session> = [];
    public attendances: Array<Attendance> = [];
    public isAdmin: boolean;
    public isUser: boolean;
    public isInstructor: boolean;
    public instructorId: number;
    public user: User;
    public addImage;

    constructor(
        private dialogsService: DialogsService,
        public messagesService: MessagesService,
        private router: Router,
        private translate: TranslateService,
        private authService: AuthenticationService,
        private route: ActivatedRoute) {
    }

    ngOnInit(): void {
        this.addImage = `${this.getPath()}dist/assets/images/addImage.png`;
        this.user = this.authService.getCurrentUser();
        this.isAdmin = this.user.role === 'admin';
        this.isUser = this.user.role === 'user';
        this.isInstructor = this.user.role === 'teacher';
        this.getParams();
        //this.getDataTable(this.pageIndex, this.pageSize, this.sortName, this.sortDirection, this.filter);
        //this.initSetting();
        this.getSessions();
        if(this.isAdmin || this.intern){
            this.getDataTable(this.pageIndex, this.pageSize, this.sortName, this.sortDirection, this.filter);
        }
        this.initSetting();
        this.initSettingByDate();
    }

    ngOnChanges(): void {
        if (this.session) {
            this.session_id = this.session.id;
            this.onByDate();
        }
    }

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

    /**
     * getParams
     */
    public getParams(): void {
        this.route.params.subscribe(res => {
            if (res.instructorId) {
                this.instructorId = Number(res.instructorId)
            }
        });
    }

    public sessionOnChange(event: any): void {
        if (event.code !== 'ArrowDown' && event.code !== 'ArrowUp' && event.code !== 'NumpadEnter' && event.code !== 'Enter') {
            this.block = true;
            Session.getAllPaged(0, Settings.isDbLocalServer ? Number.MAX_SAFE_INTEGER : 30, 'name', '', event.target.value, true).then(
                users => {
                    this.block = false;
                    this.sessions = users
                    if(this.weekday) {
                        this.session_id = this.weekday.session_id as number;
                        this.onByDate();
                    }
                    if(this.isInstructor) {
                        Instructor.getByUser(this.user.id).then(inst => {
                            this.instructor = inst;
                            this.sessions = this.sessions.filter(session => session.instructor_id === inst.id);
                        })
                    } else {
                        const instructorId: number = this.instructor ? this.instructor.id : this.instructorId;
                        if (instructorId) {
                            this.sessions = this.sessions.filter(session => session.instructor_id === instructorId);
                        }
                    }
                }, () => {
                    this.messagesService.notifyMessage(this.translate.instant('messages.something_went_wrong_message'), '', 'error');
                    this.block = false
                });
        }
    }

    public sessionOnSelect(id: number) {
        this.session_id = id;
        this.onByDate();
    }

    public displayFn(id: number) {
        const session: Session | undefined= this.sessions.find(s => s.id === Number(id));
        return session ? session.name + ' - ' + session['training'] + ' - ' +
            session['instructor'] : '';
    }

    getSessions() {
        Session.getAll().then(sessions => {
            this.sessions = sessions;
            if(this.weekday) {
                this.session_id = this.weekday.session_id as number;
                this.onByDate();
            }
            if(this.isInstructor) {
                Instructor.getByUser(this.user.id).then(inst => {
                    this.instructor = inst;
                    this.sessions = this.sessions.filter(session => session.instructor_id === inst.id);
                })
            } else {
                const instructorId: number = this.instructor ? this.instructor.id : this.instructorId;
                if (instructorId) {
                    this.sessions = this.sessions.filter(session => session.instructor_id === instructorId);
                }
            }
        });
    }

    public getDataTable(pageIndex: number, pageSize: number, sort: string, order: string, filter: string): void {
        const offset: number = pageIndex * pageSize;
        const limit: number = pageSize;
        this.block = true;
        Promise.all([this.weekday ? Attendance
                .getAllPagedByWeekday(offset, limit, sort, order, this.weekday.id) :
            this.instructor ? Attendance.getAllPagedByInstructor(offset, limit, sort, order, this.instructor.id) :
                this.intern ? Attendance.getAllPagedByIntern(offset, limit, sort, order, this.intern.id) :
                    Attendance.getAllPaged(offset, limit, sort, order, filter),
            this.weekday ? Attendance.getCountByWeekday(this.weekday.id) :
                this.instructor ? Attendance.getCountByInstructor(this.instructor.id) :
                    this.intern ? Attendance.getCountByIntern(this.intern.id) : Attendance.getCount(this.filter)])
            .then(
                values => {
                    this.block = false;
                    this.data = {
                        items: values[0],
                        paging: {totalCount: (values[1][0] as any) ? (values[1][0] as any).count : 0}
                    };
                },
                err => {
                    this.block = false;
                    this.messagesService.notifyMessage(this.translate.instant('messages.something_went_wrong_message'), err, 'error');
                });
    }

    onByDate() {
        Attendance.getAllBySession(this.session_id).then(attendances => {
            this.attendances = attendances;
            this.initSettingByDate();
            this.getDataTableByDate();
        })
    }

    getDataTableByDate() {
        this.dataByDate = {items: [], paging: {totalCount: 0}};
        this.dataByDateCopy = {items: [], paging: {totalCount: 0}};
        this.block = true;
        Promise.all([Enrollment.getAllBySession(this.session_id), Attendance.getAllBySession(this.session_id)])
            .then(async values => {
                    this.block = false;
                    this.dataByDate.paging.totalCount = values[0].length;
                    this.attendances = values[1];
                    this.isOnByDateDisplayed = true;
                    await this.asyncForEach(values[0], async (enrollment: any) => {
                        await Promise.all([Attendance.getAlldByIntern(enrollment.intern_id as number), Intern.get(enrollment.intern_id as number)])
                            .then((values: any) => {
                                const intern = values[1];
                                intern['attendances'] = values[0];
                                this.dataByDate.items.push(intern);
                                this.dataByDateCopy.items.push(intern);
                            });
                    });
                },
                () => {
                    this.block = false;
                    this.messagesService.notifyMessage(this.translate.instant('messages.something_went_wrong_message'), '', 'error');
                });
    }

    async asyncForEach(array: any, callback: any) {
        this.block = true;
        for (let index = 0; index < array.length; index++) {
            await callback(array[index], index, array);
        }
        this.block = false;
        this.dataByDate.items = this.dataByDateCopy.items.slice(this.pageIndex * this.pageSize, this.pageIndex * this.pageSize + this.pageSize);
        this.initSettingByDate();
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

    /**
     * onPageChange
     */
    public onPageChangeByDate(event: any): void {
        this.pageIndex = event.pageIndex;
        this.pageSize = event.pageSize;
        this.dataByDate.items = this.dataByDateCopy.items.slice(this.pageIndex * this.pageSize, this.pageIndex * this.pageSize + this.pageSize);
        this.initSettingByDate();
    }

    public initSetting(): void {
        this.setting = new AbstractTableSetting();
        this.setting.settingColumn = this.isUser || this.isAdmin;
        this.setting.tableName = this.tableName;
        this.setting.filter = this.isUser || this.isAdmin;
        this.setting.addRow = false;//(this.isUser || this.isAdmin) && !this.intern && !this.instructor && !this.session && !this.weekday;
        this.setting.cols = [
            {columnDef: 'date', header: 'attendance.placeholder.date', type: 'date', cell: (row: any) => `${row.date}`},
            {
                columnDef: 'day',
                header: 'attendance.placeholder.day',
                type: 'day',
                cell: (row: any) => `${this.translate.instant('weekday.placeholder.' + row.day)}`
            },
            {
                columnDef: 'present',
                header: 'attendance.placeholder.present',
                type: 'boolean',
                cell: (row: any) => `${row.present}`
            },
            {
                columnDef: 'training',
                header: 'attendance.placeholder.training_id',
                type: 'text',
                cell: (row: any) => `${row.training}`
            },
            {
                columnDef: 'session',
                header: 'attendance.placeholder.session_id',
                type: 'text',
                cell: (row: any) => `${row.session}`
            },
            {
                columnDef: 'intern',
                header: 'attendance.placeholder.intern_id',
                type: 'text',
                cell: (row: any) => `${row.intern}`
            },
            {
                columnDef: 'instructor',
                header: 'attendance.placeholder.instructor_id',
                type: 'text',
                cell: (row: any) => `${row.instructor}`
            },
            {
                columnDef: 'number',
                header: 'attendance.placeholder.room_id',
                type: 'text',
                cell: (row: any) => `${row.number}`
            },
            {
                columnDef: 'time',
                header: 'attendance.placeholder.time',
                type: 'text',
                cell: (row: any) => `${row.time}`
            }
        ];
        (this.isUser || this.isAdmin) &&
        this.setting.cols.push({
            columnDef: 'settings',
            class: 'a10',
            header: '',
            type: 'settings',
            delete: true,
            editRow: true
        });
    }

    public initSettingByDate(): void {
        this.settingByDate = new AbstractTableSetting();
        this.settingByDate.settingColumn = false;
        this.settingByDate.tableName = this.tableName;
        this.settingByDate.filter = true;
        this.settingByDate.addRow = false; //!this.intern && !this.instructor && !this.session && !this.weekday;
        this.settingByDate.cols = [
            {columnDef: 'name', header: 'attendance.placeholder.name', type: 'text', cell: (row: any) => `${row.name}`}
        ];
        this.attendances.forEach((attendance) => {
            this.settingByDate.cols.push(
                {
                    columnDef: attendance.date,
                    header: new Date(Number(attendance.date)).toLocaleDateString('fr-FR'),
                    type: 'boolean',
                    cell: (row: any) => `${row.attendances.find(s => s.date === attendance.date) ? row.attendances.find(s => s.date === attendance.date).present : 2}`
                }
            )
        });
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
                    Attendance
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
                                this.messagesService.notifyMessage(this.translate.instant('messages.unable_delete_relation'), '', 'error');
                            }
                        );
                }
            });
    }

    /**
     * add row
     */
    public onAddRow(): void {
        const id: string = String(this.instructor ? this.instructor.id : this.instructorId);
        this.router.navigate([`attendance/form-instructor/${id}` + (this.session_id ? ('/'+ this.session_id) : '')]);
    }

    /**
     * onEditRow
     */
    public onEditRow(event: Attendance): void {
        this.attendance = event;
        this.router.navigate(['attendance/form/' + event.id]);

    }

    onFilter(filter: string) {
        this.filter = filter;
        this.getDataTable(this.pageIndex, this.pageSize, this.sortName, this.sortDirection, this.filter);
    }

    onFilterByDate(filter: string) {
        this.filter = filter;
        this.dataByDate.items = this.dataByDateCopy.items.filter((val: any) => val.name.includes(filter));
        this.initSettingByDate();

    }

}
