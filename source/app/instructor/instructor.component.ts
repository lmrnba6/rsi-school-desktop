import {Component, OnInit} from '@angular/core';
import {DialogsService} from '../_services/dialogs.service';
import {Router} from '@angular/router';
import {AbstractTableSetting} from "../model/abstractTableSetting";
import './instructor.component.scss';
import {TranslateService} from "@ngx-translate/core";
import {Instructor} from "../model/instructor";
import {AuthenticationService} from "../_services/authentication.service";
import {MessagesService} from "../_services/messages.service";

@Component({
    selector: 'app-instructor',
    templateUrl: './instructor.component.html',
})
export class InstructorComponent implements OnInit {

    public filter: string = '';
    public data: any;
    public tableName: string;
    public setting: AbstractTableSetting;
    public instructor: Instructor;
    public block: boolean;
    public color: string = 'warn';
    public mode: string = 'indeterminate';
    public value: number = 100;
    public pageIndex: number = 0;
    public pageSize: number = 10;
    public sortName: string = 'name';
    public sortDirection: string = 'DESC';

    constructor(
        private dialogsService: DialogsService,
        public messagesService: MessagesService,
        private router: Router,
        private translate: TranslateService,
        private authService: AuthenticationService) {
    }

    ngOnInit(): void {
        if (this.authService.getCurrentUser().role === 'teacher') {
            Instructor.get(this.authService.getCurrentUser().username).then(instructor => {
                instructor && this.router.navigate(['instructor-management/' + instructor.id]);
            })
        }
        this.getDataTable(this.pageIndex, this.pageSize, this.sortName, this.sortDirection, this.filter);
        this.initSetting();
    }


    public getDataTable(pageIndex: number, pageSize: number, sort: string, order: string, filter: string): void {
        const offset: number = pageIndex * pageSize;
        const limit: number = pageSize;
        this.block = true;
        Promise.all([Instructor
            .getAllPaged(offset, limit, sort, order, filter), Instructor.getCount(this.filter)])
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
        this.setting.filter = true;
        this.setting.addRow = true;
        this.setting.cols = [
            {
                columnDef: 'name',
                class: 'a20',
                header: 'instructor.placeholder.name',
                type: 'text',
                cell: (row: any) => `${row.name}`
            },
            {
                columnDef: 'phone',
                class: 'a10',
                header: 'instructor.placeholder.phone',
                type: 'text',
                cell: (row: any) => `0${row.phone}`
            },
            {
                columnDef: 'weekdays',
                class: 'a35',
                header: 'weekday.title',
                type: 'html',
                cell: (row: any) => `${this.handleLines(row.weekdays || '')}`
            },
            {
                columnDef: 'email',
                class: 'a15',
                header: 'instructor.placeholder.email',
                type: 'text',
                cell: (row: any) => `${row.email}`
            },
            {
                columnDef: 'isFullTime',
                class: 'a10',
                header: 'instructor.placeholder.fullTime',
                type: 'boolean',
                cell: (row: any) => `${row.isFullTime}`
            },
            {columnDef: 'settings', class: 'a10', header: '', type: 'settings', delete: true, editRow: true},
        ];
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

    /**
     * init data
     */
    public onRowDeleted(id: number): void {
        this.dialogsService
            .confirm('messages.warning_title', 'messages.remove_row_warning_message', true, 'warning-sign')
            .subscribe(confirm => {
                if (confirm) {
                    this.block = true;
                    Instructor
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
        this.router.navigate(['instructors/forms']);
    }

    /**
     * onEditRow
     */
    public onEditRow(event: Instructor): void {
        this.instructor = event;
        this.router.navigate(['instructor-management/' + event.id]);

    }

    onFilter(filter: string) {
        this.filter = filter;
        this.getDataTable(this.pageIndex, this.pageSize, this.sortName, this.sortDirection, this.filter);
    }

}
