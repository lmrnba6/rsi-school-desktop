import {Component, Input, OnChanges, OnInit} from '@angular/core';
import {DialogsService} from '../_services/dialogs.service';
import {MessagesService} from "../_services/messages.service";
import {ActivatedRoute, Router} from '@angular/router';
import {AbstractTableSetting} from "../model/abstractTableSetting";
import './inbox.component.scss';
import {TranslateService} from "@ngx-translate/core";
import {Inbox} from "../model/inbox";
import {Intern} from "../model/intern";
import {AuthenticationService} from "../_services/authentication.service";
import {User} from "../model/user";

@Component({
    selector: 'app-inbox',
    templateUrl: './inbox.component.html',
})
export class InboxComponent implements OnInit, OnChanges {

    @Input() public intern: Intern;
    public filter: string = '';
    public data: any;
    public tableName: string;
    public setting: AbstractTableSetting;
    public inbox: Inbox;
    public block: boolean;
    public color: string = 'warn';
    public mode: string = 'indeterminate';
    public value: number = 100;
    public pageIndex: number = 0;
    public pageSize: number = 10;
    public sortName: string = 'date';
    public sortDirection: string = 'DESC';
    public isAdmin: boolean;
    public user: User;
    public deleted: boolean;
    public sent: boolean;
    public backImage = `${this.getPath()}dist/assets/images/backImage.png`;

    constructor(
        private dialogsService: DialogsService,
        public messagesService: MessagesService,
        private router: Router,
        private route: ActivatedRoute,
        private translate: TranslateService,
        private authService: AuthenticationService,
    ) {
    }

    getPath(){
        const l = window.location.href.split('/');
        const c = l.length - l.indexOf('index.html');
        return '../'.repeat(c);
    }

    ngOnInit(): void {
        this.user = this.authService.getCurrentUser();
        this.isAdmin = this.user.role === 'admin';
        this.getParams();
        this.initSetting();
    }

    fixImage(event: any) {
        if (event.target.src.includes('dist')) {
            return event.target.src = event.target.src.replace('/dist', '');
        }    }

    /**
     * getParams
     */
    public getParams(): void {
        this.route.params.subscribe(res => {
            if (res.type === 'sent') {
               this.sent = true;
            } else if (res.type === 'deleted') {
                this.deleted = true;
            }
            this.getDataTable(this.pageIndex, this.pageSize, this.sortName, this.sortDirection, this.filter);
        });
    }

    ngOnChanges(): void {
        this.getDataTable(this.pageIndex, this.pageSize, this.sortName, this.sortDirection, this.filter);
        this.initSetting();
    }


    public getDataTable(pageIndex: number, pageSize: number, sort: string, order: string, filter: string): void {
        this.messagesService.messagesSubject.next(null);
        const offset: number = pageIndex * pageSize;
        const limit: number = pageSize;
        this.block = true;
        Promise.all([
            Inbox.getAllPaged(offset, limit, sort, order, filter, this.user.id, this.deleted,  this.sent),
            Inbox.getCount(this.filter, this.user.id, this.deleted, this.sent)])
            .then(
                values => {
                    this.block = false;
                    this.data = {items: values[0], paging: {totalCount: (values[1][0] as any).count}};
                    if(this.sent) {
                        this.data.items.map((inbox: Inbox) => inbox.read = 1);
                    }
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
            {columnDef: 'date', header: 'inbox.date', type: 'date', cell: (row: any) => `${row.date}`},
            {columnDef: this.sent ? 'to_user': 'from_user', header: this.sent ? 'inbox.to' : 'inbox.from', type: 'text', cell: (row: any) => `${this.sent ?  row.to_user : row.from_user}`},
            {columnDef: 'subject', header: 'inbox.subject', type: 'text', cell: (row: any) => `${row.subject}`},
            // {columnDef: 'attachments', header: 'inbox.attachments', type: 'icon', cell: (row: any) => `${row.attachments > 0 ? 'paperclip' : 'minus'}`},
            {columnDef: 'settings',class: 'a10', header: '', type: 'settings', delete: false, editRow: true}
        ];
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
                    Inbox.get(id).then(inbox => {
                        inbox.deleted = 1;
                        inbox.update()
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
                    });
                }
            });
    }


    goBack() {
        this.router.navigate(['messages']);
    }


    /**
     * add row
     */
    public onAddRow(): void {
        this.router.navigate(['inbox/form']);
    }

    /**
     * onEditRow
     */
    public onEditRow(event: Inbox): void {
        this.inbox = event;
        this.router.navigate(['inbox/form/' + event.id]);

    }

    onFilter(filter: string) {
        this.filter = filter;
        this.getDataTable(this.pageIndex, this.pageSize, this.sortName, this.sortDirection, this.filter);
    }

}
