import {Component, Input, OnChanges, OnInit} from '@angular/core';
import {DialogsService} from '../_services/dialogs.service';
import {MessagesService} from "../_services/messages.service";
import {Router} from '@angular/router';
import {AbstractTableSetting} from "../model/abstractTableSetting";
import './payment-instructor.component.scss';
import {TranslateService} from "@ngx-translate/core";
import {Instructor} from "../model/instructor";
import {AuthenticationService} from "../_services/authentication.service";
import {Payment_instructor} from "../model/paymentInstructor";

@Component({
    selector: 'app-payment-instructor',
    templateUrl: './payment-instructor.component.html',
})
export class PaymentInstructorComponent implements OnInit, OnChanges {

    @Input() public instructor: Instructor;
    public filter: string = '';
    public data: any;
    public tableName: string;
    public setting: AbstractTableSetting;
    public paymentInstructor: Payment_instructor;
    public block: boolean;
    public color: string = 'warn';
    public mode: string = 'indeterminate';
    public value: number = 100;
    public pageIndex: number = 0;
    public pageSize: number = 10;
    public sortName: string = 'date';
    public sortDirection: string = 'DESC';
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

    getPath(){
        const l = window.location.href.split('/');
        const c = l.length - l.indexOf('index.html');
        return '../'.repeat(c);
    }

    fixImage(event: any) {
        if (event.target.src.includes('dist')) {
            return event.target.src = event.target.src.replace('/dist', '');
        }    }

    ngOnInit(): void {
        this.getDataTable(this.pageIndex, this.pageSize, this.sortName, this.sortDirection, this.filter);
        this.isAdmin = this.authService.getCurrentUser().role === 'admin';
        this.isUser = this.authService.getCurrentUser().role === 'user';
        this.initSetting();
    }

    ngOnChanges(): void {
        this.getDataTable(this.pageIndex, this.pageSize, this.sortName, this.sortDirection, this.filter);
        this.initSetting();
    }

    goBack() {
        this.router.navigate(['payments']);
    }


    public getDataTable(pageIndex: number, pageSize: number, sort: string, order: string, filter: string): void {
        const offset: number = pageIndex * pageSize;
        const limit: number = pageSize;
        this.block = true;
        Promise.all([this.instructor ?
            Payment_instructor.getAllPagedByInstructor(offset, limit, sort, order, this.instructor.id) :
            Payment_instructor.getAllPaged(offset, limit, sort, order, filter), this.instructor ? Payment_instructor.getCountByInstructor(this.instructor.id) :
            Payment_instructor.getCount(this.filter), Instructor.getAll()])
            .then(
                values => {
                    this.block = false;
                    values[0].forEach(payment_instructor => payment_instructor.instructor_id = values[2].find(instructor => instructor.id === payment_instructor.instructor_id) || payment_instructor.instructor_id)
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
        this.setting.filter = !this.instructor;
        this.setting.addRow = (this.isAdmin || this.isUser) && !this.instructor;
        this.setting.cols = [
            {columnDef: 'date', header: 'payment_instructor.placeholder.date', type: 'date', cell: (row: any) => `${row.date}`},
            {
                columnDef: 'amount',
                header: 'payment_instructor.placeholder.amount',
                type: 'text',
                cell: (row: any) => `${Number(row.amount).toFixed(0)} DA`
            },
            {
                columnDef: 'comment',
                header: 'payment_instructor.placeholder.comment',
                type: 'text',
                cell: (row: any) => `${row.comment}`
            },
            {
                columnDef: 'session_name',
                header: 'payment_instructor.placeholder.session',
                type: 'text',
                cell: (row: any) => `${row.session_name || ''}`
            },
            {
                columnDef: 'rest',
                header: 'register.placeholder.rest',
                type: 'text',
                cell: (row: any) => row.rest ? `${Number(row.rest).toFixed(0)} DA` : ''
            },
            // {
            //     columnDef: 'sold',
            //     header: 'register.placeholder.sold',
            //     type: 'text',
            //     cell: (row: any) => row.rest ? `${Number(row.sold).toFixed(0)} DA` : ''
            // },
        ];
        !this.instructor && this.setting.cols.push({
            columnDef: 'instructor',
            header: 'payment_instructor.placeholder.instructor_id',
            type: 'text',
            cell: (row: any) => `${row.instructor}`
        });
        this.isAdmin &&
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
                    Payment_instructor.get(id).then(payment_instructor => {
                        this.block = true;
                        Payment_instructor
                            .delete(id)
                            .then(
                                () => {
                                    this.block = false;
                                    this.manageInstructorSold(payment_instructor);
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

    manageInstructorSold(payment_instructor: Payment_instructor) {
        this.block = true;
        Instructor.get(payment_instructor.instructor_id as number).then(instructor => {
            instructor.sold = Number(instructor.sold) + Number(payment_instructor.amount);
            instructor.update().then(() => this.block = false,
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
        this.router.navigate(['payments/instructors/form']);
    }

    /**
     * onEditRow
     */
    public onEditRow(event: Payment_instructor): void {
        this.paymentInstructor = event;
        this.router.navigate(['payments/instructors/form/' + event.id]);

    }

    onFilter(filter: string) {
        this.filter = filter;
        this.getDataTable(this.pageIndex, this.pageSize, this.sortName, this.sortDirection, this.filter);
    }

}
