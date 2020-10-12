import {Component, Input, OnChanges, OnInit} from '@angular/core';
import {DialogsService} from '../_services/dialogs.service';
import {MessagesService} from "../_services/messages.service";
import {Router} from '@angular/router';
import {AbstractTableSetting} from "../model/abstractTableSetting";
import './commute.component.scss';
import {TranslateService} from "@ngx-translate/core";
import {Commute} from "../model/commute";
import {AuthenticationService} from "../_services/authentication.service";
import {Intern} from "../model/intern";

@Component({
    selector: 'app-commute',
    templateUrl: './commute.component.html',
})
export class CommuteComponent implements OnInit, OnChanges {

    @Input() public intern: Intern;
    public filter: string = '';
    public data: any;
    public tableName: string;
    public setting: AbstractTableSetting;
    public commute: Commute;
    public block: boolean;
    public color: string = 'warn';
    public mode: string = 'indeterminate';
    public value: number = 100;
    public pageIndex: number = 0;
    public pageSize: number = 10;
    public sortName: string = 'time';
    public sortDirection: string = 'ASC';
    public isAdmin: boolean;
    public isUser: boolean;
    public backImage = `${this.getPath()}dist/assets/images/backImage.png`;


    constructor(
        private dialogsService: DialogsService,
        public messagesService: MessagesService,
        private router: Router,
        private translate: TranslateService,
        private authService: AuthenticationService) {
    }

    ngOnInit(): void {
        this.isAdmin = this.authService.getCurrentUser().role === 'admin';
        this.isUser = this.authService.getCurrentUser().role === 'user';
        this.getDataTable(this.pageIndex, this.pageSize, this.sortName, this.sortDirection, this.filter);
        this.initSetting();
    }

    fixImage(event: any) {
        if (event.target.src.includes('dist')) {
            return event.target.src = event.target.src.replace('/dist', '');
        }
    }

    getPath() {
        const l = window.location.href.split('/');
        const c = l.length - l.indexOf('index.html');
        return '../'.repeat(c);
    }

    ngOnChanges(): void {
        this.getDataTable(this.pageIndex, this.pageSize, this.sortName, this.sortDirection, this.filter);
        this.initSetting();
    }


    public getDataTable(pageIndex: number, pageSize: number, sort: string, order: string, filter: string): void {
        const offset: number = pageIndex * pageSize;
        const limit: number = pageSize;
        this.block = true;
        Promise.all([ Commute
            .getAllPaged(offset, limit, sort, order, filter, this.intern.id), Commute.getCount(this.filter, this.intern.id)])
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
        this.setting.addRow = this.isAdmin || this.isUser;
        this.setting.cols = [
            {columnDef: 'day', header: 'commute.placeholder.day', type: 'text', cell: (row: any) => `${this.translate.instant('weekday.placeholder.' + row.day)}`},
            {columnDef: 'time', header: 'commute.placeholder.time', type: 'text', cell: (row: any) => `${row.time}`},
            {columnDef: 'direction', header: 'commute.placeholder.direction', type: 'text', cell: (row: any) => `${this.translate.instant('commute.placeholder.' + row.direction)}`},
            {columnDef: 'car', header: 'commute.placeholder.car', type: 'text', cell: (row: any) => `${row.car_name + ' ' + row.car_make}`},
            {columnDef: 'settings',class: 'a10', header: '', type: 'settings', delete: false, editRow: true}
        ];
    }

    goBack() {
        this.router.navigate(['commute']);
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
                    Commute
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
        this.router.navigate(['commute/form/' + this.intern.id]);
    }

    /**
     * onEditRow
     */
    public onEditRow(event: Commute): void {
        this.commute = event;
        this.router.navigate(['commute/form/' + this.intern.id + '/' + event.id]);

    }

    onFilter(filter: string) {
        this.filter = filter;
        this.getDataTable(this.pageIndex, this.pageSize, this.sortName, this.sortDirection, this.filter);
    }

}
