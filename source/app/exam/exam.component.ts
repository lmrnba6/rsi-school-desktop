import {Component, Input, OnChanges, OnInit} from '@angular/core';
import {DialogsService} from '../_services/dialogs.service';
import {MessagesService} from "../_services/messages.service";
import {Router} from '@angular/router';
import {AbstractTableSetting} from "../model/abstractTableSetting";
import './exam.component.scss';
import {TranslateService} from "@ngx-translate/core";
import {Exam} from "../model/exam";
import {Intern} from "../model/intern";
import {AuthenticationService} from "../_services/authentication.service";
import {Session} from "../model/session";
import {User} from "../model/user";

@Component({
    selector: 'app-exam',
    templateUrl: './exam.component.html',
})
export class ExamComponent implements OnInit, OnChanges {

    @Input() public intern: Intern;
    @Input() public session: Session;
    public filter: string = '';
    public data: any;
    public tableName: string;
    public setting: AbstractTableSetting;
    public exam: Exam;
    public block: boolean;
    public color: string = 'warn';
    public mode: string = 'indeterminate';
    public value: number = 100;
    public pageIndex: number = 0;
    public pageSize: number = 10;
    public sortName: string = 'date';
    public sortDirection: string = 'DESC';
    public isAdmin: boolean;
    public isInstructor: boolean;
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
        this.isInstructor = this.user.role === 'teacher';
        this.getDataTable(this.pageIndex, this.pageSize, this.sortName, this.sortDirection, this.filter);
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
        Promise.all([this.intern ?
            Exam.getAllPagedByIntern(offset, limit, sort, order, this.intern.id) : this.session ?
                Exam.getAllPagedBySession(offset, limit, sort, order, this.session.id) :
                this.isInstructor ? Exam.getAllPagedByInstructor(offset, limit, sort, order, Number(this.user.username)) :
            Exam.getAllPaged(offset, limit, sort, order, filter), this.intern ? Exam.getCountByIntern(this.intern.id) :
            this.session ? Exam.getCountBySession(this.session.id) :
            Exam.getCount(this.filter)])
            .then(
                values => {
                    this.block = false;
                    this.data = {items: values[0], paging: {totalCount: (values[1][0] as any).count}};
                },
                err => {
                    this.block = false;
                    this.messagesService.notifyMessage(this.translate.instant('messages.something_went_wrong_message'), err, 'error');
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
        this.setting.settingColumn = !this.intern && !this.session;
        this.setting.tableName = this.tableName;
        this.setting.filter = !this.intern && !this.session;
        this.setting.addRow = true;
        this.setting.cols = [
            {columnDef: 'date', header: 'exam.placeholder.date', type: 'date', cell: (row: any) => `${row.date}`},
            {columnDef: 'mark', header: 'exam.placeholder.mark', type: 'text', cell: (row: any) => `${row.mark}`},
            {columnDef: 'result', header: 'exam.placeholder.result', type: 'boolean', cell: (row: any) => `${row.result}`},
            {columnDef: 'intern', header: 'exam.placeholder.intern_id', type: 'text', cell: (row: any) => `${row.intern}`},
            {columnDef: 'training', header: 'exam.placeholder.training_id', type: 'text', cell: (row: any) => `${row.training}`},
            {columnDef: 'session', header: 'exam.placeholder.session_id', type: 'text', cell: (row: any) => `${row.session}`}
            ];
        !this.intern && !this.session &&
        this.setting.cols.push({columnDef: 'settings',class: 'a10', header: '', type: 'settings', delete: this.isAdmin, editRow: this.isAdmin})
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
                    Exam
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
        this.router.navigate(['exam/form']);
    }

    /**
     * onEditRow
     */
    public onEditRow(event: Exam): void {
        this.exam = event;
        this.router.navigate(['exam/form/' + event.id]);

    }

    onFilter(filter: string) {
        this.filter = filter;
        this.getDataTable(this.pageIndex, this.pageSize, this.sortName, this.sortDirection, this.filter);
    }

}
