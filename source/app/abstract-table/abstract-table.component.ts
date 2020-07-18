import {Component, EventEmitter, Input, OnChanges, OnInit, Output, ViewChild, ViewEncapsulation} from '@angular/core';
import {MatPaginator, MatSort, MatTableDataSource, PageEvent} from '@angular/material';
import {AfterViewInit} from '@angular/core/src/metadata/lifecycle_hooks';
import 'jspdf-autotable'
import './abstract-table.component.scss';
import {AbstractTableSetting} from "../model/abstractTableSetting";
import {MessagesService} from "../_services/messages.service";
import {Settings} from "../model/settings";
import {Intern} from "../model/intern";
import {DialogsService} from "../_services/dialogs.service";
import {TranslateService} from "@ngx-translate/core";
import {Attendance} from "../model/attendance";
import {Attachment} from "../model/attachment";
import {Enrollment} from "../model/enrollment";
import {Exam} from "../model/exam";
import {Inbox} from "../model/inbox";
import {Instructor} from "../model/instructor";
import {Payment} from "../model/payment";
import {Payment_instructor} from "../model/paymentInstructor";
import {Room} from "../model/room";
import {Session} from "../model/session";
import {Training} from "../model/training";
import {User} from "../model/user";
import {Visitor} from "../model/visitor";
import {AuthenticationService} from "../_services/authentication.service";
import {Register} from "../model/register";
import {Weekday} from "../model/weekday";
import {PromptService} from "../_services/prompt.service";
import {Prompt} from "../model/prompt";
const jspdf = require('jspdf');

const html2canvas = require('html2canvas');
import printJS = require("print-js");

@Component({
    selector: 'app-abstract-table',
    templateUrl: './abstract-table.component.html',
    encapsulation: ViewEncapsulation.None
})
export class AbstractTableComponent
    implements OnInit, OnChanges, AfterViewInit {
    @Input() public data: any;
    @Input() public page: string;
    @Input() public setting: AbstractTableSetting;
    @Output() deleteRow: EventEmitter<any> = new EventEmitter<any>();
    @Output() pageChange: EventEmitter<any> = new EventEmitter<any>();
    @Output() tableChange: EventEmitter<any> = new EventEmitter<any>();
    @Output() sortChange: EventEmitter<any> = new EventEmitter<any>();
    @Output() addRow: EventEmitter<any> = new EventEmitter<any>();
    @Output() editRow: EventEmitter<any> = new EventEmitter<any>();
    @Output() filter: EventEmitter<any> = new EventEmitter<any>();
    @Output() deleteAll: EventEmitter<any> = new EventEmitter<any>();
    public printImage;
    public addImage;
    public saveImage;

    @ViewChild(MatPaginator) paginator: MatPaginator;
    @ViewChild(MatSort) sort: MatSort;

    public dataSource: MatTableDataSource<any>;
    public displayedColumns: any;
    public displayedHeaders: any;
    public color: string = 'warn';
    public mode: string = 'indeterminate';
    public value: number = 100;
    public block: boolean;
    public length: number = 100;
    public pageSize: number = 10;
    public colsSelected: any = [];
    public search: boolean;
    public select: boolean;
    public rowSelected: any;
    public cols: any = [];
    public pageSizeOptions: Array<number> = [5, 10, 25, 100];
    public pageEvent: PageEvent;
    public isAdmin: boolean;


    constructor(public messagesService: MessagesService, private translate: TranslateService, private dialogsService: DialogsService, private promptService: PromptService, private auth: AuthenticationService) {
    }

    ngOnInit(): void {
        this.isAdmin = this.auth.getCurrentUser().role === 'admin';
        this.printImage = `${this.getPath()}dist/assets/images/printImage.png`;
        this.addImage = `${this.getPath()}dist/assets/images/addImage.png`;
        this.saveImage = `${this.getPath()}dist/assets/images/saveImage.png`;
    }

    fixImage(event: any) {
        if (event.target.src.includes('dist')) {
            return event.target.src = event.target.src.replace('/dist', '');
        }
    }


    ngOnChanges(): void {
        //prime table
        this.printImage = `${this.getPath()}dist/assets/images/printImage.png`;
        this.addImage = `${this.getPath()}dist/assets/images/addImage.png`;
        this.saveImage = `${this.getPath()}dist/assets/images/saveImage.png`;


        this.cols = [];
        this.colsSelected = [];
        this.setting.cols.forEach((x: any) => {
            //x.header = x.header.length ? this.translate.instant(x.header) : '';
            this.colsSelected.push(x);
        });
        this.cols = this.colsSelected;
        //end prime table
        this.displayedColumns = this.setting.cols.map((x: any) => x.columnDef);
        if (this.data) {
            this.select = false;
            this.dataSource = new MatTableDataSource<any>(this.data.items);
            this.length = this.data.paging.totalCount;
        }
    }

    getPath(){
        const l = window.location.href.split('/');
        const c = l.length - l.indexOf('index.html');
        return '../'.repeat(c);
    }

    public captureScreen(type: string) {
        const data: Prompt = {
            icon: 'list-alt',
            label: 'abstractTable.pageTitle',
            message:'abstractTable.printTitleMessage',
            title:'abstractTable.pageTitle',
            type: 'text',
            value: ''
        }
        this.promptService
            .confirm(data)
            .subscribe(value => {
                    if (value) {
                        this.printOrSave(type, value);
                    }
                });
    }

    public printOrSave(type: string, title: string) {
        window['html2canvas'] = html2canvas;
        let doc = new jspdf();
        let data: any = [];
        let dataJson: any = [];
        this.displayedHeaders = this.setting.cols.filter(s => s.columnDef !== 'settings').map((x: any) => this.translate.instant(x.header));
        this.dataSource.filteredData.forEach(obj => {
            let arr: any = [];
            let o: any = {};
            this.cols.forEach(col => {
                if (col.columnDef === 'settings') {
                } else if (col.type === 'date') {
                    o[this.translate.instant(col.header)] = this.integerToString(obj[col.columnDef]);
                    arr.push(this.integerToString(obj[col.columnDef]));
                } else if (col.type === 'car') {
                    o[this.translate.instant(col.header)] = obj['car_name'] + ' ' + obj['car_make'];
                    arr.push(obj['car_name'] + ' ' + obj['car_make']);
                } else if (col.type === 'direction') {
                    o[this.translate.instant(col.header)] = this.translate.instant('transport.placeholder.' + obj[col.columnDef]);
                    arr.push(this.translate.instant('transport.placeholder.' + obj[col.columnDef]));
                } else if (col.type === 'boolean') {
                    o[this.translate.instant(col.header)] = obj[col.columnDef] === 1 ? this.translate.instant('buttons.yes') : this.translate.instant('buttons.no');
                    arr.push(obj[col.columnDef] === 1 ? this.translate.instant('buttons.yes') : this.translate.instant('buttons.no'));
                } else if (col.type === 'day') {
                    o[this.translate.instant(col.header)] = this.translate.instant('weekday.placeholder.' + obj[col.columnDef]);
                    arr.push(this.translate.instant('weekday.placeholder.' + obj[col.columnDef]));
                } else {
                    o[this.translate.instant(col.header)] = obj[col.columnDef] || '';
                    arr.push(obj[col.columnDef] || '');
                }
            });
            data.push(arr);
            dataJson.push(o);
        });
        doc.autoTable({
            head: [this.displayedHeaders],
            body: data,
            didDrawPage:  () => {
                // Header
                doc.setFontSize(20);
                doc.setTextColor(40);
                doc.setFontStyle('normal');
                // if (base64Img) {
                //     doc.addImage(base64Img, 'JPEG', data.settings.margin.left, 15, 10, 10);
                // }
                doc.text(title,20, 20);

                // Footer
                const str = "Page " + doc.internal.getNumberOfPages()
                // Total page number plugin only available in jspdf v1.0+
                doc.setFontSize(10);

                // jsPDF 1.4+ uses getWidth, <1.4 uses .width
                doc.text(str, 10, doc.internal.pageSize.height - 10);
            },
            margin: {top: 30, bottom: 20}
        });
        if (type === 'print') {
            printJS({
                printable: dataJson,
                properties: this.displayedHeaders,
                type: 'json',
                header: `<h1>${title}</h1>`,
                style: 'h1 { text-align: center; }',
                gridHeaderStyle: 'background: #007bff; text-align: left; font-family: arial; border: 1px solid black; margin: 10px;',
                gridStyle: 'text-align: left; font-family: arial; border: 1px solid black; margin: 10px;'
            });
        } else if (type === 'save') {
            doc.save((this.page || '') + '-list.pdf');
        }
    }

    ngAfterViewInit(): void {
        // this.dataSource.paginator = this.paginator;
        // this.dataSource.sort = this.sort;
    }

    public selectAll(event: any): void {
        this.data.items.forEach((item: any) => item['selected'] = event.checked);
    }

    public deleteMultiple(): void {
        const promises: Array<Promise<any>> = [];
        this.data.items.forEach((item: any) => {
            if (item.selected) {
                if (item instanceof Attachment) {
                    promises.push(Attachment.delete(item.id));
                }
                if (item instanceof Attendance) {
                    promises.push(Attendance.delete(item.id));
                }
                if (item instanceof Enrollment) {
                    promises.push(Enrollment.delete(item.id));
                }
                if (item instanceof Exam) {
                    promises.push(Exam.delete(item.id));
                }
                if (item instanceof Inbox) {
                    promises.push(Inbox.delete(item.id));
                }
                if (item instanceof Instructor) {
                    promises.push(Instructor.delete(item.id));
                }
                if (item instanceof Intern) {
                    promises.push(Intern.delete(item.id));
                }
                if (item instanceof Payment) {
                    promises.push(Payment.delete(item.id));
                }
                if (item instanceof Payment_instructor) {
                    promises.push(Payment_instructor.delete(item.id));
                }
                if (item instanceof Room) {
                    promises.push(Room.delete(item.id));
                }
                if (item instanceof Session) {
                    promises.push(Session.delete(item.id));
                }
                if (item instanceof Training) {
                    promises.push(Training.delete(item.id));
                }
                if (item instanceof User) {
                    promises.push(User.delete(item.id));
                }
                if (item instanceof Visitor) {
                    promises.push(Visitor.delete(item.id));
                }
                if (item instanceof Weekday) {
                    promises.push(Weekday.delete(item.id));
                }
                if (item instanceof Register) {
                    promises.push(Register.delete(item.id));
                }
            }
        });
        if (promises.length > 0) {
            this.dialogsService
                .confirm('messages.warning_title', 'messages.remove_row_warning_message', true, 'warning-sign')
                .subscribe(confirm => {
                    if (confirm) {

                        this.block = true;
                        Promise.all(promises).then(() => {
                                this.block = false;
                                this.deleteAll.emit();
                                this.messagesService.notifyMessage(this.translate.instant('messages.operation_success_message'), '', 'success');
                            },
                            () => {
                                this.messagesService.notifyMessage(this.translate.instant('messages.something_went_wrong_message'), '', 'error');
                                this.block = false;
                            });
                    }
                });
        }

    }


    public applyFilter(filter: any): void {
        //if(filter.keyCode == 13) {
        let filterValue: string = filter.target.value.trim(); // Remove whitespace
        filterValue = Settings.isDbLocal ? filterValue.toLowerCase() : filterValue; // Datasource defaults to lowercase matches
        // this.dataSource.filter = filterValue;
        this.filter.emit(filterValue);
        //}
    }

    public integerToString(date: string) {
        return new Date(Number(date)).toLocaleDateString('fr-FR');
    }

    /**
     * onDeleteRow
     */
    public onDeleteRow(id: number): void {
        this.deleteRow.emit(id);
    }

    /**
     * sortChange
     */
    public sortOnChange(col: string): void {
        this.paginator.pageIndex = 0;
        this.sortChange.emit({
            col,
            sortDirection: this.sort.direction
        });
    }

    /**
     * pageOnChange
     */
    public pageOnChange(event: any): void {
        this.pageChange.emit(event);
    }

    /**
     * pageOnChange
     */
    public tableOnChange(event: any): void {
        this.tableChange.emit(event);
    }

    /**
     * onEditRow
     */
    public onEditRow(data: any): void {
        this.editRow.emit(data);
    }

    /**
     * onAddRow
     */
    public onAddRow(): void {
        this.addRow.emit();
    }

    public getStyleRow(row: any) {
        if (this.page === 'register') {
            if (Number(row.amount) < 0) {
                return {background: '#ffe6e6'}
            } else {
                return {background: '#d9ffe1'}
            }
        } else if (this.page === 'charge') {
            if (Number(row.rest) > 0) {
                return {background: '#ffe6e6'}
            } else {
                return {background: '#d9ffe1'}
            }
        } else if (this.page === 'payment') {
            if (Number(row.error)) {
                return {background: '#ffb0b0'}
            }
        } else if (this.page === 'intern') {
            if (row.isPromo) {
                return {background: '#c891ff'}
            }
            if (row.isVip) {
                return {background: '#84ff9f'}
            }
            if (row.closed || row.isAllowed) {
                return {background: '#ffb0b0'}
            }
            if ((row.sold !== undefined && Number(row.sold) !== 0) || row.read === 0) {
                return {background: '#ffffa3'}
            }
        } else {
            if (row.isPromo) {
                return {background: '#c891ff'}
            }
            if (row.isVip) {
                return {background: '#84ff9f'}
            }
            if (row.closed || row.isAllowed) {
                return {background: '#ffb0b0'}
            }
            if ((row.sold !== undefined && Number(row.sold) !== 0) || row.read === 0) {
                return {background: '#ffffa3'}
            }
        }
        return
    }

}
