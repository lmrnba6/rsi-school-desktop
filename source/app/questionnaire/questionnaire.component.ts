import {Component, OnInit} from '@angular/core';
import {DialogsService} from '../_services/dialogs.service';
import {MessagesService} from "../_services/messages.service";
import {Router} from '@angular/router';
import {AbstractTableSetting} from "../model/abstractTableSetting";
import './questionnaire.component.scss';
import {TranslateService} from "@ngx-translate/core";
import {Questionnaire} from "../model/questionnaire";

@Component({
    selector: 'app-questionnaire',
    templateUrl: './questionnaire.component.html',
})
export class QuestionnaireComponent implements OnInit {

    public filter: string = '';
    public data: any;
    public tableName: string;
    public setting: AbstractTableSetting;
    public questionnaire: Questionnaire;
    public block: boolean;
    public color: string = 'warn';
    public mode: string = 'indeterminate';
    public value: number = 100;
    public pageIndex: number = 0;
    public pageSize: number = 10;
    public sortName: string = 'title';
    public sortDirection: string = 'ASC';
    public backImage = `${this.getPath()}dist/assets/images/backImage.png`;

    constructor(
        private dialogsService: DialogsService,
        public messagesService: MessagesService,
        private router: Router,
        private translate: TranslateService,) {
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
        this.initSetting();
    }


    public getDataTable(pageIndex: number, pageSize: number, sort: string, order: string, filter: string): void {
        const offset: number = pageIndex * pageSize;
        const limit: number = pageSize;
        this.block = true;
        Promise.all([Questionnaire
            .getAllPaged(offset, limit, sort, order, filter), Questionnaire.getCount(this.filter)])
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
            {columnDef: 'title', header: 'questionnaire.placeholder.title', type: 'text', cell: (row: any) => `${row.title}`},
            {columnDef: 'questions', header: 'questionnaire.placeholder.number', type: 'text', cell: (row: any) => `${row.questions}`},
            {columnDef: 'time', header: 'questionnaire.placeholder.time', type: 'text', cell: (row: any) => `${row.time} Min`},
            {columnDef: 'name', header: 'questionnaire.placeholder.training', type: 'text', cell: (row: any) => `${row.name || ''}`},
            {columnDef: 'settings', header: '',class: 'a10', type: 'settings', delete: false, editRow: true},
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
                    Questionnaire
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
        this.router.navigate(['questionnaire/form']);
    }

    /**
     * onEditRow
     */
    public onEditRow(event: Questionnaire): void {
        this.questionnaire = event;
        this.router.navigate(['questionnaire/form/' + event.id]);

    }

    goBack() {
        this.router.navigate(['assessment']);
    }


    onFilter(filter: string) {
        this.filter = filter;
        this.getDataTable(this.pageIndex, this.pageSize, this.sortName, this.sortDirection, this.filter);
    }

}
