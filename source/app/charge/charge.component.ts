import {Component, Input, OnChanges, OnInit} from '@angular/core';
import {DialogsService} from '../_services/dialogs.service';
import {MessagesService} from "../_services/messages.service";
import {Router} from '@angular/router';
import {AbstractTableSetting} from "../model/abstractTableSetting";
import './charge.component.scss';
import {TranslateService} from "@ngx-translate/core";
import {Charge} from "../model/charge";
import {Intern} from "../model/intern";
import {AuthenticationService} from "../_services/authentication.service";

@Component({
    selector: 'app-charge',
    templateUrl: './charge.component.html',
})
export class ChargeComponent implements OnInit, OnChanges {

    @Input() public intern: Intern;
    public filter: string = '';
    public data: any;
    public tableName: string;
    public setting: AbstractTableSetting;
    public charge: Charge;
    public block: boolean;
    public color: string = 'warn';
    public mode: string = 'indeterminate';
    public value: number = 100;
    public pageIndex: number = 0;
    public pageSize: number = 10;
    public sortName: string = 'date';
    public sortDirection: string = 'DESC';
    public isAdmin: boolean;
    public isIntern: boolean;
    public isUser: boolean;
    public backImage = `${this.getPath()}dist/assets/images/backImage.png`;

    constructor(
        private dialogsService: DialogsService,
        public messagesService: MessagesService,
        private router: Router,
        private translate: TranslateService,
        private authService: AuthenticationService,
    ) {
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

    ngOnInit(): void {
        this.getDataTable(this.pageIndex, this.pageSize, this.sortName, this.sortDirection, this.filter);
        this.isAdmin = this.authService.getCurrentUser().role === 'admin';
        this.isIntern = this.authService.getCurrentUser().role === 'student';
        this.isUser = this.authService.getCurrentUser().role === 'user';
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
            Charge.getAllPagedByIntern(offset, limit, sort, order, this.intern.id) :
            Charge.getAllPaged(offset, limit, sort, order, filter), this.intern ? Charge.getCountByIntern(this.intern.id) :
            Charge.getCount(this.filter)])
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
        this.sortDirection = event.sortDirection.length ? event.sortDirection : 'DESC';
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
        this.setting.filter = !this.isIntern;
        this.setting.addRow = this.isUser || this.isAdmin;
        this.setting.cols = [
            {columnDef: 'date', header: 'charge.placeholder.date', type: 'date', cell: (row: any) => `${row.date}`},
            {
                columnDef: 'amount',
                header: 'charge.placeholder.amount',
                type: 'text',
                cell: (row: any) => `${Number(row.amount).toFixed(0)} DA`
            },
            {
                columnDef: 'comment',
                header: 'charge.placeholder.comment',
                type: 'text',
                cell: (row: any) => `${row.comment}`
            },
            {
                columnDef: 'session',
                header: 'charge.placeholder.session',
                type: 'text',
                cell: (row: any) => `${row.session || ''}`
            },
            {
                columnDef: 'rest',
                header: 'register.placeholder.rest',
                type: 'text',
                cell: (row: any) => row.rest ? `${Number(row.rest).toFixed(0)} DA` : ''
            }
        ];
        this.setting.cols.push({
            columnDef: 'settings',
            class: 'a10',
            header: '',
            type: 'settings',
            delete: false,
            editRow: true
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
                    Charge.get(id).then(charge => {
                        this.block = true;
                        Charge
                            .delete(id)
                            .then(
                                () => {
                                    this.block = false;
                                    this.manageInternSold(charge);
                                    this.data = [];
                                    this.getDataTable(this.pageIndex, this.pageSize, this.sortName, this.sortDirection, this.filter);
                                    this.messagesService.notifyMessage(this.translate.instant('messages.operation_success_message'), '', 'success');
                                },
                                () => {
                                    this.block = false;
                                    this.messagesService.notifyMessage(this.translate.instant('messages.unable_delete_relation'), '', 'error');
                                }
                            );
                    });
                }
            });
    }


    goBack() {
        this.router.navigate(['charges']);
    }

    manageInternSold(charge: Charge) {
        this.block = true;
        Charge.getSold(charge.intern as number).then(sold => {
                Intern.updateSold(charge.intern as number, sold[0].sold).then();
            }, () => {
                this.block = false;
                this.messagesService.notifyMessage(this.translate.instant('messages.something_went_wrong_message'), '', 'error');
            }
        )
    }

    /**
     * add row
     */
    public onAddRow(): void {
        this.router.navigate(['charge/form/' + this.intern.id]);
    }

    /**
     * onEditRow
     */
    public onEditRow(event: Charge): void {
        this.charge = event;
        this.router.navigate(['charge/form/' + this.intern.id + '/' + event.id]);

    }

    onFilter(filter: string) {
        this.filter = filter;
        this.getDataTable(this.pageIndex, this.pageSize, this.sortName, this.sortDirection, this.filter);
    }

}
