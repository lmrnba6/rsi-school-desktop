import { Component, OnInit } from '@angular/core';
import { DialogsService } from '../_services/dialogs.service';
import {MessagesService} from "../_services/messages.service";
import { Router } from '@angular/router';
import {AbstractTableSetting} from "../model/abstractTableSetting";
import './training.component.scss';
import {TranslateService} from "@ngx-translate/core";
import {Training} from "../model/training";
import {AuthenticationService} from "../_services/authentication.service";
@Component({
  selector: 'app-training',
  templateUrl: './training.component.html',
})
export class TrainingComponent implements OnInit {

  public filter: string = '';
  public data: any;
  public tableName: string;
  public setting: AbstractTableSetting;
  public training: Training;
  public block: boolean;
  public color: string = 'warn';
  public mode: string = 'indeterminate';
  public value: number = 100;
  public pageIndex: number = 0;
  public pageSize: number = 10;
  public sortName: string = 'name';
  public sortDirection: string = 'ASC';
  public isAdmin: boolean;

  constructor(
    private dialogsService: DialogsService,
    public messagesService: MessagesService,
    private router: Router,
    private translate: TranslateService,
    private authService: AuthenticationService) { }

  ngOnInit(): void {
    this.isAdmin = this.authService.getCurrentUser().role === 'admin';
    this.getDataTable(this.pageIndex, this.pageSize, this.sortName, this.sortDirection, this.filter);
    this.initSetting();
  }


  public getDataTable(pageIndex: number, pageSize: number, sort: string, order: string, filter: string): void {
    const offset: number = pageIndex * pageSize;
    const limit: number = pageSize;
    this.block = true;
    Promise.all([Training
      .getAllPaged(offset, limit, sort, order, filter),Training.getCount(this.filter)])
      .then(
        values => {
          this.block = false;
          this.data = { items: values[0], paging: {totalCount: (values[1][0] as any).count}};
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
    this.pageSize =  event.pageSize;
    this.getDataTable(this.pageIndex, this.pageSize, this.sortName, this.sortDirection, this.filter);
  }

  public initSetting(): void {
    this.setting = new AbstractTableSetting();
    this.setting.settingColumn = this.isAdmin;
    this.setting.tableName = this.tableName;
    this.setting.filter = true;
    this.setting.addRow = true;
    this.setting.cols = [
      { columnDef: 'name', header: 'training.placeholder.name', type: 'text', cell: (row: any) => `${row.name}` },
      { columnDef: 'time', header: 'training.placeholder.time', type: 'text', cell: (row: any) => `${row.time} min`},
      { columnDef: 'type', header: 'training.placeholder.type', type: 'text', cell: (row: any) => `${row.type}` }
    ];
      this.isAdmin &&
      this.setting.cols.push({columnDef: 'settings',class: 'a10', header: '', type: 'settings', delete: true, editRow: true});
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
          Training
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
              this.messagesService.notifyMessage(this.translate.instant('messages.unable_delete_relation'), '', 'error');
            }
            );
        }
      });
  }

  /**
   * add row
   */
  public onAddRow(): void {
    this.router.navigate(['training/form']);
  }

  /**
   * onEditRow
   */
  public onEditRow(event: Training): void {
    this.training = event;
    this.router.navigate(['training/form/' + event.id]);

  }

  onFilter(filter: string) {
    this.filter = filter;
    this.getDataTable(this.pageIndex, this.pageSize, this.sortName, this.sortDirection, this.filter);
  }

}
