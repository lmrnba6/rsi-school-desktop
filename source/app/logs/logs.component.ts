import {Component, OnInit} from '@angular/core';
import './logs.component.scss';
import {readFileSync} from 'fs';
import {Settings} from "../model/settings";

@Component({
    selector: 'app-logs',
    templateUrl: './logs.component.html',
})
export class LogsComponent implements OnInit {

    public data: any;
    public block: boolean;
    public color: string = 'warn';
    public mode: string = 'indeterminate';
    public value: number = 100;


    ngOnInit(): void {
        this.getDataTable();
    }

    public getDataTable(): void {
        this.block = true;
        this.data = readFileSync(Settings.logsPath);
        this.block = false;
    }

}
