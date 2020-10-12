import {Component, Input, OnChanges, OnInit} from '@angular/core';
import {DialogsService} from '../_services/dialogs.service';
import {MessagesService} from "../_services/messages.service";
import {Router} from '@angular/router';
import {AbstractTableSetting} from "../model/abstractTableSetting";
import './session.component.scss';
import {TranslateService} from "@ngx-translate/core";
import {Session} from "../model/session";
import {Instructor} from "../model/instructor";
import {AuthenticationService} from "../_services/authentication.service";
import {User} from "../model/user";

@Component({
    selector: 'app-session',
    templateUrl: './session.component.html',
})
export class SessionComponent implements OnInit, OnChanges {

    @Input() public instructor: Instructor;
    public filter: string = '';
    public data: any;
    public tableName: string;
    public setting: AbstractTableSetting;
    public session: Session;
    public block: boolean;
    public color: string = 'warn';
    public mode: string = 'indeterminate';
    public value: number = 100;
    public pageIndex: number = 0;
    public pageSize: number = 10;
    public sortName: string = 'name';
    public sortDirection: string = 'ASC';
    public isAdmin: boolean;
    public isUser: boolean;
    public user: User;

    constructor(
        private dialogsService: DialogsService,
        public messagesService: MessagesService,
        private router: Router,
        private translate: TranslateService,
        private authService: AuthenticationService) {
    }

    ngOnInit(): void {
        this.user = this.authService.getCurrentUser();
        this.isAdmin = this.user.role === 'admin';
        this.isUser = this.user.role === 'user';
        if (this.user.role === 'teacher') {
            Instructor.getByUser(this.user.id).then(i => {
                    this.instructor = i;
                    this.initSetting();
                    this.getDataTable(this.pageIndex, this.pageSize, this.sortName, this.sortDirection, this.filter);
                },
                () => {
                    this.block = false;
                    this.messagesService.notifyMessage(this.translate.instant('messages.something_went_wrong_message'), '', 'error');
                });
        } else {
            this.getDataTable(this.pageIndex, this.pageSize, this.sortName, this.sortDirection, this.filter);
        }
        this.initSetting();
    }

    ngOnChanges(): void {
        this.getDataTable(this.pageIndex, this.pageSize, this.sortName, this.sortDirection, this.filter);
        this.initSetting();
    }


    public getDataTable(pageIndex: number, pageSize: number, sort: string, order: string, filter: string): void {
        const offset: number = pageIndex * pageSize;
        const limit: number = pageSize;
        this.block = true;
        Promise.all([this.instructor ?
            Session.getAllPagedByInstructor(offset, limit, sort, order, this.instructor.id) : Session
                .getAllPaged(offset, limit, sort, order, filter), this.instructor ? Session.getCountByInstructor(this.instructor.id) :
            Session.getCount(this.filter)])
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
        this.setting.settingColumn = true;
        this.setting.tableName = this.tableName;
        this.setting.filter = !this.instructor;
        this.setting.addRow = this.isAdmin || this.isUser;
        this.setting.cols = [
            {
                columnDef: 'name',
                class: 'a15',
                header: 'session.placeholder.name',
                type: 'text',
                cell: (row: any) => `${row.name}`
            },
            {
                columnDef: 'weekdays',
                class: 'a25',
                header: 'session.placeholder.enrollments',
                type: 'html',
                cell: (row: any) => `${this.handleLines(row.weekdays || '')}`
            },
            {
                columnDef: 'limit',
                class: 'a10',
                header: 'session.placeholder.limit',
                type: 'text',
                cell: (row: any) => `${row.limit}`
            },
            {
                columnDef: 'interns',
                class: 'a10',
                header: 'session.placeholder.interns',
                type: 'text',
                cell: (row: any) => `${row.interns}`
            },
            {
                columnDef: 'instructor',
                class: 'a20',
                header: 'session.placeholder.instructor_id',
                type: 'text',
                cell: (row: any) => `${row.instructor}`
            },
            {
                columnDef: 'training',
                class: 'a10',
                header: 'session.placeholder.training_id',
                type: 'text',
                cell: (row: any) => `${row.training}`
            }
        ];
        this.setting.cols.push({
            columnDef: 'settings',
            class: 'a10',
            header: '',
            type: 'settings',
            delete: this.isAdmin,
            editRow: true
        });
    }

    translateDates(d: string) {
        let weekdays = new Array(7);
        weekdays[0] = "sunday";
        weekdays[1] = "monday";
        weekdays[2] = "tuesday";
        weekdays[3] = "wednesday";
        weekdays[4] = "thursday";
        weekdays[5] = "friday";
        weekdays[6] = "saturday";
        weekdays.forEach(s => {
            const reg = new RegExp(s, 'g')
            d = d.replace(reg, this.translate.instant('weekday.placeholder.' + s))
        });
        return d;
    }

    handleLines(text: string) {
        text = text || '';
        const list = text.split('---');
        const s = list.reduce((a, b) => {
            a = a + `<li class="timeTable">${b}</li>`;
            return a
        }, '')
        return text ? `<ul>${this.translateDates(s)}</ul>` : '';
    }

    public onRowDeleted(id: number): void {
        this.dialogsService
            .confirm('messages.warning_title', 'messages.remove_row_warning_message', true, 'warning-sign')
            .subscribe(confirm => {
                if (confirm) {
                    this.block = true;
                    Session
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
        this.router.navigate(['session/form']);
    }

    /**
     * onEditRow
     */
    public onEditRow(event: Session): void {
        this.session = event;
        this.router.navigate(['session-management/' + event.id]);

    }

    onFilter(filter: string) {
        this.filter = filter;
        this.getDataTable(this.pageIndex, this.pageSize, this.sortName, this.sortDirection, this.filter);
    }

}
