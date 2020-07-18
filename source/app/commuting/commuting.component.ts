import {Component, Input, OnChanges, OnInit} from '@angular/core';
import {MessagesService} from "../_services/messages.service";
import {Router} from '@angular/router';
import {AbstractTableSetting} from "../model/abstractTableSetting";
import './commuting.component.scss';
import {TranslateService} from "@ngx-translate/core";
import {Transport} from "../model/transport";
import {Session} from "../model/session";
import {AuthenticationService} from "../_services/authentication.service";
import {Commute} from "../model/commute";
import {Car} from "../model/car";

@Component({
    selector: 'app-commuting',
    templateUrl: './commuting.component.html',
})
export class CommutingComponent implements OnInit, OnChanges {

    @Input() public session: Session;
    public filter: string = '';
    public filterIntern: string = '';
    public data: any;
    public internData: any;
    public tableName: string;
    public setting: AbstractTableSetting;
    public internSetting: AbstractTableSetting;
    public transport: Transport;
    internDisplayed: boolean;
    public block: boolean;
    public color: string = 'warn';
    public mode: string = 'indeterminate';
    public value: number = 100;
    public pageIndex: number = 0;
    public pageSize: number = 10;
    public sortName: string = 'time';
    public sortDirection: string = 'ASC';
    public isAdmin: boolean;
    public day: string;
    public days: Array<string> = [];
    public car: number;
    public direction: string;
    public cars: Array<Car> = [];
    public backImage = `${this.getPath()}dist/assets/images/backImage.png`;


    constructor(
        public messagesService: MessagesService,
        private router: Router,
        private translate: TranslateService,
        private authService: AuthenticationService) {
    }

    ngOnInit(): void {
        this.toDay();
        this.getCars();
        this.isAdmin = this.authService.getCurrentUser().role === 'admin';
        this.getDataTable(this.pageIndex, this.pageSize, this.sortName, this.sortDirection);
        this.initSetting();
        this.initInternSetting();
    }

    getCars() {
        Car.getAll().then(cars => this.cars = cars);
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
        this.getDataTable(this.pageIndex, this.pageSize, this.sortName, this.sortDirection);
        this.initSetting();
        this.initInternSetting();
    }

    toDay() {
        let a = new Date();
        let weekdays = new Array(7);
        weekdays[0] = "sunday";
        weekdays[1] = "monday";
        weekdays[2] = "tuesday";
        weekdays[3] = "wednesday";
        weekdays[4] = "thursday";
        weekdays[5] = "friday";
        weekdays[6] = "saturday";
        this.days =weekdays;
        this.day = weekdays[a.getDay()];
    }


    public getDataTable(pageIndex: number, pageSize: number, sort: string, order: string): void {
        const offset: number = pageIndex * pageSize;
        const limit: number = pageSize;
        this.block = true;
        Commute.getAllPagedByDayAndCar(offset, limit, sort, order,this.day, this.car, this.direction)
            .then(
                values => {
                    this.block = false;
                    this.data = {items: values, paging: {totalCount: values.length }};
                },
                () => {
                    this.block = false;
                    this.messagesService.notifyMessage(this.translate.instant('messages.something_went_wrong_message'), '', 'error');
                });
    }

    public getInternDataTable(filter: string, transport: number): void {
        this.block = true;
        Commute.getAllPagedInternsByTransport(filter, transport)
            .then(
                values => {
                    this.block = false;
                    this.internData = {items: values, paging: {totalCount: values.length }};
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
        this.getDataTable(this.pageIndex, this.pageSize, event.col, event.sortDirection);
    }


    /**
     * onPageChange
     */
    public onPageChange(event: any): void {
        this.pageIndex = event.pageIndex;
        this.pageSize = event.pageSize;
        this.getDataTable(this.pageIndex, this.pageSize, this.sortName, this.sortDirection);
    }

    public initSetting(): void {
        this.setting = new AbstractTableSetting();
        this.setting.settingColumn = true;
        this.setting.tableName = this.tableName;
        this.setting.filter = false;
        this.setting.paging = false;
        this.setting.addRow = true;
        this.setting.cols = [
            {columnDef: 'time', header: 'transport.placeholder.time', type: 'text', cell: (row: any) => `${row.time}`},
            {columnDef: 'day', header: 'transport.placeholder.day', type: 'day', cell: (row: any) => `${this.translate.instant('weekday.placeholder.' + row.day)}`},
            {columnDef: 'direction', header: 'transport.placeholder.direction', type: 'direction', cell: (row: any) => `${this.translate.instant('transport.placeholder.' + row.direction)}`},
            {columnDef: 'car', header: 'transport.placeholder.car', type: 'car', cell: (row: any) => `${row.car_name + ' ' + row.car_make}`},
            {columnDef: 'interns', header: 'transport.placeholder.interns', type: 'text', cell: (row: any) => `${row.interns}`},
            {columnDef: 'settings',class: 'a10', header: '', type: 'settings', delete: false, editRow: true}
        ];
    }

    public initInternSetting(): void {
        this.internSetting = new AbstractTableSetting();
        this.internSetting.settingColumn = false;
        this.internSetting.tableName = this.tableName;
        this.internSetting.filter = true;
        this.internSetting.paging = false;
        this.internSetting.addRow = false;
        this.internSetting.cols = [
            {columnDef: 'name',class: 'a25', header: 'intern.placeholder.name', type: 'text', cell: (row: any) => `${row.name}`},
            {columnDef: 'phone',class: 'a15', header: 'intern.placeholder.phone', type: 'text', cell: (row: any) => `0${row.phone}`},
            {columnDef: 'address',class: 'a40', header: 'intern.placeholder.address', type: 'text', cell: (row: any) => `${row.address}`},
            {columnDef: 'comment',class: 'a20', header: 'intern.placeholder.comment', type: 'text', cell: (row: any) => `${row.comment || ''}`},
        ];
    }

    onChange() {
        this.internDisplayed = false;
        this.getDataTable(this.pageIndex, this.pageSize, this.sortName, this.sortDirection);
    }

    goBack() {
        this.router.navigate(['transportation']);
    }

    /**
     * onEditRow
     */
    public onEditRow(event: Transport): void {
        this.transport = event;
        this.internDisplayed = true;
        this.getInternDataTable(this.filterIntern, this.transport.id)

    }

    onFilter(filter: string) {
        this.filter = filter;
        this.getDataTable(this.pageIndex, this.pageSize, this.sortName, this.sortDirection);
    }

    onFilterIntern(filter: string) {
        this.filterIntern = filter;
        this.getInternDataTable(this.filterIntern, this.transport.id);
    }

}
