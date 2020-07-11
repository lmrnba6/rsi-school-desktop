import {Component, Input, OnChanges, OnInit} from '@angular/core';
import {DialogsService} from '../_services/dialogs.service';
import {MessagesService} from "../_services/messages.service";
import {Router} from '@angular/router';
import {AbstractTableSetting} from "../model/abstractTableSetting";
import './enrollment.component.scss';
import {TranslateService} from "@ngx-translate/core";
import {Intern} from "../model/intern";
import {Enrollment} from "../model/enrollment";
import {AuthenticationService} from "../_services/authentication.service";


@Component({
    selector: 'app-enrollment',
    templateUrl: './enrollment.component.html',
})
export class EnrollmentComponent implements OnInit, OnChanges {

    @Input() public intern: Intern;
    public filter: string = '';
    public data: any;
    public tableName: string;
    public setting: AbstractTableSetting;
    public enrollment: Enrollment;
    public block: boolean;
    public color: string = 'warn';
    public mode: string = 'indeterminate';
    public value: number = 100;
    public pageIndex: number = 0;
    public pageSize: number = 10;
    public sortName: string = 'date';
    public sortDirection: string = 'DESC';
    public isAdmin: boolean;

    constructor(
        private dialogsService: DialogsService,
        public messagesService: MessagesService,
        private router: Router,
        private translate: TranslateService,
        private authService: AuthenticationService) {
    }

    ngOnInit(): void {
        this.isAdmin = this.authService.getCurrentUser().role === 'admin';
        this.initSetting();
        if(!this.intern) {
            this.getDataTable(this.pageIndex, this.pageSize, this.sortName, this.sortDirection, this.filter);
        }

    }

    ngOnChanges(): void {
        this.getDataTable(this.pageIndex, this.pageSize, this.sortName, this.sortDirection, this.filter);
    }

    public getDataTable(pageIndex: number, pageSize: number, sort: string, order: string, filter: string): void {
        const offset: number = pageIndex * pageSize;
        const limit: number = pageSize;
        this.block = true;
        Promise.all([this.intern ? Enrollment
            .getAllPagedByIntern(offset, limit, sort, order, this.intern.id) : Enrollment
            .getAllPaged(offset, limit, sort, order, filter), this.intern ? Enrollment.getCountByIntern(this.intern.id) :
            Enrollment.getCount(this.filter)])
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
        this.setting.settingColumn = !this.intern;
        this.setting.tableName = this.tableName;
        this.setting.filter = !this.intern;
        this.setting.addRow = true;
        this.setting.cols = [
            {columnDef: 'intern', header: 'enrollment.placeholder.intern_id', type: 'text', cell: (row: any) => `${row.intern}`},
            {columnDef: 'training_id', header: 'enrollment.placeholder.training_id', type: 'text', cell: (row: any) => `${row.training_id}`},
            {columnDef: 'session', header: 'enrollment.placeholder.session_id', type: 'text', cell: (row: any) => `${row.session}`},
            {columnDef: 'instructor', header: 'enrollment.placeholder.instructor_id', type: 'text', cell: (row: any) => `${row.instructor}`},
            {columnDef: 'date', header: 'enrollment.placeholder.date', type: 'date', cell: (row: any) => `${row.date}`}
        ];
        !this.intern && this.isAdmin &&
        this.setting.cols.push({columnDef: 'settings',class: 'a10', header: '', type: 'settings', delete: this.isAdmin, editRow: this.isAdmin});
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
                    Enrollment
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
        this.router.navigate(['enrollment/form']);
    }

    /**
     * onEditRow
     */
    public onEditRow(event: Enrollment): void {
        this.enrollment = event;
        this.router.navigate(['enrollment/form/' + event.id]);

    }

    onFilter(filter: string) {
        this.filter = filter;
        this.getDataTable(this.pageIndex, this.pageSize, this.sortName, this.sortDirection, this.filter);
    }

}
