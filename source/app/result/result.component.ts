import {Component, OnInit} from '@angular/core';
import './result.component.scss';
import {Enrollment} from "../model/enrollment";
import {TranslateService} from "@ngx-translate/core";
import {Session} from "../model/session";
import {AbstractTableSetting} from "../model/abstractTableSetting";


@Component({
    selector: 'app-result',
    templateUrl: './result.component.html',
})
export class ResultComponent implements OnInit {

    constructor(private translate: TranslateService) {}

    ngOnInit() {
        this.data = {items: [], paging: {totalCount: 0}};
        this.initSetting();
    }

    public title: string;
    public chartType: string = '';
    public chartData: Array<any> = [];
    public chartLabels: Array<string> = [];
    public from = new Date();
    public to = new Date();
    public result: boolean = false;
    public statType: string;
    public types = ['student', 'instructor'];
    public block: boolean;
    public color: string = 'warn';
    public mode: string = 'indeterminate';
    public value: number = 100;
    public expanded = true;
    public type = 'graph';


    public data: any;
    public tableName: string;
    public setting: AbstractTableSetting;

    public initSetting(): void {
        this.setting = new AbstractTableSetting();
        this.setting.settingColumn = false;
        this.setting.tableName = this.tableName;
        this.setting.filter = false;
        this.setting.addRow = true;
        this.setting.paging = false;
        this.setting.cols = [
            {columnDef: 'name', header: 'result.name', type: 'text', cell: (row: any) => `${row.name}`},
            {columnDef: 'count', header: 'result.count', type: 'text', cell: (row: any) => `${row.count}`}
        ];
    }

    stat() {
        this.expanded = false;
        this.data = {items: [], paging: {totalCount: 0}};
        this.chartData = [];
        this.chartLabels = [];
        if(this.statType === 'instructor') {
            this.title = this.translate.instant('result.instructor_title');
            this.chartType = 'pie';
            this.block = true;
            Session.getAllGroupByInstructor(this.from.getTime(), this.to.getTime()).then((sessions: any) =>{
                this.block = false;
                this.result = true;
                this.expanded = false;
                sessions.forEach(
                    (session: any) => {
                        this.chartLabels.push(session.name);
                        this.chartData.push(session.instructors);
                        this.data.items.push({name: session.name, count: session.instructors});
                    });
                }, () => this.block = false);
        } else if(this.statType === 'student') {
            this.title = this.translate.instant('result.student_title');
            this.chartType = 'pie';
            this.block = true;
            Enrollment.getAllGroupByTrainingByIntern(this.from.getTime(), this.to.getTime()).then((enrollments: any) => {
                this.block = false;
                this.result = true;
                this.expanded = false;
                enrollments.forEach(
                (enrollment: any) => {
                    this.chartLabels.push(enrollment.name);
                    this.chartData.push(enrollment.interns);
                    this.data.items.push({name: enrollment.name, count: enrollment.interns})
                });}, () => this.block = false);
        } else {
            this.result = false;
        }


    }


}
