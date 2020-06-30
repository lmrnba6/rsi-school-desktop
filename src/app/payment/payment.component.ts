import {Component, Input, OnChanges, OnInit} from '@angular/core';
import {DialogsService} from '../_services/dialogs.service';
import {MessagesService} from "../_services/messages.service";
import {Router} from '@angular/router';
import {AbstractTableSetting} from "../model/abstractTableSetting";
import './payment.component.scss';
import {TranslateService} from "@ngx-translate/core";
import {Payment} from "../model/payment";
import {Intern} from "../model/intern";
import {AuthenticationService} from "../_services/authentication.service";

@Component({
    selector: 'app-payment',
    templateUrl: './payment.component.html',
})
export class PaymentComponent implements OnInit, OnChanges {

    @Input() public intern: Intern;
    public filter: string = '';
    public data: any;
    public tableName: string;
    public setting: AbstractTableSetting;
    public payment: Payment;
    public block: boolean;
    public color: string = 'warn';
    public mode: string = 'indeterminate';
    public value: number = 100;
    public pageIndex: number = 0;
    public pageSize: number = 5;
    public sortName: string = 'date';
    public sortDirection: string = 'ASC';
    public isAdmin: boolean;

    constructor(
        private dialogsService: DialogsService,
        public messagesService: MessagesService,
        private router: Router,
        private translate: TranslateService,
        private authService: AuthenticationService,
        ) {
    }

    ngOnInit(): void {
        this.getDataTable(this.pageIndex, this.pageSize, this.sortName, this.sortDirection, this.filter);
        this.isAdmin = this.authService.getCurrentUser().role === 'admin';
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
            Payment.getAllPagedByIntern(offset, limit, sort, order, this.intern.id) :
            Payment.getAllPaged(offset, limit, sort, order, filter), this.intern ? Payment.getCountByIntern(this.intern.id) :
            Payment.getCount(this.filter)])
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
        this.setting.settingColumn = this.isAdmin;
        this.setting.tableName = this.tableName;
        this.setting.filter = !this.intern;
        this.setting.addRow = true;
        this.setting.cols = [
            {columnDef: 'date', header: 'payment.placeholder.date', type: 'date', cell: (row: any) => `${row.date}`},
            {columnDef: 'amount', header: 'payment.placeholder.amount', type: 'text', cell: (row: any) => `${Number(row.amount).toFixed(2)} DA`},
            {columnDef: 'comment', header: 'payment.placeholder.comment', type: 'text', cell: (row: any) => `${row.comment}`},
            {columnDef: 'intern_id', header: 'payment.placeholder.intern_id', type: 'text', cell: (row: any) => `${row.intern}`}
        ];
        this.isAdmin &&
        this.setting.cols.push({columnDef: 'settings', header: '', type: 'settings', delete: true, editRow: true});
    }

    /**
     * init data
     */
    public onRowDeleted(id: number): void {
        this.dialogsService
            .confirm('messages.warning_title', 'messages.remove_row_warning_message', true, 'warning-sign')
            .subscribe(confirm => {
                if (confirm) {
                    Payment.get(id).then(payment => {
                        this.block = true;
                        Payment
                            .delete(id)
                            .then(
                                () => {
                                    this.block = false;
                                    this.manageInternSold(payment);
                                    this.data = [];
                                    this.getDataTable(this.pageIndex, this.pageSize, this.sortName, this.sortDirection, this.filter);
                                    this.messagesService.notifyMessage(this.translate.instant('messages.operation_success_message'), '', 'success');
                                },
                                () => {
                                    this.block = false;
                                    this.messagesService.notifyMessage(this.translate.instant('messages.something_went_wrong_message'), '', 'error');
                                }
                            );
                    });
                }
            });
    }


    goBack() {
        this.router.navigate(['payments']);
    }

    manageInternSold(payment: Payment) {
        this.block = true;
        Intern.get(payment.intern_id as number).then(intern => {
            intern.sold = Number(intern.sold) + Number(payment.amount);
            intern.update().then(() => this.block = false,
                () => {
                    this.block = false;
                    this.messagesService.notifyMessage(this.translate.instant('messages.something_went_wrong_message'), '', 'error');
                });
        },() => {
                this.block = false;
                this.messagesService.notifyMessage(this.translate.instant('messages.something_went_wrong_message'), '', 'error');
            }
            )
    }

    /**
     * add row
     */
    public onAddRow(): void {
        this.router.navigate(['payment/form']);
    }

    /**
     * onEditRow
     */
    public onEditRow(event: Payment): void {
        this.payment = event;
        this.router.navigate(['payment/form/' + event.id]);

    }

    onFilter(filter: string) {
        this.filter = filter;
        this.getDataTable(this.pageIndex, this.pageSize, this.sortName, this.sortDirection, this.filter);
    }

}
