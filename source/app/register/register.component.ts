import {Component, Input, OnChanges, OnInit} from '@angular/core';
import {DialogsService} from '../_services/dialogs.service';
import {MessagesService} from "../_services/messages.service";
import {Router} from '@angular/router';
import {AbstractTableSetting} from "../model/abstractTableSetting";
import './register.component.scss';
import {TranslateService} from "@ngx-translate/core";
import {Register} from "../model/register";
import {Intern} from "../model/intern";
import {AuthenticationService} from "../_services/authentication.service";
import MAX_SAFE_INTEGER = require("core-js/fn/number/max-safe-integer");

@Component({
    selector: 'app-register',
    templateUrl: './register.component.html',
})
export class RegisterComponent implements OnInit, OnChanges {

    @Input() public intern: Intern;
    public tabSelected: number = 0;
    public filter: string = '';
    public data: any;
    public expenses: any;
    public recipes: any;
    public tableName: string;
    public setting: AbstractTableSetting;
    public register: Register;
    public block: boolean;
    public color: string = 'warn';
    public mode: string = 'indeterminate';
    public value: number = 100;
    public pageIndex: number = 0;
    public pageSize: number = MAX_SAFE_INTEGER;
    public sortName: string = 'date';
    public sortDirection: string = 'DESC';
    public isAdmin: boolean;
    public from = new Date();
    public to = new Date();
    public soldAll:number;

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
        this.getTotalSold();
    }

    ngOnChanges(): void {
        this.getDataTable(this.pageIndex, this.pageSize, this.sortName, this.sortDirection, this.filter);
        this.initSetting();
        this.getTotalSold();
    }

    public onTabChange(): void {
        this.ngOnInit();
    }


    public getTotalSold(): void {
        Register.getAll().then(res => {
            this.soldAll = res.reduce((a: number, b: Register) => { return Number(a) + Number(b.amount)},0);
        })
    }

    public search(): void {
        this.getDataTable(this.pageIndex, this.pageSize, this.sortName, this.sortDirection, this.filter);
    }

    public getDataTable(pageIndex: number, pageSize: number, sort: string, order: string, filter: string): void {
        const offset: number = pageIndex * pageSize;
        const limit: number = pageSize;
        this.block = true;
        Promise.all([ this.tabSelected === 0 ?
            Register.getAllPaged(offset, limit, sort, order, filter,this.from.setHours(0,0,0,0), this.to.setHours(23,59,59,999))
            : this.tabSelected === 1 ?
            Register.getAllPagedRecipes(offset, limit, sort, order, filter,this.from.setHours(0,0,0,0), this.to.setHours(23,59,59,999))
            :             Register.getAllPagedExpenses(offset, limit, sort, order, filter,this.from.setHours(0,0,0,0), this.to.setHours(23,59,59,999)),

            Register.getCount(this.filter)])
            .then(
                values => {
                    this.block = false;
                    this.getTotalSold();
                    this.data = {items: values[0], paging: {totalCount: (values[1][0] as any).count}};
                    this.expenses = {items: values[0], paging: {totalCount: (values[1][0] as any).count}};
                    this.recipes = {items: values[0], paging: {totalCount: (values[1][0] as any).count}};
                },
                () => {
                    this.block = false;
                    this.messagesService.notifyMessage(this.translate.instant('messages.something_went_wrong_message'), '', 'error');
                });
    }

    public getSold(): number {
        if(this.data){
            return this.data.items.reduce((a: number, b: Register) => { return Number(a) + Number(b.amount)},0);
        }
        return 0;
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
        this.setting.settingColumn = false;
        this.setting.tableName = this.tableName;
        this.setting.filter = !this.intern;
        this.setting.paging = false;
        this.setting.addRow = true;
        this.setting.cols = [
            {columnDef: 'amount', header: 'register.placeholder.amount', type: 'text', cell: (row: any) => `${Number(row.amount).toFixed(0)} DA`},
            {columnDef: 'date', header: 'register.placeholder.date', type: 'date', cell: (row: any) => `${row.date}`},
            {columnDef: 'intern', header: 'register.placeholder.intern', type: 'text', cell: (row: any) => `${row.intern || ''}`},
            {columnDef: 'comment', header: 'register.placeholder.comment', type: 'text', cell: (row: any) => `${row.comment}`},
            {columnDef: 'training', header: 'register.placeholder.training', type: 'text', cell: (row: any) => `${row.training || ''}`},
            {columnDef: 'sold', header: 'register.placeholder.sold', type: 'text', cell: (row: any) => row.sold ? `${Number(row.sold).toFixed(0)} DA` : ''},
            {columnDef: 'rest', header: 'register.placeholder.rest', type: 'text', cell: (row: any) => row.rest ? `${Number(row.rest).toFixed(0)} DA` : ''},
            {columnDef: 'responsible', header: 'register.placeholder.responsible', type: 'text', cell: (row: any) => row.responsible || ''}
        ];
        // this.isAdmin &&
        // this.setting.cols.push({columnDef: 'settings',class: 'a10', header: '', type: 'settings', delete: true, editRow: true});
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
                    Register
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


    goBack() {
        this.router.navigate(['payments']);
    }


    /**
     * add row
     */
    public onAddRow(): void {
        this.router.navigate(['register/form/type/' + ((this.tabSelected === 0 || this.tabSelected === 1) ? '+' : '-')]);
    }

    /**
     * onEditRow
     */
    public onEditRow(event: Register): void {
        this.register = event;
        this.router.navigate(['register/form/' + event.id]);

    }

    onFilter(filter: string) {
        this.filter = filter;
        this.getDataTable(this.pageIndex, this.pageSize, this.sortName, this.sortDirection, this.filter);
    }

}
