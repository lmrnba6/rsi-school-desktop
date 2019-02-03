import {Component, Input, OnChanges, OnInit} from '@angular/core';
import {DialogsService} from '../_services/dialogs.service';
import {MessagesService} from "../_services/messages.service";
import {Router} from '@angular/router';
import {AbstractTableEvent, AbstractTableSetting} from "../model/abstractTableSetting";
import './intern.component.scss';
import {TranslateService} from "@ngx-translate/core";
import {Intern} from "../model/intern";
import {Session} from "../model/session";
import {AuthenticationService} from "../_services/authentication.service";

@Component({
    selector: 'app-intern',
    templateUrl: './intern.component.html',
})
export class InternComponent implements OnInit, OnChanges {

    @Input() public session: Session;
    public filter: string = '';
    public data: any;
    public tableName: string;
    public setting: AbstractTableSetting;
    public intern: Intern;
    public block: boolean;
    public color: string = 'warn';
    public mode: string = 'indeterminate';
    public value: number = 100;
    public pageIndex: number = 0;
    public pageSize: number = 5;
    public sortName: string = 'name';
    public sortDirection: string = 'ASC';
    public isAdmin: boolean;

    constructor(
        private dialogsService: DialogsService,
        public messagesService: MessagesService,
        private router: Router,
        private translate: TranslateService,
        private authService: AuthenticationService) {
    }

    ngOnInit(): void {
        if(this.authService.getCurrentUser().role === 'student') {
            Intern.getByPhone(this.authService.getCurrentUser().username).then(intern => {
                intern && this.router.navigate(['intern-management/' + intern.id]);
            })
        }
        this.isAdmin = this.authService.getCurrentUser().role === 'admin';
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
        Promise.all([this.session ? Intern.getAllPagedBySession(offset, limit, sort, order, this.session.id) :
            Intern
            .getAllPaged(offset, limit, sort, order, filter), this.session ? Intern.getCountInternBySession(this.session.id) :
            Intern.getCount(this.filter)])
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

    public onTableChnage(event: AbstractTableEvent) {
        this.getDataTable(event.first, event.rows, this.sortName, this.sortDirection, this.filter);
    }

    public initSetting(): void {
        this.setting = new AbstractTableSetting();
        this.setting.settingColumn = !this.session;;
        this.setting.tableName = this.tableName;
        this.setting.filter = !this.session;
        this.setting.addRow = true;
        this.setting.cols = [
            {columnDef: 'name', header: 'intern.placeholder.name', type: 'text', cell: (row: any) => `${row.name}`},
            {columnDef: 'birth', header: 'intern.placeholder.birth', type: 'date', cell: (row: any) => `${row.birth}`},
            {columnDef: 'phone', header: 'intern.placeholder.phone', type: 'text', cell: (row: any) => `${row.phone}`},
            {columnDef: 'sold', header: 'intern.placeholder.sold', type: 'text', cell: (row: any) => `${row.sold}`},
            {columnDef: 'name_arabic', header: 'intern.placeholder.name_arabic', type: 'text', cell: (row: any) => `${row.name_arabic}`}
        ];
        !this.session &&
        this.setting.cols.push({columnDef: 'settings', header: '', type: 'settings', delete: this.isAdmin, editRow: true});
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
                    Intern
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
        this.router.navigate(['intern/form']);
    }

    /**
     * onEditRow
     */
    public onEditRow(event: Intern): void {
        this.intern = event;
        this.router.navigate(['intern-management/' + event.id]);

    }

    onFilter(filter: string) {
        this.filter = filter;
        this.getDataTable(this.pageIndex, this.pageSize, this.sortName, this.sortDirection, this.filter);
    }

}
