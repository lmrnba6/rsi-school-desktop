import {Component, OnInit} from '@angular/core';
import {DialogsService} from '../_services/dialogs.service';
import {MessagesService} from "../_services/messages.service";
import {Router} from '@angular/router';
import {AbstractTableSetting} from "../model/abstractTableSetting";
import './course.component.scss';
import {TranslateService} from "@ngx-translate/core";
import {Course} from "../model/course";
import {Training} from "../model/training";

@Component({
    selector: 'app-course',
    templateUrl: './course.component.html',
})
export class CourseComponent implements OnInit {

    public filter: string = '';
    public data: any;
    public tableName: string;
    public setting: AbstractTableSetting;
    public course: Course;
    public block: boolean;
    public color: string = 'warn';
    public mode: string = 'indeterminate';
    public value: number = 100;
    public pageIndex: number = 0;
    public pageSize: number = 10;
    public sortName: string = 'name';
    public sortDirection: string = 'ASC';

    constructor(
        private dialogsService: DialogsService,
        public messagesService: MessagesService,
        private router: Router,
        private translate: TranslateService,) {
    }

    ngOnInit(): void {
        this.getDataTable(this.pageIndex, this.pageSize, this.sortName, this.sortDirection, this.filter);
        this.initSetting();
    }


    public getDataTable(pageIndex: number, pageSize: number, sort: string, order: string, filter: string): void {
        const offset: number = pageIndex * pageSize;
        const limit: number = pageSize;
        this.block = true;
        Promise.all([Course
            .getAllPaged(offset, limit, sort, order, filter), Course.getCount(this.filter), Training.getAll()])
            .then(
                values => {
                    this.block = false;
                    values[0].forEach(course => course.training_id = values[2].find((training: Training) => training.id === course.training_id) || course.training_id)
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
            {columnDef: 'name', header: 'course.placeholder.name', type: 'text', cell: (row: any) => `${row.name}`},
            {columnDef: 'time', header: 'course.placeholder.time', type: 'text', cell: (row: any) => `${row.time}`},
            {columnDef: 'training_id', header: 'course.placeholder.training_id', type: 'text', cell: (row: any) => `${row.training_id.name}`},
            {columnDef: 'settings', header: '',class: 'a10', type: 'settings', delete: true, editRow: true},
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
                    Course
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
        this.router.navigate(['course/form']);
    }

    /**
     * onEditRow
     */
    public onEditRow(event: Course): void {
        this.course = event;
        this.router.navigate(['course/form/' + event.id]);

    }

    onFilter(filter: string) {
        this.filter = filter;
        this.getDataTable(this.pageIndex, this.pageSize, this.sortName, this.sortDirection, this.filter);
    }

}
